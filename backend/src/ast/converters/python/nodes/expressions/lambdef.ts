import { LambdaNode } from "src/ast/types/general-ast/ast-nodes/expression-node/lambda-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";
import { ReturnNode } from "src/ast/types/general-ast/ast-nodes/statement-node/return-node";
import { convertLambdaParams } from "../parameters/lambda-params";
import { LambdefContext } from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Parameter } from "../parameters/param";

export const convertLambdef = (
  visitor: IPythonAstVisitor,
  ctx: LambdefContext,
): PythonVisitorReturnValue => {
  const params = ctx.lambda_params();

  let parameters: Parameter[] = [];
  if (params) {
    parameters = convertLambdaParams(visitor, params);
  }

  const expression = visitor.getExpression(ctx.expression());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.lambda,
      parameterNames: parameters.map((p) => p.name),
      body: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.sequence,
        statements: [
          {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.return,
            value: expression.node,
          } satisfies ReturnNode,
        ],
      } satisfies StatementSequenceNode,
    } satisfies LambdaNode,
    functionDeclarations: expression.functionDeclarations,
  };
};
