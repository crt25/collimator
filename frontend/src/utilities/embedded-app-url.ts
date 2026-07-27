import { TaskType } from "@/api/collimator/generated/models";
import { jupyterAppHostName, scratchAppHostName } from "@/utilities/constants";

export type EmbeddedAppMode = "edit" | "solve" | "show";

/**
 * Builds the URL embedding the application for the given task type in the
 * given mode. Returns null for unsupported task types.
 */
export const getEmbeddedAppUrl = (
  taskType: TaskType,
  mode: EmbeddedAppMode,
): string | null => {
  switch (taskType) {
    case TaskType.SCRATCH:
      return `${scratchAppHostName}/${mode}`;
    case TaskType.JUPYTER:
      // "crtMode", not "mode": JupyterLite's mode-support plugin owns the
      // "mode" URL param and overwrites it with the lab shell mode (CRT-363)
      return `${jupyterAppHostName}?crtMode=${mode}`;
    default:
      return null;
  }
};
