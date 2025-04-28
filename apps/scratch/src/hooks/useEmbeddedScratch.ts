import VM from "scratch-vm";
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { defineMessages, InjectedIntl } from "react-intl";
import JSZip from "jszip";
import { useDispatch } from "react-redux";
import { selectLocale } from "@scratch-submodule/scratch-gui/src/reducers/locales";
import {
  useIframeParent,
  Language,
  Submission,
  Test,
} from "iframe-rpc-react/src";
import { loadCrtProject } from "../vm/load-crt-project";
import { saveCrtProject } from "../vm/save-crt-project";
import { Assertion } from "../types/scratch-vm-custom";
import { defaultMaximumExecutionTimeInMs } from "../utilities/constants";

export const scratchIdentifierSeparator = "$";

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
  timeoutExceeded: {
    id: "useEmbeddedScratch.timeoutExceeded",
    defaultMessage: "We stopped the run, it was taking too long.",
  },
});

class VmUnavailableError extends Error {
  constructor() {
    super("VM is not available");
  }
}

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

const buildSubmission = (
  json: string,
  passedTests: Test[],
  failedTests: Test[],
): Submission => ({
  file: new Blob([json], {
    type: "application/json",
  }),
  passedTests,
  failedTests,
});

const getSubmission = async (
  vm: VM,
  intl: InjectedIntl,
): Promise<Submission> => {
  // first stop the project and reset the state
  vm.runtime.stopAll();

  // enable assertions if they are not enabled yet
  const assertionsEnabled = areAssertionsEnabled(vm);
  if (!assertionsEnabled) {
    vm.runtime.emit("ENABLE_ASSERTIONS");
  }

  try {
    // then save project state
    const json = vm.toJSON();

    const maximumExecutionTimeInMs =
      vm.crtConfig?.maximumExecutionTimeInMs ?? defaultMaximumExecutionTimeInMs;

    const waitForAssertions = new Promise<{
      passedAssertions: Assertion[];
      failedAssertions: Assertion[];
    }>((resolve) => {
      let finishedRunning = false;
      vm.runtime.once(
        "ASSERTIONS_CHECKED",
        (passedAssertions, failedAssertions) => {
          finishedRunning = true;

          resolve({
            passedAssertions,
            failedAssertions,
          });
        },
      );

      // once the project is backed up, run the project
      vm.greenFlag();

      setTimeout(() => {
        if (finishedRunning) {
          return;
        }

        // if the project is still running after the timeout, stop it
        vm.stopAll();
        vm.runtime.emit("PROJECT_RUN_STOP");

        console.error(`${logModule} Maximum execution time exceeded`);

        toast.error(intl.formatMessage(messages.timeoutExceeded));
      }, maximumExecutionTimeInMs);
    });

    const { passedAssertions, failedAssertions } = await waitForAssertions;

    const mapToTest = (assertion: Assertion): Test => ({
      identifier: `${assertion.targetName}${scratchIdentifierSeparator}${assertion.blockId}`,
      name: assertion.assertionName,
      contextName: assertion.targetName,
    });

    // wait for project run to finish
    return buildSubmission(
      json,
      passedAssertions.map(mapToTest),
      failedAssertions.map(mapToTest),
    );
  } catch (e) {
    console.error(`${logModule} RPC: getSubmission failed with error:`, e);
    toast.error(intl.formatMessage(messages.cannotSaveProject));

    throw e;
  } finally {
    if (!assertionsEnabled) {
      vm.runtime.emit("DISABLE_ASSERTIONS");
    }
  }
};

export const useEmbeddedScratch = (
  vm: VM | null,
  intl: InjectedIntl,
): ReturnType<typeof useIframeParent> => {
  const dispatch = useDispatch();

  const setLocale = useCallback(
    // ensure that the languages are supported by scratch
    // see https://github.com/scratchfoundation/scratch-l10n/blob/master/src/locale-data.mjs#L77
    (language: Language) => dispatch(selectLocale(language)),
    [],
  );

  const handleRequest = useMemo<Parameters<typeof useIframeParent>[0]>(
    () => ({
      /* eslint-disable @typescript-eslint/explicit-function-return-type */
      getHeight: async (_request) => ({
        procedure: "getHeight",
        result: document.body.scrollHeight,
      }),
      getSubmission: async (_request) => {
        if (!vm) {
          throw new VmUnavailableError();
        }

        const submission = await getSubmission(vm, intl);

        return {
          procedure: "getSubmission",
          result: submission,
        };
      },
      getTask: async (request) => {
        if (!vm) {
          throw new VmUnavailableError();
        }

        try {
          const task = await saveCrtProject(vm);
          const submission = await getSubmission(vm, intl);

          return {
            procedure: "getTask",
            result: {
              file: task,
              initialSolution: submission,
            },
          };
        } catch (e) {
          console.error(
            `${logModule} RPC: ${request.procedure} failed with error:`,
            e,
          );
          toast.error(intl.formatMessage(messages.cannotSaveProject));

          throw e;
        }
      },
      loadTask: async (request) => {
        if (!vm) {
          throw new VmUnavailableError();
        }

        try {
          setLocale(request.arguments.language);

          console.debug(`${logModule} Loading project`);
          const sb3Project = await request.arguments.task.arrayBuffer();
          await loadCrtProject(vm, sb3Project);

          return {
            procedure: "loadTask",
          };
        } catch (e) {
          console.error(
            `${logModule} RPC: ${request.procedure} failed with error:`,
            e,
          );
          toast.error(intl.formatMessage(messages.cannotLoadProject));

          throw e;
        }
      },
      loadSubmission: async (request) => {
        if (!vm) {
          throw new VmUnavailableError();
        }

        setLocale(request.arguments.language);

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
          const { subTaskId } = request.arguments;

          if (subTaskId) {
            const target = vm.runtime.targets.find(
              (target) => target.getName() === subTaskId,
            );

            if (target) {
              vm.setEditingTarget(target.id);
            }
          }

          return {
            procedure: "loadSubmission",
          };
        } catch (e) {
          console.error(`${logModule} Project load failure: ${e}`);
          toast.error(intl.formatMessage(messages.cannotLoadProject));

          throw e;
        }
      },
      setLocale: async (request) => {
        if (!vm) {
          throw new VmUnavailableError();
        }
        // save content
        const sb3Project = await saveCrtProject(vm);

        // change language - apparently scratch resets the content with this?
        setLocale(request.arguments);
        await loadCrtProject(vm, await sb3Project.arrayBuffer());

        return {
          procedure: "setLocale",
        };
      },
    }),
    [vm],
  );

  return useIframeParent(handleRequest);
};
