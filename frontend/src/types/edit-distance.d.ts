declare module "edit-distance" {
  /**
   * Represents the result of a tree edit distance calculation
   */
  export interface EditDistanceResult {
    /**
     * The computed edit distance between the two trees
     */
    distance: number;

    /**
     * Unknown
     */
    pairs: () => unknown;

    /**
     * Unknown
     */
    alignment: () => unknown;
  }

  /**
   * Function to get children of a node in the tree
   */
  export type GetChildrenFn<T> = (node: T) => T[];

  /**
   * Cost function for inserting a node
   */
  export type InsertCostFn<T> = (node: T) => number;

  /**
   * Cost function for removing a node
   */
  export type RemoveCostFn<T> = (node: T) => number;

  /**
   * Cost function for updating a node
   */
  export type UpdateCostFn<T> = (a: T, b: T) => number;

  /**
   * Calculates the tree edit distance between two trees
   * @param a The first tree
   * @param b The second tree
   * @param getChildren Function to retrieve children of a node
   * @param insertCost Function to calculate the cost of inserting a node
   * @param removeCost Function to calculate the cost of removing a node
   * @param updateCost Function to calculate the cost of updating a node
   * @returns Result object containing the edit distance
   */
  export function ted<T>(
    a: T,
    b: T,
    getChildren: GetChildrenFn<T>,
    insertCost: InsertCostFn<T>,
    removeCost: RemoveCostFn<T>,
    updateCost: UpdateCostFn<T>,
  ): EditDistanceResult;
}
