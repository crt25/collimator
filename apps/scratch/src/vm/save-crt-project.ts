import VM from "scratch-vm";
import JSZip from "jszip";

/**
 * @returns Project in a Scratch 3.0 JSON representation.
 */
export const saveCrtProject = async (vm: VM): Promise<Blob> => {
  const blob = await vm.saveProjectSb3();

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
