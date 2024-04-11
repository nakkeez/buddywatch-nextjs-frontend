import React from 'react';

interface PredictionData {
  bbox: [number, number, number, number];
  confidence: number;
}

interface ApiResponse {
  prediction: PredictionData;
}

/**
 * Draw a rectangle matching the bounding box coordinates got from the server.
 *
 * @param {ApiResponse} prediction Response from server containing the object detection model's prediction
 * @param {React.RefObject<HTMLCanvasElement>} canvas Reference to the HTMLCanvasElement where the rectangle will be drawn
 */
export function drawPredictions(
  prediction: ApiResponse,
  canvas: React.RefObject<HTMLCanvasElement>
): void {
  const { bbox, confidence } = prediction.prediction;
  // Get bounding box coordinates
  const [xmin, ymin, xmax, ymax] = bbox;

  if (canvas.current) {
    const renderingContext: CanvasRenderingContext2D | null =
      canvas.current.getContext('2d');
    if (renderingContext && confidence > 0.6) {
      const { width, height } = canvas.current;
      renderingContext.beginPath(); // Draw new line

      renderingContext.font = '12px Courier New';
      renderingContext.fillStyle = '#FF0F0F';
      renderingContext.globalAlpha = 0.2;

      // Scale coordinates that are in a normalized format
      renderingContext.roundRect(
        xmin * width,
        ymin * height,
        xmax * width,
        ymax * height
      );
      renderingContext.fill();
    }
  }
}
