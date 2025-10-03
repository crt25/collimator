import JSZip from "jszip";
import { ScratchCrtConfig } from "../../../types/scratch-vm-custom";
import { TestTask } from "./index";
import type { Buffer } from "node:buffer";

const defaultCrtConfig: ScratchCrtConfig = {
  allowedBlocks: {},
  freezeStateByBlockId: {},
  maximumExecutionTimeInMs: 5000,
  enableStageInteractions: true,
};

export const missingAssetsTask: TestTask = {
  blocksOfMainTarget: 1,
  frozenBlocksOfMainTarget: 0,
  crtConfig: defaultCrtConfig,
  file: (async (): Promise<Buffer> => {
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

    return zip.generateAsync({ type: "nodebuffer" });
  })(),
};

export const noTargetsTask: TestTask = {
  blocksOfMainTarget: 0,
  frozenBlocksOfMainTarget: 0,
  crtConfig: defaultCrtConfig,
  file: (async (): Promise<Buffer> => {
    const zip = new JSZip();
    const project = { targets: [] };
    zip.file("project.json", JSON.stringify(project));
    return zip.generateAsync({ type: "nodebuffer" });
  })(),
};

export const noCostumesOrSoundsTask: TestTask = {
  blocksOfMainTarget: 0,
  frozenBlocksOfMainTarget: 0,
  crtConfig: defaultCrtConfig,
  file: (async (): Promise<Buffer> => {
    const zip = new JSZip();
    const project = { targets: [{}] };
    zip.file("project.json", JSON.stringify(project));
    return zip.generateAsync({ type: "nodebuffer" });
  })(),
};
