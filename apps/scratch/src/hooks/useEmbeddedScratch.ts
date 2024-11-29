import VM from "scratch-vm";
import { useIframeParent } from "./useIframeParent";
import { useCallback } from "react";
import { saveCrtProject } from "../vm/save-crt-project";
import { loadCrtProject } from "../vm/load-crt-project";
import toast from "react-hot-toast";
import { defineMessages, InjectedIntl } from "react-intl";
import JSZip from "jszip";

const messages = defineMessages({
  cannotLoadProject: {
    id: "useEmbeddedScratch.cannotLoadProject",
    defaultMessage: "Could not load the project",
  },
  cannotSaveProject: {
    id: "useEmbeddedScratch.cannotSaveProject",
    defaultMessage: "Could not save the project",
  },
});

export const useEmbeddedScratch = (
  vm: VM | null,
  intl: InjectedIntl,
): ReturnType<typeof useIframeParent> => {
  const handleRequest = useCallback<Parameters<typeof useIframeParent>[0]>(
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
            saveCrtProject(vm)
              .then((content) => {
                respondToMessageEvent({
                  procedure: "getTask",
                  result: content,
                });
              })
              .catch((e) => {
                console.error(e);
                toast.error(intl.formatMessage(messages.cannotSaveProject));
              });
          }
          break;
        case "loadTask":
          if (vm) {
            const sb3Project = await request.arguments.arrayBuffer();

            loadCrtProject(vm, sb3Project)
              .then(() => {
                respondToMessageEvent({
                  procedure: "loadTask",
                });
              })
              .catch((e) => {
                console.error(e);
                toast.error(intl.formatMessage(messages.cannotLoadProject));
              });
          }
          break;
        case "loadSubmission":
          if (vm) {
            const sb3Project = await request.arguments.task.arrayBuffer();
            const submission = await request.arguments.submission.text();

            const zip = new JSZip();
            await zip.loadAsync(sb3Project);

            zip.remove("project.json");
            zip.file("project.json", submission);

            const taskMergedWithSubmission = await zip
              .generateAsync({
                // options consistent with https://github.com/scratchfoundation/scratch-vm/blob/766c767c7a2f3da432480ade515de0a9f98804ba/src/virtual-machine.js#L400C19-L407C12
                type: "blob",
                mimeType: "application/x.scratch.sb3",
                compression: "DEFLATE",
                compressionOptions: {
                  level: 6,
                },
              })
              .then((blob) => blob.arrayBuffer());

            loadCrtProject(vm, taskMergedWithSubmission)
              .then(() => {
                respondToMessageEvent({
                  procedure: "loadSubmission",
                });
              })
              .catch((e) => {
                console.error(e);
                toast.error(intl.formatMessage(messages.cannotLoadProject));
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
