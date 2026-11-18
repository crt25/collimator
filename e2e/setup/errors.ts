export class FastStackError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "FastStackError";
  }
}

export class FastSlotInUseError extends FastStackError {
  constructor(
    public slot: number,
    public holderPid: number | null,
    hint: string,
  ) {
    super(`Fast stack slot ${slot} is in use by process ${holderPid}. ${hint}`);

    this.name = "FastSlotInUseError";
  }
}
