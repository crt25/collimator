import { ted as treeEditDistance } from "edit-distance";
import { AstNode } from "@ast/index";
import { getAstNodeLabel } from "./label";
import { getAstNodeChildren } from "./children";

const insertCost = (_: AstNode): number => 1;
const removeCost = insertCost;
const updateCost = (a: AstNode, b: AstNode): number =>
  getAstNodeLabel(a) !== getAstNodeLabel(b) ? 1 : 0;

export const computeZhangShashaDistance = (
  a: AstNode,
  b: AstNode,
): Promise<number> => {
  const analysis = treeEditDistance(
    a,
    b,
    getAstNodeChildren,
    insertCost,
    removeCost,
    updateCost,
  );
  return Promise.resolve(analysis.distance);
};
