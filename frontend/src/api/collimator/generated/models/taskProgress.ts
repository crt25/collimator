/**
 * Generated by orval v7.6.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */

/**
 * The task status
 */
export type TaskProgress = (typeof TaskProgress)[keyof typeof TaskProgress];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const TaskProgress = {
  done: "done",
  partiallyDone: "partiallyDone",
  opened: "opened",
  unOpened: "unOpened",
} as const;
