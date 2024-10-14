import { AstNodeBase } from "../../ast-node-base";
import { AstNodeType } from "../../ast-node-type";
import { CodeNodeType } from "./code-node-type";

/**
 * A node representing code.
 */
export interface CodeNodeBase extends AstNodeBase {
  nodeType: AstNodeType.code;
  codeType: CodeNodeType;
}
