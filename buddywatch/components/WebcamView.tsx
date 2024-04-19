'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { Circles } from 'react-loader-spinner';
import { drawPredictions } from '@/utils/drawPredictions';
import { resizeCanvas } from '@/utils/resizeCanvas';
import { downloadFile } from '@/utils/downloadFile';
import ActionButton from '@/components/ActionButton';

let interval: any = null;

/**
 * Use connected webcam to display the camera feed and provide functionality for
 * making a single prediction, toggling surveillance, and recording video feed.
 *
 * @returns {React.JSX.Element} A React element that renders a webcam to the user.
 */
export default function WebcamView() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSurveilling, setIsSurveilling] = useState<boolean>(false);
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = React.useState<Blob[]>([]);
  const [startTime, setStartTime] = React.useState(0);
  const [endTime, setEndTime] = React.useState(0);

  const { data: session } = useSession();
  console.log(session);
  useEffect(() => {
    if (isSurveilling) {
      interval = setInterval((): void => {
        const imageSrc: string | null | undefined =
          webcamRef.current?.getScreenshot();
        sendImageToServer(imageSrc);
      }, 100);
    }

    return (): void => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [webcamRef.current, isSurveilling]);

  /**
   * Take an image and send that image to the server.
   */
  const capture = (): void => {
    try {
      if (webcamRef.current) {
        const imageSrc: string | null | undefined =
          webcamRef.current?.getScreenshot();
        sendImageToServer(imageSrc);
        toast.success('Screenshot taken!');
      } else {
        toast.error('Webcam not found!');
      }
    } catch (err) {
      toast.error('Taking screenshot failed!');
      console.error(err);
    }
  };

  /**
   * Send image to the object detection model in the server.
   * Get a response with bounding box coordinates and confidence score back from the server.
   * Resize canvas and drawn the bounding boxes in to the canvas.
   *
   * @param {string | null | undefined } imageSrc base64 encoded string of webcam image
   */
  const sendImageToServer = async (
    imageSrc: string | null | undefined
  ): Promise<void> => {
    if (!imageSrc) return;

    try {
      // Convert Base64 string to a Blob
      const res: Response = await fetch(imageSrc);
      const blob: Blob = await res.blob();

      const file: File = new File([blob], 'image.jpg', {
        type: 'image/jpeg',
      });

      const data: FormData = new FormData();
      data.append('image', file);

      const response: Response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/predict/`,
        {
          method: 'POST',
          headers: {
            authorization: `Bearer ${session?.user.access}`,
          },
          body: data,
        }
      );

      const serverResponse = await response.json();

      if (serverResponse.success) {
        resizeCanvas(canvasRef, webcamRef);
        drawPredictions(serverResponse, canvasRef);
      }
    } catch (error) {
      toast.error('Error while sending data to the server!');
      console.error('Error while communicating with server:', error);
    }
  };

  /**
   * Change surveillance status and notify user about it.
   * Remove drawn bounding box from the canvas.
   */
  const changeSurveillanceStatus = (): void => {
    if (isSurveilling) {
      setIsSurveilling(false);
      const context: CanvasRenderingContext2D | null | undefined =
        canvasRef.current?.getContext('2d');
      context?.clearRect(0, 0, context.canvas.width, context.canvas.height);
      toast.success('Surveillance stopped!');
    } else {
      setIsSurveilling(true);
      toast.success('Surveillance started!');
    }
  };

  /**
   * Start recording current media stream and place callback to store
   * the recorded data chucks into state.
   */
  const startRecording = useCallback((): void => {
    if (webcamRef.current && webcamRef.current.stream) {
      const startTime: number = new Date().getTime(); // Capture start time
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: 'video/webm',
      });
      mediaRecorderRef.current.addEventListener(
        'dataavailable',
        storeRecordingIntoState
      );
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setStartTime(startTime);
        toast.success('Recording started!');
      }
    } else {
      toast.error('Webcam not found!');
    }
  }, [webcamRef, setIsRecording, mediaRecorderRef]);

  /**
   * Stop recording current media stream.
   */
  const stopRecording = useCallback((): void => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      const endTime: number = new Date().getTime();
      setEndTime(endTime);

      toast.success('Recording stopped!');
    }
  }, [mediaRecorderRef, webcamRef, setIsRecording]);

  /**
   * Store recorded media into state when media stream ends.
   *
   * @param {BlobEvent} data Blob object containing recorded data
   */
  const storeRecordingIntoState = useCallback(
    ({ data }: BlobEvent): void => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  /**
   * Format Unix timestamps into file name friendly format.
   *
   * @param {number} date Unix epoch time stamp
   * @returns {string} Datetime in YYYYMMDD-HHmmss format
   */
  const formatDateForFile = (date: number) => {
    const isoString: string = new Date(date).toISOString();
    const datePart: string = isoString.slice(0, 10).replace(/-/g, '');
    const timePart: string = isoString.slice(11, 19).replace(/:/g, '');
    return `${datePart}-${timePart}`;
  };

  /**
   * Download previously recorded media stream into user's device from state in webm format.
   */
  const downloadRecording = useCallback((): void => {
    if (recordedChunks.length) {
      const formattedStartTime: string = formatDateForFile(startTime);
      const formattedEndTime: string = formatDateForFile(endTime);
      const filename: string = `${formattedStartTime}_${formattedEndTime}_${session?.user.username}_buddywatch.webm`;

      const blob: Blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });

      downloadFile(blob, filename);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  /**
   * Format Unix timestamps into file name friendly format.
   *
   * @param {number} start Unix epoch for start time
   * @param {number} end Unix epoch for end time
   * @returns {string} Datetime in YYYYMMDD-HHmmss format
   */
  const formatVideoTitle = (start: number, end: number) => {
    const startString: string = new Date(startTime).toLocaleString('fi-FI');

    const endString: string = new Date(endTime).toLocaleString('fi-FI');

    return `${startString} - ${endString}`;
  };

  /**
   * Send recorded webm video file to server.
   */
  const sendRecordingToServer = useCallback(async (): Promise<void> => {
    if (recordedChunks.length) {
      const formattedStartTime: string = formatDateForFile(startTime);
      const formattedEndTime: string = formatDateForFile(endTime);
      const filename: string = `${formattedStartTime}_${formattedEndTime}_${session?.user.username}_buddywatch.webm`;

      const blob: Blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      const formData: FormData = new FormData();

      const videoTitle: string = formatVideoTitle(startTime, endTime);

      // Append the blob to form data.
      formData.append('file', blob, filename);
      formData.append('title', videoTitle);

      try {
        const response: Response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/videos/upload/`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${session?.user.access}`,
            },
            body: formData,
          }
        );

        const serverResponse = await response.json();
        console.log(serverResponse);
        if (response.ok) {
          toast.success('Video uploaded successfully!');
          setRecordedChunks([]);
        } else {
          toast.error('Video upload failed');
          const errorBody = await response.json();
          console.log('Upload error:', errorBody);
        }
      } catch (error) {
        console.error('Error uploading video:', error);
        toast.error(`Error: ${error}`);
      }
    }
  }, [recordedChunks, setRecordedChunks]);

  /**
   * Set loading state to false. Called when webcam is loaded.
   */
  const handleUserMedia = () => {
    setIsLoading(false);
  };

  // Apply a conditional styles based on loading state
  const contentClass = isLoading ? 'opacity-0' : 'opacity-100';

  return (
    <>
      {isLoading && (
        <div
          className={
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform'
          }
        >
          <Circles width={100} height={100} color={'#0EA5E9'} />
        </div>
      )}
      {/* Apply contentClass to conditionally toggle visibility */}
      <section className={`relative max-w-7xl text-center ${contentClass}`}>
        <div className="relative w-full">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="relative z-10 h-full w-full object-contain p-2"
            onUserMedia={handleUserMedia}
          />
          <canvas
            ref={canvasRef}
            className="absolute left-0 top-0 z-20 h-full w-full"
          />
        </div>
        <section className="my-3 flex w-full justify-around">
          <ActionButton
            onClick={capture}
            bgColor="bg-sky-500"
            icon="f7:camera"
            tooltipId="capture-anchor"
            tooltipText="Take a screenshot and make a prediction."
          />
          <ActionButton
            onClick={changeSurveillanceStatus}
            bgColor="bg-sky-500"
            icon="icon-park-outline:surveillance-cameras-one"
            tooltipId="surveil-anchor"
            tooltipText={
              isSurveilling ? 'Stop surveillance' : 'Start surveillance'
            }
          />
          <ActionButton
            onClick={isRecording ? stopRecording : startRecording}
            bgColor="bg-sky-500"
            icon="solar:videocamera-record-linear"
            tooltipId="record-anchor"
            tooltipText={
              isRecording ? 'Stop recording video' : 'Start recording video'
            }
          />
          <ActionButton
            onClick={
              recordedChunks.length > 0
                ? downloadRecording
                : () => {
                    toast.error('Nothing has been recorded!');
                  }
            }
            bgColor={recordedChunks.length > 0 ? 'bg-sky-500' : 'bg-gray-500'}
            icon="tabler:download"
            tooltipId="download-anchor"
            tooltipText="Download recorded video"
          />
          <ActionButton
            onClick={
              recordedChunks.length > 0
                ? sendRecordingToServer
                : () => {
                    toast.error('Nothing has been recorded!');
                  }
            }
            bgColor={recordedChunks.length > 0 ? 'bg-sky-500' : 'bg-gray-500'}
            icon="carbon:save"
            tooltipId="save-anchor"
            tooltipText="Save recorded video to server"
          />
        </section>
      </section>
    </>
  );
}
