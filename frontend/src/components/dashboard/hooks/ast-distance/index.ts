import { AstNode } from "@ast/index";
import { match } from "ts-pattern";
import { DistanceType } from "./distance-type";
import { computePqDistance } from "./pq-distance";

export const getAstDistance = (
  type: DistanceType,
  a: AstNode,
  b: AstNode,
): Promise<number> =>
  match(type)
    .returnType<Promise<number>>()
    .with(DistanceType.pq, () => computePqDistance(a, b))
    .exhaustive();
