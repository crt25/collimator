/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description
 * OpenAPI spec version: 0.1
 */
import type { ClassTeacherDto } from "./classTeacherDto";

export interface ExistingClassExtendedDto {
  /** The class's unique identifier, a positive integer. */
  id: number;
  name: string;
  /** The list of session IDs. */
  sessions: number[];
  /** The number of students in the class. */
  studentCount: number;
  /** The teacher of the class. */
  teacher: ClassTeacherDto;
  teacherId: number;
}
