"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { drawPredictions } from "@/utils/drawPredictions";
import { resizeCanvas } from "@/utils/resizeCanvas";

let interval: any = null;

export default function WebcamView() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    sendImageToServer(imageSrc);
  }, [webcamRef]);

  const sendImageToServer = (imageSrc: any): void => {
    if (!imageSrc) return;

    // Convert Base64 string to a Blob
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file: File = new File([blob], "image.jpg", {
          type: "image/jpeg",
        });

        const data: FormData = new FormData();
        data.append("image", file);

        fetch("http://localhost:8000/api/predict/", {
          method: "POST",
          body: data,
        })
          .then((response) => response.json())
          .then((data) => {
            resizeCanvas(canvasRef, webcamRef);
            drawPredictions(data, canvasRef.current?.getContext("2d"));
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      });
  };

  const changeSurveillanceStatus = (): void => {
    if (surveil) {
      setSurveil(false);
      const context = canvasRef.current?.getContext("2d");
      context?.clearRect(0, 0, context.canvas.width, context.canvas.height);
    } else setSurveil(true);
  };

  return (
    <section className="max-w-7xl relative text-center">
      <div className="border-2 relative w-full">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="h-full w-full object-contain p-2 relative z-10"
        ></Webcam>
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full z-20" // z-20
        />
      </div>
      <button
        onClick={capture}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Screenshot
      </button>
      <button
        onClick={() => {
          changeSurveillanceStatus();
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Surveil
      </button>
    </section>
  );
}
