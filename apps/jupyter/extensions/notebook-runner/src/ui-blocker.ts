import { JupyterFrontEnd } from "@jupyterlab/application";

const OVERLAY_ID = "notebook-runner-ui-blocker";

/**
 * Make the whole JupyterLite UI inert (no typing, clicking or focus) and show a
 * spinner overlay for the duration of a long operation such as the getTask
 * save/export pipeline. Returns a cleanup function that restores interactivity.
 *
 * We block the whole shell rather than toggling per-cell `readOnly`: the
 * `Cell.readOnly` setter writes `editable: false` into the cell metadata, which
 * is persisted into the saved .ipynb and would permanently lock the notebook
 * for both the teacher and the students (CRT-438).
 *
 * `inert` disables user pointer, keyboard and focus for the subtree while
 * leaving programmatic work — command execution, kernel messaging and
 * `context.save()` — unaffected. It is set on the shell node only, so error
 * dialogs (which attach to `document.body`) remain dismissible.
 */
export const blockUserInterface = (app: JupyterFrontEnd): (() => void) => {
  const shellNode = app.shell.node;
  const previousInert = shellNode.inert;
  shellNode.inert = true;

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:10000",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "background:rgba(255,255,255,0.6)",
    "cursor:wait",
  ].join(";");

  // jp-Spinner / jp-SpinnerContent styles ship with @jupyterlab/apputils.
  const spinner = document.createElement("div");
  spinner.className = "jp-Spinner";
  const spinnerContent = document.createElement("div");
  spinnerContent.className = "jp-SpinnerContent";
  spinner.appendChild(spinnerContent);
  overlay.appendChild(spinner);

  document.body.appendChild(overlay);

  let cleanedUp = false;
  return (): void => {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    shellNode.inert = previousInert;
    overlay.remove();
  };
};
