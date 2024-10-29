export class UpdateBlockToolboxEvent extends Event {
  public static readonly eventName = "update-block-toolbox";

  constructor() {
    super(UpdateBlockToolboxEvent.eventName);
  }
}
