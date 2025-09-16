import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { ExpressionContext } from "../../generated/PythonParser";

export const convertExpression = (
  visitor: IPythonAstVisitor,
  ctx: ExpressionContext,
): PythonVisitorReturnValue => {
  const disjunctions = ctx.disjunction_list();

  if (disjunctions.length > 0) {
    const ifTrue = visitor.getExpression(disjunctions[0]);

    if (disjunctions.length === 1) {
      return ifTrue;
    }

    // https://github.com/antlr/grammars-v4/blob/master/python/python3_13/PythonParser.g4#L499C7-L499C56
    // disjunction 'if' disjunction 'else' expression

    const condition = visitor.getExpression(disjunctions[1]);
    const ifFalse = visitor.getExpression(ctx.expression());

    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: "if-then-else",
        operands: [condition.node, ifTrue.node, ifFalse.node],
      } satisfies OperatorNode,
      functionDeclarations: [
        ...condition.functionDeclarations,
        ...ifTrue.functionDeclarations,
        ...ifFalse.functionDeclarations,
      ],
    };
  }

  // https://github.com/antlr/grammars-v4/blob/master/python/python3_13/PythonParser.g4#L500C7-L500C14
  return visitor.visit(ctx.lambdef());
};
