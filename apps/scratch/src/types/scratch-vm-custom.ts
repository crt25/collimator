import { BlockLimits } from "../blocks/make-toolbox-xml";
import { BlockFreezeStates } from "../blocks/types";

export interface CrtBlock {
  isTaskBlock?: boolean;
}

export interface CrtEventMap {
  /**
   * Event emitted after the assertions extension has been loaded.
   */
  ASSERTIONS_EXTENSION_LOADED: [];

  /**
   * Event emitted to check if assertions are enabled.
   */
  ARE_ASSERTIONS_ENABLED_QUERY: [];

  /**
   * Event emitted as a response to the query for whether assertions are enabled.
   */
  ARE_ASSERTIONS_ENABLED_RESPONSE: [boolean];

  /**
   * Event emitted to enable assertions.
   */
  ENABLE_ASSERTIONS: [];

  /**
   * Event emitted when assertions are enabled.
   */
  ASSERTIONS_ENABLED: [];

  /**
   * Event emitted to disable assertions.
   */
  DISABLE_ASSERTIONS: [];

  /**
   * Event emitted when assertions are disabled.
   */
  ASSERTIONS_DISABLED: [];

  /**
   * Event emitted after the project's assertions have been evaluated.
   * Note that there is no guarantee this event is ever emitted.
   * It will only be emitted if the assertions extension is loaded.
   * The first argument is a number indicating the total number of checked assertions
   * and the checked assertions.
   */
  ASSERTIONS_CHECKED: [
    // number of total assertions.
    number,
    // number of passed assertions.
    number,
  ];
}

export interface ScratchCrtConfig {
  /**
   * A map from scratch opcode to a number that defines how many times
   * a given block can be used.
   */
  allowedBlocks: BlockLimits;

  /**
   * Whether initial task blocks can be edited.
   */
  freezeStateByBlockId: {
    [taskBlockId: string]: BlockFreezeStates | undefined;
  };
}
