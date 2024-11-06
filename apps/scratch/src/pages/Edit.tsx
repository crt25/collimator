import { useParams } from "react-router-dom";
import Gui from "../containers/customized-scratch-containers/Gui";
import VM from "scratch-vm";
import { useState } from "react";
import { patchScratchVm } from "../vm";
import { useEmbeddedScratch } from "../hooks/useEmbeddedScratch";

const Edit = () => {
  const { _sessionId, _taskId } = useParams();
  const [vm, setVm] = useState<VM | null>(null);

  const { hasLoaded } = useEmbeddedScratch(vm);

  if (!hasLoaded) {
    return null;
  }

  return (
    <Gui
      canEditTask={true}
      isCostumesTabEnabled={true}
      isSoundsTabEnabled={true}
      onStorageInit={(storageInstance: {
        addOfficialScratchWebStores: () => void;
      }) => storageInstance.addOfficialScratchWebStores()}
      basePath="/"
      onVmInit={(vm: VM) => {
        setVm(vm);
        patchScratchVm(vm);
      }}
    />
  );
};

export default Edit;
