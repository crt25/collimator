import "jest-extended";
import { getCombinationsUnsafe } from "../../combinatorics";

describe("getCombinations", () => {
  // Get combinations into an array, safely
  const getCombinations = (n: number, k: number): number[][] => {
    const combinations = [];
    for (const combination of getCombinationsUnsafe(n, k)) {
      combinations.push([...combination]);
    }
    return combinations;
  };

  it("returns all combinations of k elements from a set of n elements", () => {
    expect(getCombinations(5, 3)).toIncludeSameMembers([
      [0, 1, 2],
      [0, 1, 3],
      [0, 1, 4],
      [0, 2, 3],
      [0, 2, 4],
      [0, 3, 4],
      [1, 2, 3],
      [1, 2, 4],
      [1, 3, 4],
      [2, 3, 4],
    ]);
  });

  it("returns an empty array if k is greater than n", () => {
    const combinations = Array.from(getCombinations(3, 4));
    expect(combinations).toEqual([]);
  });

  it("returns a single combination if k equals n", () => {
    const combinations = Array.from(getCombinations(3, 3));
    expect(combinations).toEqual([[0, 1, 2]]);
  });

  it("returns an empty combination if k is 0", () => {
    const combinations = Array.from(getCombinations(3, 0));
    expect(combinations).toEqual([[]]);
  });

  it("returns an empty array if n is 0", () => {
    const combinations = Array.from(getCombinations(0, 0));
    expect(combinations).toEqual([[]]);
  });
});
