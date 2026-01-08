import {
  Colors,
  ColorSet,
  ColorTheme,
  getColorsForTheme,
} from "@scratch-submodule/packages/scratch-gui/src/lib/themes";

type ColorsExtended = Colors & {
  Assertions: ColorSet;
};

export const getCrtColorsTheme = (themeName: ColorTheme): ColorsExtended => {
  const theme = getColorsForTheme(themeName);

  theme.pen = theme.control;

  return { ...theme, Assertions: theme.control };
};
