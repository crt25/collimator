type FillOrStrokeStyle = string | CanvasGradient | CanvasPattern;

export const createReferenceSymbol = (
  size: number,
  fill: FillOrStrokeStyle,
  strokeWidth = 0,
  stroke = "black",
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = fill;
    ctx.font = `${size * 1.25}px serif`;
    ctx.fillText("𝓡", 0, size);

    if (strokeWidth > 0) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = stroke;
      ctx.strokeText("𝓡", 0, size);
    }
  }

  return canvas;
};
