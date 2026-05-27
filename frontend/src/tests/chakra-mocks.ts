/* eslint-disable @typescript-eslint/explicit-function-return-type */

/**
 * DOM API mocks required by Chakra UI v3 in jsdom.
 * Source:
 * - https://chakra-ui.com/docs/components/concepts/testing
 *
 */

// jsdom does not expose structuredClone even on Node 17+ but Chakra UI v3+ uses it (https://github.com/jsdom/jsdom/issues/3363).
// Also see: https://medium.com/@Yasirgaji/setting-up-jest-for-next-js-and-chakra-ui-a-practical-battle-tested-guide-1ba5c9ace4b2
if (
  typeof (global as typeof globalThis & { structuredClone?: unknown })
    .structuredClone === "undefined"
) {
  (
    global as typeof globalThis & { structuredClone: <T>(val: T) => T }
  ).structuredClone = <T>(val: T): T => JSON.parse(JSON.stringify(val));
}

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  disconnect: jest.fn(),
  observe: jest.fn(),
  takeRecords: jest.fn(),
  unobserve: jest.fn(),
}));

Element.prototype.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};

// PointerEvent is present in jsdom but not a usable constructor in some
// versions. @zag-js which is used by Chakra UI v3 dispatches PointerEvents directly,
// so we replace it with a subclass of MouseEvent when needed.
// See: https://github.com/jsdom/jsdom/issues/2527
if (typeof window.PointerEvent !== "function") {
  class PointerEvent extends MouseEvent {
    pointerId: number;
    pointerType: string;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.pointerType = params.pointerType ?? "mouse";
    }
  }

  global.PointerEvent =
    PointerEvent as unknown as typeof globalThis.PointerEvent;
}
