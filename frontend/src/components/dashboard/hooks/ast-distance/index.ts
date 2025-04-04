import { AstNode } from "@ast/index";
import { match } from "ts-pattern";
import { DistanceType } from "./distance-type";
import { computePqGramsDistance } from "./pqgrams-distance";
import { computeZhangShashaDistance } from "./zhangshasha-distance";

export const getAstDistance = (
  type: DistanceType,
  a: AstNode,
  b: AstNode,
): Promise<number> =>
  match(type)
    .returnType<Promise<number>>()
    .with(DistanceType.pqGrams, () => computePqGramsDistance(a, b))
    .with(DistanceType.zhangShasha, () => computeZhangShashaDistance(a, b))
    .exhaustive();
