import { Chart, ChartType, Plugin } from "chart.js";
import { markAsHandled } from "../hacks";

interface PartialChartPluginOptions {
  select?: Options;
}

interface Selection {
  startX: number;
  startY: number;
  width: number;
  height: number;

  isDragging: boolean;
}

interface Options {
  enabled?: boolean;
  onSelection?: (selection: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    unionWithPrevious: boolean;
  }) => void;
  fillColor?: string | CanvasGradient | CanvasPattern;
}

// declare plugin option typings https://www.chartjs.org/docs/latest/developers/plugins.html#typescript-typings
declare module "chart.js" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType extends ChartType> {
    select: Options;
  }
}

const defaultSelection: Selection = {
  startX: 0,
  startY: 0,
  width: 0,
  height: 0,

  isDragging: false,
};

const overlayClass = "canvas-select-overlay";
const minSelection = 20;

const SelectPlugin: Plugin & {
  initChart: (chart: Chart) => void;
  cleanupListeners?: () => Selection;
} = {
  id: "select-plugin",

  cleanupListeners: undefined,

  initChart(chart) {
    const parent = chart.canvas.parentElement;

    if (!parent) {
      return;
    }

    const opts = chart.config.options?.plugins as PartialChartPluginOptions;

    let overlay = parent.querySelector<HTMLCanvasElement>(
      `canvas.${overlayClass}`,
    );

    let initialSelection = defaultSelection;

    if (this.cleanupListeners) {
      initialSelection = this.cleanupListeners();
    }

    if (opts.select?.enabled) {
      if (overlay === null) {
        overlay = createOverlayHtmlCanvasElement(chart);
        parent.prepend(overlay);
      }

      this.cleanupListeners = initOverlayCanvas(
        chart,
        overlay,
        opts.select,
        initialSelection,
      );
    } else {
      this.cleanupListeners = undefined;
    }
  },

  beforeInit(chart) {
    this.initChart(chart);
  },

  afterUpdate(chart) {
    this.initChart(chart);
  },

  resize(chart, { size }) {
    const opts = chart.config.options?.plugins as PartialChartPluginOptions;

    if (!opts.select?.enabled) {
      return;
    }

    const overlay = getOverlayCanvas(chart);
    overlay.width = size.width;
    overlay.height = size.height;
  },

  beforeDestroy(chart) {
    const opts = chart.config.options?.plugins as PartialChartPluginOptions;

    if (!opts.select?.enabled) {
      return;
    }

    const overlay = getOverlayCanvas(chart);
    overlay.remove();

    if (this.cleanupListeners) {
      this.cleanupListeners();
    }
  },
};

const getOverlayCanvas = (chart: Chart): HTMLCanvasElement => {
  const parent = chart.canvas.parentElement;

  if (!parent) {
    throw new Error("The canvas must have a parent element");
  }

  const overlay = parent.querySelector<HTMLCanvasElement>(
    `canvas.${overlayClass}`,
  );

  if (!overlay) {
    throw new Error("Overlay was not found");
  }

  return overlay;
};

const mapRange = (
  value: number,
  min: number,
  max: number,
  toMin: number,
  toMax: number,
  flip = false,
): number =>
  flip
    ? (1 - (value - min) / (max - min)) * (toMax - toMin) + toMin
    : ((value - min) / (max - min)) * (toMax - toMin) + toMin;

const transformXToChartAxisCoordinates = (chart: Chart, x: number): number =>
  mapRange(
    x,
    chart.chartArea.left,
    chart.chartArea.right,
    chart.scales.x.min,
    chart.scales.x.max,
  );

const transformYToChartAxisCoordinates = (chart: Chart, y: number): number =>
  mapRange(
    y,
    chart.chartArea.top,
    chart.chartArea.bottom,
    chart.scales.y.min,
    chart.scales.y.max,
    true,
  );

const initOverlayCanvas = (
  chart: Chart,
  overlay: HTMLCanvasElement,
  options: Options | undefined,
  initialSelection: Selection,
): (() => Selection) => {
  const chartCanvas = chart.canvas;
  const ctx = overlay.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get 2D context of canvas");
  }

  let selection: Selection = { ...initialSelection };
  const onSelection = options?.onSelection;

  if (!onSelection) {
    return () => selection;
  }

  const onPointerDown = (evt: PointerEvent): void => {
    const rect = chartCanvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;

    if (
      x < chart.chartArea.left ||
      x > chart.chartArea.right ||
      y < chart.chartArea.top ||
      y > chart.chartArea.bottom
    ) {
      // pointer is outside of the chart area
      return;
    }

    selection.startX = x;
    selection.startY = y;

    selection.isDragging = true;

    // pointerup/click may be anywhere on the window
    window.addEventListener(
      "click",
      (evt) => {
        const chartContentRect = chartCanvas.getBoundingClientRect();

        const coordinates = getCoordinatesInChartArea(
          chart,
          evt.clientX - chartContentRect.left,
          evt.clientY - chartContentRect.top,
        );

        let minX = Math.min(selection.startX, coordinates.x);
        let maxX = Math.max(selection.startX, coordinates.x);
        let minY = Math.min(selection.startY, coordinates.y);
        let maxY = Math.max(selection.startY, coordinates.y);

        const xDiff = maxX - minX;
        const yDiff = maxY - minY;

        if (xDiff < minSelection) {
          const increaseBy = minSelection - xDiff;
          minX -= increaseBy / 2;
          maxX += increaseBy / 2;
        }

        if (yDiff < minSelection) {
          const increaseBy = minSelection - yDiff;
          minY -= increaseBy / 2;
          maxY += increaseBy / 2;
        }

        onSelection({
          minX: transformXToChartAxisCoordinates(chart, minX),
          maxX: transformXToChartAxisCoordinates(chart, maxX),

          // for the y-axis, we need to flip the min and max because
          // in browser coordinates the y-axis grows from top to bottom
          minY: transformYToChartAxisCoordinates(chart, maxY),
          maxY: transformYToChartAxisCoordinates(chart, minY),

          unionWithPrevious: evt.shiftKey,
        });

        selection = { ...defaultSelection };
        ctx.clearRect(0, 0, overlay.width, overlay.height);

        markAsHandled(evt);
      },
      {
        once: true,
      },
    );
  };

  const onPointerLeave = (): void => {
    if (!selection.isDragging) {
      ctx.clearRect(0, 0, overlay.width, overlay.height);
    }
  };

  const onPointerMove = (evt: PointerEvent): void => {
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    const chartContentRect = chartCanvas.getBoundingClientRect();

    if (selection.isDragging) {
      const { x, y } = getCoordinatesInChartArea(
        chart,
        evt.clientX - chartContentRect.left,
        evt.clientY - chartContentRect.top,
      );

      const currentX = x;
      const currentY = y;

      selection.width = currentX - selection.startX;
      selection.height = currentY - selection.startY;

      ctx.fillStyle = options?.fillColor ?? "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(
        selection.startX,
        selection.startY,
        selection.width,
        selection.height,
      );
    }
  };

  chartCanvas.addEventListener("pointerdown", onPointerDown);
  chartCanvas.addEventListener("pointerleave", onPointerLeave);
  chartCanvas.addEventListener("pointermove", onPointerMove);

  return (): Selection => {
    chartCanvas.removeEventListener("pointerdown", onPointerDown);
    chartCanvas.removeEventListener("pointerleave", onPointerLeave);
    chartCanvas.removeEventListener("pointermove", onPointerMove);

    return selection;
  };
};

const createOverlayHtmlCanvasElement = (
  chartInstance: Chart,
): HTMLCanvasElement => {
  const overlay = document.createElement("canvas");
  overlay.style.position = "absolute";
  overlay.style.pointerEvents = "none";
  overlay.width = chartInstance.canvas.width;
  overlay.height = chartInstance.canvas.height;

  overlay.classList.add(overlayClass);
  return overlay;
};

const getCoordinatesInChartArea = (
  chartInstance: Chart,
  valX: number,
  valY: number,
): {
  x: number;
  y: number;
} => ({
  x: Math.min(
    Math.max(valX, chartInstance.chartArea.left),
    chartInstance.chartArea.right,
  ),
  y: Math.min(
    Math.max(valY, chartInstance.chartArea.top),
    chartInstance.chartArea.bottom,
  ),
});

export default SelectPlugin;
