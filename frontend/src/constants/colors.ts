// define colors that must be used in javascript.
// should be moved to CSS variables the next time this is touched.
type RgbColor = [number, number, number];

const dataPointDefault: RgbColor = [155, 89, 182];
const dataPointMixed: RgbColor = [0, 0, 0];
const dataPointSuccess: RgbColor = [39, 174, 96];
const dataPointPartialSuccess: RgbColor = [243, 156, 18];
const dataPointNoSuccess: RgbColor = [231, 76, 60];

const groupLabelColor = "rgba(0, 0, 0, 0.5)";

const deleteSplitLabelColor = "rgba(255, 99, 132, 0.5)";
const deleteSplitLabelColorHover = "rgba(255, 99, 132, 1)";
const deletSplitLabelBackgroundColor = "rgb(255, 255, 255)";

const highlighBorderColor = "rgba(241,196,15,1)";

export const Colors = {
  dataPoint: {
    default: dataPointDefault,
    mixed: dataPointMixed,
    success: dataPointSuccess,
    partialSuccess: dataPointPartialSuccess,
    noSuccess: dataPointNoSuccess,
    selectedBorderColor: highlighBorderColor,
  },
  chartLabel: {
    groupLabelColor,
    deleteSplitLabelColor,
    deletSplitLabelBackgroundColor,
    deleteSplitLabelColorHover,
  },
};
