import JSZip from "jszip";
import { ScratchCrtConfig } from "../../../types/scratch-vm-custom";
import { TestTask } from "./index";

const defaultCrtConfig: ScratchCrtConfig = {
  allowedBlocks: {},
  freezeStateByBlockId: {},
  maximumExecutionTimeInMs: 5000,
  enableStageInteractions: true,
};

export async function createMissingAssetsTask(): Promise<TestTask> {
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
    blocksOfMainTarget: 1,
    frozenBlocksOfMainTarget: 0,
    crtConfig: defaultCrtConfig,
    file: zip.generateAsync({ type: "nodebuffer" }),
  };
}

export async function createNoTargetsTask(): Promise<TestTask> {
  const zip = new JSZip();
  const project = { targets: [] };
  zip.file("project.json", JSON.stringify(project));
  return {
    blocksOfMainTarget: 0,
    frozenBlocksOfMainTarget: 0,
    crtConfig: defaultCrtConfig,
    file: zip.generateAsync({ type: "nodebuffer" }),
  };
}

export async function createNoCostumesOrSoundsTask(): Promise<TestTask> {
  const zip = new JSZip();
  const project = { targets: [{}] };
  zip.file("project.json", JSON.stringify(project));
  return {
    blocksOfMainTarget: 0,
    frozenBlocksOfMainTarget: 0,
    crtConfig: defaultCrtConfig,
    file: zip.generateAsync({ type: "nodebuffer" }),
  };
}
