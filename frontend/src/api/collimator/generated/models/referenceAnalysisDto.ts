/**
 * Generated by orval v7.6.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import type { ExistingSolutionTestDto } from "./existingSolutionTestDto";

export interface ReferenceAnalysisDto {
  /** The task id the analysis is associated with. */
  taskId: number;
  /** The base64 encoded solution hash. */
  solutionHash: string;
  /** Whether this solution is marked as a reference solution. */
  isReferenceSolution: boolean;
  /** The tests for the current analysis. */
  tests: ExistingSolutionTestDto[];
  /**
   * The unique identifier of the key pair used to encrypt the student's pseudonym.
   * @nullable
   */
  studentKeyPairId: number | null;
  /** The version of the AST. */
  astVersion: string;
  /** The generalized AST of the solution. */
  genericAst: string;
  /** The title of the reference solution */
  title: string;
  /** The description of the reference solution */
  description: string;
  /** The reference solutions's unique identifier, a positive integer. */
  referenceSolutionId: number;
}
