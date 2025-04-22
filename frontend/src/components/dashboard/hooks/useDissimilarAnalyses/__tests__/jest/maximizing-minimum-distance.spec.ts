import "jest-extended";
import { maximizeMinimumDistance } from "../..";

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

describe("maximizeMinimumDistance", () => {
  it("if only two elements are selected, the distance is maximized", () => {
    expect(
      maximizeMinimumDistance(
        2,
        buildDistanceMatrix([
          { i: 0, j: 1, distance: 0 },
          { i: 0, j: 2, distance: 1 },
          { i: 1, j: 2, distance: 0 },
        ]),
      ),
    ).toIncludeSameMembers([0, 2]);
  });

  it("maximizes the minimum distance", () => {
    expect(
      maximizeMinimumDistance(
        3,
        buildDistanceMatrix([
          { i: 0, j: 1, distance: 1 },
          { i: 0, j: 2, distance: 0.1 },
          { i: 0, j: 3, distance: 1 },
          // this is clearly the largest individual distance but
          // the distance between 2 and any other is very small (0.1)
          { i: 1, j: 2, distance: Number.POSITIVE_INFINITY },
          { i: 1, j: 3, distance: 1 },
          { i: 2, j: 3, distance: 0.1 },
        ]),
      ),
    ).toIncludeSameMembers([0, 1, 3]);
  });
});
