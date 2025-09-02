import { AstNode } from "src/ast/types/general-ast";
import { FunctionDeclarationNode } from "src/ast/types/general-ast/ast-nodes";

export type PythonVisitorReturnValue = {
  /**
   * An optional AST node representing the result of the visit.
   */
  node?: AstNode;

  /**
   * A list of function declarations found in the Python code
   * which are to be hoisted.
   * For python, this array should always be empty.
   */
  functionDeclarations: FunctionDeclarationNode[];
};
