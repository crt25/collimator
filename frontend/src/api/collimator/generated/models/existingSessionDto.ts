/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import type { ExistingSessionDtoLesson } from "./existingSessionDtoLesson";
import type { SessionStatus } from "./sessionStatus";

export interface ExistingSessionDto {
  createdAt: string;
  description: string;
  /** The session's unique identifier, a positive integer. */
  id: number;
  /**
   * The lesson from which this session was created.
   * @nullable
   */
  lesson: ExistingSessionDtoLesson;
  /** The session's status. */
  status: SessionStatus;
  /** The list of task IDs. */
  tasks: number[];
  title: string;
}