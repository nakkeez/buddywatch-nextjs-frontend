export function drawPredictions(
  prediction: any,
  renderingContext: CanvasRenderingContext2D | null | undefined,
): void {
  const { bbox, confidence } = prediction.prediction;
  const [x, y, width, height] = bbox;

  if (renderingContext && confidence > 0.8) {
    renderingContext.beginPath(); // Draw new line

    renderingContext.font = "12px Courier New";
    renderingContext.fillStyle = "#FF0F0F";
    renderingContext.globalAlpha = 0.4;

    renderingContext.roundRect(x * 680, y * 480, width * 680, height * 480);
    renderingContext.fill();

    renderingContext.font = "16px Courier New";
    renderingContext.globalAlpha = 1;

    renderingContext.fillText("person", x * 680, y * 480);
  }
}
