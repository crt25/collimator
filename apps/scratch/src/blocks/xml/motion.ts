import { ColorSet } from "@scratch-submodule/packages/scratch-gui/src/lib/themes";
import ScratchBlocks from "scratch-blocks";
import { categorySeparator } from "./constants";
import { filterNotAllowedBlocks } from "./helpers";

export enum MotionOpCode {
  movesteps = "motion_movesteps",
  turnright = "motion_turnright",
  turnleft = "motion_turnleft",
  goto = "motion_goto",
  gotoxy = "motion_gotoxy",
  glideto = "motion_glideto",
  glidesecstoxy = "motion_glidesecstoxy",
  pointindirection = "motion_pointindirection",
  pointtowards = "motion_pointtowards",
  changexby = "motion_changexby",
  setx = "motion_setx",
  changeyby = "motion_changeyby",
  sety = "motion_sety",
  ifonedgebounce = "motion_ifonedgebounce",
  setrotationstyle = "motion_setrotationstyle",
  xposition = "motion_xposition",
  yposition = "motion_yposition",
  direction = "motion_direction",
}

const motionXmlByOpCode: Record<MotionOpCode, (targetId: string) => string> = {
  [MotionOpCode.movesteps]: () => `
    <block type="motion_movesteps">
        <value name="STEPS">
            <shadow type="math_number">
                <field name="NUM">10</field>
            </shadow>
        </value>
    </block>`,
  [MotionOpCode.turnright]: () => `
    <block type="motion_turnright">
        <value name="DEGREES">
            <shadow type="math_number">
                <field name="NUM">15</field>
            </shadow>
        </value>
    </block>`,
  [MotionOpCode.turnleft]: () => `
    <block type="motion_turnleft">
        <value name="DEGREES">
            <shadow type="math_number">
                <field name="NUM">15</field>
            </shadow>
        </value>
    </block>`,
  [MotionOpCode.goto]: () => `
    <block type="motion_goto">
        <value name="TO">
            <shadow type="motion_goto_menu">
            </shadow>
        </value>
    </block>`,
  [MotionOpCode.gotoxy]: () => `
    <block type="motion_gotoxy">
        <value name="X">
            <shadow id="movex" type="math_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="Y">
            <shadow id="movey" type="math_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
    </block>`,
  [MotionOpCode.glideto]: () => `
    <block type="motion_glideto" id="motion_glideto">
        <value name="SECS">
            <shadow type="math_number">
                <field name="NUM">1</field>
            </shadow>
        </value>
        <value name="TO">
            <shadow type="motion_glideto_menu">
            </shadow>
        </value>
    </block>`,
  [MotionOpCode.glidesecstoxy]: () => `
    <block type="motion_glidesecstoxy">
        <value name="SECS">
            <shadow type="math_number">
                <field name="NUM">1</field>
            </shadow>
        </value>
        <value name="X">
            <shadow id="glidex" type="math_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
        <value name="Y">
            <shadow id="glidey" type="math_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
    </block>`,
  [MotionOpCode.pointindirection]: () => `
    <block type="motion_pointindirection">
        <value name="DIRECTION">
            <shadow type="math_angle">
                <field name="NUM">90</field>
            </shadow>
        </value>
    </block>`,
  [MotionOpCode.pointtowards]: () => `
    <block type="motion_pointtowards">
        <value name="TOWARDS">
            <shadow type="motion_pointtowards_menu">
            </shadow>
        </value>
    </block>`,
  [MotionOpCode.changexby]: () => `
    <block type="motion_changexby">
        <value name="DX">
            <shadow type="math_number">
                <field name="NUM">10</field>
            </shadow>
        </value>
    </block>`,
  [MotionOpCode.setx]: () => `
    <block type="motion_setx">
        <value name="X">
            <shadow id="setx" type="math_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
    </block>`,
  [MotionOpCode.changeyby]: () => `
    <block type="motion_changeyby">
        <value name="DY">
            <shadow type="math_number">
                <field name="NUM">10</field>
            </shadow>
        </value>
    </block>`,
  [MotionOpCode.sety]: () => `
    <block type="motion_sety">
        <value name="Y">
            <shadow id="sety" type="math_number">
                <field name="NUM">0</field>
            </shadow>
        </value>
    </block>`,
  [MotionOpCode.ifonedgebounce]: () => `
    <block type="motion_ifonedgebounce"/>`,
  [MotionOpCode.setrotationstyle]: () => `
    <block type="motion_setrotationstyle"/>`,
  [MotionOpCode.xposition]: (targetId) => `
    <block id="${targetId}__motion_xposition" type="motion_xposition"/>`,
  [MotionOpCode.yposition]: (targetId) => `
    <block id="${targetId}__motion_yposition" type="motion_yposition"/>`,
  [MotionOpCode.direction]: (targetId) => `
    <block id="${targetId}__motion_direction" type="motion_direction"/>`,
};

/* eslint-disable no-unused-vars */
export const buildMotionXml = function (
  isInitialSetup: boolean,
  isStage: boolean,
  targetId: string,
  colors: ColorSet,
  blockLimits: Partial<Record<MotionOpCode, number>> = {},
): string {
  const stageSelected = ScratchBlocks.ScratchMsgs.translate(
    "MOTION_STAGE_SELECTED",
    "Stage selected: no motion blocks",
  );
  // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
  const xml = Object.entries(blockLimits)
    .filter(filterNotAllowedBlocks)
    .map(([opCode]) => {
      const entry = motionXmlByOpCode[opCode as MotionOpCode];

      if (!entry) {
        return "";
      }

      return entry(targetId);
    })
    .join("");

  if (xml.length === 0) {
    return "";
  }

  return `
    <category name="%{BKY_CATEGORY_MOTION}" id="motion" colour="${colors.primary}" secondaryColour="${colors.tertiary}">
        ${isStage ? `<label text="${stageSelected}"></label>` : xml}
        ${categorySeparator}
    </category>
    `;
};
