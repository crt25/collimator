import JSZip from "jszip";
import { ScratchCrtConfig } from "../../types/scratch-vm-custom";
import { TestTask } from "./index";

const defaultCrtConfig: ScratchCrtConfig = {
  allowedBlocks: {},
  freezeStateByBlockId: {},
  maximumExecutionTimeInMs: 5000,
  enableStageInteractions: true,
};

/**
 * Creates a test task where the project is missing some assets.
 * @return {TestTask} The test task.
 */
export const createMissingAssetsTask = (): TestTask => {
  const zip = new JSZip();

  const project = {
    targets: [
      {
        costumes: [
          { assetId: "costume1", dataFormat: "png" },
          { assetId: "costume2", dataFormat: "svg" },
        ],
        sounds: [{ assetId: "sound1", dataFormat: "wav" }],
      },
    ],
  };

  zip.file("project.json", JSON.stringify(project));
  zip.file("costume1.png", "mock");

  return {
    blocksOfMainTarget: 0,
    frozenBlocksOfMainTarget: 0,
    crtConfig: defaultCrtConfig,
    file: zip.generateAsync({ type: "nodebuffer" }),
  };
};

/**
 * Creates a test task where the project has no targets.
 * @return {TestTask} The test task.
 */
export const createNoTargetsTask = (): TestTask => {
  const zip = new JSZip();
  const project = { targets: [] };
  zip.file("project.json", JSON.stringify(project));

  return {
    blocksOfMainTarget: 0,
    frozenBlocksOfMainTarget: 0,
    crtConfig: defaultCrtConfig,
    file: zip.generateAsync({ type: "nodebuffer" }),
  };
};

/**
 * Creates a test task where the project has targets but no costumes or sounds.
 * @return {TestTask} The test task.
 */
export const createNoCostumesOrSoundsTask = (): TestTask => {
  const zip = new JSZip();
  const project = { targets: [{}] };
  zip.file("project.json", JSON.stringify(project));

  return {
    blocksOfMainTarget: 0,
    frozenBlocksOfMainTarget: 0,
    crtConfig: defaultCrtConfig,
    file: zip.generateAsync({ type: "nodebuffer" }),
  };
};
