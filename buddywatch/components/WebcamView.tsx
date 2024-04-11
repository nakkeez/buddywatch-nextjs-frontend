'use client';

import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import { Watch } from 'react-loader-spinner';
import { drawPredictions } from '@/utils/drawPredictions';
import { resizeCanvas } from '@/utils/resizeCanvas';

let interval: any = null;

export default function WebcamView() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [surveil, setSurveil] = useState<boolean>(false);

  useEffect(() => {
    if (surveil) {
      interval = setInterval((): void => {
        const imageSrc: string | null | undefined =
          webcamRef.current?.getScreenshot();
        sendImageToServer(imageSrc);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [webcamRef.current, surveil]);

  const capture = React.useCallback((): void => {
    const imageSrc: string | null | undefined =
      webcamRef.current?.getScreenshot();
    toast.info('Screenshot taken!');
    sendImageToServer(imageSrc);
  }, [webcamRef]);

  const sendImageToServer = (imageSrc: any): void => {
    if (!imageSrc) return;

    // Convert Base64 string to a Blob
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file: File = new File([blob], 'image.jpg', {
          type: 'image/jpeg',
        });

        const data: FormData = new FormData();
        data.append('image', file);

        fetch('http://localhost:8000/api/predict/', {
          method: 'POST',
          body: data,
        })
          .then((response) => response.json())
          .then((data) => {
            resizeCanvas(canvasRef, webcamRef);
            drawPredictions(data, canvasRef.current?.getContext('2d'));
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      });
  };

  const changeSurveillanceStatus = (): void => {
    if (surveil) {
      setSurveil(false);
      const context = canvasRef.current?.getContext('2d');
      context?.clearRect(0, 0, context.canvas.width, context.canvas.height);
      toast.info('Surveillance stopped!');
    } else {
      setSurveil(true);
      toast.info('Surveillance stopped!');
    }
  };

  const handleUserMedia = () => {
    setLoading(false); // Set loading to false when webcam is loaded
  };

  // Apply a conditional styles based on loading state
  const contentClass = loading ? 'opacity-0' : 'opacity-100';

  return (
    <>
      {loading && (
        <div className={'flex items-center justify-center'}>
          <Watch color={'#0EA5E9'} /> {/* Show loading spinner */}
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
        <button
          onClick={capture}
          className="rounded bg-sky-500 px-4 py-2 font-bold text-white hover:bg-sky-700"
        >
          Screenshot
        </button>
        <button
          onClick={() => {
            changeSurveillanceStatus();
          }}
          className="rounded bg-sky-500 px-4 py-2 font-bold text-white hover:bg-sky-700"
        >
          Surveil
        </button>
      </section>
    </>
  );
}
