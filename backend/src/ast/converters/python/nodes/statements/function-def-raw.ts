import { AstNodeType } from "src/ast/types/general-ast";
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { isStatementNode } from "src/ast/types/general-ast/helpers/node-type-checks";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  ExpressionContext,
  Function_def_rawContext,
  ParamsContext,
  Type_paramsContext,
} from "../../generated/PythonParser";
import { convertTypeParams } from "../types/type-params";
import { GenericTypeParameter } from "../types/type-param";
import { convertParams } from "../parameters/params";
import { Parameter } from "../parameters/param";

export const convertFunctionDefRaw = (
  visitor: IPythonAstVisitor,
  ctx: Function_def_rawContext,
): {
  isAsync: boolean;
  name: string;
  genericTypeParameters: GenericTypeParameter[];
  parameters: Parameter[];
  returnType: ExpressionNode | null;
  body: StatementSequenceNode;
} => {
  const isAsync = ctx.ASYNC() !== undefined;
  const name = ctx.name().getText();

  const typeParams = ctx.type_params() as Type_paramsContext | undefined;
  let genericTypeParameters: GenericTypeParameter[] = [];
  if (typeParams) {
    genericTypeParameters = convertTypeParams(visitor, typeParams);
  }

  const params = ctx.params() as ParamsContext | undefined;
  const parameters = params ? convertParams(visitor, params) : [];

  const returnType = ctx.expression() as ExpressionContext | undefined;
  const returnTypeExpression = returnType
    ? visitor.getExpression(returnType)
    : null;

  const body = visitor.visit(ctx.block());

  if (!isStatementNode(body.node)) {
    throw new Error("Function body is not a statement node");
  }

  const bodyNode =
    body.node.statementType === StatementNodeType.sequence
      ? body.node
      : ({
          nodeType: AstNodeType.statement,
          statementType: StatementNodeType.sequence,
          statements: [body.node],
        } as StatementSequenceNode);

  return {
    isAsync,
    name,
    genericTypeParameters,
    parameters,
    returnType: returnTypeExpression?.node ?? null,
    body: bodyNode,
  };
};
