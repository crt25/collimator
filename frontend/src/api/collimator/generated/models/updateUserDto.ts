/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import type { UserType } from "./userType";

export interface UpdateUserDto {
  /** The user's email address. */
  email: string;
  /**
   * The user's full name (optional).
   * @nullable
   */
  name: string | null;
  /** The user's role. */
  type: UserType;
}
