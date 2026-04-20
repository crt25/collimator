import { ISettingRegistry } from "@jupyterlab/settingregistry";
import { NotebookActions } from "@jupyterlab/notebook";
import { AppCrtIframeApi, ToastType } from "./iframe-rpc/src";
import { sendMessage } from "./send-message";

const executionToolbarButtons = new Set(["run", "advance"]);
const alwaysDisabledToolbarButtons = new Set([
  "restart",
  "restart-and-run",
  "save",
  "interrupt",
]);

const loadingMessage =
  "Please wait while the task is being prepared. Code execution is temporarily disabled while packages are being installed...";

// these are the methods on NotebookActions we want to block while packages install.
// every keyboard shortcut, toolbar click, and command palette action ends up calling one of them.
const blockedActions = [
  "run",
  "runAll",
  "runAllAbove",
  "runAllBelow",
  "runAndAdvance",
  "runAndInsert",
] as const;

type BlockedAction = (typeof blockedActions)[number];

export class LoadingStateManager {
  private isLoading = false;
  private originalActions: Partial<
    Record<BlockedAction, (typeof NotebookActions)[BlockedAction]>
  > = {};

  constructor(
    private settingRegistry: ISettingRegistry,
    private sendRequest: AppCrtIframeApi["sendRequest"],
  ) {}

  private async setExecutionButtonsDisabled(disabled: boolean): Promise<void> {
    const settings = await this.settingRegistry.load(
      "@jupyterlab/notebook-extension:panel",
    );
    const current = settings.get("toolbar").composite;

    if (!Array.isArray(current)) {
      return;
    }

    const updated = current.map((item) => {
      if (alwaysDisabledToolbarButtons.has(item.name)) {
        return { ...item, disabled: true };
      }

      if (executionToolbarButtons.has(item.name)) {
        return { ...item, disabled };
      }

      return item;
    });

    await settings.set("toolbar", updated);
  }

  private notify(title: string, body: string, type: ToastType): Promise<void> {
    return sendMessage(title, body, type, this.sendRequest).catch((error) => {
      console.error(`Failed to show "${title}" notification:`, error);
    });
  }

  private blockNotebookActions(): void {
    for (const name of blockedActions) {
      const original = NotebookActions[name];
      this.originalActions[name] = original;

      NotebookActions[name] = async (..._args: unknown[]): Promise<boolean> => {
        await this.notify("Loading Task", loadingMessage, ToastType.Info);
        return Promise.resolve(false);
      };
    }
  }

  private unblockNotebookActions(): void {
    for (const name of blockedActions) {
      const original = this.originalActions[name];

      if (original) {
        NotebookActions[name] = original;
      }
    }

    this.originalActions = {};
  }

  async startLoading(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.blockNotebookActions();

    await this.setExecutionButtonsDisabled(true);
    await this.notify("Loading Task", loadingMessage, ToastType.Info);
  }

  async finishLoading(success: boolean): Promise<void> {
    if (!this.isLoading) {
      return;
    }

    this.isLoading = false;

    this.unblockNotebookActions();

    if (success) {
      await this.setExecutionButtonsDisabled(false);

      await this.notify(
        "Task Ready",
        "All packages installed successfully. Code execution is now enabled.",
        ToastType.Success,
      );
    } else {
      // leave the buttons disabled as running cells on a broken setup is worse than not being able to run them
      await this.notify(
        "Task Setup Failed",
        "An error occurred while preparing the task. Please reload the page or contact support.",
        ToastType.Error,
      );
    }
  }
}
