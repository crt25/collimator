import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  ArgumentsContext,
  Class_def_rawContext,
  Type_paramsContext,
} from "../../generated/PythonParser";
import { GenericTypeParameter } from "../types/type-param";
import { convertTypeParams } from "../types/type-params";
import { convertArguments } from "../expressions/arguments";

export const convertClassDefRaw = (
  visitor: IPythonAstVisitor,
  ctx: Class_def_rawContext,
): {
  name: string;
  genericTypeParameters: GenericTypeParameter[];
  baseClasses: ExpressionNode[];
  keywordParameters: { name: string; expression: ExpressionNode }[];
  body: StatementSequenceNode;
} => {
  const typeParams = ctx.type_params() as Type_paramsContext | undefined;
  let genericTypeParameters: GenericTypeParameter[] = [];
  if (typeParams) {
    genericTypeParameters = convertTypeParams(visitor, typeParams);
  }

  let baseClasses: ExpressionNode[] = [];
  let keywordParameters: { name: string; expression: ExpressionNode }[] = [];

  const argumentsContext = ctx.arguments() as ArgumentsContext | undefined;
  if (argumentsContext) {
    const args = convertArguments(visitor, argumentsContext);

    baseClasses = args.unnamed;
    keywordParameters = args.named;
  }

  const body = visitor.getStatementSequence([ctx.block()]);

  return {
    name: ctx.name().getText(),
    genericTypeParameters,
    baseClasses,
    keywordParameters,
    body: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.sequence,
      statements: [...body.functionDeclarations, ...body.node.statements],
    } satisfies StatementSequenceNode,
  };
};
