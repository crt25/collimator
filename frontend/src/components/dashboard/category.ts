import { defineMessages, IntlShape } from "react-intl";
import pattern from "patternomaly";
import { Colors } from "@/constants/colors";

const messages = defineMessages({
  xAxis: {
    id: "Category.xAxis",
    defaultMessage: "x-Axis",
  },
  yAxis: {
    id: "Category.yAxis",
    defaultMessage: "y-Axis",
  },
  noTests: {
    id: "Category.noTests",
    defaultMessage: "Without tests",
  },
  automaticGroup: {
    id: "Category.automaticGroup",
    defaultMessage: "Automatic Group",
  },
  allTestsPass: {
    id: "Category.allTestsPass",
    defaultMessage: "All tests pass",
  },
  someTestsPass: {
    id: "Category.partiallyCorrect",
    defaultMessage: "Some tests pass",
  },
  noTestsPass: {
    id: "Category.inCorrect",
    defaultMessage: "No test passes",
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
  // whether there is at least one test
  hasTests = 1 << 1,
  // whether at least one test passes
  passesSomeTests = 1 << 2,
  // whether all tests pass
  passesAllTests = 1 << 3,
  // whether it is an automatic group
  isAutomaticGroup = 1 << 4,
}

const hasFlag = (category: Category, flag: Category): boolean =>
  (category & flag) === flag;

export const getCategoryName = (
  intl: IntlShape,
  category: Category,
): string => {
  const hasTests = hasFlag(category, Category.hasTests);
  const passesATest = hasFlag(category, Category.passesSomeTests);
  const passesAllTests = hasFlag(category, Category.passesAllTests);
  const matchesFilter = hasFlag(category, Category.matchesFilters);
  const isAutomaticGroup = hasFlag(category, Category.isAutomaticGroup);

  let name = isAutomaticGroup
    ? intl.formatMessage(messages.automaticGroup)
    : intl.formatMessage(messages.noTests);

  if (hasTests) {
    if (passesAllTests) {
      name = intl.formatMessage(messages.allTestsPass);
    } else if (passesATest) {
      name = intl.formatMessage(messages.someTestsPass);
    } else {
      name = intl.formatMessage(messages.noTestsPass);
    }
  }

  if (!matchesFilter) {
    name += " (" + intl.formatMessage(messages.filteredOut) + ")";
  }

  return name;
};

type PatternType = Parameters<typeof pattern.draw>[0];

export const getCanvasPattern = (
  category: Category,
): string | CanvasPattern => {
  const hasTests = hasFlag(category, Category.hasTests);
  const passesATest = hasFlag(category, Category.passesSomeTests);
  const passesAllTests = hasFlag(category, Category.passesAllTests);
  const matchesFilter = hasFlag(category, Category.matchesFilters);

  let color: [number, number, number] = Colors.dataPoint.default;
  let alpha = 1;
  let patternName: PatternType | null = "zigzag";

  if (hasTests) {
    if (passesAllTests) {
      color = Colors.dataPoint.success;
      patternName = null;
    } else if (passesATest) {
      color = Colors.dataPoint.partialSuccess;
      patternName = "triangle";
    } else {
      color = Colors.dataPoint.noSuccess;
      patternName = "diagonal";
    }
  }

  if (!matchesFilter) {
    alpha = 0.25;
  }

  const colorString = `rgba(${color.slice(0, 3).join(" ")} / ${alpha})`;

  if (patternName) {
    return pattern.draw(patternName, colorString);
  }

  return colorString;
};
