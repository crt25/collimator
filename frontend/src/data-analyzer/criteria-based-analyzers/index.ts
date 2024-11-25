import { countFunctionCalls } from "./calls-function";
import { countConditions } from "./condition";
import { countFunctionDeclaration } from "./contains-function-declaration";
import { countExpressions } from "./expression";
import { countLoops } from "./loop";
import { countStatements } from "./statement";

export const CriteriaBasedAnalyzer = {
  countStatements,
  countExpressions,
  countFunctionCalls,
  countConditions,
  countFunctionDeclaration,
  countLoops,
};
