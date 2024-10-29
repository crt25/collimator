export class ModifyBlockConfigEvent extends Event {
  public static readonly eventName = "modify-block-config";
  readonly blockId: string;

  constructor(blockId: string) {
    super(ModifyBlockConfigEvent.eventName);

    this.blockId = blockId;
  }
}
