import VM from "@scratch/scratch-vm";

/**
 * https://github.com/scratchfoundation/scratch-vm/blob/766c767c7a2f3da432480ade515de0a9f98804ba/src/serialization/sb3.js#L470-L500
 */
export interface RememberedTargetState {
  currentCostume: number;
  volume: number;
  customState: Partial<VM.CustomState>;
}

export interface RememberedStageState extends RememberedTargetState {
  tempo: number;
  videoTransparency: number;
}

export interface RememberedSpriteState extends RememberedTargetState {
  name: string;
  x: number;
  y: number;
  size: number;
  direction: number;
  visible: boolean;
  draggable: boolean;
  rotationStyle: VM.RotationStyle;
  layerOrder: number;
}

const cloneCustomState = (
  customState: Partial<VM.CustomState>,
): Partial<VM.CustomState> => structuredClone(customState);

export const rememberStageState = (
  target: VM.Target,
): RememberedStageState => ({
  currentCostume: target.currentCostume,
  volume: target.volume,
  tempo: target.tempo,
  videoTransparency: target.videoTransparency,
  customState: cloneCustomState(target._customState),
});

export const rememberSpriteState = (
  target: VM.Target,
): RememberedSpriteState => ({
  currentCostume: target.currentCostume,
  volume: target.volume,
  name: target.getName(),
  x: target.x,
  y: target.y,
  size: target.size,
  direction: target.direction,
  visible: target.visible,
  draggable: target.draggable,
  rotationStyle: target.rotationStyle,
  layerOrder: target.getLayerOrder(),
  customState: cloneCustomState(target._customState),
});

export const restoreStageStateForExecution = (
  target: VM.Target,
  state: RememberedStageState,
): void => {
  target.setCostume(state.currentCostume);
  target.volume = state.volume;
  target.tempo = state.tempo;
  target.videoTransparency = state.videoTransparency;
  target._customState = cloneCustomState(state.customState);
};

export const restoreSpriteStateForExecution = (
  target: VM.Target,
  state: RememberedSpriteState,
): void => {
  target.setCostume(state.currentCostume);
  target.volume = state.volume;
  target.sprite.name = state.name;
  target.setXY(state.x, state.y);
  target.setSize(state.size);
  target.setDirection(state.direction);
  target.setVisible(state.visible);
  target.setDraggable(state.draggable);
  target.setRotationStyle(state.rotationStyle);
  // see https://github.com/scratchfoundation/scratch-vm/blob/bb1659e1f42de5bd28d7233c8e418c4e536a2bf0/src/sprites/rendered-target.js#L850
  target.renderer?.setDrawableOrder(
    target.drawableID,
    state.layerOrder,
    "sprite",
  );
  target._customState = cloneCustomState(state.customState);
};

export const restoreStageStateForSerialization = (
  target: VM.Target,
  state: RememberedStageState,
): void => {
  target.currentCostume = state.currentCostume;
  target.volume = state.volume;
  target.tempo = state.tempo;
  target.videoTransparency = state.videoTransparency;
  target._customState = cloneCustomState(state.customState);
};

export const restoreSpriteStateForSerialization = (
  target: VM.Target,
  state: RememberedSpriteState,
): void => {
  target.currentCostume = state.currentCostume;
  target.volume = state.volume;
  target.sprite.name = state.name;
  target.x = state.x;
  target.y = state.y;
  target.size = state.size;
  target.direction = state.direction;
  target.visible = state.visible;
  target.draggable = state.draggable;
  target.rotationStyle = state.rotationStyle;
  target._customState = cloneCustomState(state.customState);
};

export interface StartState {
  sprites: Map<string, RememberedSpriteState>;
  stage: RememberedStageState | undefined;
}

export const isTrackableSprite = (target: VM.Target): boolean =>
  // track every sprite the project file defines whether shown or hidden, skip the stage and runtime clones.
  !target.isStage && target.isOriginal !== false;

export const backupTargetsState = (vm: VM, startState: StartState): void => {
  if (startState.sprites.size !== 0 || startState.stage) {
    return;
  }

  for (const target of vm.runtime.targets) {
    if (target.isStage) {
      startState.stage = rememberStageState(target);
      continue;
    }

    if (!isTrackableSprite(target)) {
      continue;
    }

    startState.sprites.set(target.id, rememberSpriteState(target));
  }
};
