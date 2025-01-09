import { Chart } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

// globally register external plugins
Chart.register(annotationPlugin);

export { default as SplitPlugin } from "./split";
export * from "./split";

export { default as SelectPlugin } from "./select";
export * from "./select";
