export function* iterateAllBlocks(
  runtime: VMExtended.RuntimeExtended,
): Generator<VMExtended.BlockExtended> {
  for (const target of runtime.targets) {
    for (const block of Object.values(target.blocks._blocks)) {
      yield block;
    }
  }
}
