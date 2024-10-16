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

export type ShowBlocks = {
  motion: Partial<Record<MotionOpCode, boolean>>;
  looks: Partial<Record<LooksOpCode, boolean>>;
  sound: Partial<Record<SoundOpCode, boolean>>;
  event: Partial<Record<EventOpCode, boolean>>;
  control: Partial<Record<ControlOpCode, boolean>>;
  sensing: Partial<Record<SensingOpCode, boolean>>;
  operators: Partial<Record<OperatorsOpCode, boolean>>;
  variables: boolean;
  customBlocks: boolean;
};

const createDictionaryWithAllValuesTrue = (
  object: Record<string, string>,
): Record<string, boolean> =>
  Object.values(object).reduce((acc, key) => ({ ...acc, [key]: true }), {});

export const showAllBlocks: ShowBlocks = {
  motion: createDictionaryWithAllValuesTrue(MotionOpCode),
  looks: createDictionaryWithAllValuesTrue(LooksOpCode),
  sound: createDictionaryWithAllValuesTrue(SoundOpCode),
  event: createDictionaryWithAllValuesTrue(EventOpCode),
  control: createDictionaryWithAllValuesTrue(ControlOpCode),
  sensing: createDictionaryWithAllValuesTrue(SensingOpCode),
  operators: createDictionaryWithAllValuesTrue(OperatorsOpCode),
  variables: true,
  customBlocks: true,
};

export const showNoBlocks: ShowBlocks = {
  motion: {},
  looks: {},
  sound: {},
  event: {},
  control: {},
  sensing: {},
  operators: {},
  variables: false,
  customBlocks: false,
};

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
  showBlocks: ShowBlocks = showAllBlocks,
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
      showBlocks.motion,
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
      showBlocks.looks,
    );
  const soundXML =
    moveCategory("sound") ||
    buildSoundXml(
      isInitialSetup,
      isStage,
      targetId,
      soundName,
      colors.sounds,
      showBlocks.sound,
    );
  const eventsXML =
    moveCategory("event") ||
    buildEventXml(
      isInitialSetup,
      isStage,
      targetId,
      colors.event,
      showBlocks.event,
    );
  const controlXML =
    moveCategory("control") ||
    buildControlXml(
      isInitialSetup,
      isStage,
      targetId,
      colors.control,
      showBlocks.control,
    );
  const sensingXML =
    moveCategory("sensing") ||
    buildSensingXml(
      isInitialSetup,
      isStage,
      targetId,
      colors.sensing,
      showBlocks.sensing,
    );
  const operatorsXML =
    moveCategory("operators") ||
    buildOperatorsXml(
      isInitialSetup,
      isStage,
      targetId,
      colors.operators,
      showBlocks.operators,
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
    showBlocks.variables ? variablesXML : "",
    gap,
    showBlocks.customBlocks ? myBlocksXML : "",
  ];

  if (!everything.find((xml) => xml.includes("<category"))) {
    // if all blocks are disabled, show a message
    everything.push(allBlocksAreDisabled);
  }

  for (const extensionCategory of categoriesXML) {
    everything.push(gap, extensionCategory.xml);
  }

  everything.push(xmlClose);
  return everything.join("\n");
};

export default makeToolboxXML;
