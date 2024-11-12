/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import type { SessionClassDto } from "./sessionClassDto";
import type { SessionLessonDto } from "./sessionLessonDto";
import type { SessionStatus } from "./sessionStatus";
import type { SessionTaskDto } from "./sessionTaskDto";

export interface ExistingSessionExtendedDto {
  /** The session's class. */
  class: SessionClassDto;
  createdAt: string;
  description: string;
  /** The session's unique identifier, a positive integer. */
  id: number;
  /** The corresponding lesson. */
  lesson: SessionLessonDto;
  /** The session's status. */
  status: SessionStatus;
  /** The session's task. */
  tasks: SessionTaskDto[];
  title: string;
}
