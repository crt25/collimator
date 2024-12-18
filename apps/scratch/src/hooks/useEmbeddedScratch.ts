import VM from "scratch-vm";
import { useIframeParent } from "./useIframeParent";
import { useCallback } from "react";
import { saveCrtProject } from "../vm/save-crt-project";
import { loadCrtProject } from "../vm/load-crt-project";
import toast from "react-hot-toast";
import { defineMessages, InjectedIntl } from "react-intl";
import JSZip from "jszip";

const logModule = "[Embedded Scratch]";

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

const areAssertionsEnabled = (vm: VM): boolean => {
  let assertionsEnabled = false;
  const setAssertionsEnabled = (enabled: boolean): void => {
    assertionsEnabled = enabled;
  };

  vm.runtime.once("ARE_ASSERTIONS_ENABLED_RESPONSE", setAssertionsEnabled);

  // check if assertions are enabled
  vm.runtime.emit("ARE_ASSERTIONS_ENABLED_QUERY");

  // Note that this function relies on the fact that javascript is single-threaded
  // and the fact that the scratch vm runtime extends EventEmitter from the 'events' module.
  // (https://github.com/scratchfoundation/scratch-vm/blob/ebec46b0af5e4def038930cbdce4c01ad29483c5/src/engine/runtime.js#L179)
  // The implementation is a simple loop (https://github.com/browserify/events/blob/main/events.js#L152)
  // which sill execute all event handlers before returning from the emit function.
  // Because the event handler of ARE_ASSERTIONS_ENABLED_QUERY in turn emits a ARE_ASSERTIONS_ENABLED_RESPONSE event
  // (if the assertions extension is loaded), the event handler of ARE_ASSERTIONS_ENABLED_RESPONSE will be executed
  // before the return statement of this function is executed.
  return assertionsEnabled;
};

export const useEmbeddedScratch = (
  vm: VM | null,
  intl: InjectedIntl,
): ReturnType<typeof useIframeParent> => {
  const handleRequest = useCallback<Parameters<typeof useIframeParent>[0]>(
    async (request, respondToMessageEvent) => {
      console.debug(`${logModule} VM: ${!!vm}, RPC: ${request.procedure}`);
      switch (request.procedure) {
        case "getHeight":
          respondToMessageEvent({
            procedure: "getHeight",
            result: document.body.scrollHeight,
          });
          break;
        case "getSubmission":
          if (vm) {
            if (!areAssertionsEnabled(vm)) {
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

            try {
              // then backup project state
              const [zip, json] = await Promise.all([
                saveCrtProject(vm).then((blob) => blob.arrayBuffer()),
                vm.toJSON(),
              ]);

              const waitForAssertions = new Promise<{
                totalTests: number;
                passedTests: number;
              }>((resolve) => {
                vm.runtime.once(
                  "ASSERTIONS_CHECKED",
                  (totalTests, passedTests) =>
                    resolve({ totalTests, passedTests }),
                );

                // once the project is backed up, run the project
                vm.greenFlag();
              });

              const { totalTests, passedTests } = await waitForAssertions;

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

              return await loadCrtProject(vm, zip);
            } catch (e) {
              console.error(e);
              toast.error(intl.formatMessage(messages.cannotSaveProject));
            }
          }
          break;
        case "getTask":
          if (vm) {
            try {
              const content = await saveCrtProject(vm);

              respondToMessageEvent({
                procedure: "getTask",
                result: content,
              });
            } catch (e) {
              console.error(e);
              toast.error(intl.formatMessage(messages.cannotSaveProject));
            }
          }
          break;
        case "loadTask":
          if (vm) {
            const sb3Project = await request.arguments.arrayBuffer();
            try {
              await loadCrtProject(vm, sb3Project);
              respondToMessageEvent({
                procedure: "loadTask",
              });
            } catch (e) {
              console.error(e);
              toast.error(intl.formatMessage(messages.cannotLoadProject));
            }
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

            try {
              console.debug(`${logModule} Loading project`);
              await loadCrtProject(vm, taskMergedWithSubmission);
              // TODO: change the editing target to the relevant sprite
              const { subTaskId } = request.arguments;
              if (subTaskId) {
                const target = vm.runtime.targets.find(
                  (target) => target.getName() === subTaskId,
                );

                if (target) {
                  console.log("setEditingTarget", target.id);
                  vm.setEditingTarget(target.id);
                }
              }
              respondToMessageEvent({
                procedure: "loadSubmission",
              });
            } catch (e) {
              console.error(`${logModule} Project load failure: ${e}`);
              toast.error(intl.formatMessage(messages.cannotLoadProject));
            }
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
