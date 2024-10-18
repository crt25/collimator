import { FormattedMessage } from "react-intl";

import musicIconURL from "./example/music.png";
import musicInsetIconURL from "./example/music-small.svg";
import React from "react";
import VM from "scratch-vm";
import { ArgumentType } from "../blocks/argument-type";
import { BlockType } from "../blocks/block-type";

export enum ExtensionId {
  Example = "example",
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
  defaultValue: number;
}

export interface ExtensionMetdataBlock {
  opcode: string;
  blockType: BlockType;
  text: string;
  arguments?: {
    [key: string]: ExtensionMetdataBlockArgument;
  };
  hideFromPalette?: boolean;
}

export interface ExtensionMetadataMenu {
  acceptReporters: boolean;
  items: { text: string; value: string }[];
}

export interface ExtensionMetadata {
  id: string;
  name: string;
  menuIconURI: string;
  blockIconURI: string;
  blocks: ExtensionMetdataBlock[];
  menus: {
    [key: string]: ExtensionMetadataMenu;
  };
}

export interface ExtensionUtilType {
  target: VM.Target;
}

export default {
  [ExtensionId.Example]: {
    name: (
      <FormattedMessage
        defaultMessage="Music"
        description="Name for the 'Music' extension"
        id="gui.extension.music.name"
      />
    ),
    iconURL: musicIconURL,
    insetIconURL: musicInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Play instruments and drums."
        description="Description for the 'Music' extension"
        id="gui.extension.music.description"
      />
    ),
    featured: true,
  },
} as Record<ExtensionId, Extension>;
