import VM from "scratch-vm";

import SpriteLibrary from "@scratch-submodule/scratch-gui/src/containers/sprite-library.jsx";
import StageSelector from "@scratch-submodule/scratch-gui/src/containers/stage-selector.jsx";
import { STAGE_DISPLAY_SIZES } from "@scratch-submodule/scratch-gui/src/lib/layout-constants";

import styles from "@scratch-submodule/scratch-gui/src/components/target-pane/target-pane.css";
import React from "react";
import MinimalStageSelector from "../../MinimalStageSelector";
import SpriteSelectorComponent from "../sprite-selector/SpriteSelector";

export type Sprite = {
  costume?: {
    asset?: {
      encodeDataURI: () => string;
    };
    url?: string;
    name: string;
    bitmapResolution?: number;
    rotationCenterX?: number;
    rotationCenterY?: number;
  };
  costumeCount: number;
  direction?: number;
  id?: string;
  name: string;
  order?: number;
  size?: number;
  visibility?: boolean;
  x?: number;
  y?: number;
  rotationStyle?: VM.RotationStyle;
  visible?: boolean;
};

export type Props = {
  editingTarget: string;
  isStageSelectorVisible?: boolean;
  isAddNewSpriteButtonVisible?: boolean;
  isSpriteInfoEnabled?: boolean;
  isDeleteSpriteButtonVisible?: boolean;
  isDuplicateSpriteButtonVisible?: boolean;
  isExportSpriteButtonVisible?: boolean;
  fileInputRef?: (input: HTMLInputElement) => void;
  hoveredTarget?: {
    sprite: string;
    hoveredSprite?: string;
    receivedBlocks?: boolean;
  };
  onActivateBlocksTab: () => void;
  onChangeSpriteDirection?: (direction: number) => void;
  onChangeSpriteName?: (name: string) => void;
  onChangeSpriteRotationStyle?: (style: VM.RotationStyle) => void;
  onChangeSpriteSize?: (size: number) => void;
  onChangeSpriteVisibility?: (visibility: boolean) => void;
  onChangeSpriteX?: (x: number) => void;
  onChangeSpriteY?: (y: number) => void;
  onDeleteSprite?: (id: string) => void;
  onDrop?: (dragInfo: {
    dragType: string;
    index: number;
    newIndex: number;
    payload: {
      bodyUrl: string;
      body: string;
      name: string;
    };
  }) => void;
  onDuplicateSprite?: (id: string) => void;
  onExportSprite?: (id: string) => void;
  onFileUploadClick?: () => void;
  onNewSpriteClick: (e: Event) => void;
  onPaintSpriteClick?: () => void;
  onRequestCloseSpriteLibrary?: () => void;
  onSelectSprite: (id: string) => void;
  onSpriteUpload?: (e: Event) => void;
  onSurpriseSpriteClick?: () => void;
  raiseSprites?: boolean;
  spriteLibraryVisible?: boolean;
  sprites: Record<string, Sprite>;
  stage: Sprite;
  stageSize: keyof typeof STAGE_DISPLAY_SIZES;
  vm: VM;
};

/*
 * Pane that contains the sprite selector, sprite info, stage selector,
 * and the new sprite, costume and backdrop buttons
 * @param {object} props Props for the component
 * @returns {React.Component} rendered component
 */
const TargetPane = ({
  editingTarget,
  fileInputRef,
  hoveredTarget,
  isStageSelectorVisible,
  isAddNewSpriteButtonVisible,
  isDeleteSpriteButtonVisible,
  isDuplicateSpriteButtonVisible,
  isExportSpriteButtonVisible,
  isSpriteInfoEnabled,
  spriteLibraryVisible,
  onActivateBlocksTab,
  onChangeSpriteDirection,
  onChangeSpriteName,
  onChangeSpriteRotationStyle,
  onChangeSpriteSize,
  onChangeSpriteVisibility,
  onChangeSpriteX,
  onChangeSpriteY,
  onDeleteSprite,
  onDrop,
  onDuplicateSprite,
  onExportSprite,
  onFileUploadClick,
  onNewSpriteClick,
  onPaintSpriteClick,
  onRequestCloseSpriteLibrary,
  onSelectSprite,
  onSpriteUpload,
  onSurpriseSpriteClick,
  raiseSprites,
  stage,
  stageSize,
  sprites,
  vm,
  ...componentProps
}: Props) => {
  const stageId = stage.id;
  let stageSelector: React.JSX.Element | null = null;

  if (stageId) {
    stageSelector = isStageSelectorVisible ? (
      <StageSelector
        asset={stage.costume?.asset}
        // @ts-expect-error The inferred type is wrong
        backdropCount={stage.costumeCount}
        id={stageId}
        selected={stageId === editingTarget}
        onSelect={onSelectSprite}
      />
    ) : (
      <MinimalStageSelector
        url={stage.costume?.asset?.encodeDataURI()}
        backdropCount={stage.costumeCount || 0}
        selected={stageId === editingTarget}
        onClick={() => onSelectSprite(stageId)}
      />
    );
  }

  return (
    <div className={styles.targetPane} {...componentProps}>
      <SpriteSelectorComponent
        isAddNewSpriteButtonVisible={isAddNewSpriteButtonVisible}
        isSpriteInfoEnabled={isSpriteInfoEnabled}
        isDeleteSpriteButtonVisible={isDeleteSpriteButtonVisible}
        isDuplicateSpriteButtonVisible={isDuplicateSpriteButtonVisible}
        isExportSpriteButtonVisible={isExportSpriteButtonVisible}
        editingTarget={editingTarget}
        hoveredTarget={hoveredTarget}
        raised={raiseSprites}
        selectedId={editingTarget}
        spriteFileInput={fileInputRef}
        sprites={sprites}
        stageSize={stageSize}
        onChangeSpriteDirection={onChangeSpriteDirection}
        onChangeSpriteName={onChangeSpriteName}
        onChangeSpriteRotationStyle={onChangeSpriteRotationStyle}
        onChangeSpriteSize={onChangeSpriteSize}
        onChangeSpriteVisibility={onChangeSpriteVisibility}
        onChangeSpriteX={onChangeSpriteX}
        onChangeSpriteY={onChangeSpriteY}
        onDeleteSprite={onDeleteSprite}
        onDrop={onDrop}
        onDuplicateSprite={onDuplicateSprite}
        onExportSprite={onExportSprite}
        onFileUploadClick={onFileUploadClick}
        onNewSpriteClick={onNewSpriteClick}
        onPaintSpriteClick={onPaintSpriteClick}
        onSelectSprite={onSelectSprite}
        onSpriteUpload={onSpriteUpload}
        onSurpriseSpriteClick={onSurpriseSpriteClick}
      />
      <div className={styles.stageSelectorWrapper}>
        <div className="d-contents" data-testid="stage-selector">
          {stageSelector}
        </div>
        <div>
          {spriteLibraryVisible ? (
            <SpriteLibrary
              vm={vm}
              onActivateBlocksTab={onActivateBlocksTab}
              onRequestClose={onRequestCloseSpriteLibrary}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TargetPane;
