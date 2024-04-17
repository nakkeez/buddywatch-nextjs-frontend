'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import Webcam from 'react-webcam';
import { useSession } from 'next-auth/react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { Watch } from 'react-loader-spinner';
import { drawPredictions } from '@/utils/drawPredictions';
import { resizeCanvas } from '@/utils/resizeCanvas';
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

  const [loading, setLoading] = useState<boolean>(true);
  const [surveil, setSurveil] = useState<boolean>(false);
  const [capturing, setCapturing] = React.useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = React.useState<Blob[]>([]);

  const { data: session } = useSession();

  useEffect(() => {
    if (surveil) {
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
  }, [webcamRef.current, surveil]);

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
      console.log(session?.user.access);
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
    if (surveil) {
      setSurveil(false);
      const context: CanvasRenderingContext2D | null | undefined =
        canvasRef.current?.getContext('2d');
      context?.clearRect(0, 0, context.canvas.width, context.canvas.height);
      toast.success('Surveillance stopped!');
    } else {
      setSurveil(true);
      toast.success('Surveillance started!');
    }
  };

  /**
   * Start recording current media stream and place callback to store
   * the recorded data chucks into state.
   */
  const startRecording = useCallback((): void => {
    if (webcamRef.current && webcamRef.current.stream) {
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: 'video/webm',
      });
      //
      mediaRecorderRef.current.addEventListener(
        'dataavailable',
        storeRecordingIntoState
      );
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.start();
        setCapturing(true);
        toast.success('Recording started!');
      }
    } else {
      toast.error('Webcam not found!');
    }
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  /**
   * Stop recording current media stream.
   */
  const stopRecording = useCallback((): void => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setCapturing(false);
      toast.success('Recording stopped!');
    }
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  /**
   * Store recorded media into state when media stream ends
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

  const getCurrentDate = (): string => {
    const date: Date = new Date();

    const day: number = date.getDate();
    const month: number = date.getMonth() + 1;
    const year: number = date.getFullYear();

    return `${year}-${month}-${day}`;
  };

  /**
   * Download previously recorded media stream into user's device from state in webm format.
   */
  const downloadRecording = useCallback((): void => {
    if (recordedChunks.length) {
      const blob: Blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      const url: string = URL.createObjectURL(blob);
      const download: HTMLAnchorElement = document.createElement('a');
      document.body.appendChild(download);
      download.href = url;
      download.download = `${getCurrentDate()}_buddywatch.webm`;
      download.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  const sendRecordingToServer = useCallback(async (): Promise<void> => {
    if (recordedChunks.length) {
      const blob: Blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      const formData: FormData = new FormData();

      const videoTitle: string = `${getCurrentDate()}_${uuidv4()}`;

      // Append the blob to form data.
      formData.append('file', blob, `${videoTitle}.webm`);
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
    setLoading(false);
  };

  // Apply a conditional styles based on loading state
  const contentClass = loading ? 'opacity-0' : 'opacity-100';

  return (
    <>
      {loading && (
        <div className={'flex h-screen items-center justify-center'}>
          <Watch width={100} height={100} color={'#0EA5E9'} />{' '}
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
            buttonText="Make Prediction"
            icon={
              <Icon icon="fluent:screenshot-20-filled" width="24" height="24" />
            }
          />
          <ActionButton
            onClick={changeSurveillanceStatus}
            bgColor="bg-sky-500"
            buttonText={surveil ? 'Stop Surveilling' : 'Start Surveiling'}
            icon={
              <Icon
                icon="icon-park-solid:surveillance-cameras-one"
                width="24"
                height="24"
              />
            }
          />
          <ActionButton
            onClick={capturing ? stopRecording : startRecording}
            bgColor="bg-sky-500"
            buttonText={capturing ? 'Stop Recording' : 'Start Recording'}
            icon={<Icon icon="foundation:record" width="24" height="24" />}
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
            buttonText="Download"
            icon={<Icon icon="ic:round-download" width="24" height="24" />}
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
            buttonText="Save Video"
            icon={<Icon icon="ic:baseline-save" width="24" height="24" />}
          />
        </section>
      </section>
    </>
  );
}
