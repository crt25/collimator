/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import type { TaskType } from "./taskType";

export interface UpdateTaskDto {
  description: string;
  title: string;
  /** The task's type. */
  type: TaskType;
}
