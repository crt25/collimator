import VM from "scratch-vm";
import { defaultCrtConfig } from "./default-crt-config";
import JSZip from "jszip";
import { ScratchCrtConfig } from "../../types/scratch-vm-custom";

/**
 * Load a Scratch project from a .sb, .sb2, .sb3 or json string.
 * @param input A json string, object, or ArrayBuffer representing the project to load.
 * @return Promise that resolves after targets are installed.
 */
export const loadCrtProject = async (
  vm: VM,
  input: ArrayBufferView | ArrayBuffer | string | object,
): Promise<void> => {
  // overwrite any existing config
  vm.crtConfig = {
    ...defaultCrtConfig,
  };

  if (input instanceof ArrayBuffer) {
    const zip = new JSZip();
    await zip.loadAsync(input);

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

  return vm.loadProject(input);
};
