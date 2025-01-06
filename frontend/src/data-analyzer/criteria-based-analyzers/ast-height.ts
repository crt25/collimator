import { GeneralAst } from "@ast/index";
import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  AstCriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";

export const computeHeight = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[AstCriterionType.height],
): CriteriaBasedAnalyzerOutput[AstCriterionType.height] => {
  /**
   * The height of a node is the length of the longest downward path to a leaf from that node.
   * The depth of a node is the length of the path to its root (i.e., its root path).
   * (see https://en.wikipedia.org/wiki/Tree_(abstract_data_type))
   *
   * Hence the height of the AST (root node) is equivalent to the maximum depth of the AST.
   */
  let maxDepth = 0;

  const callback = (_node: unknown, depth: number): AstWalkSignal => {
    maxDepth = Math.max(maxDepth, depth);

    return AstWalkSignal.continueWalking;
  };

  walkAst(ast, {
    actorCallback: callback,
    eventListenerCallback: callback,
    statementCallback: callback,
    expressionCallback: callback,
  });

  return maxDepth;
};
