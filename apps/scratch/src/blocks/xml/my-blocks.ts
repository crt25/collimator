import { ColorSet } from "@scratch-submodule/scratch-gui/src/lib/themes";

export const buildMyBlocksXml = function (
  isInitialSetup: boolean,
  isStage: boolean,
  targetId: string,
  colors: ColorSet,
): string {
  // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
  return `
    <category
        name="%{BKY_CATEGORY_MYBLOCKS}"
        id="myBlocks"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}"
        custom="PROCEDURE">
    </category>
    `;
};
