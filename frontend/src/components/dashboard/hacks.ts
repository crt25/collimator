import { Chart } from "chart.js";
import { EventContext } from "chartjs-plugin-annotation";

export const isAlreadyHandled = (event: Event): boolean =>
  "handled" in event ? true : false;

export const markAsHandled = (event: Event): void => {
  // @ts-expect-error This is an annoying way working around the fact that stopImmediatePropagation doesn't work
  event["handled"] = true;
};

export const cannotDeleteSplits = (ctx: EventContext): boolean =>
  "blockDeletes" in ctx.chart;

export const blockDeletingSplits = (chart: Chart): void => {
  // @ts-expect-error Works around the weird event system of chartjs
  chart["blockDeletes"] = true;
};

export const unblockDeletingSplits = (chart: Chart): void => {
  if ("blockDeletes" in chart) {
    delete chart["blockDeletes"];
  }
};
