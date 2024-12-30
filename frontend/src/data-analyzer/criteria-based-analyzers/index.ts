import { computeHeight } from "./ast-height";
import { countFunctionCalls } from "./calls-function";
import { countConditions } from "./condition";
import { countFunctionDeclaration } from "./contains-function-declaration";
import { countCustomFunctionCalls } from "./custom-function-call";
import { countExpressions } from "./expression";
import { computeIndentation } from "./indentation";
import { countLoops } from "./loop";
import { countStatements } from "./statement";

export const CriteriaBasedAnalyzer = {
  countStatements,
  countExpressions,
  countCustomFunctionCalls,
  countFunctionCalls,
  countConditions,
  countFunctionDeclaration,
  countLoops,
  computeHeight,
  computeIndentation,
};
