import {
  ExpressionNode,
  ExpressionNodeType,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import {
  FunctionDeclarationNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { ClassDeclarationNode } from "src/ast/types/general-ast/ast-nodes/statement-node/class-declaration-node";
import {
  Class_defContext,
  DecoratorsContext,
} from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { convertClassDefRaw } from "./class-def-raw";

export const convertClassDef = (
  visitor: IPythonAstVisitor,
  ctx: Class_defContext,
): PythonVisitorReturnValue => {
  const classDeclaration = convertClassDefRaw(visitor, ctx.class_def_raw());

  const decoratorsCtx = ctx.decorators() as DecoratorsContext | undefined;
  const decoratorNodes: ExpressionNode[] = [];
  const functionDeclarations: FunctionDeclarationNode[] = [];
  if (decoratorsCtx) {
    const decorators = visitor.getExpression(decoratorsCtx);

    if (decorators.node.expressionType !== ExpressionNodeType.sequence) {
      throw new Error("Decorators must be a node of type expression sequence");
    }

    decoratorNodes.push(...decorators.node.expressions);
    functionDeclarations.push(...decorators.functionDeclarations);
  }

  const decoratorExpressions = [
    ...decoratorNodes,
    // Supply the extra keyword parameters as decorators.
    // This includes keywords such as 'metaclass'
    ...classDeclaration.keywordParameters.map(
      (k) =>
        ({
          nodeType: AstNodeType.expression,
          expressionType: ExpressionNodeType.operator,
          operator: k.name,
          operands: [k.expression],
        }) satisfies ExpressionNode,
    ),
  ];

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.classDeclaration,
      name: classDeclaration.name,
      baseClasses: classDeclaration.baseClasses,
      body: classDeclaration.body,
      decorators:
        decoratorExpressions.length > 0 ? decoratorExpressions : undefined,
    } satisfies ClassDeclarationNode,
    functionDeclarations: functionDeclarations,
  };
};
