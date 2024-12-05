/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import type { AuthenticationProvider } from "./authenticationProvider";
import type { UserType } from "./userType";

export interface CreateUserDto {
  /** The authentication provider used to sign in. */
  authenticationProvider: AuthenticationProvider;
  /** The email address of a user. */
  email: string;
  /**
   * The user's full name (optional).
   * @nullable
   */
  name: string | null;
  /** The user's role. */
  type: UserType;
}
