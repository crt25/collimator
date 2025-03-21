/**
 * Generated by orval v7.6.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import type { TaskType } from "./taskType";
import type { TaskReferenceSolutionDto } from "./taskReferenceSolutionDto";

export interface ExistingTaskWithReferenceSolutionsDto {
  title: string;
  description: string;
  /** The task's type. */
  type: TaskType;
  /** The task's unique identifier, a positive integer. */
  id: number;
  /** The user's unique identifier, a positive integer. */
  creatorId: number;
  /** The list of reference solutions. */
  referenceSolutions: TaskReferenceSolutionDto[];
}
