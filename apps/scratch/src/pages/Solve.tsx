import { useParams } from "react-router-dom";
import Gui from "../containers/customized-scratch-containers/Gui";
import VM from "scratch-vm";
import { useCallback, useState } from "react";
import { patchScratchVm } from "../vm";
import { useIframeParent } from "../hooks/useIframeParent";
import { saveCrtProject } from "../vm/save-crt-project";
import { loadCrtProject } from "../vm/load-crt-project";

const Solve = () => {
  const { _sessionId, _taskId } = useParams();

  const [vm, setVm] = useState<VM | null>(null);

  const { hasLoaded, sendRequest } = useIframeParent(
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

  const reportProgress = useCallback(
    (assertions: number, passedAssertions: number) =>
      sendRequest({
        procedure: "reportProgress",
        arguments: {
          tests: assertions,
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
