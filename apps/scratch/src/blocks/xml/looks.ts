import { ColorSet } from "@scratch-submodule/scratch-gui/src/lib/themes";
import ScratchBlocks from "scratch-blocks";
import { categorySeparator } from "./constants";
import { filterNotAllowedBlocks } from "./helpers";

export enum LooksOpCode {
  sayforsecs = "looks_sayforsecs",
  say = "looks_say",
  thinkforsecs = "looks_thinkforsecs",
  think = "looks_think",
  switchbackdropto = "looks_switchbackdropto",
  switchbackdroptoandwait = "looks_switchbackdroptoandwait",
  nextbackdrop = "looks_nextbackdrop",
  switchcostumeto = "looks_switchcostumeto",
  nextcostume = "looks_nextcostume",
  changesizeby = "looks_changesizeby",
  setsizeto = "looks_setsizeto",
  changeeffectby = "looks_changeeffectby",
  seteffectto = "looks_seteffectto",
  cleargraphiceffects = "looks_cleargraphiceffects",
  show = "looks_show",
  hide = "looks_hide",
  gotofrontback = "looks_gotofrontback",
  goforwardbackwardlayers = "looks_goforwardbackwardlayers",
  backdropnumbername = "looks_backdropnumbername",
  costumenumbername = "looks_costumenumbername",
  size = "looks_size",
}

const hello = ScratchBlocks.ScratchMsgs.translate("LOOKS_HELLO", "Hello!");
const hmm = ScratchBlocks.ScratchMsgs.translate("LOOKS_HMM", "Hmm...");

const looksXmlByOpCode: Record<
  LooksOpCode,
  (
    isStage: boolean,
    targetId: string,
    costumeName: string,
    backdropName: string,
  ) => string
> = {
  [LooksOpCode.sayforsecs]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="looks_sayforsecs">
            <value name="MESSAGE">
                <shadow type="text">
                    <field name="TEXT">${hello}</field>
                </shadow>
            </value>
            <value name="SECS">
                <shadow type="math_number">
                    <field name="NUM">2</field>
                </shadow>
            </value>
        </block>`,
  [LooksOpCode.say]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="looks_say">
            <value name="MESSAGE">
                <shadow type="text">
                    <field name="TEXT">${hello}</field>
                </shadow>
            </value>
        </block>`,
  [LooksOpCode.thinkforsecs]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="looks_thinkforsecs">
            <value name="MESSAGE">
                <shadow type="text">
                    <field name="TEXT">${hmm}</field>
                </shadow>
            </value>
            <value name="SECS">
                <shadow type="math_number">
                    <field name="NUM">2</field>
                </shadow>
            </value>
        </block>`,
  [LooksOpCode.think]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="looks_think">
            <value name="MESSAGE">
                <shadow type="text">
                    <field name="TEXT">${hmm}</field>
                </shadow>
            </value>
        </block>`,
  [LooksOpCode.switchbackdropto]: (
    _isStage,
    _targetId,
    _costumeName,
    backdropName,
  ) => `
        <block type="looks_switchbackdropto">
            <value name="BACKDROP">
                <shadow type="looks_backdrops">
                    <field name="BACKDROP">${backdropName}</field>
                </shadow>
            </value>
        </block>`,
  [LooksOpCode.switchbackdroptoandwait]: (
    isStage,
    _targetId,
    _costumeName,
    backdropName,
  ) =>
    isStage
      ? `
        <block type="looks_switchbackdroptoandwait">
            <value name="BACKDROP">
                <shadow type="looks_backdrops">
                    <field name="BACKDROP">${backdropName}</field>
                </shadow>
            </value>
        </block>`
      : "",
  [LooksOpCode.nextbackdrop]: () => `
        <block type="looks_nextbackdrop"/>`,
  [LooksOpCode.switchcostumeto]: (_isStage, targetId, costumeName) => `
        <block id="${targetId}__looks_switchcostumeto" type="looks_switchcostumeto">
            <value name="COSTUME">
                <shadow type="looks_costume">
                    <field name="COSTUME">${costumeName}</field>
                </shadow>
            </value>
        </block>`,
  [LooksOpCode.nextcostume]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="looks_nextcostume"/>`,
  [LooksOpCode.changesizeby]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="looks_changesizeby">
            <value name="CHANGE">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>`,
  [LooksOpCode.setsizeto]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="looks_setsizeto">
            <value name="SIZE">
                <shadow type="math_number">
                    <field name="NUM">100</field>
                </shadow>
            </value>
        </block>`,
  [LooksOpCode.changeeffectby]: () => `
        <block type="looks_changeeffectby">
            <value name="CHANGE">
                <shadow type="math_number">
                    <field name="NUM">25</field>
                </shadow>
            </value>
        </block>`,
  [LooksOpCode.seteffectto]: () => `
        <block type="looks_seteffectto">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>`,
  [LooksOpCode.cleargraphiceffects]: () => `
        <block type="looks_cleargraphiceffects"/>`,
  [LooksOpCode.show]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="looks_show"/>`,
  [LooksOpCode.hide]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="looks_hide"/>`,
  [LooksOpCode.gotofrontback]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="looks_gotofrontback"/>`,
  [LooksOpCode.goforwardbackwardlayers]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="looks_goforwardbackwardlayers">
            <value name="NUM">
                <shadow type="math_integer">
                    <field name="NUM">1</field>
                </shadow>
            </value>
        </block>`,
  [LooksOpCode.backdropnumbername]: () => `
        <block id="backdropnumbername" type="looks_backdropnumbername"/>`,
  [LooksOpCode.costumenumbername]: (isStage, targetId) =>
    isStage
      ? ""
      : `
        <block id="${targetId}__looks_costumenumbername" type="looks_costumenumbername"/>`,
  [LooksOpCode.size]: (isStage, targetId) =>
    isStage
      ? ""
      : `
        <block id="${targetId}__looks_size" type="looks_size"/>`,
};

export const buildLooksXml = function (
  isInitialSetup: boolean,
  isStage: boolean,
  targetId: string,
  costumeName: string,
  backdropName: string,
  colors: ColorSet,
  blockLimits: Partial<Record<LooksOpCode, number>> = {},
): string {
  const xml = Object.entries(blockLimits)
    .filter(filterNotAllowedBlocks)
    .map(([opCode]) => {
      const entry = looksXmlByOpCode[opCode as LooksOpCode];

      if (!entry) {
        return "";
      }

      return entry(isStage, targetId, costumeName, backdropName);
    })
    .join("");

  if (xml.length === 0) {
    return "";
  }

  // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
  return `
    <category name="%{BKY_CATEGORY_LOOKS}" id="looks" colour="${colors.primary}" secondaryColour="${colors.tertiary}">
        ${xml}
        ${categorySeparator}
    </category>
    `;
};
