/**
 * Generated by orval v7.6.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import type { AuthenticationProvider } from "./authenticationProvider";
import type { UserType } from "./userType";
import type { ExistingUserDtoPublicKeyId } from "./existingUserDtoPublicKeyId";

export interface ExistingUserDto {
  /**
   * The user's full name (optional).
   * @nullable
   */
  name: string | null;
  /** The email address of a user. */
  email: string;
  /** The authentication provider used to sign in. */
  authenticationProvider: AuthenticationProvider;
  /** The user's role. */
  type: UserType;
  /** The user unique identifier, a positive integer. */
  id: number;
  /**
   * An identifier for the user which is unique for the authentication provider.
   * @nullable
   */
  oidcSub: string | null;
  /**
   * The unique identifier of the associated public key.
   * @nullable
   */
  publicKeyId: ExistingUserDtoPublicKeyId;
}
