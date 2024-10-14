// if I am not mistaken this refers to having multiple values where the first one is show and later ones
// are used for replacement when removing the first but this is just a guess based on the seen exports
// see https://github.com/scratchfoundation/scratch-parser/blob/master/lib/sb3_definitions.json#L241

export enum BlockInputType {
  unobscuredShadow = 1,
  noShadow = 2,
  obscuredShadow = 3,
}
