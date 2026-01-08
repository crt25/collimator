import { ColorSet } from "@scratch-submodule/packages/scratch-gui/src/lib/themes";
import { categorySeparator } from "./constants";
import { filterNotAllowedBlocks } from "./helpers";

export enum ControlOpCode {
  wait = "control_wait",
  repeat = "control_repeat",
  forever = "control_forever",
  if = "control_if",
  if_else = "control_if_else",
  wait_until = "control_wait_until",
  repeat_until = "control_repeat_until",
  stop = "control_stop",
  create_clone_of = "control_create_clone_of",
  start_as_clone = "control_start_as_clone",
  delete_this_clone = "control_delete_this_clone",
}

const controlXmlByOpCode: Record<ControlOpCode, (isStage: boolean) => string> =
  {
    [ControlOpCode.wait]: () => `
        <block type="control_wait">
            <value name="DURATION">
                <shadow type="math_positive_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
        </block>`,
    [ControlOpCode.repeat]: () => `
        <block type="control_repeat">
            <value name="TIMES">
                <shadow type="math_whole_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>`,
    [ControlOpCode.forever]: () => `
        <block id="control_forever" type="control_forever"/>`,
    [ControlOpCode.if]: () => `
        <block type="control_if"/>`,
    [ControlOpCode.if_else]: () => `
        <block type="control_if_else"/>`,
    [ControlOpCode.wait_until]: () => `
        <block id="control_wait_until" type="control_wait_until"/>`,
    [ControlOpCode.repeat_until]: () => `
        <block id="control_repeat_until" type="control_repeat_until"/>`,
    [ControlOpCode.stop]: () => `
        <block type="control_stop"/>`,
    [ControlOpCode.create_clone_of]: () => `
        <block type="control_create_clone_of">
            <value name="CLONE_OPTION">
                <shadow type="control_create_clone_of_menu"/>
            </value>
        </block>`,
    [ControlOpCode.start_as_clone]: (iStage) =>
      iStage
        ? ""
        : `
        <block type="control_start_as_clone"/>`,
    [ControlOpCode.delete_this_clone]: (iStage) =>
      iStage
        ? ""
        : `
        <block type="control_delete_this_clone"/>`,
  };

export const buildControlXml = function (
  isInitialSetup: boolean,
  isStage: boolean,
  targetId: string,
  colors: ColorSet,
  blockLimits: Partial<Record<ControlOpCode, number>> = {},
): string {
  const xml = Object.entries(blockLimits)
    .filter(filterNotAllowedBlocks)
    .map(([opCode]) => {
      const entry = controlXmlByOpCode[opCode as ControlOpCode];

      if (!entry) {
        return "";
      }

      return entry(isStage);
    })
    .join("");

  if (xml.length === 0) {
    return "";
  }

  // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
  return `
    <category
        name="%{BKY_CATEGORY_CONTROL}"
        id="control"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}">
        ${xml}
        ${categorySeparator}
    </category>
    `;
};
