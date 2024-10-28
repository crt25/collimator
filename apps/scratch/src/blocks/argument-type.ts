export enum ArgumentType {
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
