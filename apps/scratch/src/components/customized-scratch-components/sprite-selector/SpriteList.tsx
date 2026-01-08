import classNames from "classnames";

import React from "react";
import DragConstants from "@scratch-submodule/packages/scratch-gui/src/lib/drag-constants";

import Box from "@scratch-submodule/packages/scratch-gui/src/components/box/box.jsx";
import SpriteSelectorItem from "@scratch-submodule/packages/scratch-gui/src/containers/sprite-selector-item.jsx";
import SortableHOC from "@scratch-submodule/packages/scratch-gui/src/lib/sortable-hoc.jsx";
import SortableAsset from "@scratch-submodule/packages/scratch-gui/src/components/asset-panel/sortable-asset.jsx";
import ThrottledPropertyHOC from "@scratch-submodule/packages/scratch-gui/src/lib/throttled-property-hoc.jsx";

import styles from "@scratch-submodule/packages/scratch-gui/src/components/sprite-selector/sprite-selector.css";
import { Sprite } from "../target-pane/TargetPane";

const ThrottledSpriteSelectorItem = ThrottledPropertyHOC(
  "asset",
  500,
  // @ts-expect-error - inferred type is wrong but no need to fix it now - copy of the scratch codebase
)(SpriteSelectorItem);

type Props = {
  isDeleteSpriteButtonVisible?: boolean;
  isDuplicateSpriteButtonVisible?: boolean;
  isExportSpriteButtonVisible?: boolean;
  containerRef: () => void;
  draggingIndex: number;
  draggingType: keyof typeof DragConstants; // Use keyof to allow valid keys of DragConstants
  editingTarget?: string;
  hoveredTarget?: {
    hoveredSprite?: string;
    receivedBlocks?: boolean;
    sprite?: string;
  };
  items: Sprite[];
  onAddSortable: () => void;
  onDeleteSprite?: (id: string) => void;
  onDuplicateSprite?: (id: string) => void;
  onExportSprite?: (id: string) => void;
  onRemoveSortable: () => void;
  onSelectSprite?: (id: string) => void;
  ordering: number[]; // Array of numbers
  raised?: boolean;
  selectedId?: string;
};

const SpriteList = function (props: Props) {
  const {
    isDeleteSpriteButtonVisible,
    isDuplicateSpriteButtonVisible,
    isExportSpriteButtonVisible,
    containerRef,
    editingTarget,
    draggingIndex,
    draggingType,
    hoveredTarget,
    onDeleteSprite,
    onExportSprite,
    onDuplicateSprite,
    onSelectSprite,
    onAddSortable,
    onRemoveSortable,
    ordering,
    raised,
    selectedId,
    items,
  } = props;

  const isSpriteDrag = draggingType === DragConstants.SPRITE;

  return (
    <Box
      className={classNames(styles.scrollWrapper, {
        [styles.scrollWrapperDragging]:
          draggingType === DragConstants.BACKPACK_SPRITE,
      })}
      componentRef={containerRef}
    >
      <Box className={styles.itemsWrapper}>
        {items.map((sprite, index) => {
          // If the sprite has just received a block drop, used for green highlight
          const receivedBlocks =
            hoveredTarget?.sprite === sprite.id &&
            sprite.id !== editingTarget &&
            hoveredTarget?.receivedBlocks;

          // If the sprite is indicating it can receive block dropping, used for blue highlight
          let isRaised =
            !receivedBlocks && raised && sprite.id !== editingTarget;

          // A sprite is also raised if a costume or sound is being dragged.
          // Note the absence of the self-sharing check: a sprite can share assets with itself.
          // This is a quirk of 2.0, but seems worth leaving possible, it
          // allows quick (albeit unusual) duplication of assets.
          isRaised =
            isRaised ||
            [
              DragConstants.COSTUME,
              DragConstants.SOUND,
              DragConstants.BACKPACK_COSTUME,
              DragConstants.BACKPACK_SOUND,
              DragConstants.BACKPACK_CODE,
            ].includes(draggingType || "");

          return (
            <SortableAsset
              className={classNames(styles.spriteWrapper, {
                [styles.placeholder]: isSpriteDrag && index === draggingIndex,
              })}
              index={isSpriteDrag ? ordering.indexOf(index) : index}
              key={sprite.name}
              onAddSortable={onAddSortable}
              onRemoveSortable={onRemoveSortable}
            >
              {/* @ts-expect-error - Wrong typing in scratch */}
              <ThrottledSpriteSelectorItem
                asset={sprite?.costume?.asset}
                className={classNames(styles.sprite, {
                  [styles.raised]: isRaised,
                  [styles.receivedBlocks]: receivedBlocks,
                })}
                dragPayload={sprite.id}
                dragType={DragConstants.SPRITE}
                id={sprite.id}
                index={index}
                key={sprite.id}
                name={sprite.name}
                selected={sprite.id === selectedId}
                onClick={onSelectSprite}
                onDeleteButtonClick={
                  isDeleteSpriteButtonVisible ? onDeleteSprite : null
                }
                onDuplicateButtonClick={
                  isDuplicateSpriteButtonVisible ? onDuplicateSprite : null
                }
                onExportButtonClick={
                  isExportSpriteButtonVisible ? onExportSprite : null
                }
              />
            </SortableAsset>
          );
        })}
      </Box>
    </Box>
  );
};

export default SortableHOC(SpriteList) as React.FunctionComponent<
  Omit<
    Props,
    | "containerRef"
    | "draggingIndex"
    | "draggingType"
    | "mouseOverIndex"
    | "ordering"
    | "onAddSortable"
    | "onRemoveSortable"
  > & {
    dragInfo?: {
      currentOffset?: {
        x?: number;
        y?: number;
      };
      dragType?: string;
      dragging?: boolean;
      index?: number;
    };
    items?: Array<{
      url?: string;
      name: string;
    }>;
    onClose?: () => void;
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
    isRtl?: boolean;
  }
>;
