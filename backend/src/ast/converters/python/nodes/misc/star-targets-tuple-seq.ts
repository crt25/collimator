import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Star_targets_tuple_seqContext } from "../../generated/PythonParser";
import { createTupleOperator } from "../expressions/tuple";

export const convertStarTargetsTupleSeq = (
  visitor: IPythonAstVisitor,
  ctx: Star_targets_tuple_seqContext,
): PythonVisitorReturnValue => {
  const { nodes: targets, functionDeclarations } = visitor.getExpressions(
    ctx.star_target_list(),
  );

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: createTupleOperator,
      operands: targets,
    } satisfies OperatorNode,
    functionDeclarations,
  };
};
