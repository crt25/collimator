import { AstNodeType } from "./ast-node-type";

export interface AstNodeBase {
  nodeType: AstNodeType;

  /**
   * Each node can optionally be associated with a component id.
   * This is used to narrow down the analysis to a specific component.
   * Note that if a node has a component id, all its children implicitly have the same component id
   * meaning there is no need to set the component id for each child node.
   * If it is undefined and no parent node has a component id, the node is considered to be part of all components.
   */
  componentId?: string;
}
