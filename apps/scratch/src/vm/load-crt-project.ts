import VM from "scratch-vm";
import JSZip from "jszip";
import { ScratchCrtConfig, ScratchProject } from "../types/scratch-vm-custom";

import {
  CrtConfigParseError,
  InvalidProjectJsonError,
  InvalidZipError,
  MissingAssetsError,
  MissingProjectJsonError,
  VmLoadError,
  ScratchProjectError,
} from "../errors/scratch/index";

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
 * Clear the nextProject variable and reset isLoading.
 */
const clearNextProject = (): void => {
  isLoading = false;
  nextProject = undefined;
};

/**
 * Load and parse a ZIP file from an ArrayBuffer.
 * @param input The ArrayBuffer representing the ZIP file.
 * @return A promise that resolves to the JSZip instance.
 */
const loadZip = async (input: ArrayBuffer): Promise<JSZip> => {
  const zip = new JSZip();

  try {
    await zip.loadAsync(input);
  } catch (e) {
    throw new InvalidZipError(e as Error);
  }

  return zip;
};

/**
 * Load and parse project.json from a ZIP file.
 * @param zip The JSZip instance representing the loaded ZIP file.
 * @return A promise that resolves to the ScratchProject object.
 */
const parseProjectJson = async (zip: JSZip): Promise<ScratchProject> => {
  const projectFile = zip.file("project.json");

  if (!projectFile) {
    throw new MissingProjectJsonError();
  }

  let project: ScratchProject;

  try {
    project = await projectFile.async("text").then((text) => JSON.parse(text));
  } catch (e) {
    throw new InvalidProjectJsonError(e as Error);
  }

  return project;
};

/**
 * Validate that all assets listed in project.json exist in the ZIP.
 * @param zip The JSZip instance representing the loaded ZIP file.
 * @param project The parsed project.json object.
 */
const validateAssets = async (
  zip: JSZip,
  project: ScratchProject,
): Promise<void> => {
  // check that all costume/sound assets exist in the ZIP
  const missingAssets = await getMissingFilenames(zip, project);

  if (missingAssets.length > 0) {
    throw new MissingAssetsError(missingAssets);
  }
};

/**
 * Load and parse crt.json from a ZIP file, if it exists.
 * @param vm The Scratch VM instance to set the crtConfig on.
 * @param zip The JSZip instance representing the loaded ZIP file.
 * @return A promise that resolves when loading is complete.
 */
const loadCrtConfig = async (vm: VM, zip: JSZip): Promise<void> => {
  const configFile = zip.file("crt.json");

  vm.crtConfig = { ...defaultCrtConfig };

  if (configFile) {
    // if the project contains a crt.json file, we parse it
    let config: ScratchCrtConfig;
    try {
      config = await configFile.async("text").then((text) => JSON.parse(text));
    } catch (e) {
      throw new CrtConfigParseError(e as Error);
    }

    // merge with default config s.t. all keys are always present
    vm.crtConfig = { ...defaultCrtConfig, ...config };
  }
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

  try {
    if (input instanceof ArrayBuffer) {
      const zip = await loadZip(input);
      const project = await parseProjectJson(zip);
      await validateAssets(zip, project);
      await loadCrtConfig(vm, zip);

      vm.runtime.emit("CRT_CONFIG_CHANGED", vm.crtConfig);
    }

    await vm.loadProject(input);
  } catch (e) {
    clearNextProject();
    if (e instanceof ScratchProjectError) {
      throw e;
    }

    throw new VmLoadError(e as Error);
  } finally {
    isLoading = false;
  }

  // if a project was queued while loading, load it now
  if (nextProject !== undefined) {
    const project = nextProject;
    // clear the queued project so that we don't get stuck in a loop
    nextProject = undefined;

    await loadCrtProject(vm, project);
  }
};
