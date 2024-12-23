/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import type { PrivateKeyDto } from "./privateKeyDto";

export interface KeyPairDto {
  createdAt: string;
  /** The key pair unique identifier, a positive integer. */
  id: number;
  /** The encrypted private keys belonging to this public key. Each of these private keys is the same but encrypted with a different symmetric key. */
  privateKeys: PrivateKeyDto[];
  /** The public key as a JSON Web Key (JWK) */
  publicKey: string;
  /** The public key as a JSON Web Key (JWK) */
  publicKeyFingerprint: string;
  /** Salt to derive a symmetric key encoded in base64. */
  salt: string;
  /** The id of the teacher this key belongs to. */
  teacherId: number;
}
