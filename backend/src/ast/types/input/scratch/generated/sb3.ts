/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type NumPrimitive =
  | []
  | [4 | 5 | 6 | 7 | 8]
  | [4 | 5 | 6 | 7 | 8, string | number];
export type ColorPrimitive = [] | [9] | [9, string];
export type TextPrimitive = [] | [10] | [10, string | number];
export type BroadcastPrimitive =
  | []
  | [11]
  | [11, string]
  | [11, string, string];
/**
 * @minItems 3
 * @maxItems 5
 */
export type VariablePrimitive = [12, string, string, ...number[]];
/**
 * @minItems 3
 * @maxItems 5
 */
export type ListPrimitive = [13, string, string, ...number[]];
/**
 * @maxItems 3
 */
export type ScalarVariable =
  | []
  | [string]
  | [string, (string | number) | boolean, ...true[]];
export type List = [] | [string] | [string, ((string | number) | boolean)[]];

/**
 * Scratch 3.0 Project Schema
 */
export interface HttpsScratchMitEduSb3SchemaJson {
  meta: {
    semver: string;
    vm?: string;
    agent?: string;
    origin?: string;
    [k: string]: unknown;
  };
  targets: [] | [Stage & Target, ...(Sprite & Target)[]];
  [k: string]: unknown;
}
/**
 * Description of property (and/or property/value pairs) that are unique to the stage.
 */
export interface Stage {
  name: "Stage";
  isStage: true;
  tempo?: number;
  videoTransparency?: number;
  videoState?: "on" | "off" | "on-flipped";
  /**
   * The layer order of the stage should be 0, if specified.
   */
  layerOrder?: 0;
  [k: string]: unknown;
}
/**
 * Properties common to both Scratch 3.0 Stage and Sprite
 */
export interface Target {
  currentCostume?: number;
  blocks: {
    [k: string]: Block | (VariablePrimitive | ListPrimitive);
  };
  variables: {
    [k: string]: ScalarVariable;
  };
  lists?: {
    [k: string]: List;
  };
  broadcasts?: {
    /**
     * the message being broadcasted
     */
    [k: string]: string;
  };
  comments?: {
    [k: string]: Comment;
  };
  /**
   * @minItems 1
   */
  costumes: [Costume, ...Costume[]];
  sounds: Sound[];
  volume?: number;
  [k: string]: unknown;
}
export interface Block {
  opcode: string;
  comment?: string;
  inputs?: {
    [k: string]:
      | []
      | [
          1 | 2 | 3,
          ...(
            | (string | null)
            | (
                | NumPrimitive
                | ColorPrimitive
                | TextPrimitive
                | BroadcastPrimitive
                | VariablePrimitive
                | ListPrimitive
              )
          )[],
        ];
  };
  fields?: {
    [k: string]: unknown;
  };
  next?: string | null;
  topLevel?: boolean;
  parent?: string | null;
  shadow?: boolean;
  x?: number;
  y?: number;
  mutation?: {
    tagName?: "mutation";
    children?: unknown[];
    proccode?: string;
    argumentids?: string;
    warp?: ("true" | "false" | "null") | boolean | null;
    hasnext?: ("true" | "false" | "null") | boolean | null;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
export interface Comment {
  blockId?: string | null;
  text: string;
  minimized?: boolean;
  x?: number | null;
  y?: number | null;
  width?: number;
  height?: number;
  [k: string]: unknown;
}
export interface Costume {
  assetId: string;
  bitmapResolution?: number;
  dataFormat: "png" | "svg" | "jpeg" | "jpg" | "bmp" | "gif";
  md5ext?: string;
  name: string;
  /**
   * This property is not required, but is highly recommended.
   */
  rotationCenterX?: number;
  /**
   * This property is not required, but is highly recommended.
   */
  rotationCenterY?: number;
  [k: string]: unknown;
}
export interface Sound {
  assetId: string;
  dataFormat: "wav" | "wave" | "mp3";
  md5ext?: string;
  name: string;
  rate?: number;
  sampleCount?: number;
  [k: string]: unknown;
} /**
 * Description of property (and/or property/value pairs) for sprites.
 */
export interface Sprite {
  name: string;
  isStage: false;
  visible?: boolean;
  x?: number;
  y?: number;
  size?: number;
  direction?: number;
  draggable?: boolean;
  rotationStyle?: "all around" | "don't rotate" | "left-right";
  /**
   * The layer order of a sprite should be a positive number, if specified.
   */
  layerOrder?: number;
  [k: string]: unknown;
}
