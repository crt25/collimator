import React from "react";
import { defineMessages, InjectedIntl, injectIntl } from "react-intl";

import Box from "@scratch-submodule/scratch-gui/src/components/box/box.jsx";
import SpriteInfo from "@scratch-submodule/scratch-gui/src//containers/sprite-info.jsx";
import ActionMenu from "@scratch-submodule/scratch-gui/src/components/action-menu/action-menu.jsx";
import VM from "scratch-vm";
// @ts-expect-error - no type definitions
import { isRtl } from "scratch-l10n";

import styles from "@scratch-submodule/scratch-gui/src/components/sprite-selector/sprite-selector.css";

import fileUploadIcon from "@scratch-submodule/scratch-gui/src/components/action-menu/icon--file-upload.svg";
import paintIcon from "@scratch-submodule/scratch-gui/src/components/action-menu/icon--paint.svg";
import spriteIcon from "@scratch-submodule/scratch-gui/src/components/action-menu/icon--sprite.svg";
import surpriseIcon from "@scratch-submodule/scratch-gui/src/components/action-menu/icon--surprise.svg";
import searchIcon from "@scratch-submodule/scratch-gui/src/components/action-menu/icon--search.svg";
import { STAGE_DISPLAY_SIZES } from "@scratch-submodule/scratch-gui/src/lib/layout-constants";
import { Sprite } from "../target-pane/TargetPane";
import { WithoutInteraction } from "../../WithoutInteraction";
import SpriteList from "./SpriteList";

const messages = defineMessages({
  addSpriteFromLibrary: {
    id: "gui.spriteSelector.addSpriteFromLibrary",
    description: "Button to add a sprite in the target pane from library",
    defaultMessage: "Choose a Sprite",
  },
  addSpriteFromPaint: {
    id: "gui.spriteSelector.addSpriteFromPaint",
    description: "Button to add a sprite in the target pane from paint",
    defaultMessage: "Paint",
  },
  addSpriteFromSurprise: {
    id: "gui.spriteSelector.addSpriteFromSurprise",
    description: "Button to add a random sprite in the target pane",
    defaultMessage: "Surprise",
  },
  addSpriteFromFile: {
    id: "gui.spriteSelector.addSpriteFromFile",
    description: "Button to add a sprite in the target pane from file",
    defaultMessage: "Upload Sprite",
  },
});

type Props = {
  isAddNewSpriteButtonVisible?: boolean;
  isSpriteInfoEnabled?: boolean;
  isDeleteSpriteButtonVisible?: boolean;
  isDuplicateSpriteButtonVisible?: boolean;
  isExportSpriteButtonVisible?: boolean;
  editingTarget?: string;
  hoveredTarget?: {
    hoveredSprite?: string;
    receivedBlocks?: boolean;
  };
  intl: InjectedIntl;
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
  onNewSpriteClick?: (e: Event) => void;
  onPaintSpriteClick?: () => void;
  onSelectSprite?: (id: string) => void;
  onSpriteUpload?: (e: Event) => void;
  onSurpriseSpriteClick?: () => void;
  raised?: boolean;
  selectedId?: string;
  spriteFileInput?: (input: HTMLInputElement) => void;
  sprites: {
    [id: string]: Sprite;
  };
  stageSize: keyof typeof STAGE_DISPLAY_SIZES;
};

const SpriteSelectorComponent = function (props: Props) {
  const {
    isAddNewSpriteButtonVisible,
    isSpriteInfoEnabled,
    isDeleteSpriteButtonVisible,
    isDuplicateSpriteButtonVisible,
    isExportSpriteButtonVisible,
    editingTarget,
    hoveredTarget,
    intl,
    onChangeSpriteDirection,
    onChangeSpriteName,
    onChangeSpriteRotationStyle,
    onChangeSpriteSize,
    onChangeSpriteVisibility,
    onChangeSpriteX,
    onChangeSpriteY,
    onDrop,
    onDeleteSprite,
    onDuplicateSprite,
    onExportSprite,
    onFileUploadClick,
    onNewSpriteClick,
    onPaintSpriteClick,
    onSelectSprite,
    onSpriteUpload,
    onSurpriseSpriteClick,
    raised,
    selectedId,
    spriteFileInput,
    sprites,
    stageSize,
    ...componentProps
  } = props;
  const selectedSprite: Sprite | undefined = sprites[selectedId ?? ""];
  let spriteInfoDisabled = false;
  if (typeof selectedSprite === "undefined") {
    spriteInfoDisabled = true;
  }

  const spriteInfo = (
    <SpriteInfo
      direction={selectedSprite?.direction}
      disabled={spriteInfoDisabled}
      name={selectedSprite?.name}
      rotationStyle={selectedSprite?.rotationStyle}
      size={selectedSprite?.size}
      stageSize={stageSize}
      visible={selectedSprite?.visible}
      x={selectedSprite?.x}
      y={selectedSprite?.y}
      onChangeDirection={onChangeSpriteDirection}
      onChangeName={onChangeSpriteName}
      onChangeRotationStyle={onChangeSpriteRotationStyle}
      onChangeSize={onChangeSpriteSize}
      onChangeVisibility={onChangeSpriteVisibility}
      onChangeX={onChangeSpriteX}
      onChangeY={onChangeSpriteY}
    />
  );

  return (
    <Box className={styles.spriteSelector} {...componentProps}>
      {isSpriteInfoEnabled ? (
        spriteInfo
      ) : (
        <WithoutInteraction>{spriteInfo}</WithoutInteraction>
      )}
      <SpriteList
        editingTarget={editingTarget}
        hoveredTarget={hoveredTarget}
        items={Object.keys(sprites).map((id) => sprites[id])}
        raised={raised}
        selectedId={selectedId}
        onDeleteSprite={onDeleteSprite}
        onDrop={onDrop}
        onDuplicateSprite={onDuplicateSprite}
        onExportSprite={onExportSprite}
        onSelectSprite={onSelectSprite}
        isDeleteSpriteButtonVisible={isDeleteSpriteButtonVisible}
        isDuplicateSpriteButtonVisible={isDuplicateSpriteButtonVisible}
        isExportSpriteButtonVisible={isExportSpriteButtonVisible}
      />
      {isAddNewSpriteButtonVisible && (
        <ActionMenu
          className={styles.addButton}
          img={spriteIcon}
          moreButtons={[
            {
              title: intl.formatMessage(messages.addSpriteFromFile),
              img: fileUploadIcon,
              onClick: onFileUploadClick,
              fileAccept:
                ".svg, .png, .bmp, .jpg, .jpeg, .sprite2, .sprite3, .gif",
              fileChange: onSpriteUpload,
              fileInput: spriteFileInput,
              fileMultiple: true,
            },
            {
              title: intl.formatMessage(messages.addSpriteFromSurprise),
              img: surpriseIcon,
              onClick: onSurpriseSpriteClick,
            },
            {
              title: intl.formatMessage(messages.addSpriteFromPaint),
              img: paintIcon,
              onClick: onPaintSpriteClick,
            },
            {
              title: intl.formatMessage(messages.addSpriteFromLibrary),
              img: searchIcon,
              onClick: onNewSpriteClick,
            },
          ]}
          title={intl.formatMessage(messages.addSpriteFromLibrary)}
          tooltipPlace={isRtl(intl.locale) ? "right" : "left"}
          onClick={onNewSpriteClick}
        />
      )}
    </Box>
  );
};

export default injectIntl(SpriteSelectorComponent);
