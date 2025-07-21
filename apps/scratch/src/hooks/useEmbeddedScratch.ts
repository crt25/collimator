import VM from "scratch-vm";
import { useMemo } from "react";
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
  GetTask,
  LoadTask,
  LoadSubmission,
  SetLocale,
  Task,
} from "iframe-rpc-react/src";
import { AnyAction, Dispatch } from "redux";
import { loadCrtProject } from "../vm/load-crt-project";
import { saveCrtProject } from "../vm/save-crt-project";
import { Assertion } from "../types/scratch-vm-custom";

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

    const maximumExecutionTimeInMs = vm.crtConfig?.maximumExecutionTimeInMs;

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

export class EmbeddedScratchCallbacks {
  constructor(
    private vm: VM,
    private intl: InjectedIntl,
    private dispatch: Dispatch<AnyAction>,
  ) {}

  async getHeight(): Promise<number> {
    return document.body.scrollHeight;
  }

  async getSubmission(): Promise<Submission> {
    return getSubmission(this.vm, this.intl);
  }

  async getTask(request: GetTask["request"]): Promise<Task> {
    try {
      const task = await saveCrtProject(this.vm);
      const submission = await getSubmission(this.vm, this.intl);

      return {
        file: task,
        initialSolution: submission,
      };
    } catch (e) {
      console.error(
        `${logModule} RPC: ${request.method} failed with error:`,
        e,
      );
      toast.error(this.intl.formatMessage(messages.cannotSaveProject));

      throw e;
    }
  }

  async loadTask(request: LoadTask["request"]): Promise<undefined> {
    try {
      this.setScratchLocale(request.params.language);

      console.debug(`${logModule} Loading project`);
      const sb3Project = await request.params.task.arrayBuffer();
      await loadCrtProject(this.vm, sb3Project);
    } catch (e) {
      console.error(
        `${logModule} RPC: ${request.method} failed with error:`,
        e,
      );
      toast.error(this.intl.formatMessage(messages.cannotLoadProject));

      throw e;
    }
  }

  async loadSubmission(request: LoadSubmission["request"]): Promise<undefined> {
    this.setScratchLocale(request.params.language);

    const sb3Project = await request.params.task.arrayBuffer();
    const submission = await request.params.submission.text();

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
      await loadCrtProject(this.vm, taskMergedWithSubmission);
      const { subTaskId } = request.params;

      if (subTaskId) {
        const target = this.vm.runtime.targets.find(
          (target) => target.getName() === subTaskId,
        );

        if (target) {
          this.vm.setEditingTarget(target.id);
        }
      }
    } catch (e) {
      console.error(`${logModule} Project load failure: ${e}`);
      toast.error(this.intl.formatMessage(messages.cannotLoadProject));

      throw e;
    }
  }

  async setLocale(request: SetLocale["request"]): Promise<undefined> {
    // save content
    const sb3Project = await saveCrtProject(this.vm);

    // change language - apparently scratch resets the content with this?
    this.setScratchLocale(request.params);
    await loadCrtProject(this.vm, await sb3Project.arrayBuffer());
  }

  private setScratchLocale(language: Language): void {
    // ensure that the languages are supported by scratch
    // see https://github.com/scratchfoundation/scratch-l10n/blob/master/src/locale-data.mjs#L77
    this.dispatch(selectLocale(language));
  }
}

export const useEmbeddedScratch = (
  vm: VM | null,
  intl: InjectedIntl,
): ReturnType<typeof useIframeParent> => {
  const dispatch = useDispatch();

  const callbacks = useMemo(() => {
    if (!vm) {
      return null;
    }

    return new EmbeddedScratchCallbacks(vm, intl, dispatch);
  }, [vm, intl, dispatch]);

  const handleRequest = useMemo<Parameters<typeof useIframeParent>[0]>(() => {
    if (callbacks) {
      return {
        getHeight: callbacks.getHeight.bind(callbacks),
        getSubmission: callbacks.getSubmission.bind(callbacks),
        getTask: callbacks.getTask.bind(callbacks),
        loadTask: callbacks.loadTask.bind(callbacks),
        loadSubmission: callbacks.loadSubmission.bind(callbacks),
        setLocale: callbacks.setLocale.bind(callbacks),
      };
    }

    const throwError = (): never => {
      throw new VmUnavailableError();
    };

    return {
      getHeight: throwError,
      getSubmission: throwError,
      getTask: throwError,
      loadTask: throwError,
      loadSubmission: throwError,
      setLocale: throwError,
    };
  }, [callbacks]);

  return useIframeParent(handleRequest);
};
