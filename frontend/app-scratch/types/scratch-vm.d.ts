/// <reference path="../node_modules/@turbowarp/types/types/scratch-vm.d.ts" />

// extend type definition
declare namespace VMExtended {
  export * from "../node_modules/@turbowarp/types/types/scratch-vm.d.ts";

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

  export interface BlockExtended extends VM.Block {
    isMonitored: boolean;
  }

  export interface BlocksExtended extends VM.Blocks {
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
      [key: string]: {type: string;fieldName: string;};
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

  export interface RuntimeExtended extends VM.Runtime {
    monitorBlocks: BlocksExtended;

    _blockInfo: ExtensionInfo[];
  }

  export interface Monitor {
    get(name: string): unknown;
  }

  export interface Monitors {
    values(): Monitor[];
  }

  export interface RenderedTargetEventMapExtended extends VM.RenderedTargetEventMap {
    "SCRIPT_GLOW_ON": [{id: string}];
    "SCRIPT_GLOW_OFF": [{id: string}];
    "BLOCK_GLOW_ON": [{id: string}];
    "BLOCK_GLOW_OFF": [{id: string}];
    "VISUAL_REPORT": [{id: string; value: unknown;}];
    "workspaceUpdate": [{xml: string;}];
    "workspaceUpdate": [{xml: string;}];
    "targetsUpdate": [];
    "MONITORS_UPDATE": [Monitors];
    "BLOCKSINFO_UPDATE": [ExtensionInfoExtended];
    "EXTENSION_ADDED": [ExtensionInfoExtended];
    "PERIPHERAL_CONNECTED": [];
    "PERIPHERAL_DISCONNECTED": [];
  }
}

declare class VMExtended extends VM {
  // override
  runtime: VMExtended.RuntimeExtended;

  // extend
  addListener: EventEmitter<VMExtended.RenderedTargetEventMapExtended>["on"];
  removeListener: EventEmitter<VMExtended.RenderedTargetEventMapExtended>["removeListener"];

  getLocale(): string;
  setLocale(locale: string, messages: string): Promise<void>;
  clearFlyoutBlocks(): void;

  blockListener: Function;
  flyoutBlockListener: Function;
  monitorBlockListener: Function;
}

declare module "scratch-vm" {
  export = VMExtended;
  export default VMExtended;
}
