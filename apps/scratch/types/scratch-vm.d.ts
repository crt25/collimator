/// <reference path="../node_modules/@turbowarp/types/types/scratch-vm.d.ts" />

// extend type definition
declare namespace VMExtended {
  export * from "../node_modules/@turbowarp/types/types/scratch-vm.d.ts";

  enum ArgumentType {
    // https://github.com/scratchfoundation/scratch-vm/blob/766c767c7a2f3da432480ade515de0a9f98804ba/src/extension-support/argument-type.js

    /**
     * Numeric value with angle picker
     */
    angle = "angle",

    /**
     * Boolean value with hexagonal placeholder
     */
    boolean = "Boolean",

    /**
     * Numeric value with color picker
     */
    color = "color",

    /**
     * Numeric value with text field
     */
    number = "number",

    /**
     * String value with text field
     */
    string = "string",

    /**
     * String value with matrix field
     */
    matrix = "matrix",

    /**
     * MIDI note number with note picker (piano) field
     */
    note = "note",

    /**
     * Inline image on block (as part of the label)
     */
    image = "image",
  }

  enum BlockType {
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

  export interface BlockInfo {
    // https://github.com/scratchfoundation/scratch-vm/blob/e15809697de82760a6f13e03c502251de5bdd8c7/src/extension-support/extension-manager.js
    // https://github.com/scratchfoundation/scratch-vm/blob/e15809697de82760a6f13e03c502251de5bdd8c7/test/unit/extension_conversion.js#L93

    opcode: string;
    blockType: BlockType;
    text?: string;
    arguments: Record<string, unknown>;

    terminal: boolean;
    blockAllThreads: boolean;
    arguments: Record<string, unknown>;
    func?: (args: unknown, util: unknown) => unknown;
    isDynamic: boolean;
  }

  export type RotationStyle = VM.RotationStyle;

  export interface BlockExtended extends VM.Block {
    isMonitored: boolean;
    x: number;
    y: number;

    // a property added by the CRT to mark a block as a task block
    isTaskBlock?: boolean;
  }

  export interface BlocksExtended extends VM.Blocks {
    _blocks: Record<string, BlockExtended>;

    getBlock(id: string): BlockExtended | undefined;
  }

  export interface ExtensionInfoBlock {
    // https://github.com/scratchfoundation/scratch-vm/blob/e15809697de82760a6f13e03c502251de5bdd8c7/test/unit/extension_conversion.js#L93
    opcode: string;

    info: BlockInfo;
    json?: Record<string, unknown>;
    arguments: Record<string, unknown>;
  }

  export interface CustomFieldType {
    // https://github.com/scratchfoundation/scratch-vm/blob/e15809697de82760a6f13e03c502251de5bdd8c7/src/engine/runtime.js#L1003
    // https://github.com/scratchfoundation/scratch-vm/blob/e15809697de82760a6f13e03c502251de5bdd8c7/test/unit/extension_conversion.js#L110
    fieldName?: string;
    extendedName?: string;
    argumentTypeInfo?: {
      [key: string]: { type: string; fieldName: string };
    };
    scratchBlocksDefinition: {
      // https://github.com/scratchfoundation/scratch-vm/blob/e15809697de82760a6f13e03c502251de5bdd8c7/src/engine/runtime.js#L1032
      json: Record<string, unknown>;
    };
    fieldImplementation?: unknown;

    output?: string;
    outputShape?: number;
    implementation?: {
      fromJson: () => void;
    };
  }

  export interface ExtensionInfoExtended extends VM.ExtensionInfo {
    // https://github.com/scratchfoundation/scratch-vm/blob/e15809697de82760a6f13e03c502251de5bdd8c7/test/unit/extension_conversion.js#L85C7-L85C41
    id: string;
    name: string;
    color1: string;
    color2: string;
    color3: string;
    blockIconURI: string;

    menus: ExtensionInfoBlock[];
    blocks: ExtensionInfoBlock[];
    customFieldTypes: {
      [key: string]: CustomFieldType;
    };
  }

  export interface MonitorBlockInfo {
    isSpriteSpecific: boolean;
    getId: (string) => string;
  }

  type EventEmitterArgs<Events, K extends keyof Events> = Events[K] extends Array<unknown> ? Events[K] : unknown[];
  type EventEmitterCallback<Events, K extends keyof Events> = (...args: Events[K] extends Array<unknown> ? Events[K] : unknown[]) => void

  export interface RuntimeEventMapExtended extends VM.RuntimeEventMap {
    targetWasCreated: [
      // The new target
      TargetExtended,
      // The original target, if any. This will be set for clones.
      TargetExtended?
    ];

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
     * The first argument is a boolean indicating whether all assertions passed.
     */
    ASSERTIONS_CHECKED: [
      // whether all assertions passed.
      boolean
    ];
  }

  export interface RuntimeExtended extends VM.Runtime {

    // override event emitter
    on<K extends keyof RuntimeEventMapExtended>(event: K, callback: EventEmitterCallback<RuntimeEventMapExtended, K>): void;
    once<K extends keyof RuntimeEventMapExtended>(event: K, callback: EventEmitterCallback<RuntimeEventMapExtended, K>): void;
    off<K extends keyof RuntimeEventMapExtended>(event: K, callback: EventEmitterCallback<RuntimeEventMapExtended, K>): void;
    removeListener<K extends keyof RuntimeEventMapExtended>(event: K, callback: EventEmitterCallback<RuntimeEventMapExtended, K>): void;
    listeners<K extends keyof RuntimeEventMapExtended>(event: K): EventEmitterCallback<RuntimeEventMapExtended, K>[];
    emit<K extends keyof RuntimeEventMapExtended>(event: K, ...args: EventEmitterArgs<RuntimeEventMapExtended, K>): void;
    // end override event emitter

    monitorBlocks: BlocksExtended;
    monitorBlockInfo: MonitorBlockInfo;

    _blockInfo: ExtensionInfo[];

    handleProjectLoaded: () => void;

    targets: TargetExtended[];
  }

  export interface ExtensionManagerExtended extends VM.ExtensionManager {
    _registerInternalExtension: (extension: unknown) => string;
    _loadedExtensions: Map<string, string>;
  }

  export interface TargetExtended extends VM.Target {
    blocks: BlocksExtended;
  }

  export interface TargetWithCustomState<CustomState> extends TargetExtended {
    getCustomState(name: string): CustomState | undefined;
    setCustomState(name: T, value: CustomState): void;
  }

  export interface Monitor {
    get(name: string): unknown;
  }

  export interface Monitors {
    values(): Monitor[];
  }

  export interface RenderedTargetEventMapExtended
    extends VM.RenderedTargetEventMap {
    SCRIPT_GLOW_ON: [{ id: string }];
    SCRIPT_GLOW_OFF: [{ id: string }];
    BLOCK_GLOW_ON: [{ id: string }];
    BLOCK_GLOW_OFF: [{ id: string }];
    BLOCK_DRAG_END: [VM.BlockExtended[]];

    VISUAL_REPORT: [{ id: string; value: unknown }];
    workspaceUpdate: [{ xml: string }];
    workspaceUpdate: [{ xml: string }];
    targetsUpdate: [];
    MONITORS_UPDATE: [Monitors];
    BLOCKSINFO_UPDATE: [ExtensionInfoExtended];
    EXTENSION_ADDED: [ExtensionInfoExtended];
    PERIPHERAL_CONNECTED: [];
    PERIPHERAL_DISCONNECTED: [];
  }

  export interface BlockPackageClass {
    new (runtime: RuntimeExtended): BlockPackage;
  }

  export interface BlockPackage {
    // https://github.com/scratchfoundation/scratch-vm/blob/e15809697de82760a6f13e03c502251de5bdd8c7/src/blocks/scratch3_event.js
    getPrimitives: () => Record<
      string,
      (args: Record<string, unknown>, util: unknown) => void
    >;
    getHats?: () => Record<string, { restartExistingThreads: boolean }>;

    // https://github.com/scratchfoundation/scratch-vm/blob/e15809697de82760a6f13e03c502251de5bdd8c7/src/blocks/scratch3_motion.js#L47
    getMonitored?: () => Record<string, MonitorBlockInfo>;
  }

  export interface ScratchCrtConfig {
    /**
     * A map from scratch opcode to a number that defines how many times
     * a given block can be used.
     */
    allowedBlocks: import("../src/blocks/make-toolbox-xml").BlockLimits;

    /**
     * Whether initial task blocks can be edited.
     */
    taskBlockIds: {[taskBlockId?: string]: import("../src/blocks/types").BlockFreezeStates | undefined };
  }
}

declare class VMExtended extends VM {
  // override
  runtime: VMExtended.RuntimeExtended;
  extensionManager: VMExtended.ExtensionManagerExtended;

  /**
   * Deletes the target with the given ID and any of its clones.
   * @returns If a sprite was deleted, returns a function to undo the deletion.
   */
  deleteSprite(targetId: string): (() => Promise<void>) | null;

  reorderTarget(oldIndex: number, newIndex: number): boolean;

  // extend
  addListener: EventEmitter<VMExtended.RenderedTargetEventMapExtended>["on"];
  removeListener: EventEmitter<VMExtended.RenderedTargetEventMapExtended>["removeListener"];

  getLocale(): string;
  setLocale(locale: string, messages: string): Promise<void>;
  clearFlyoutBlocks(): void;

  blockListener: Function;
  flyoutBlockListener: Function;
  monitorBlockListener: Function;

  // add a custom config
  crtConfig?: VMExtended.ScratchCrtConfig;
}

declare module "scratch-vm" {
  export = VMExtended;
  export default VMExtended;
}

declare module "scratch-vm/src/blocks/*" {
  const blockPackage: VMExtended.StaticBlockPackage;

  export default blockPackage;
}
