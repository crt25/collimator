import { computeHeight } from "./ast-height";
import { countBuiltInFunctionCalls } from "./built-in-function-call";
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
  countFunctionCalls: countBuiltInFunctionCalls,
  countConditions,
  countFunctionDeclaration,
  countLoops,
  computeHeight,
  computeIndentation,
};
