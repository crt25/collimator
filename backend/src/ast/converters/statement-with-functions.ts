import { StatementNode } from "../types/general-ast";
import { FunctionDeclarationNode } from "../types/general-ast/ast-nodes";

export type StatementWithFunctions = {
  node: StatementNode;
  functionDeclarations: FunctionDeclarationNode[];
};
