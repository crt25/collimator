import VM from "scratch-vm";
import { useIframeParent } from "./useIframeParent";
import { useCallback } from "react";
import { saveCrtProject } from "../vm/save-crt-project";
import { loadCrtProject } from "../vm/load-crt-project";

export const useEmbeddedScratch = (
  vm: VM | null,
): ReturnType<typeof useIframeParent> => {
  const handleRequest = useCallback(
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
  );

  return useIframeParent(handleRequest);
};
