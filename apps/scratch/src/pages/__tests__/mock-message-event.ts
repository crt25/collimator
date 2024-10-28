export class MockMessageEvent extends Event {
  source: Window;
  data: unknown;

  constructor(source: Window, data: unknown) {
    super("message");

    this.source = source;
    this.data = data;
  }
}
