// https://github.com/scratchfoundation/scratch-gui/blob/develop/src/lib/themes/index.js
declare module "@scratch-submodule/scratch-gui/src/lib/themes" {
  export interface ColorSet {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  }

  export interface Colors {
    motion: ColorSet;
    looks: ColorSet;
    sounds: ColorSet;
    control: ColorSet;
    event: ColorSet;
    sensing: ColorSet;
    pen: ColorSet;
    operators: ColorSet;
    data: ColorSet;
    // This is not a new category, but rather for differentiation
    // between lists and scalar variables.
    data_lists: ColorSet;
    more: ColorSet;
    text: string;
    workspace: string;
    toolboxHover: string;
    toolboxSelected: string;
    toolboxText: string;
    toolbox: string;
    flyout: string;
    scrollbar: string;
    scrollbarHover: string;
    textField: string;
    textFieldText: string;
    insertionMarker: string;
    insertionMarkerOpacity: number;
    dragShadowOpacity: number;
    stackGlow: string;
    stackGlowSize: number;
    stackGlowOpacity: number;
    replacementGlow: string;
    replacementGlowSize: number;
    replacementGlowOpacity: number;
    colourPickerStroke: string;
    // CSS colours: support RGBA
    fieldShadow: string;
    dropDownShadow: string;
    numPadBackground: string;
    numPadBorder: string;
    numPadActiveBackground: string;
    numPadText: string; // Do not use hex here, it cannot be inlined with data-uri SVG
    valueReportBackground: string;
    valueReportBorder: string;
    menuHover: string;
  }

  export enum ColorTheme {
    Default = "default",
    Dark = "dark",
    HightContrast = "high-contrast",
  }

  export interface Theme {
    blocksMediaFolder: string;
    colors: Colors;
    extensions: Record<string, unknown>;
    label: string;
    icon: string;
  }

  export const DEFAULT_THEME = ColorTheme.Default;
  export const DARK_THEME = ColorTheme.Dark;
  export const HIGH_CONTRAST_THEME = ColorTheme.HightContrast;
  export const defaultColors: Colors;

  export const getColorsForTheme: (theme: ColorTheme) => Colors;
  export const themeMap: Record<ColorTheme, Theme>;
}
