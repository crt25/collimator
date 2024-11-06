/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description
 * OpenAPI spec version: 0.1
 */

export interface UpdateUserDto {
  /** The user's email address. */
  email: string;
  /**
   * The user's full name (optional).
   * @nullable
   */
  name: string | null;
  /** The user's role, one of: TEACHER, ADMIN. */
  type: string;
}
