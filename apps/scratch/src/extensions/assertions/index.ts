// adapted from https://github.com/scratchfoundation/scratch-vm/blob/766c767c7a2f3da432480ade515de0a9f98804ba/src/extensions/scratch3_music/index.js

import VM from "scratch-vm";
import formatMessage from "format-message";
import { ExtensionId, ExtensionMetadata, ExtensionUtilType } from "..";
import { BlockType } from "../../blocks/block-type";
import { ArgumentType } from "../../blocks/argument-type";
import testIconWhite from "./test-icon-white.svg";
import testIconBlack from "./test-icon-black.svg";

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 */
const blockIconURI = testIconWhite;

/**
 * Icon svg to be displayed in the category menu, encoded as a data URI.
 */
const menuIconURI = testIconBlack;

type CustomState = {
  allAssertionsTrue: boolean;
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
 * Class for an example Scratch 3.0 extension.
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class AssertionExtension {
  static readonly STATE_KEY = EXTENSION_ID;
  static readonly DEFAULT_STATE: CustomState = {
    allAssertionsTrue: true,
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
        target.renderer.setDrawableOrder(
          target.drawableID,
          state.layerOrder,
          "sprite",
        );
      }

      // reset the assertions state for each target
      const state = getCustomState(target);

      setCustomState(target, {
        ...state,
        allAssertionsTrue: true,
      });
    });
  };

  /**
   * Callback for when the project stops running.
   */
  onProjectStop = (): void => {
    const allAssertionsPassed = this.runtime.targets.reduce((acc, target) => {
      const state = getCustomState(target);

      return acc && state.allAssertionsTrue;
    }, true);

    this.runtime.emit("ASSERTIONS_CHECKED", allAssertionsPassed);
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
      name: formatMessage({
        id: "crt.extensions.assertions.categoryName",
        default: "Assertions",
        description: "Label for the Assertions extension category",
      }),
      menuIconURI,
      blockIconURI,
      blocks: [
        {
          // Note: In order to avoid hardcoding all extension opcodes into the collimator backend, we tell
          // collimator via a opcode prefix what the block should be translated to.
          opcode: "noop_assert",
          blockType: BlockType.command,
          text: formatMessage({
            id: "crt.extensions.assertions.assert",
            default: "Assert [CONDITION] is true",
          }),
          arguments: {
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
   * Assert a condition is true.
   */
  noop_assert(
    args: { CONDITION: boolean },
    { target }: ExtensionUtilType,
  ): void {
    const state = getCustomState(target);

    setCustomState(target, {
      ...state,
      allAssertionsTrue: state.allAssertionsTrue && args.CONDITION,
    });
  }
}

export default AssertionExtension;
