import { jqgram } from "jqgram";
import { AstNode } from "@ast/index";
import { getAstNodeLabel } from "./label";
import { getAstNodeChildren } from "./children";

const getInputForNode = (
  a: AstNode,
): {
  root: AstNode;
  lfn: (node: AstNode) => string;
  cfn: (node: AstNode) => AstNode[];
} => ({
  root: a,
  lfn: getAstNodeLabel,
  cfn: getAstNodeChildren,
});

export const computePqGramsDistance = (
  a: AstNode,
  b: AstNode,
  p = 2,
  q = 3,
): Promise<number> =>
  new Promise((resolve) =>
    jqgram.distance(
      getInputForNode(a),
      getInputForNode(b),
      { p, q },
      (result) => resolve(result.distance),
    ),
  );
