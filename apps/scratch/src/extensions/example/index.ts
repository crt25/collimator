// adapted from https://github.com/scratchfoundation/scratch-vm/blob/766c767c7a2f3da432480ade515de0a9f98804ba/src/extensions/scratch3_music/index.js

import VM from "scratch-vm";
import formatMessage from "format-message";
import { ExtensionId, ExtensionMetadata, ExtensionUtilType } from "..";
import { BlockType } from "../../blocks/block-type";
import { ArgumentType } from "../../blocks/argument-type";

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 */
const blockIconURI: string =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHRpdGxlPm11c2ljLWJsb2NrLWljb248L3RpdGxlPjxkZWZzPjxwYXRoIGQ9Ik0zMi4xOCAyNS44NzRDMzIuNjM2IDI4LjE1NyAzMC41MTIgMzAgMjcuNDMzIDMwYy0zLjA3IDAtNS45MjMtMS44NDMtNi4zNzItNC4xMjYtLjQ1OC0yLjI4NSAxLjY2NS00LjEzNiA0Ljc0My00LjEzNi42NDcgMCAxLjI4My4wODQgMS44OS4yMzQuMzM4LjA4Ni42MzcuMTguOTM4LjMwMi44Ny0uMDItLjEwNC0yLjI5NC0xLjgzNS0xMi4yMy0yLjEzNC0xMi4zMDIgMy4wNi0xLjg3IDguNzY4LTIuNzUyIDUuNzA4LS44ODUuMDc2IDQuODItMy42NSAzLjg0NC0zLjcyNC0uOTg3LTQuNjUtNy4xNTMuMjYzIDE0LjczOHptLTE2Ljk5OCA1Ljk5QzE1LjYzIDM0LjE0OCAxMy41MDcgMzYgMTAuNDQgMzZjLTMuMDcgMC01LjkyMi0xLjg1Mi02LjM4LTQuMTM2LS40NDgtMi4yODQgMS42NzQtNC4xMzUgNC43NS00LjEzNSAxLjAwMyAwIDEuOTc1LjE5NiAyLjg1NS41NDMuODIyLS4wNTUtLjE1LTIuMzc3LTEuODYyLTEyLjIyOC0yLjEzMy0xMi4zMDMgMy4wNi0xLjg3IDguNzY0LTIuNzUzIDUuNzA2LS44OTQuMDc2IDQuODItMy42NDggMy44MzQtMy43MjQtLjk4Ny00LjY1LTcuMTUyLjI2MiAxNC43Mzh6IiBpZD0iYSIvPjwvZGVmcz48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjx1c2UgZmlsbD0iI0ZGRiIgeGxpbms6aHJlZj0iI2EiLz48cGF0aCBzdHJva2Utb3BhY2l0eT0iLjEiIHN0cm9rZT0iIzAwMCIgZD0iTTI4LjQ1NiAyMS42NzVjLS4wMS0uMzEyLS4wODctLjgyNS0uMjU2LTEuNzAyLS4wOTYtLjQ5NS0uNjEyLTMuMDIyLS43NTMtMy43My0uMzk1LTEuOTgtLjc2LTMuOTItMS4xNDItNi4xMTMtLjczMi00LjIyMy0uNjkzLTYuMDUuMzQ0LTYuNTI3LjUtLjIzIDEuMDYtLjA4IDEuODQuMzUuNDE0LjIyNyAyLjE4MiAxLjM2NSAyLjA3IDEuMjk2IDEuOTk0IDEuMjQyIDMuNDY0IDEuNzc0IDQuOTMgMS41NDggMS41MjYtLjIzNyAyLjUwNC0uMDYgMi44NzYuNjE4LjM0OC42MzUuMDE1IDEuNDE2LS43MyAyLjE4LTEuNDcyIDEuNTE2LTMuOTc1IDIuNTE0LTUuODQ4IDIuMDIzLS44MjItLjIyLTEuMjM4LS40NjUtMi4zOC0xLjI2N2wtLjA5NS0uMDY2Yy4wNDcuNTkzLjI2NCAxLjc0LjcxNyAzLjgwMy4yOTQgMS4zMzYgMi4wOCA5LjE4NyAyLjYzNyAxMS42NzRsLjAwMi4wMTJjLjUyOCAyLjYzNy0xLjg3MyA0LjcyNC01LjIzNiA0LjcyNC0zLjI5IDAtNi4zNjMtMS45ODgtNi44NjItNC41MjgtLjUzLTIuNjQgMS44NzMtNC43MzQgNS4yMzMtNC43MzQuNjcyIDAgMS4zNDcuMDg1IDIuMDE0LjI1LjIyNy4wNTcuNDM2LjExOC42MzYuMTg3em0tMTYuOTk2IDUuOTljLS4wMS0uMzE4LS4wOS0uODM4LS4yNjYtMS43MzctLjA5LS40Ni0uNTk1LTIuOTM3LS43NTMtMy43MjctLjM5LTEuOTYtLjc1LTMuODktMS4xMy02LjA3LS43MzItNC4yMjMtLjY5Mi02LjA1LjM0NC02LjUyNi41MDItLjIzIDEuMDYtLjA4MiAxLjg0LjM1LjQxNS4yMjcgMi4xODIgMS4zNjQgMi4wNyAxLjI5NSAxLjk5MyAxLjI0MiAzLjQ2MiAxLjc3NCA0LjkyNiAxLjU0OCAxLjUyNS0uMjQgMi41MDQtLjA2NCAyLjg3Ni42MTQuMzQ4LjYzNS4wMTUgMS40MTUtLjcyOCAyLjE4LTEuNDc0IDEuNTE3LTMuOTc3IDIuNTEzLTUuODQ3IDIuMDE3LS44Mi0uMjItMS4yMzYtLjQ2NC0yLjM3OC0xLjI2N2wtLjA5NS0uMDY1Yy4wNDcuNTkzLjI2NCAxLjc0LjcxNyAzLjgwMi4yOTQgMS4zMzcgMi4wNzggOS4xOSAyLjYzNiAxMS42NzVsLjAwMy4wMTNjLjUxNyAyLjYzOC0xLjg4NCA0LjczMi01LjIzNCA0LjczMi0zLjI4NyAwLTYuMzYtMS45OTMtNi44Ny00LjU0LS41Mi0yLjY0IDEuODg0LTQuNzMgNS4yNC00LjczLjkwNSAwIDEuODAzLjE1IDIuNjUuNDM2eiIvPjwvZz48L3N2Zz4=";

/**
 * Icon svg to be displayed in the category menu, encoded as a data URI.
 */
const menuIconURI: string =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE2LjA5IDEyLjkzN2MuMjI4IDEuMTQxLS44MzMgMi4wNjMtMi4zNzMgMi4wNjMtMS41MzUgMC0yLjk2Mi0uOTIyLTMuMTg2LTIuMDYzLS4yMy0xLjE0Mi44MzMtMi4wNjggMi4zNzItMi4wNjguMzIzIDAgLjY0MS4wNDIuOTQ1LjExN2EzLjUgMy41IDAgMCAxIC40NjguMTUxYy40MzUtLjAxLS4wNTItMS4xNDctLjkxNy02LjExNC0xLjA2Ny02LjE1MiAxLjUzLS45MzUgNC4zODQtMS4zNzcgMi44NTQtLjQ0Mi4wMzggMi40MS0xLjgyNSAxLjkyMi0xLjg2Mi0uNDkzLTIuMzI1LTMuNTc3LjEzMiA3LjM3ek03LjQ2IDguNTYzYy0xLjg2Mi0uNDkzLTIuMzI1LTMuNTc2LjEzIDcuMzdDNy44MTYgMTcuMDczIDYuNzU0IDE4IDUuMjIgMThjLTEuNTM1IDAtMi45NjEtLjkyNi0zLjE5LTIuMDY4LS4yMjQtMS4xNDIuODM3LTIuMDY3IDIuMzc1LTIuMDY3LjUwMSAwIC45ODcuMDk4IDEuNDI3LjI3Mi40MTItLjAyOC0uMDc0LTEuMTg5LS45My02LjExNEMzLjgzNCAxLjg3IDYuNDMgNy4wODcgOS4yODIgNi42NDZjMi44NTQtLjQ0Ny4wMzggMi40MS0xLjgyMyAxLjkxN3oiIGZpbGw9IiM1NzVFNzUiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==";

type CustomState = {
  test: string;
};

const EXTENSION_ID = ExtensionId.Example;

/**
 * Class for an example Scratch 3.0 extension.
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class ExampleExtension {
  static readonly STATE_KEY = EXTENSION_ID;
  static readonly DEFAULT_STATE: CustomState = {
    test: "value",
  };

  /**
   * The runtime instantiating this block package.
   * @type {Runtime}
   */
  private readonly runtime: VM.RuntimeExtended;

  constructor(runtime: VM.RuntimeExtended) {
    this.runtime = runtime;

    this.onTargetCreated = this.onTargetCreated.bind(this);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.runtime.on("targetWasCreated", this.onTargetCreated as any);
  }
  /**
   * Create data for a menu in scratch-blocks format, consisting of an array of objects with text and
   * value properties. The text is a translated string, and the value is one-indexed.
   * @param  {object[]} info - An array of info objects each having a name property.
   * @return {array} - An array of objects with text and value properties.
   * @private
   */
  buildMenu(info: { name: string }[]): { text: string; value: string }[] {
    return info.map((entry, index) => ({
      text: entry.name,
      value: String(index + 1),
    }));
  }

  /**
   * Gte the custom state for a target.
   * @param {Target} target
   * @returns the mutable custom state associated with that target. This will be created if necessary.
   * @private
   */
  getCustomState(target: VM.TargetExtended): CustomState {
    let state = (
      target as VM.TargetWithCustomState<CustomState>
    ).getCustomState(ExampleExtension.STATE_KEY);

    if (!state) {
      state = { ...ExampleExtension.DEFAULT_STATE };

      (target as VM.TargetWithCustomState<CustomState>).setCustomState(
        ExampleExtension.STATE_KEY,
        state,
      );
    }

    return state;
  }

  /**
   * When a Target is cloned, clone the custom state.
   * @param newTarget - the newly created target.
   * @param sourceTarget - the target used as a source for the new clone, if any.
   * @listens Runtime#event:targetWasCreated
   * @private
   */
  onTargetCreated(
    newTarget: VM.TargetExtended,
    sourceTarget?: VM.TargetExtended,
  ): void {
    if (sourceTarget) {
      const state = (
        sourceTarget as VM.TargetWithCustomState<CustomState>
      ).getCustomState(ExampleExtension.STATE_KEY);

      if (state) {
        (newTarget as VM.TargetWithCustomState<CustomState>).setCustomState(
          ExampleExtension.STATE_KEY,
          {
            ...state,
          },
        );
      }
    }
  }

  /**
   * @returns {object} metadata for this extension and its blocks.
   */
  getInfo(): ExtensionMetadata {
    return {
      id: EXTENSION_ID,
      name: formatMessage({
        id: "music.categoryName",
        default: "Music",
        description: "Label for the Music extension category",
      }),
      menuIconURI,
      blockIconURI,
      blocks: [
        {
          // Note: In order to avoid hardcoding all extension opcodes into collimator, we tell
          // collimator via a opcode prefix what the block should be translated to.
          opcode: "functionCall_setX",
          blockType: BlockType.command,
          text: formatMessage({
            id: "music.setTempo",
            default: "set tempo to [TEMPO]",
            description: "set tempo (speed) for notes, drums, and rests played",
          }),
          arguments: {
            TEMPO: {
              type: ArgumentType.number,
              defaultValue: 60,
            },
          },
        },
      ],
      menus: {},
    };
  }

  /**
   * Set the target's x position.
   */
  setX(args: { TEMPO: string | number }, { target }: ExtensionUtilType): void {
    target.setXY(parseInt(args.TEMPO.toString()), target.y);
  }
}

export default ExampleExtension;
