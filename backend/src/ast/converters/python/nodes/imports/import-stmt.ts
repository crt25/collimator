import { AstNodeType } from "src/ast/types/general-ast";
import {
  FunctionCallNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Import_stmtContext } from "../../generated/PythonParser";
import { convertImportName } from "./import-name";
import { convertImportFrom } from "./import-from";

export const convertImportStmt = (
  visitor: IPythonAstVisitor,
  ctx: Import_stmtContext,
): PythonVisitorReturnValue => {
  const importName = ctx.import_name();
  const imports = importName
    ? convertImportName(visitor, importName)
    : convertImportFrom(visitor, ctx.import_from());

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.functionCall,
      name: "@import",
      arguments: imports.map((i) => {
        const path = {
          nodeType: AstNodeType.expression,
          expressionType: ExpressionNodeType.literal,
          type: "string",
          value: i.path,
        } satisfies LiteralNode;

        if (!i.alias) {
          return path;
        }

        return {
          nodeType: AstNodeType.expression,
          expressionType: ExpressionNodeType.operator,
          operator: "as",
          operands: [
            path,
            {
              nodeType: AstNodeType.expression,
              expressionType: ExpressionNodeType.literal,
              type: "string",
              value: i.alias,
            } satisfies LiteralNode,
          ],
        } satisfies OperatorNode;
      }),
    } satisfies FunctionCallNode,
    functionDeclarations: [],
  };
};
