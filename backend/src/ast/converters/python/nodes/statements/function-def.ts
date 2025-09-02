import {
  FunctionDeclarationNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { AstNodeType } from "src/ast/types/general-ast";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import {
  DecoratorsContext,
  Function_defContext,
} from "../../generated/PythonParser";
import { convertFunctionDefRaw } from "./function-def-raw";

export const convertFunctionDef = (
  visitor: IPythonAstVisitor,
  ctx: Function_defContext,
): PythonVisitorReturnValue => {
  const functionDeclaration = convertFunctionDefRaw(
    visitor,
    ctx.function_def_raw(),
  );

  const decorators = ctx.decorators() as DecoratorsContext | undefined;
  if (decorators) {
    const { node } = visitor.getExpression(decorators);

    if (node.expressionType !== ExpressionNodeType.sequence) {
      throw new Error("Decorators must be a node of type expression sequence");
    }

    return {
      node: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.functionDeclaration,
        name: functionDeclaration.name,
        parameterNames: functionDeclaration.parameters.map((p) => p.name),
        body: functionDeclaration.body,
        decorators: node.expressions,
      } satisfies FunctionDeclarationNode,
      // python function declarations are not hoisted
      functionDeclarations: [],
    };
  }

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.functionDeclaration,
      name: functionDeclaration.name,
      parameterNames: functionDeclaration.parameters.map((p) => p.name),
      body: functionDeclaration.body,
    } satisfies FunctionDeclarationNode,
    // python function declarations are not hoisted
    functionDeclarations: [],
  };
};
