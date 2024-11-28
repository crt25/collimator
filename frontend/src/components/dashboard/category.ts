import { defineMessages, IntlShape } from "react-intl";
import pattern from "patternomaly";

const messages = defineMessages({
  xAxis: {
    id: "Category.xAxis",
    defaultMessage: "x-Axis",
  },
  yAxis: {
    id: "Category.yAxis",
    defaultMessage: "y-Axis",
  },
  correct: {
    id: "Category.correct",
    defaultMessage: "Correct",
  },
  inCorrect: {
    id: "Category.inCorrect",
    defaultMessage: "Incorrect",
  },
  filteredOut: {
    id: "Category.filteredOut",
    defaultMessage: "filtered out",
  },
});

export enum Category {
  none = 0,
  // whether all filters match
  matchesFilters = 1 << 0,
  // whether all tests pass
  passesTests = 1 << 1,
}

const hasFlag = (category: Category, flag: Category): boolean =>
  (category & flag) === flag;

export const getCategoryName = (
  intl: IntlShape,
  category: Category,
): string => {
  const passesTests = hasFlag(category, Category.passesTests);
  const matchesFilter = hasFlag(category, Category.matchesFilters);

  let name = intl.formatMessage(
    passesTests ? messages.correct : messages.inCorrect,
  );

  if (!matchesFilter) {
    name += " (" + intl.formatMessage(messages.filteredOut) + ")";
  }

  return name;
};

type PatternType = Parameters<typeof pattern.draw>[0];

export const getCanvasPattern = (category: Category): CanvasPattern => {
  const testsPass = hasFlag(category, Category.passesTests);
  const matchesFilter = hasFlag(category, Category.matchesFilters);

  const color: [number, number, number, number] = testsPass
    ? [39, 174, 96, 1]
    : [231, 76, 60, 1];

  const patternName: PatternType = testsPass ? "disc" : "diagonal";

  if (!matchesFilter) {
    color[3] = 0.25;
  }

  const colorString = `rgba(${color.slice(0, 3).join(" ")} / ${color[3]})`;

  return pattern.draw(patternName, colorString);
};
