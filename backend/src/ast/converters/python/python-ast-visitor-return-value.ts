import {
  FunctionDeclarationNode,
  StatementNode,
} from "src/ast/types/general-ast/ast-nodes";
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";

export type PythonVisitorReturnValue = {
  /**
   * An optional AST node representing the result of the visit.
   */
  node?: StatementNode | ExpressionNode;

  /**
   * A list of function declarations found in the Python code
   * which are to be hoisted.
   * For python, this array should always be empty.
   */
  functionDeclarations: FunctionDeclarationNode[];
};
