import Gui from "../containers/customized-scratch-containers/Gui";
import VM from "scratch-vm";
import { useCallback, useState } from "react";
import { patchScratchVm } from "../vm";
import { useEmbeddedScratch } from "../hooks/useEmbeddedScratch";

const Solve = () => {
  const [vm, setVm] = useState<VM | null>(null);

  const { hasLoaded, sendRequest } = useEmbeddedScratch(vm);

  const reportProgress = useCallback(
    (totalAssertions: number, passedAssertions: number) =>
      sendRequest({
        procedure: "reportProgress",
        arguments: {
          totalTests: totalAssertions,
          passedTests: passedAssertions,
        },
      }),
    [sendRequest],
  );

  if (!hasLoaded) {
    return null;
  }

  return (
    <Gui
      canEditTask={false}
      isCostumesTabEnabled={false}
      isSoundsTabEnabled={false}
      onStorageInit={(storageInstance: {
        addOfficialScratchWebStores: () => void;
      }) => storageInstance.addOfficialScratchWebStores()}
      basePath="/"
      onVmInit={(vm: VM) => {
        setVm(vm);
        patchScratchVm(vm);
      }}
      onTaskProgress={reportProgress}
    />
  );
};

export default Solve;
