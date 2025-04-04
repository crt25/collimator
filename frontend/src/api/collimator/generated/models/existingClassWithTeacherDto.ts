/**
 * Generated by orval v7.6.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import type { ClassTeacherDto } from "./classTeacherDto";

export interface ExistingClassWithTeacherDto {
  /** The class's unique identifier, a positive integer. */
  id: number;
  name: string;
  /** The teacher of the class. */
  teacher: ClassTeacherDto;
}
