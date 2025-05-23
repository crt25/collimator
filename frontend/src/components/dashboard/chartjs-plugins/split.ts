import { Chart, ChartType, Plugin } from "chart.js";
import {
  blockDeletingSplits,
  isAlreadyHandled,
  markAsHandled,
  unblockDeletingSplits,
} from "../hacks";

interface PartialChartPluginOptions {
  split?: Options;
}

interface Selection {
  startX: number;
  startY: number;
  width: number;
  height: number;

  isDragging: boolean;
}

export enum SplitType {
  horizontal = "horizontal",
  vertical = "vertical",
}

type HorizontalSplit = {
  type: SplitType.horizontal;
  y: number;
};

type VerticalSplit = {
  type: SplitType.vertical;
  x: number;
};

export type ChartSplit = HorizontalSplit | VerticalSplit;

interface Options {
  enabled?: boolean;
  onAddSplit?: (split: ChartSplit) => void;
}

// declare plugin option typings https://www.chartjs.org/docs/latest/developers/plugins.html#typescript-typings
declare module "chart.js" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType extends ChartType> {
    split: Options;
  }
}

const defaultSelection: Selection = {
  startX: 0,
  startY: 0,
  width: 0,
  height: 0,

  isDragging: false,
};

const overlayClass = "canvas-split-overlay";
const minimumDistanceDragged = 20;
const cursorThickness = 2;

const SplitPlugin: Plugin & {
  initChart: (chart: Chart) => void;
  cleanupListeners?: () => Selection;
} = {
  id: "split-plugin",

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

    if (opts.split?.enabled) {
      if (overlay === null) {
        overlay = createOverlayHtmlCanvasElement(chart);
        parent.prepend(overlay);
      }

      this.cleanupListeners = initOverlayCanvas(
        chart,
        overlay,
        opts.split,
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

    if (!opts.split?.enabled) {
      return;
    }

    const overlay = getOverlayCanvas(chart);
    overlay.width = size.width;
    overlay.height = size.height;
  },

  beforeDestroy(chart) {
    const opts = chart.config.options?.plugins as PartialChartPluginOptions;

    if (!opts.split?.enabled) {
      return;
    }

    const overlay = getOverlayCanvas(chart);
    overlay.remove();

    if (this.cleanupListeners) {
      this.cleanupListeners();
    }
  },

  beforeEvent(chart, args) {
    const opts = chart.config.options?.plugins as PartialChartPluginOptions;
    const onAddSplit = opts?.split?.onAddSplit;

    if (!opts.split?.enabled) {
      return;
    }

    if (!onAddSplit) {
      return;
    }

    if (args.event.type === "click") {
      const chartCanvas = chart.canvas;
      const evt = args.event.native as MouseEvent;
      if (!evt) {
        return;
      }

      if (isAlreadyHandled(evt)) {
        return;
      }

      const rect = chartCanvas.getBoundingClientRect();
      const { x, y } = getCoordinatesInChartArea(
        chart,
        evt.clientX - rect.left,
        evt.clientY - rect.top,
      );

      if (addNewSplit(chart, x, y, onAddSplit, x, y)) {
        // if a split was added, block any click event within the event propagation
        markAsHandled(evt);
        unblockDeletingSplits(chart);
      }
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

const addNewSplit = (
  chart: Chart,
  originalX: number,
  originalY: number,
  onAddSplit: (split: ChartSplit) => void,
  splitX: number,
  splitY: number,
): boolean => {
  if (isXSplit(chart, originalX, originalY)) {
    const xFraction =
      (splitX - chart.chartArea.left) /
      (chart.chartArea.right - chart.chartArea.left);
    const { min: minX, max: maxX } = chart.scales.x;

    onAddSplit({
      type: SplitType.vertical,
      x: (maxX - minX) * xFraction + minX,
    });
  } else if (isYSplit(chart, originalX, originalY)) {
    const yFraction =
      // 1 minus because the DOM coordinate system is top to bottom whereas a graph is bottom to top
      1 -
      (splitY - chart.chartArea.top) /
        (chart.chartArea.bottom - chart.chartArea.top);

    const { min: minY, max: maxY } = chart.scales.y;

    onAddSplit({
      type: SplitType.horizontal,
      y: (maxY - minY) * yFraction + minY,
    });
  } else {
    return false;
  }

  return true;
};

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
  const onAddSplit = options?.onAddSplit;

  if (!onAddSplit) {
    return () => selection;
  }

  const onPointerDown = (evt: PointerEvent): void => {
    const rect = chartCanvas.getBoundingClientRect();
    const { x, y } = getCoordinatesInChartArea(
      chart,
      evt.clientX - rect.left,
      evt.clientY - rect.top,
    );

    selection.startX = x;
    selection.startY = y;

    selection.isDragging = true;

    // pointerup may be anywhere on the window
    window.addEventListener(
      "pointerup",
      (evt) => {
        if (isMinimumDistanceDragged(selection)) {
          const chartContentRect = chartCanvas.getBoundingClientRect();

          const { x, y } = getCoordinatesInChartArea(
            chart,
            evt.clientX - chartContentRect.left,
            evt.clientY - chartContentRect.top,
          );

          addNewSplit(
            chart,
            selection.startX,
            selection.startY,
            onAddSplit,
            x,
            y,
          );

          // block any click event within the event propagation
          blockDeletingSplits(chart);
        }

        selection = { ...defaultSelection };
        ctx.clearRect(0, 0, overlay.width, overlay.height);
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

      if (isXSplit(chart, selection.startX, selection.startY)) {
        // x-axis selection

        ctx.fillRect(
          currentX - cursorThickness,
          chart.chartArea.top,
          cursorThickness,
          chart.chartArea.bottom - chart.chartArea.top,
        );
      } else if (isYSplit(chart, selection.startX, selection.startY)) {
        // y-axis selection

        ctx.fillRect(
          chart.chartArea.left,
          currentY - cursorThickness,
          chart.chartArea.right - chart.chartArea.left,
          cursorThickness,
        );
      }
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

const isXSplit = (
  chart: Chart,
  originalX: number,
  originalY: number,
): boolean =>
  // within the x-axis
  chart.chartArea.bottom <= originalY &&
  chart.chartArea.left <= originalX &&
  chart.chartArea.right >= originalX;

const isYSplit = (
  chart: Chart,
  originalX: number,
  originalY: number,
): boolean =>
  // within the y-axis
  chart.chartArea.left >= originalX &&
  chart.chartArea.bottom >= originalY &&
  chart.chartArea.top <= originalY;

const isMinimumDistanceDragged = (selection: Selection): boolean =>
  Math.max(Math.abs(selection.height), Math.abs(selection.width)) >=
  minimumDistanceDragged;

export default SplitPlugin;
