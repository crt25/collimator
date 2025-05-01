import "jest-extended";
import { maximizeDistanceSum } from "../..";

const buildDistanceMatrix = (
  distances: { i: number; j: number; distance: number }[],
): number[][] => {
  const elements =
    distances.reduce((acc, { i, j }) => Math.max(acc, i, j), 0) + 1;

  const matrix: number[][] = new Array(elements)
    .fill(undefined)
    .map((_) => new Array(elements).fill(Number.POSITIVE_INFINITY));

  for (const { i, j, distance } of distances) {
    matrix[i][j] = distance;
    matrix[j][i] = distance;
  }

  return matrix;
};

describe("maximizeDistanceSum", () => {
  it("if only two elements are selected, the distance is maximized", () => {
    expect(
      maximizeDistanceSum(
        2,
        buildDistanceMatrix([
          { i: 0, j: 1, distance: 0 },
          { i: 0, j: 2, distance: 1 },
          { i: 1, j: 2, distance: 0 },
        ]),
      ),
    ).toIncludeSameMembers([0, 2]);
  });

  it("maximizes the distance sum", () => {
    expect(
      maximizeDistanceSum(
        3,
        buildDistanceMatrix([
          // 0 and 1 are the same but they have a large distance to 3
          { i: 0, j: 1, distance: 0 },
          { i: 0, j: 2, distance: 1000 },
          { i: 0, j: 3, distance: 50 },
          { i: 1, j: 2, distance: 1000 },
          { i: 1, j: 3, distance: 50 },
          { i: 2, j: 3, distance: 50 },
        ]),
      ),
    ).toIncludeSameMembers([0, 1, 2]);
  });
});
