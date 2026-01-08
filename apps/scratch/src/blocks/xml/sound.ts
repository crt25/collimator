import { ColorSet } from "@scratch-submodule/packages/scratch-gui/src/lib/themes";
import { categorySeparator } from "./constants";
import { filterNotAllowedBlocks } from "./helpers";

export enum SoundOpCode {
  playuntildone = "sound_playuntildone",
  play = "sound_play",
  stopallsounds = "sound_stopallsounds",
  changeeffectby = "sound_changeeffectby",
  seteffectto = "sound_seteffectto",
  cleareffects = "sound_cleareffects",
  changevolumeby = "sound_changevolumeby",
  setvolumeto = "sound_setvolumeto",
  volume = "sound_volume",
}

const soundXmlByOpCode: Record<
  SoundOpCode,
  (targetId: string, soundName: string) => string
> = {
  [SoundOpCode.playuntildone]: (targetId, soundName) => `
        <block id="${targetId}__sound_playuntildone" type="sound_playuntildone">
            <value name="SOUND_MENU">
                <shadow type="sound_sounds_menu">
                    <field name="SOUND_MENU">${soundName}</field>
                </shadow>
            </value>
        </block>`,
  [SoundOpCode.play]: (targetId, soundName) => `
        <block id="${targetId}__sound_play" type="sound_play">
            <value name="SOUND_MENU">
                <shadow type="sound_sounds_menu">
                    <field name="SOUND_MENU">${soundName}</field>
                </shadow>
            </value>
        </block>`,
  [SoundOpCode.stopallsounds]: () => `
        <block type="sound_stopallsounds"/>`,
  [SoundOpCode.changeeffectby]: () => `
        <block type="sound_changeeffectby">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>`,
  [SoundOpCode.seteffectto]: () => `
        <block type="sound_seteffectto">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">100</field>
                </shadow>
            </value>
        </block>`,
  [SoundOpCode.cleareffects]: () => `
        <block type="sound_cleareffects"/>`,
  [SoundOpCode.changevolumeby]: () => `
        <block type="sound_changevolumeby">
            <value name="VOLUME">
                <shadow type="math_number">
                    <field name="NUM">-10</field>
                </shadow>
            </value>
        </block>`,
  [SoundOpCode.setvolumeto]: () => `
        <block type="sound_setvolumeto">
            <value name="VOLUME">
                <shadow type="math_number">
                    <field name="NUM">100</field>
                </shadow>
            </value>
        </block>`,
  [SoundOpCode.volume]: (targetId) => `
        <block id="${targetId}__sound_volume" type="sound_volume"/>`,
};

export const buildSoundXml = function (
  isInitialSetup: boolean,
  isStage: boolean,
  targetId: string,
  soundName: string,
  colors: ColorSet,
  blockLimits: Partial<Record<SoundOpCode, number>> = {},
): string {
  const xml = Object.entries(blockLimits)
    .filter(filterNotAllowedBlocks)
    .map(([opCode]) => {
      const entry = soundXmlByOpCode[opCode as SoundOpCode];

      if (!entry) {
        return "";
      }

      return entry(targetId, soundName);
    })
    .join("");

  if (xml.length === 0) {
    return "";
  }

  // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
  return `
    <category name="%{BKY_CATEGORY_SOUND}" id="sound" colour="${colors.primary}" secondaryColour="${colors.tertiary}">
        ${xml}
        ${categorySeparator}
    </category>
    `;
};
