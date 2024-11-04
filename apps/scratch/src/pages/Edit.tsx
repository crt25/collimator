import { useParams } from "react-router-dom";
import Gui from "../containers/customized-scratch-containers/Gui";
import VM from "scratch-vm";
import { useCallback, useState } from "react";
import { patchScratchVm } from "../vm";
import { saveCrtProject } from "../vm/save-crt-project";
import { loadCrtProject } from "../vm/load-crt-project";
import { useIframeParent } from "../hooks/useIframeParent";

const Edit = () => {
  const { _sessionId, _taskId } = useParams();
  const [vm, setVm] = useState<VM | null>(null);

  const { hasLoaded } = useIframeParent(
    useCallback(
      async (request, respondToMessageEvent) => {
        switch (request.procedure) {
          case "getHeight":
            respondToMessageEvent({
              procedure: "getHeight",
              result: document.body.scrollHeight,
            });
            break;
          case "getSubmission":
            if (vm) {
              respondToMessageEvent({
                procedure: "getSubmission",
                result: new Blob([vm.toJSON()], {
                  type: "application/json",
                }),
              });
            }
            break;
          case "getTask":
            if (vm) {
              saveCrtProject(vm).then((content) => {
                respondToMessageEvent({
                  procedure: "getTask",
                  result: content,
                });
              });
            }
            break;
          case "loadTask":
            if (vm) {
              const sb3Project = await request.arguments.arrayBuffer();

              loadCrtProject(vm, sb3Project).then(() => {
                respondToMessageEvent({
                  procedure: "loadTask",
                });
              });
            }
            break;
          default:
            break;
        }
      },
      [vm],
    ),
  );

  if (!hasLoaded) {
    return null;
  }

  /*if (!isInIframe) {
    return (
      <div>Tasks can only be solved in the context of the CRT application.</div>
    );
  }*/

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
