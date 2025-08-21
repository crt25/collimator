export enum Mode {
  edit,
  solve,
  show,
}

export const getModeFromUrl = (): Mode => {
  // check if URL contains 'mode' parameter and retrieve the respective 'Mode' enum value, defaulting to 'edit'
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get("mode") ?? "edit";

  return Mode[modeParam as keyof typeof Mode] ?? Mode.edit;
};
