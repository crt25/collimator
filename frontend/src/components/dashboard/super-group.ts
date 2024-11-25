import { defineMessages, IntlShape } from "react-intl";
import pattern from "patternomaly";

const messages = defineMessages({
  xAxis: {
    id: "Analysis.xAxis",
    defaultMessage: "x-Axis",
  },
  yAxis: {
    id: "Analysis.yAxis",
    defaultMessage: "y-Axis",
  },
  correct: {
    id: "Analysis.correct",
    defaultMessage: "Correct",
  },
  inCorrect: {
    id: "Analysis.inCorrect",
    defaultMessage: "Incorrect",
  },
  filteredOut: {
    id: "Analysis.filteredOut",
    defaultMessage: "filtered out",
  },
});

export enum SuperGroup {
  none = 0,
  // whether all filters match
  matches = 1 << 0,
  // whether all tests pass
  testsPass = 1 << 1,
}

const hasFlag = (superGroup: SuperGroup, flag: SuperGroup): boolean =>
  (superGroup & flag) === flag;

export const getSuperGroupName = (
  intl: IntlShape,
  superGroup: SuperGroup,
): string => {
  const testsPass = hasFlag(superGroup, SuperGroup.testsPass);
  const matchesFilter = hasFlag(superGroup, SuperGroup.matches);

  let name = intl.formatMessage(
    testsPass ? messages.correct : messages.inCorrect,
  );

  if (!matchesFilter) {
    name += " (" + intl.formatMessage(messages.filteredOut) + ")";
  }

  return name;
};

type PatternType = Parameters<typeof pattern.draw>[0];

export const getCanvasPattern = (superGroup: SuperGroup): CanvasPattern => {
  const testsPass = hasFlag(superGroup, SuperGroup.testsPass);
  const matchesFilter = hasFlag(superGroup, SuperGroup.matches);

  const color: [number, number, number, number] = testsPass
    ? [46, 204, 113, 1]
    : [231, 76, 60, 1];

  const patternName: PatternType = testsPass ? "disc" : "diagonal";

  if (!matchesFilter) {
    color[3] = 0.25;
  }

  const colorString = `rgba(${color.slice(0, 3).join(" ")} / ${color[3]})`;

  return pattern.draw(patternName, colorString);
};
