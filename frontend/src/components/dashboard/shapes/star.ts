type FillOrStrokeStyle = string | CanvasGradient | CanvasPattern;

const drawStar = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  fillStyle: FillOrStrokeStyle,
  strokeWidth = 0,
  strokeStyle: FillOrStrokeStyle = "black",
): void => {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  if (strokeWidth > 0) {
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }

  ctx.fillStyle = fillStyle;
  ctx.fill();
};

export const createStar = (
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
    drawStar(
      ctx,
      size / 2,
      size / 2,
      5,
      size / 3,
      size / 6,
      fill,
      strokeWidth,
      stroke,
    );
  }

  return canvas;
};
