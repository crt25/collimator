import { callsFunction } from "./calls-function";
import { containsCondition } from "./contains-condition";
import { containsFunctionDeclaration } from "./contains-function-declaration";
import { containsLoop } from "./contains-loop";

export const CriteriaBasedAnalyzer = {
  callsFunction,
  containsCondition,
  containsFunctionDeclaration,
  containsLoop,
};
