import { AstNodeType } from "src/ast/types/general-ast";
import {
  FunctionCallNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { EvalContext } from "../../generated/PythonParser";

export const convertEval = (
  visitor: IPythonAstVisitor,
  ctx: EvalContext,
): PythonVisitorReturnValue => {
  const expression = visitor.getExpression(ctx.expressions());

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.functionCall,
      name: "eval",
      arguments: [expression.node],
    } satisfies FunctionCallNode,
    functionDeclarations: expression.functionDeclarations,
  };
};
