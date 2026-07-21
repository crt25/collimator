import { JupyterFrontEnd } from "@jupyterlab/application";
import { Spinner } from "@jupyterlab/apputils";

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
 *
 * An optional (already localized) message is shown below the spinner.
 */
export const blockUserInterface = (
  app: JupyterFrontEnd,
  message?: string,
): (() => void) => {
  const shellNode = app.shell.node;
  const previousInert = shellNode.inert;
  shellNode.inert = true;

  const spinner = new Spinner();

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  // The Spinner fills the overlay with an opaque, centered, theme-coloured
  // loading screen; the message is layered above it, just below the spinner.
  overlay.style.cssText = ["position:fixed", "inset:0", "z-index:10000"].join(
    ";",
  );
  overlay.appendChild(spinner.node);

  if (message) {
    const label = document.createElement("div");
    label.textContent = message;
    label.style.cssText = [
      "position:absolute",
      "top:calc(50% + 3.5rem)",
      "left:50%",
      "transform:translateX(-50%)",
      "z-index:11",
      "max-width:32rem",
      "padding:0 1rem",
      "text-align:center",
      "color:var(--jp-ui-font-color1)",
      "font-family:var(--jp-ui-font-family)",
      "font-size:var(--jp-ui-font-size1)",
    ].join(";");
    overlay.appendChild(label);
  }

  document.body.appendChild(overlay);

  let cleanedUp = false;
  return (): void => {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    shellNode.inert = previousInert;
    spinner.dispose();
    overlay.remove();
  };
};
