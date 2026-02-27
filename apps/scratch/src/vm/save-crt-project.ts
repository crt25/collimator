import VM from "@scratch/scratch-vm";
import JSZip from "jszip";
import { loadCrtProject } from "./load-crt-project";

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

export const prepareCrtProjectForExport = async (vm: VM): Promise<Blob> => {
  const task = await saveCrtProject(vm);

  // On every task creation, Scratch internally loads empty, hardcoded assets. See: https://github.com/scratchfoundation/scratch-storage/blob/ec078d15666743d4ec4ebba5d6bceda85143f095/src/WebHelper.ts#L142
  // it replaces them and re-generates new asset ids, which causes the saved task to have different asset ids than the ones in the submission.
  // Moreover, if teachers were to add more assets to the task, those would also initially have different ids.
  // These new assets are affected by sanitization, which change the SVG content and causes the asset ids to change.
  // See: https://github.com/scratchfoundation/scratch-editor/blob/d6da8b32af0aa702c989bb077551c8a33d421413/packages/scratch-svg-renderer/src/sanitize-svg.js#L129
  // To work around this, we re-load the project we just saved, which ensures that the asset ids in the task and the submission are the same.
  const exportedTask = await task.arrayBuffer();

  await loadCrtProject(vm, exportedTask);

  const reExportedTask = await saveCrtProject(vm);

  return reExportedTask;
};
