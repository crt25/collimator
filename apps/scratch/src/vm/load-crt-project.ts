import VM from "scratch-vm";
import JSZip from "jszip";
import { ScratchCrtConfig, ScratchProject } from "../types/scratch-vm-custom";
import { defaultCrtConfig } from "./default-crt-config";

export enum ScratchProjectErrorCode {
  ConcurrentLoadError = "CONCURRENT_LOAD_ERROR",
  InvalidZip = "INVALID_ZIP",
  MissingProjectJson = "MISSING_PROJECT_JSON",
  InvalidProjectJson = "INVALID_PROJECT_JSON",
  CrtConfigParseError = "CRT_CONFIG_PARSE_ERROR",
  VmLoadError = "VM_LOAD_ERROR",
  MissingAssets = "MISSING_ASSETS",
  InvalidFormat = "INVALID_FORMAT",
  Unknown = "UNKNOWN",
}

type ScratchProjectErrorDetails =
  | { errorMsg: Error | string }
  | { missingAssets: string[] }
  | undefined;

export class ScratchProjectError extends Error {
  constructor(
    public code: ScratchProjectErrorCode,
    message: string,
    public details?: ScratchProjectErrorDetails,
  ) {
    super(message);
    this.name = "ScratchProjectError";
  }
}

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

const clearNextProject = (): void => {
  isLoading = false;
  nextProject = undefined;
};

const loadZip = async (input: ArrayBuffer): Promise<JSZip> => {
  const zip = new JSZip();
  try {
    await zip.loadAsync(input);
  } catch (e) {
    clearNextProject();
    throw new ScratchProjectError(
      ScratchProjectErrorCode.InvalidZip,
      "Invalid project file: not a valid ZIP archive",
      { errorMsg: e as Error | string },
    );
  }
  return zip;
};

const parseProjectJson = async (zip: JSZip): Promise<ScratchProject> => {
  const projectFile = zip.file("project.json");
  if (!projectFile) {
    clearNextProject();
    throw new ScratchProjectError(
      ScratchProjectErrorCode.MissingProjectJson,
      "Invalid project file: project.json missing",
    );
  }
  // parse project.json
  let project: ScratchProject;
  try {
    project = await projectFile.async("text").then((text) => JSON.parse(text));
  } catch (e) {
    clearNextProject();
    throw new ScratchProjectError(
      ScratchProjectErrorCode.InvalidProjectJson,
      "Invalid project file: project.json is not valid JSON",
      { errorMsg: e as Error | string },
    );
  }
  return project;
};

const validateAssets = async (
  zip: JSZip,
  project: ScratchProject,
): Promise<void> => {
  // check that all costume/sound assets exist in the ZIP
  const missingAssets = await getMissingFilenames(zip, project);
  if (missingAssets.length > 0) {
    clearNextProject();
    throw new ScratchProjectError(
      ScratchProjectErrorCode.MissingAssets,
      `Project is missing ${missingAssets.length} assets`,
      { missingAssets },
    );
  }
};

const loadCrtConfig = async (vm: VM, zip: JSZip): Promise<void> => {
  const configFile = zip.file("crt.json");

  vm.crtConfig = { ...defaultCrtConfig };

  if (configFile) {
    // if the project contains a crt.json file, we parse it
    let config: ScratchCrtConfig;
    try {
      config = await configFile.async("text").then((text) => JSON.parse(text));
    } catch (e) {
      clearNextProject();
      throw new ScratchProjectError(
        ScratchProjectErrorCode.CrtConfigParseError,
        "Invalid project file: crt.json is not valid JSON",
        { errorMsg: e as Error | string },
      );
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
    throw new ScratchProjectError(
      ScratchProjectErrorCode.ConcurrentLoadError,
      "A project is already being loaded. This project has been queued.",
    );
  }

  isLoading = true;

  // overwrite any existing config
  vm.crtConfig = {
    ...defaultCrtConfig,
  };

  if (input instanceof ArrayBuffer) {
    const zip = await loadZip(input);
    const project = await parseProjectJson(zip);
    await validateAssets(zip, project);
    await loadCrtConfig(vm, zip);

    vm.runtime.emit("CRT_CONFIG_CHANGED", vm.crtConfig);
  }

  try {
    await vm.loadProject(input);
  } catch (e) {
    clearNextProject();
    throw new ScratchProjectError(
      ScratchProjectErrorCode.VmLoadError,
      "The Scratch VM failed to load the project",
      { errorMsg: e as Error | string },
    );
  }

  isLoading = false;

  // if a project was queued while loading, load it now
  if (nextProject !== undefined) {
    const project = nextProject;
    // clear the queued project so that we don't get stuck in a loop
    nextProject = undefined;

    await loadCrtProject(vm, project);
  }
};
