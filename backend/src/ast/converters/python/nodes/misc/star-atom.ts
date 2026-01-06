import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
  VariableNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import {
  NameContext,
  Star_atomContext,
  Star_targets_list_seqContext,
  Star_targets_tuple_seqContext,
  Target_with_star_atomContext,
} from "../../generated/PythonParser";
import { createTupleOperator } from "../expressions/tuple";
import { createListOperator } from "../expressions/list";

export const convertStarAtom = (
  visitor: IPythonAstVisitor,
  ctx: Star_atomContext,
): PythonVisitorReturnValue => {
  const name = ctx.name() as NameContext | undefined;

  if (name) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.variable,
        name: name.getText(),
      } satisfies VariableNode,
      functionDeclarations: [],
    };
  }

  const targetWithStarAtom = ctx.target_with_star_atom() as
    | Target_with_star_atomContext
    | undefined;

  if (targetWithStarAtom) {
    return visitor.visit(targetWithStarAtom);
  }

  if (ctx.LPAR()) {
    const startTargetsTupleSequence = ctx.star_targets_tuple_seq() as
      | Star_targets_tuple_seqContext
      | undefined;

    if (startTargetsTupleSequence) {
      return visitor.visit(startTargetsTupleSequence);
    }

    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: createTupleOperator,
        operands: [],
      } satisfies OperatorNode,
      functionDeclarations: [],
    };
  }

  const starTargetsListSequence = ctx.star_targets_list_seq() as
    | Star_targets_list_seqContext
    | undefined;

  if (starTargetsListSequence) {
    return visitor.visit(starTargetsListSequence);
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: createListOperator,
      operands: [],
    } satisfies OperatorNode,
    functionDeclarations: [],
  };
};
