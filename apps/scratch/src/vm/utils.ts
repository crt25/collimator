import { BlockExtended } from "@scratch/scratch-vm";

export function* allBlocks(
  runtime: VMExtended.RuntimeExtended,
): Generator<BlockExtended> {
  for (const target of runtime.targets) {
    for (const block of Object.values(target.blocks._blocks)) {
      yield block;
    }
  }
}
