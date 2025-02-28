import { FormattedMessage } from "react-intl";
import React from "react";
import VM from "scratch-vm";
import { ArgumentType } from "../blocks/argument-type";
import { BlockType } from "../blocks/block-type";

import assertionsIconURL from "./assertions/assertions.svg";
import assertionsInsetIconURL from "./assertions/test-icon-white.svg";

export enum ExtensionId {
  Assertions = "assertions",
}

export interface Extension {
  name: React.ReactNode;
  description: React.ReactNode;
  iconURL: string;
  insetIconURL: string;
  featured: boolean;
}

export interface ExtensionMetdataBlockArgument {
  type: ArgumentType;
  menu?: string;
  defaultValue?: unknown;
}

export interface ExtensionMetdataBlock {
  opcode: string;
  blockType: BlockType;
  text: string;
  arguments?: {
    [key: string]: ExtensionMetdataBlockArgument;
  };
  hideFromPalette?: boolean;
  restartExistingThreads?: boolean;

  // If true, scratch will continously run the block and starts the stack if the return value changes from false to true.
  // If undefined it is assumed to be true.
  // Note however, that this causes some UI bugs such as https://github.com/scratchfoundation/scratch-vm/issues/1948
  isEdgeActivated?: boolean;
}

export interface ExtensionMetadataMenu {
  acceptReporters: boolean;
  items: { text: string; value: string }[];
}

export interface ExtensionMetadata {
  id: string;
  name: string;
  color1: string;
  color2: string;
  color3: string;
  menuIconURI: string;
  blockIconURI: string;
  blocks: ExtensionMetdataBlock[];
  menus: {
    [key: string]: ExtensionMetadataMenu;
  };
}

/**
 * The block utility.
 * See https://github.com/scratchfoundation/scratch-vm/blob/a41de71ac5680642c37f7e3cd122e77af72ddf52/src/engine/block-utility.js#L229.
 */
export interface ExtensionUtilType {
  target: VM.TargetExtended;
  thread: {
    stack: string[];
  };
}

export default {
  [ExtensionId.Assertions]: {
    name: (
      <FormattedMessage
        defaultMessage="Assertions"
        description="Name for the 'Assertions' extension"
        id="crt.extension.assertions.name"
      />
    ),
    iconURL: assertionsIconURL,
    insetIconURL: assertionsInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Assert conditions on students' code"
        description="Description for the 'Assertions' extension"
        id="crt.extension.assertions.description"
      />
    ),
    featured: true,
  },
} as Record<ExtensionId, Extension>;
