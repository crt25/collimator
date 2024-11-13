/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import type { TaskType } from "./taskType";

export interface DeletedTaskDto {
  /** The user's unique identifier, a positive integer. */
  creatorId: number;
  description: string;
  /** Task file */
  file: Blob;
  /** The task's unique identifier, a positive integer. */
  id: number;
  title: string;
  /** The task's type. */
  type: TaskType;
}
