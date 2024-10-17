import VM from "scratch-vm";
import JSZip from "jszip";
import { ExtensionId } from "../extensions";
import ExampleExtension from "../extensions/example";
import { ScratchCrtConfig } from "./scratch-crt-config";

export const patchScratchVm = (vm: VM): void => {
  // patch extension manager load function with a custom implementation
  vm.extensionManager.loadExtensionURL = async (
    id: string,
  ): Promise<number> => {
    // modified logic from https://github.com/scratchfoundation/scratch-vm/blob/766c767c7a2f3da432480ade515de0a9f98804ba/src/extension-support/extension-manager.js#L142

    switch (id) {
      case ExtensionId.Example: {
        const extensionInstance = new ExampleExtension(vm.runtime);

        const serviceName =
          vm.extensionManager._registerInternalExtension(extensionInstance);

        vm.extensionManager._loadedExtensions.set(id, serviceName);
        break;
      }
      default:
        break;
    }

    return Promise.resolve(0);
  };

  // modify the loadProject function to parse our additional project data
  const originalLoadProject = vm.loadProject.bind(vm);

  /**
   * Load a Scratch project from a .sb, .sb2, .sb3 or json string.
   * @param input A json string, object, or ArrayBuffer representing the project to load.
   * @return Promise that resolves after targets are installed.
   */
  vm.loadProject = async (
    input: ArrayBufferView | ArrayBuffer | string | object,
  ): Promise<void> => {
    // overwrite any existing config
    vm.crtConfig = {};

    if (input instanceof ArrayBuffer) {
      const zip = new JSZip();
      await zip.loadAsync(input);

      const configFile = zip.file("crt.json");

      if (configFile) {
        // if the project contains a crt.json file, we parse it
        const config: ScratchCrtConfig = await configFile
          .async("text")
          .then((text) => JSON.parse(text));

        vm.crtConfig = config;
      }
    }

    return originalLoadProject(input);
  };

  // modify the saveProjectSb3 function to include our additional project data
  const originalSaveProjectSb3 = vm.saveProjectSb3.bind(vm);

  /**
   * @returns Project in a Scratch 3.0 JSON representation.
   */
  vm.saveProjectSb3 = async (): Promise<Blob> => {
    const blob = await originalSaveProjectSb3();

    const zip = new JSZip();
    await zip.loadAsync(blob);

    zip.file("crt.json", JSON.stringify(vm.crtConfig));

    return zip.generateAsync({
      // options consistent with https://github.com/scratchfoundation/scratch-vm/blob/766c767c7a2f3da432480ade515de0a9f98804ba/src/virtual-machine.js#L400C19-L407C12
      type: "blob",
      mimeType: "application/x.scratch.sb3",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });
  };

  // add custom callback to when the greenFlag event is triggered
  vm.runtime.on("PROJECT_START", () => {
    console.log("Green flag clicked");
  });

  vm.runtime.on("PROJECT_LOADED", () => {
    console.log("loaded", vm.crtConfig);
  });

  vm.runtime.on("PROJECT_RUN_STOP", () => {
    console.log("stopped");
  });
};
