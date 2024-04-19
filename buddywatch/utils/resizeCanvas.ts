import React from 'react';
import Webcam from 'react-webcam';

/**
 * Send image to the object detection model in the server.
 * Get a response with bounding box coordinates and confidence score back from the server.
 * Resize canvas and drawn the bounding boxes in to the canvas.
 *
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef reference to HTMLCanvasElement that will be resized
 * @param {React.RefObject<Webcam>} webcamRef reference to Webcam against which the size of the canvas is changed
 */
export function resizeCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  webcamRef: React.RefObject<Webcam>
): void {
  const canvas: HTMLCanvasElement | null = canvasRef.current;
  const videoFeed: HTMLVideoElement | null | undefined =
    webcamRef.current?.video;

  if (canvas && videoFeed) {
    canvas.width = videoFeed.videoWidth;
    canvas.height = videoFeed.videoHeight;
  }
}
