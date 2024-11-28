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
            let assertionsEnabled = false;
            const setAssertionsEnabled = (enabled: boolean): void => {
              assertionsEnabled = enabled;
            };

            vm.runtime.once(
              "ARE_ASSERTIONS_ENABLED_RESPONSE",
              setAssertionsEnabled,
            );

            // check if assertions are enabled
            vm.runtime.emit("ARE_ASSERTIONS_ENABLED_QUERY");

            if (!assertionsEnabled) {
              respondToMessageEvent({
                procedure: "getSubmission",
                result: {
                  file: new Blob([vm.toJSON()], {
                    type: "application/json",
                  }),
                  totalTests: 0,
                  passedTests: 0,
                },
              });

              return;
            }
            // if assertions are enabled, we need to run the tests before submitting

            // first stop the project and reset the state
            vm.runtime.stopAll();

            // then backup project state
            Promise.all([
              saveCrtProject(vm).then((blob) => blob.arrayBuffer()),
              vm.toJSON(),
            ])
              .then(([zip, json]) =>
                new Promise<{
                  totalTests: number;
                  passedTests: number;
                  zip: ArrayBuffer;
                  json: string;
                }>((resolve) => {
                  vm.runtime.once(
                    "ASSERTIONS_CHECKED",
                    (totalTests, passedTests) =>
                      resolve({ totalTests, passedTests, zip, json }),
                  );

                  // once the project is backed up, run the project
                  vm.greenFlag();
                }).then(({ totalTests, passedTests, zip, json }) => {
                  // wait for project run to finish
                  respondToMessageEvent({
                    procedure: "getSubmission",
                    result: {
                      file: new Blob([json], {
                        type: "application/json",
                      }),
                      totalTests,
                      passedTests,
                    },
                  });

                  return loadCrtProject(vm, zip);
                }),
              )
              .catch((e) => {
                console.error(e);
                toast.error(intl.formatMessage(messages.cannotSaveProject));
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
