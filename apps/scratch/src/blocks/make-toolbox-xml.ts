import { Colors } from "@scratch-submodule/scratch-gui/src/lib/themes";
import { buildMotionXml, MotionOpCode } from "./xml/motion";
import { buildLooksXml, LooksOpCode } from "./xml/looks";
import { buildSoundXml, SoundOpCode } from "./xml/sound";
import { buildEventXml, EventOpCode } from "./xml/event";
import { buildControlXml, ControlOpCode } from "./xml/control";
import { buildSensingXml, SensingOpCode } from "./xml/sensing";
import { buildOperatorsXml, OperatorsOpCode } from "./xml/operators";
import { buildVariablesXml } from "./xml/data";
import { buildMyBlocksXml } from "./xml/my-blocks";
import { categorySeparator } from "./xml/constants";

const xmlEscape = function (unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c: string) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
    }

    throw new Error("Unexpected character in xmlEscape");
  });
};

const xmlOpen = '<xml style="display: none">';
const xmlClose = "</xml>";

const allBlocksAreDisabled = `<category name="All blocks are disabled" />`;

/**
 * The number of blocks that are allowed to be used for a given task.
 * For variables and custom blocks, it is just a boolean value as in
 * whether they are allowed or not.
 * If a block id is not present in the object, it is assumed to be 0.
 * If an entry is 0, the block is not shown in the toolbox.
 * If an entry is negative, the block can be used an unlimited number of times.
 */
export type BlockLimits = Partial<Record<MotionOpCode, number>> &
  Partial<Record<LooksOpCode, number>> &
  Partial<Record<SoundOpCode, number>> &
  Partial<Record<EventOpCode, number>> &
  Partial<Record<ControlOpCode, number>> &
  Partial<Record<SensingOpCode, number>> &
  Partial<Record<OperatorsOpCode, number>> & {
    variables?: boolean;
    customBlocks?: boolean;
  } & {
    [key: string]: number | boolean | undefined;
  };

const createDictionaryWithAllValuesInfinite = (
  object: Record<string, string>,
): Record<string, number> =>
  Object.values(object).reduce((acc, key) => ({ ...acc, [key]: -1 }), {});

const allowAllMotionBlocks: BlockLimits =
  createDictionaryWithAllValuesInfinite(MotionOpCode);

const allowAllLooksBlocks: BlockLimits =
  createDictionaryWithAllValuesInfinite(LooksOpCode);

const allowAllSoundBlocks: BlockLimits =
  createDictionaryWithAllValuesInfinite(SoundOpCode);

const allowAllEventBlocks: BlockLimits =
  createDictionaryWithAllValuesInfinite(EventOpCode);

const allowAllControlBlocks: BlockLimits =
  createDictionaryWithAllValuesInfinite(ControlOpCode);

const allowAllSensingBlocks: BlockLimits =
  createDictionaryWithAllValuesInfinite(SensingOpCode);

const allowAllOperatorsBlocks: BlockLimits =
  createDictionaryWithAllValuesInfinite(OperatorsOpCode);

export const allowAllStandardBlocks: BlockLimits = {
  ...allowAllMotionBlocks,
  ...allowAllLooksBlocks,
  ...allowAllSoundBlocks,
  ...allowAllEventBlocks,
  ...allowAllControlBlocks,
  ...allowAllSensingBlocks,
  ...allowAllOperatorsBlocks,
  variables: true,
  customBlocks: true,
};

export const allowNoBlocks: BlockLimits = {};

/**
 * @param isInitialSetup - Whether the toolbox is for initial setup. If the mode is "initial setup",
 * blocks with localized default parameters (e.g. ask and wait) should not be loaded. (LLK/scratch-gui#5445)
 * @param isStage - Whether the toolbox is for a stage-type target. This is always set to true
 * when isInitialSetup is true.
 * @param colors - The colors for the theme.
 * @param targetId - The current editing target
 * @param categoriesXML - optional array of `{id,xml}` for categories. This can include both core
 * and other extensions: core extensions will be placed in the normal Scratch order; others will go at the bottom.
 * @property id - the extension / category ID.
 * @property xml - the `<category>...</category>` XML for this extension / category.
 * @param costumeName - The name of the default selected costume dropdown.
 * @param backdropName - The name of the default selected backdrop dropdown.
 * @param soundName -  The name of the default selected sound dropdown.
 * @param blockLimits - The number of blocks that are allowed to be used for a given task. Null means all blocks are allowed.
 * @returns- a ScratchBlocks-style XML document for the contents of the toolbox.
 */
const makeToolboxXML = function (
  isInitialSetup: boolean,
  isStage = true,
  targetId: string,
  colors: Colors,
  categoriesXML: { id: string; xml: string }[] = [],
  costumeName: string = "",
  backdropName: string = "",
  soundName: string = "",
  blockLimits: BlockLimits | null = null,
): string {
  isStage = isInitialSetup || isStage;
  const gap = categorySeparator;

  costumeName = xmlEscape(costumeName);
  backdropName = xmlEscape(backdropName);
  soundName = xmlEscape(soundName);

  categoriesXML = categoriesXML.slice();
  const moveCategory = (categoryId: string): string | undefined => {
    const index = categoriesXML.findIndex(
      (categoryInfo) => categoryInfo.id === categoryId,
    );
    if (index >= 0) {
      // remove the category from categoriesXML and return its XML
      const [categoryInfo] = categoriesXML.splice(index, 1);
      return categoryInfo.xml;
    }
    return undefined;
  };
  const motionXML =
    moveCategory("motion") ||
    buildMotionXml(
      isInitialSetup,
      isStage,
      targetId,
      colors.motion,
      blockLimits ?? allowAllMotionBlocks,
    );
  const looksXML =
    moveCategory("looks") ||
    buildLooksXml(
      isInitialSetup,
      isStage,
      targetId,
      costumeName,
      backdropName,
      colors.looks,
      blockLimits ?? allowAllLooksBlocks,
    );
  const soundXML =
    moveCategory("sound") ||
    buildSoundXml(
      isInitialSetup,
      isStage,
      targetId,
      soundName,
      colors.sounds,
      blockLimits ?? allowAllSoundBlocks,
    );
  const eventsXML =
    moveCategory("event") ||
    buildEventXml(
      isInitialSetup,
      isStage,
      targetId,
      colors.event,
      blockLimits ?? allowAllEventBlocks,
    );
  const controlXML =
    moveCategory("control") ||
    buildControlXml(
      isInitialSetup,
      isStage,
      targetId,
      colors.control,
      blockLimits ?? allowAllControlBlocks,
    );
  const sensingXML =
    moveCategory("sensing") ||
    buildSensingXml(
      isInitialSetup,
      isStage,
      targetId,
      colors.sensing,
      blockLimits ?? allowAllSensingBlocks,
    );
  const operatorsXML =
    moveCategory("operators") ||
    buildOperatorsXml(
      isInitialSetup,
      isStage,
      targetId,
      colors.operators,
      blockLimits ?? allowAllOperatorsBlocks,
    );
  const variablesXML =
    moveCategory("data") ||
    buildVariablesXml(isInitialSetup, isStage, targetId, colors.data);
  const myBlocksXML =
    moveCategory("procedures") ||
    buildMyBlocksXml(isInitialSetup, isStage, targetId, colors.more);

  const everything: string[] = [
    xmlOpen,
    motionXML,
    gap,
    looksXML,
    gap,
    soundXML,
    gap,
    eventsXML,
    gap,
    controlXML,
    gap,
    sensingXML,
    gap,
    operatorsXML,
    gap,
    blockLimits == null || blockLimits.variables ? variablesXML : "",
    gap,
    blockLimits == null || blockLimits.customBlocks ? myBlocksXML : "",
  ];

  for (const extensionCategory of categoriesXML) {
    if (blockLimits !== null) {
      // find all <block type="{opcode}"> elements and check them against blockLimits
      extensionCategory.xml = extensionCategory.xml.replace(
        /<block type="([^"]+)">.*?<\/block>/g,
        (match, opcode) => {
          // if the opcode is not in any of the blockLimits, return the match
          if (opcode in blockLimits) {
            const limit = blockLimits[opcode];
            if (limit === 0) {
              // if the limit is 0, don't show the block
              return "";
            }
          } else {
            // if the opcode is not in blockLimits, don't show the block
            return "";
          }

          return match;
        },
      );
    }

    // check if the xml still contains some <block> elements
    if (extensionCategory.xml.includes("<block")) {
      // if so, add the category to the toolbox
      everything.push(extensionCategory.xml);
    }
  }

  if (!everything.find((xml) => xml.includes("<category"))) {
    // if all blocks are disabled, show a message
    everything.push(allBlocksAreDisabled);
  }

  everything.push(xmlClose);
  return everything.join("\n");
};

export default makeToolboxXML;
