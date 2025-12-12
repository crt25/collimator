import { ColorSet } from "@scratch-submodule/packages/scratch-gui/src/lib/themes";

export const buildVariablesXml = function (
  isInitialSetup: boolean,
  isStage: boolean,
  targetId: string,
  colors: ColorSet,
): string {
  // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
  return `
    <category
        name="%{BKY_CATEGORY_VARIABLES}"
        id="variables"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}"
        custom="VARIABLE">
    </category>
    `;
};
