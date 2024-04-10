import React from "react";
import Webcam from "react-webcam";

export function resizeCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  webcamRef: React.RefObject<Webcam>,
) {
  const canvas: HTMLCanvasElement | null = canvasRef.current;
  const videoFeed: HTMLVideoElement | null | undefined =
    webcamRef.current?.video;

  if (canvas && videoFeed) {
    canvas.width = videoFeed.videoWidth;
    canvas.height = videoFeed.videoHeight;
  }
}
