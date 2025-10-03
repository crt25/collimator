import VM from "scratch-vm";
import JSZip from "jszip";
import { ScratchCrtConfig, ScratchProject } from "../types/scratch-vm-custom";
import { defaultCrtConfig } from "./default-crt-config";

let nextProject: ArrayBuffer | undefined = undefined;
let isLoading = false;

/**
 * Get all assets listed in project.json exist in the ZIP
 * @param zip The JSZip instance representing the loaded ZIP file.
 * @param project The parsed project.json object.
 * @return A list of missing asset filenames. Empty if all assets are present.
 */
export const getMissingFilenames = async (
  zip: JSZip,
  project: ScratchProject,
): Promise<string[]> => {
  const missing: string[] = [];

  for (const target of project.targets) {
    for (const costume of target.costumes || []) {
      const filename = `${costume.assetId}.${costume.dataFormat}`;
      if (!zip.file(filename)) {
        missing.push(filename);
      }
    }

    for (const sound of target.sounds || []) {
      const filename = `${sound.assetId}.${sound.dataFormat}`;
      if (!zip.file(filename)) {
        missing.push(filename);
      }
    }
  }

  return missing;
};

/**
 * Load a Scratch project from a .sb, .sb2, .sb3 or json string.
 * @param input A json string, object, or ArrayBuffer representing the project to load.
 * @return Promise that resolves after targets are installed.
 */
export const loadCrtProject = async (
  vm: VM,
  input: ArrayBuffer,
): Promise<void> => {
  if (isLoading) {
    // calling loadProject while another project is being loaded causes weird behavior
    // so we queue the next project to load
    nextProject = input;
    return;
  }

  isLoading = true;

  // overwrite any existing config
  vm.crtConfig = {
    ...defaultCrtConfig,
  };

  if (input instanceof ArrayBuffer) {
    const zip = new JSZip();
    await zip.loadAsync(input);

    // always require a project.json
    const projectFile = zip.file("project.json");
    if (!projectFile) {
      throw new Error("Invalid project file: project.json missing");
    }

    // parse project.json
    const project: ScratchProject = await projectFile
      .async("text")
      .then((text) => JSON.parse(text));

    // check that all costume/sound assets exist in the ZIP
    const missingAssets = await getMissingFilenames(zip, project);
    if (missingAssets.length > 0) {
      throw new Error(
        `Could not load project: missing assets (${missingAssets.join(", ")})`,
      );
    }

    const configFile = zip.file("crt.json");

    if (configFile) {
      // if the project contains a crt.json file, we parse it
      const config: ScratchCrtConfig = await configFile
        .async("text")
        .then((text) => JSON.parse(text));

      // merge with default config s.t. all keys are always present
      vm.crtConfig = { ...defaultCrtConfig, ...config };
    }
  }
  vm.runtime.emit("CRT_CONFIG_CHANGED", vm.crtConfig);

  await vm.loadProject(input);

  isLoading = false;

  // if a project was queued while loading, load it now
  if (nextProject !== undefined) {
    const project = nextProject;
    // clear the queued project so that we don't get stuck in a loop
    nextProject = undefined;

    await loadCrtProject(vm, project);
  }
};
