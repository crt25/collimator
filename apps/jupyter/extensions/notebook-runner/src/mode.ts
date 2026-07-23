export enum Mode {
  edit,
  solve,
  show,
}

export const getModeFromUrl = (): Mode => {
  // Read our own "crtMode" URL param. We must NOT use "mode": JupyterLite's
  // `@jupyterlite/application-extension:mode-support` plugin owns that param and
  // overwrites it with the lab shell mode ("single-document"/"multiple-document")
  // whenever the shell mode changes — which our own `application:toggle-mode`
  // call triggers on every load. Sharing the name let a reload read the shell
  // mode, fall through to the default, and silently switch a student into edit
  // mode, exposing the teacher notebook (CRT-363).
  const urlParams = new URLSearchParams(window.location.search);

  // Default to the most restrictive mode. Edit must be requested explicitly, so
  // a missing or unrecognized param can never expose the teacher template to a
  // student — the frontend always sets crtMode explicitly for every flow.
  switch (urlParams.get("crtMode")) {
    case "edit":
      return Mode.edit;
    case "solve":
      return Mode.solve;
    case "show":
    default:
      return Mode.show;
  }
};
