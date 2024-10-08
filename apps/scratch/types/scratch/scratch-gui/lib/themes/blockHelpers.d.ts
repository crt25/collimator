import { ColorTheme } from "@scratch-submodule/scratch-gui/src/lib/themes";

// https://github.com/scratchfoundation/scratch-gui/blob/develop/src/lib/themes/blockHelpers.js
declare module "@scratch-submodule/scratch-gui/src/lib/themes/blockHelpers" {
  /**
   * Applies extension color theme to categories.
   * No changes are applied if called with the default theme, allowing extensions to provide their own colors.
   * These colors are not seen if the category provides a blockIconURI.
   * @param dynamicBlockXML - XML for each category of extension blocks, returned from getBlocksXML
   * in the vm runtime.
   * @param theme - Theme name
   * @returns Dynamic block XML updated with colors.
   */
  export const injectExtensionBlockTheme: <T>(
    dynamicBlockXML: T,
    theme: ColorTheme
  ) => T;

  /**
   * Applies extension color theme to static block json.
   * No changes are applied if called with the default theme, allowing extensions to provide their own colors.
   * @param blockInfoJson - Static block json
   * @param theme - Theme name
   * @returns Block info json with updated colors. The original blockInfoJson is not modified.
   */
  export const injectExtensionCategoryTheme: <T>(
    blockInfoJson: T,
    theme: ColorTheme
  ) => T;
}
