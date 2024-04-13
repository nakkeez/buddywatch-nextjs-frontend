'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import { Watch } from 'react-loader-spinner';
import { drawPredictions } from '@/utils/drawPredictions';
import { resizeCanvas } from '@/utils/resizeCanvas';

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
  const capture = useCallback((): void => {
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
  }, [webcamRef]);

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

      const response = await fetch('http://localhost:8000/api/predict/', {
        method: 'POST',
        body: data,
      });

      const serverResponse = await response.json();

      resizeCanvas(canvasRef, webcamRef);
      drawPredictions(serverResponse, canvasRef);
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

      // Append the blob to form data.
      formData.append('file', blob, `${getCurrentDate()}_buddywatch.webm`);
      formData.append('name', 'Buddywatch Recording');

      console.log(formData);

      try {
        const response = await fetch('http://localhost:8000/api/upload/', {
          method: 'POST',
          body: formData,
        });

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
          <button
            onClick={capture}
            className="w-36 rounded-lg bg-sky-500 py-2 font-bold text-white hover:bg-sky-700"
          >
            Make Prediction
          </button>
          <button
            onClick={changeSurveillanceStatus}
            className="w-36 rounded-lg bg-sky-500 py-2 font-bold text-white hover:bg-sky-700"
          >
            {surveil ? 'Stop Surveilling' : 'Start Surveiling'}
          </button>
          <button
            onClick={capturing ? stopRecording : startRecording}
            className="w-36 rounded-lg bg-sky-500 py-2 font-bold text-white hover:bg-sky-700"
          >
            {capturing ? 'Stop Recording' : 'Start Recording'}
          </button>
          {recordedChunks.length > 0 ? (
            <>
              <button
                onClick={downloadRecording}
                className="w-36 rounded-lg bg-sky-500 py-2 font-bold text-white hover:bg-sky-700"
              >
                Download Video
              </button>
              <button
                onClick={sendRecordingToServer}
                className="w-36 rounded-lg bg-sky-500 py-2 font-bold text-white hover:bg-sky-700"
              >
                Save Video
              </button>
            </>
          ) : (
            <>
              <button
                className="w-36 rounded-lg bg-gray-500 py-2 font-bold text-white"
                onClick={() => {
                  toast.error('Nothing has been recorded!');
                }}
              >
                Download Video
              </button>
              <button
                className="w-36 rounded-lg bg-gray-500 py-2 font-bold text-white"
                onClick={() => {
                  toast.error('Nothing has been recorded!');
                }}
              >
                Save Video
              </button>
            </>
          )}
        </section>
      </section>
    </>
  );
}
