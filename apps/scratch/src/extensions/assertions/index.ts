// adapted from https://github.com/scratchfoundation/scratch-vm/blob/766c767c7a2f3da432480ade515de0a9f98804ba/src/extensions/scratch3_music/index.js

import VM from "scratch-vm";
import { defineMessages } from "react-intl";
import { ExtensionId, ExtensionMetadata, ExtensionUtilType } from "..";
import { BlockType } from "../../blocks/block-type";
import { ArgumentType } from "../../blocks/argument-type";
import { formatMessage } from "../../i18n";
import { Assertion } from "../../types/scratch-vm-custom";
import testIconWhite from "./test-icon-white.svg";
import testIconBlack from "./test-icon-black.svg";

const messages = defineMessages({
  categoryName: {
    id: "crt.extensions.assertions.categoryName",
    defaultMessage: "Assertions",
    description: "Label for the Assertions extension category",
  },
  eventWhenTaskFinishedRunning: {
    id: "crt.extensions.assertions.event_whenTaskFinishedRunning",
    defaultMessage: "when task finished running",
    description:
      "The name displayed on the scratch block that runs after the project has stopped running",
  },
  assert: {
    id: "crt.extensions.assertions.assert",
    defaultMessage: "[NAME]: Assert [CONDITION] is true",
  },
  unnamedAssertion: {
    id: "crt.extensions.assertions.unnamedAssertion",
    defaultMessage: "Unnamed Assertion",
  },
  assertDefaultValue: {
    id: "crt.extensions.assertions.assertDefaultValue",
    defaultMessage: "x-Coordinate of final position is correct",
  },
});

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 */
const blockIconURI = testIconWhite;

/**
 * Icon svg to be displayed in the category menu, encoded as a data URI.
 */
const menuIconURI = testIconBlack;

type CustomState = {
  passedAssertions: { assertionName: string; blockId: string }[];
  failedAssertions: { assertionName: string; blockId: string }[];
};

const EXTENSION_ID = ExtensionId.Assertions;

/**
 * Get the custom state for a target.
 * @param {Target} target
 * @returns the mutable custom state associated with that target. This will be created if necessary.
 */
const getCustomState = (target: VM.TargetExtended): CustomState => {
  let state = (target as VM.TargetWithCustomState<CustomState>).getCustomState(
    AssertionExtension.STATE_KEY,
  );

  if (!state) {
    state = { ...AssertionExtension.DEFAULT_STATE };

    (target as VM.TargetWithCustomState<CustomState>).setCustomState(
      AssertionExtension.STATE_KEY,
      state,
    );
  }

  return state;
};

/**
 * Set the custom state for a target.
 */
const setCustomState = (
  target: VM.TargetExtended,
  state: CustomState,
): void => {
  (target as VM.TargetWithCustomState<CustomState>).setCustomState(
    AssertionExtension.STATE_KEY,
    state,
  );
};

interface RememberedTargetState {
  currentCostume: number;
  volume: number;
  customState: Partial<VM.CustomState>;
}

interface RememberedStageState extends RememberedTargetState {
  tempo: number;
  videoTransparency: number;
}

interface RememberedSpriteState extends RememberedTargetState {
  name: string;
  x: number;
  y: number;
  size: number;
  direction: number;
  draggable: boolean;
  rotationStyle: VM.RotationStyle;
  layerOrder: number;
}

/**
 * Adds assertions to the Scratch VM.
 * See https://github.com/scratchfoundation/scratch-vm/blob/develop/docs/extensions.md for a documentation of the Scratch VM extensions.
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class AssertionExtension {
  static readonly STATE_KEY = EXTENSION_ID;
  static readonly DEFAULT_STATE: CustomState = {
    passedAssertions: [],
    failedAssertions: [],
  };

  /**
   * The runtime instantiating this block package.
   * @type {Runtime}
   */
  private readonly runtime: VM.RuntimeExtended;

  private rememberedStageState: RememberedStageState | null = null;
  private rememberedSpriteState: {
    [targetId: string]: RememberedSpriteState;
  } = {};

  /**
   * Whether assertions are enabled.
   */
  private enabled: boolean = false;

  /**
   * Whether assertions are currently being run.
   */
  private runningAssertions: boolean = false;

  constructor(runtime: VM.RuntimeExtended) {
    this.runtime = runtime;

    this.onEnableAssertions = this.onEnableAssertions.bind(this);
    this.onDisableAssertions = this.onDisableAssertions.bind(this);
    this.onTargetCreated = this.onTargetCreated.bind(this);
    this.onProjectStart = this.onProjectStart.bind(this);
    this.onProjectStop = this.onProjectStop.bind(this);
    this.onProjectStopAll = this.onProjectStopAll.bind(this);
    this.onProjectLoaded = this.onProjectLoaded.bind(this);

    this.runtime.on("ENABLE_ASSERTIONS", this.onEnableAssertions);
    this.runtime.on("DISABLE_ASSERTIONS", this.onDisableAssertions);

    // reply to queries about whether assertions are enabled
    this.runtime.on("ARE_ASSERTIONS_ENABLED_QUERY", () =>
      this.runtime.emit("ARE_ASSERTIONS_ENABLED_RESPONSE", this.enabled),
    );

    // emit an event to signal that the extension has been loaded
    this.runtime.emit("ASSERTIONS_EXTENSION_LOADED");
  }

  /**
   * Called when assertions are to be enabled.
   * Remembers the initial state of all targets,
   * resets them when the project starts running and
   * checks the assertions when the project stops running.
   */
  onEnableAssertions = (): void => {
    this.rememberTargetStates();

    this.runtime.on("PROJECT_LOADED", this.onProjectLoaded);
    this.runtime.on("targetWasCreated", this.onTargetCreated);
    this.runtime.on("PROJECT_START", this.onProjectStart);
    this.runtime.on("PROJECT_RUN_STOP", this.onProjectStop);
    this.runtime.on("PROJECT_STOP_ALL", this.onProjectStopAll);

    this.enabled = true;
    this.runtime.emit("ASSERTIONS_ENABLED");
  };

  /**
   * Called when the project is loaded while assertions are enabled.
   * This requires us to remember the initial state of all targets.
   */
  onProjectLoaded = (): void => {
    this.rememberTargetStates();
  };

  /**
   * Called when assertions are to be disabled.
   * Stops resetting targets when the project starts running and
   * no longer checks the assertions when the project stops running.
   */
  onDisableAssertions = (): void => {
    this.runtime.off("targetWasCreated", this.onTargetCreated);
    this.runtime.off("PROJECT_START", this.onProjectStart);
    this.runtime.off("PROJECT_RUN_STOP", this.onProjectStop);
    this.runtime.off("PROJECT_STOP_ALL", this.onProjectStopAll);

    this.enabled = false;
    this.runtime.emit("ASSERTIONS_DISABLED");
  };

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
      ).getCustomState(AssertionExtension.STATE_KEY);

      if (state) {
        (newTarget as VM.TargetWithCustomState<CustomState>).setCustomState(
          AssertionExtension.STATE_KEY,
          {
            ...state,
          },
        );
      }
    }
  }

  /**
   * Callback for when the project starts running.
   */
  onProjectStart = (): void => {
    this.resetAllTargets();
  };

  /**
   * Remembers the state of all targets so they can be reset later.
   */
  rememberTargetStates = (): void => {
    this.rememberedSpriteState = {};
    this.rememberedStageState = null;

    for (const target of this.runtime.targets) {
      if (target.isStage) {
        this.rememberedStageState = {
          currentCostume: target.currentCostume,
          volume: target.volume,
          tempo: target.tempo,
          videoTransparency: target.videoTransparency,
          customState: target._customState,
        };
      } else if (target.isSprite()) {
        this.rememberedSpriteState[target.id] = {
          currentCostume: target.currentCostume,
          volume: target.volume,
          name: target.getName(),
          x: target.x,
          y: target.y,
          size: target.size,
          direction: target.direction,
          draggable: target.draggable,
          rotationStyle: target.rotationStyle,
          layerOrder: target.getLayerOrder(),
          customState: target._customState,
        };
      }
    }
  };

  /**
   * Reset all targets to their initial state, i.e. the state they were in when assertions were enabled.
   */
  resetAllTargets = (): void => {
    this.runtime.targets.forEach((target) => {
      // reset the state for each target

      if (target.isStage && this.rememberedStageState) {
        target.setCostume(this.rememberedStageState.currentCostume);
        target.volume = this.rememberedStageState.volume;
        target.tempo = this.rememberedStageState.tempo;
        target.videoTransparency = this.rememberedStageState.videoTransparency;

        target._customState = this.rememberedStageState.customState;
      } else if (target.isSprite() && this.rememberedSpriteState[target.id]) {
        const state = this.rememberedSpriteState[target.id];

        target.setCostume(state.currentCostume);
        target.volume = state.volume;
        target.sprite.name = state.name;
        target.setXY(state.x, state.y);
        target.setSize(state.size);
        target.setDirection(state.direction);
        target.setDraggable(state.draggable);
        target.setRotationStyle(state.rotationStyle);

        // see https://github.com/scratchfoundation/scratch-vm/blob/bb1659e1f42de5bd28d7233c8e418c4e536a2bf0/src/sprites/rendered-target.js#L850C71-L850C97
        target.renderer?.setDrawableOrder(
          target.drawableID,
          state.layerOrder,
          "sprite",
        );

        target._customState = state.customState;
      }

      // reset the assertions state for each target
      const state = getCustomState(target);

      setCustomState(target, {
        ...state,
        passedAssertions: [],
        failedAssertions: [],
      });
    });
  };

  /**
   * Callback for when the project stops running.
   */
  onProjectStop = (): void => {
    const afterRunOpcode = `${EXTENSION_ID}_event_whenTaskFinishedRunning`;

    let projectHasAfterRunAssertions: boolean = false;
    this.runtime.allScriptsByOpcodeDo(
      afterRunOpcode,
      () => (projectHasAfterRunAssertions = true),
    );

    if (projectHasAfterRunAssertions && !this.runningAssertions) {
      // once the project has stopped running, check the after-run assertions
      // note that after running them, we'll land in this method again
      this.runningAssertions = true;

      // see https://github.com/scratchfoundation/scratch-vm/blob/3867903e65ed9ed03cfeeb80a785457df7c2f099/src/blocks/scratch3_event.js#L12
      this.runtime.startHats(afterRunOpcode);
    } else {
      // we just ran the after-run assertions
      this.runningAssertions = false;

      this.onProjectAssertionsRan();
    }
  };

  /**
   * Callback for when the project assertions were run.
   */
  onProjectAssertionsRan = (): void => {
    const { passedAssertions, failedAssertions } = this.runtime.targets.reduce<{
      passedAssertions: Assertion[];
      failedAssertions: Assertion[];
    }>(
      ({ passedAssertions, failedAssertions }, target) => {
        const state = getCustomState(target);

        for (const assertion of state.failedAssertions) {
          this.runtime.emit("BLOCK_GLOW_ON", { id: assertion.blockId });
        }

        for (const assertion of state.passedAssertions) {
          this.runtime.emit("BLOCK_GLOW_OFF", { id: assertion.blockId });
        }

        const toAssertions = ({
          assertionName,
          blockId,
        }: {
          assertionName: string;
          blockId: string;
        }): Assertion => ({
          assertionName,
          blockId,
          targetName: target.getName(),
        });

        return {
          passedAssertions: [
            ...passedAssertions,
            ...state.passedAssertions.map(toAssertions),
          ],
          failedAssertions: [
            ...failedAssertions,
            ...state.failedAssertions.map(toAssertions),
          ],
        };
      },
      {
        passedAssertions: [],
        failedAssertions: [],
      },
    );

    this.runtime.emit("ASSERTIONS_CHECKED", passedAssertions, failedAssertions);
  };

  /**
   * Callback for when the red stop button is pressed.
   */
  onProjectStopAll = (): void => {
    this.resetAllTargets();
  };

  /**
   * @returns {object} metadata for this extension and its blocks.
   */
  getInfo(): ExtensionMetadata {
    return {
      id: EXTENSION_ID,
      name: formatMessage(messages.categoryName),
      menuIconURI,
      blockIconURI,
      color1: "#0FBD8C",
      color2: "#c26a77",
      color3: "#0B8E69",
      blocks: [
        {
          opcode: "event_whenTaskFinishedRunning",
          text: formatMessage(messages.eventWhenTaskFinishedRunning),
          blockType: BlockType.hat,
          isEdgeActivated: false,
          arguments: {},
        },
        {
          // Note: In order to avoid hardcoding all extension opcodes into the collimator backend, we tell
          // collimator via a opcode prefix what the block should be translated to.
          opcode: "noop_assert",
          blockType: BlockType.command,
          text: formatMessage(messages.assert),
          arguments: {
            NAME: {
              type: ArgumentType.string,
              defaultValue: formatMessage(messages.assertDefaultValue),
            },
            CONDITION: {
              type: ArgumentType.boolean,
            },
          },
        },
      ],
      menus: {},
    };
  }

  /**
   * A scratch hat block that is triggered when the task has finished running.
   */
  event_whenTaskFinishedRunning(
    _args: unknown,
    _util: ExtensionUtilType,
  ): boolean {
    // always run the children when this block is triggered
    return true;
  }

  /**
   * Assert a condition is true.
   */
  noop_assert(
    args: { NAME?: string; CONDITION: boolean },
    { target, thread }: ExtensionUtilType,
  ): void {
    const state = getCustomState(target);
    const newAssertion = {
      assertionName: args.NAME ?? formatMessage(messages.unnamedAssertion),
      blockId: thread.stack[thread.stack.length - 1],
    };

    setCustomState(target, {
      ...state,
      passedAssertions: args.CONDITION
        ? [...state.passedAssertions, newAssertion]
        : state.passedAssertions,
      failedAssertions: !args.CONDITION
        ? [...state.failedAssertions, newAssertion]
        : state.failedAssertions,
    });
  }
}

export default AssertionExtension;
