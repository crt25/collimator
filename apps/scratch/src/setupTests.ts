// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// add polyfills for jest
import "jest-canvas-mock";
import { AudioContext } from "standardized-audio-context-mock";

// we need to mock this module because it crashes the tests otherwise as jest doesn't fully simulate the browser environment
jest.mock("./containers/Blocks");

jest.mock("./scratch/scratch-gui/src/lib/supported-browser", () => ({
  supportedBrowser: (): boolean => true,
  recommendedBrowser: (): boolean => true,
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.AudioContext = AudioContext as any;
