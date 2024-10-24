export enum BlockType {
  // https://github.com/scratchfoundation/scratch-vm/blob/e15809697de82760a6f13e03c502251de5bdd8c7/src/extension-support/block-type.js

  /**
   * Boolean reporter with hexagonal shape
   */
  boolean = "Boolean",

  /**
   * A button (not an actual block) for some special action, like making a variable
   */
  button = "button",

  /**
   * Command block
   */
  command = "command",

  /**
   * Specialized command block which may or may not run a child branch
   * The thread continues with the next block whether or not a child branch ran.
   */
  conditional = "conditional",

  /**
   * Specialized hat block with no implementation function
   * This stack only runs if the corresponding event is emitted by other code.
   */
  event = "event",

  /**
   * Hat block which conditionally starts a block stack
   */
  hat = "hat",

  /**
   * Specialized command block which may or may not run a child branch
   * If a child branch runs, the thread evaluates the loop block again.
   */
  loop = "loop",

  /**
   * General reporter with numeric or string value
   */
  reporter = "reporter",
}
