import { ColorSet } from "@scratch-submodule/packages/scratch-gui/src/lib/themes";
import ScratchBlocks from "scratch-blocks";
import { categorySeparator } from "./constants";
import { filterNotAllowedBlocks } from "./helpers";

export enum SensingOpCode {
  touchingobject = "sensing_touchingobject",
  touchingcolor = "sensing_touchingcolor",
  coloristouchingcolor = "sensing_coloristouchingcolor",
  distanceto = "sensing_distanceto",
  askandwait = "sensing_askandwait",
  answer = "sensing_answer",
  keypressed = "sensing_keypressed",
  mousedown = "sensing_mousedown",
  mousex = "sensing_mousex",
  mousey = "sensing_mousey",
  setdragmode = "sensing_setdragmode",
  loudness = "sensing_loudness",
  timer = "sensing_timer",
  resettimer = "sensing_resettimer",
  of = "sensing_of",
  current = "sensing_current",
  dayssince2000 = "sensing_dayssince2000",
  username = "sensing_username",
}

const name = ScratchBlocks.ScratchMsgs.translate(
  "SENSING_ASK_TEXT",
  "What's your name?",
);

const sensingXmlByOpCode: Record<
  SensingOpCode,
  (isStage: boolean, isInitialSetup: boolean) => string
> = {
  [SensingOpCode.touchingobject]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="sensing_touchingobject">
            <value name="TOUCHINGOBJECTMENU">
                <shadow type="sensing_touchingobjectmenu"/>
            </value>
        </block>`,
  [SensingOpCode.touchingcolor]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="sensing_touchingcolor">
            <value name="COLOR">
                <shadow type="colour_picker"/>
            </value>
        </block>`,
  [SensingOpCode.coloristouchingcolor]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="sensing_coloristouchingcolor">
            <value name="COLOR">
                <shadow type="colour_picker"/>
            </value>
            <value name="COLOR2">
                <shadow type="colour_picker"/>
            </value>
        </block>`,
  [SensingOpCode.distanceto]: (isStage: boolean) =>
    isStage
      ? ""
      : `
        <block type="sensing_distanceto">
            <value name="DISTANCETOMENU">
                <shadow type="sensing_distancetomenu"/>
            </value>
        </block>`,
  [SensingOpCode.askandwait]: (_isStage, isInitialSetup) =>
    isInitialSetup
      ? ""
      : `
        <block id="sensing_askandwait" type="sensing_askandwait">
            <value name="QUESTION">
                <shadow type="text">
                    <field name="TEXT">${name}</field>
                </shadow>
            </value>
        </block>`,
  [SensingOpCode.answer]: () => `
        <block id="sensing_answer" type="sensing_answer"/>`,
  [SensingOpCode.keypressed]: () => `
        <block type="sensing_keypressed">
            <value name="KEY_OPTION">
                <shadow type="sensing_keyoptions"/>
            </value>
        </block>`,
  [SensingOpCode.mousedown]: () => `
        <block type="sensing_mousedown"/>`,
  [SensingOpCode.mousex]: () => `
        <block type="sensing_mousex"/>`,
  [SensingOpCode.mousey]: () => `
        <block type="sensing_mousey"/>`,
  [SensingOpCode.setdragmode]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="sensing_setdragmode" id="sensing_setdragmode"/>`,
  [SensingOpCode.loudness]: () => `
        <block id="sensing_loudness" type="sensing_loudness"/>`,
  [SensingOpCode.timer]: () => `
        <block id="sensing_timer" type="sensing_timer"/>`,
  [SensingOpCode.resettimer]: () => `
        <block type="sensing_resettimer"/>`,
  [SensingOpCode.of]: () => `
        <block id="sensing_of" type="sensing_of">
            <value name="OBJECT">
                <shadow id="sensing_of_object_menu" type="sensing_of_object_menu"/>
            </value>
        </block>`,
  [SensingOpCode.current]: () => `
        <block id="sensing_current" type="sensing_current"/>`,
  [SensingOpCode.dayssince2000]: () => `
        <block type="sensing_dayssince2000"/>`,
  [SensingOpCode.username]: () => `
        <block type="sensing_username"/>`,
};

export const buildSensingXml = function (
  isInitialSetup: boolean,
  isStage: boolean,
  targetId: string,
  colors: ColorSet,
  blockLimits: Partial<Record<SensingOpCode, number>> = {},
): string {
  const xml = Object.entries(blockLimits)
    .filter(filterNotAllowedBlocks)
    .map(([opCode]) => {
      const entry = sensingXmlByOpCode[opCode as SensingOpCode];

      if (!entry) {
        return "";
      }

      return entry(isStage, isInitialSetup);
    })
    .join("");

  if (xml.length === 0) {
    return "";
  }

  // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
  return `
    <category
        name="%{BKY_CATEGORY_SENSING}"
        id="sensing"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}">
        ${xml}
        ${categorySeparator}
    </category>
    `;
};
