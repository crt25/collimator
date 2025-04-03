const logModule = `[useDissimilarAnalyses]`;

/**
 * Computes all combinations of k elements from a set.
 *
 * @warning This function can hog the CPU for large n and k.
 * @warning The generated arrays get overridden at each new yield, it's the caller's
 * responsibility to make a copy of the generated arrays if necessary.
 *
 * Inspired by https://github.com/lvlte/project-euler/blob/main/lib/combinatorics.js#L170
 * (MIT License).
 */
export function* getCombinationsUnsafe(
  n: number,
  k: number,
): Generator<number[]> {
  if (k > n) {
    console.error(
      `${logModule} Can't generate combinations. k must be less than or equal to n. Got ${k} > ${n}`,
    );
    return;
  }

  const combination = Array.from(Array(k), (_, idx) => idx);

  /**
   * Computes the next (n choose k) combination.
   * @returns False if we exhausted all combinations, true otherwise.
   */
  const next = (): boolean => {
    let i = k - 1;

    // combination is an array if k indices that will be sorted in ascending order.
    // we start by incrementing the last index.
    combination[i]++;

    if (combination[i] < n) {
      // if that index is still within bounds, we have a new combination.
      return true;
    }

    // if the last index is out of bounds (= n), we need to find the next index to increment.

    // define a limit for the next index to increment.
    // it will be decremented as we walk backwards through the combination
    // to ensure 1) that the indices are unique and 2) that they are strictly increasing (or decreasing backwards).
    let limit = n;

    // walk backwards from the last index to find the next index to increment.
    while (i > 0) {
      // we already did i, so decrement it.
      i--;
      // and accordingly decrement the limit.
      limit--;

      // then increment the next index.
      combination[i]++;

      // check if that value is below the limit. if it is, we found our now combination.
      // we just need to ensure that the indices are unique.
      if (combination[i] < limit) {
        // store the value of this index which is strictly smaller than n-i, i.e. at most n-i-1.
        let idx = combination[i];

        // walk until the end of the combination
        // and ensure that the indices are unique.
        for (let j = i + 1; j < combination.length; j++) {
          idx++;
          combination[j] = idx;
        }

        return true;
      }

      // if the value is not below the limit, we have incremented it to the limit in previous iterations
      // and need to continue walking backwards.
    }
    return false;
  };

  do {
    yield combination;
  } while (next());
}

export const choose = (n: number, k: number): number => {
  if (k === 0) return 1;
  return (n * choose(n - 1, k - 1)) / k;
};
