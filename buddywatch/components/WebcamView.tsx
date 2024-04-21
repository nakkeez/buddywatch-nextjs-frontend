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
 * Component that uses connected webcam to display the camera feed and provide functionality for
 * making a single prediction, toggling surveillance, and recording video feed.
 *
 * @returns {React.JSX.Element} A React element that renders a webcam and set of action buttons to the user.
 */
export default function WebcamView(): React.JSX.Element {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const isRecordingRef = useRef<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSurveilling, setIsSurveilling] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = React.useState<Blob[]>([]);
  const [startTime, setStartTime] = React.useState(0);
  const [endTime, setEndTime] = React.useState(0);
  const [isAutoRecording, setIsAutoRecording] = useState<boolean>(false);
  const [emptyImageCount, setEmptyImageCount] = useState<number>(0);

  const { data: session } = useSession();

  // Reference to the current value of isSurveilling. Needed for consistent concurrent behavior
  const isSurveillingRef = useRef(isSurveilling);

  // Update the reference whenever isSurveilling changes
  useEffect(() => {
    isSurveillingRef.current = isSurveilling;
  }, [isSurveilling]);

  /**
   * Start and stop auto recording based on the confidence score of the object detection model.
   *
   * @param {any} confidence Confidence score of the object detection model's prediction
   */
  const handleAutoRecording = (confidence: any) => {
    const isPersonDetected: boolean = confidence > 0.7;
    if (isPersonDetected && !isRecordingRef.current) {
      if (isSurveillingRef.current) {
        startRecording();
      }
    } else if (isPersonDetected && isRecordingRef.current) {
      setEmptyImageCount(0);
    } else if (!isPersonDetected && isRecordingRef.current) {
      setEmptyImageCount(emptyImageCount + 1);
      // Stop recording if 10 consecutive images without person in them are detected
      if (emptyImageCount >= 10) {
        stopRecording();
        setEmptyImageCount(0);
      }
    }
  };

  /**
   * Send image to the object detection model in the server.
   * Get a response with bounding box coordinates and confidence score back from the server.
   * Resize canvas and drawn the bounding box to the HTML canvas.
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
        if (isSurveilling && isAutoRecording) {
          handleAutoRecording(serverResponse.prediction.confidence);
        }
      }
    } catch (error) {
      toast.error('Error while sending data to the server!');
      console.error('Error while communicating with server:', error);
    }
  };

  // Initialize interval to send images to the server for object detection.
  useEffect(() => {
    if (isSurveilling) {
      interval = setInterval((): void => {
        const imageSrc: string | null | undefined =
          webcamRef.current?.getScreenshot();
        sendImageToServer(imageSrc);
      }, 100);
    } else {
      clearInterval(interval);
    }

    return (): void => {
      clearInterval(interval);
    };
  }, [webcamRef.current, isSurveilling, isAutoRecording, sendImageToServer]);

  /**
   * Take an image and send that image to the server.
   */
  const capture = (): void => {
    try {
      if (webcamRef.current) {
        const imageSrc: string | null | undefined =
          webcamRef.current?.getScreenshot();
        sendImageToServer(imageSrc);
        setTimeout(clearCanvas, 2000);
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
   * Change surveillance status and notify user about it.
   * Remove drawn bounding box from the canvas.
   */
  const clearCanvas = (): void => {
    const context: CanvasRenderingContext2D | null | undefined =
      canvasRef.current?.getContext('2d');
    context?.clearRect(0, 0, context.canvas.width, context.canvas.height);
  };

  /**
   * Store recorded data chunks into state when media stream ends.
   *
   * @param {BlobEvent} data Blob object containing recorded data
   */
  const storeRecordingIntoState = useCallback(
    ({ data }: BlobEvent): void => {
      if (data.size > 0) {
        setRecordedChunks((prev: Blob[]) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  /**
   * Start recording current media stream and place callback to store
   * the recorded data chucks into state when data becomes available.
   * Capture the start time of the recording.
   */
  const startRecording = useCallback((): void => {
    // Clear previously recorded chunks
    setRecordedChunks([]);

    if (webcamRef.current && webcamRef.current.stream) {
      const startTime: number = new Date().getTime(); // Capture start time
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: 'video/webm',
      });
      mediaRecorderRef.current.ondataavailable = storeRecordingIntoState;
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.start();
        isRecordingRef.current = true;
        setStartTime(startTime);
        toast.success('Recording started!');
      }
    } else {
      toast.error('Webcam not found!');
    }
  }, [webcamRef, mediaRecorderRef, storeRecordingIntoState]);

  /**
   * Stop recording current media stream. Capture the end time of the recording.
   */
  const stopRecording = useCallback((): void => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      isRecordingRef.current = false;

      const endTime: number = new Date().getTime();
      setEndTime(endTime);

      toast.success('Recording stopped!');
    }
  }, [mediaRecorderRef, webcamRef]);

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
  }, [recordedChunks, startTime, endTime, session?.user.username]);

  /**
   * Format Unix timestamps into user's preferred datetime format.
   *
   * @param {number} start Unix epoch for start time
   * @param {number} end Unix epoch for end time
   * @returns {string} Datetime in local time format
   */
  const formatVideoTitle = (start: number, end: number): string => {
    const startString: string = new Date(start).toLocaleString();

    const endString: string = new Date(end).toLocaleString();

    return `${startString} - ${endString}`;
  };

  /**
   * Convert recorded data chunks into webm Blob and send it to the server.
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

  useEffect(() => {
    // Download recorded media stream into user's device when auto recording is enabled
    // This is done to prevent issues with concurrency when using interval
    if (isAutoRecording && recordedChunks.length > 0) {
      sendRecordingToServer();
    }
  }, [isAutoRecording, recordedChunks, sendRecordingToServer]);

  /**
   * Set loading state to false. Called when webcam is loaded.
   */
  const handleUserMedia = () => {
    setIsLoading(false);
  };

  /**
   * Enable or disable surveillance and notify user about it.
   * Remove drawn bounding box from the canvas after one seconds
   * of stopping surveillance.
   */
  const toggleSurveillance = (): void => {
    setIsSurveilling(!isSurveilling);

    if (!isSurveilling) {
      toast.success('Surveillance started!');
    } else {
      toast.success('Surveillance stopped!');
    }
  };

  useEffect(() => {
    if (!isSurveilling) {
      if (isRecordingRef.current) {
        stopRecording();
      }
      clearInterval(interval);
      setTimeout(clearCanvas, 1000);
    }
  }, [isSurveilling]);

  /**
   * Enable or disable auto recording status and notify user about it.
   *
   */
  const toggleAutoRecording = (): void => {
    if (isAutoRecording) {
      setIsAutoRecording(false);
      toast.success('Auto recording disabled!');
    } else {
      setIsAutoRecording(true);
      toast.success('Auto recording enabled!');
    }
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
        <section className="my-3 flex w-full justify-around rounded-xl bg-gray-200 py-4 dark:bg-gray-400">
          <ActionButton
            onClick={capture}
            bgColor="bg-sky-500"
            icon="f7:camera"
            tooltipId="capture-anchor"
            tooltipText="Take a screenshot and make a prediction."
          />
          <ActionButton
            onClick={toggleSurveillance}
            bgColor={isSurveilling ? 'bg-green-600' : 'bg-sky-500'}
            icon="icon-park-outline:surveillance-cameras-one"
            tooltipId="surveil-anchor"
            tooltipText={
              isSurveilling ? 'Stop surveillance' : 'Start surveillance'
            }
          />
          <ActionButton
            onClick={
              isRecordingRef.current
                ? () => {
                    toast.error(
                      'Cannot enable auto recording while recording!'
                    );
                  }
                : toggleAutoRecording
            }
            bgColor={
              isRecordingRef.current && isAutoRecording
                ? 'bg-green-900'
                : isRecordingRef.current && !isAutoRecording
                  ? 'bg-gray-500'
                  : isAutoRecording
                    ? 'bg-green-600'
                    : 'bg-sky-500'
            }
            icon="ph:vinyl-record-light"
            tooltipId="autorecord-anchor"
            tooltipText={
              isRecordingRef.current && isAutoRecording
                ? 'Cannot change setting during auto recording'
                : !isRecordingRef.current && isAutoRecording
                  ? 'Disable auto recording'
                  : 'Enable auto recording when person is detected'
            }
          />
          <ActionButton
            onClick={
              isAutoRecording
                ? () => {
                    toast.error(
                      'Cannot start recording while auto recording is enabled!'
                    );
                  }
                : isRecordingRef.current
                  ? stopRecording
                  : startRecording
            }
            bgColor={
              isAutoRecording
                ? 'bg-gray-500'
                : isRecordingRef.current
                  ? 'bg-green-600'
                  : 'bg-sky-500'
            }
            icon="solar:videocamera-record-linear"
            tooltipId="record-anchor"
            tooltipText={
              isRecordingRef.current
                ? 'Stop recording video'
                : 'Start recording video'
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
