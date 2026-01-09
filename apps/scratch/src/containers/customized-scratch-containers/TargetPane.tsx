import bindAll from "lodash.bindall";
import React from "react";
import VM from "@scratch/scratch-vm";
import { connect } from "react-redux";
import { injectIntl, IntlShape } from "react-intl";

import { Action, Dispatch } from "redux";
import {
  openSpriteLibrary,
  closeSpriteLibrary,
} from "@scratch-submodule/packages/scratch-gui/src/reducers/modals";
import {
  activateTab,
  COSTUMES_TAB_INDEX,
  BLOCKS_TAB_INDEX,
} from "@scratch-submodule/packages/scratch-gui/src/reducers/editor-tab";
import { setReceivedBlocks } from "@scratch-submodule/packages/scratch-gui/src/reducers/hovered-target";
import {
  showStandardAlert,
  closeAlertWithId,
} from "@scratch-submodule/packages/scratch-gui/src/reducers/alerts";
import { setRestore } from "@scratch-submodule/packages/scratch-gui/src/reducers/restore-deletion";
import DragConstants from "@scratch-submodule/packages/scratch-gui/src/lib/drag-constants";
import { BLOCKS_DEFAULT_SCALE } from "@scratch-submodule/packages/scratch-gui/src/lib/layout-constants";
import spriteLibraryContent from "@scratch-submodule/packages/scratch-gui/src/lib/libraries/sprites.json";
import {
  handleFileUpload,
  spriteUpload,
} from "@scratch-submodule/packages/scratch-gui/src/lib/file-uploader.js";
import sharedMessages from "@scratch-submodule/packages/scratch-gui/src/lib/shared-messages";
import { emptySprite } from "@scratch-submodule/packages/scratch-gui/src/lib/empty-assets";
import { highlightTarget } from "@scratch-submodule/packages/scratch-gui/src/reducers/targets";
import {
  fetchSprite,
  fetchCode,
} from "@scratch-submodule/packages/scratch-gui/src/lib/backpack-api";
import randomizeSpritePosition from "@scratch-submodule/packages/scratch-gui/src/lib/randomize-sprite-position";
import downloadBlob from "@scratch-submodule/packages/scratch-gui/src/lib/download-blob";
import TargetPaneComponent, {
  Sprite,
  Props as TargetPaneProps,
} from "../../components/customized-scratch-components/target-pane/TargetPane";

interface Metrics {
  scrollX: number;
  scrollY: number;
  scale: number;
}

interface Props extends Omit<
  TargetPaneProps,
  "onSelectSprite" | "onActivateBlocksTab" | keyof InjectedProps
> {
  intl: IntlShape;
  onNewSpriteClick?: (e: Event) => void;
}

class TargetPane extends React.Component<ConnectedProps> {
  private fileInput?: HTMLInputElement;

  constructor(props: ConnectedProps) {
    super(props);
    bindAll(this, [
      "handleActivateBlocksTab",
      "handleBlockDragEnd",
      "handleChangeSpriteRotationStyle",
      "handleChangeSpriteDirection",
      "handleChangeSpriteName",
      "handleChangeSpriteSize",
      "handleChangeSpriteVisibility",
      "handleChangeSpriteX",
      "handleChangeSpriteY",
      "handleDeleteSprite",
      "handleDrop",
      "handleDuplicateSprite",
      "handleExportSprite",
      "handleNewSprite",
      "handleNewSpriteClick",
      "handleSelectSprite",
      "handleSurpriseSpriteClick",
      "handlePaintSpriteClick",
      "handleFileUploadClick",
      "handleSpriteUpload",
      "setFileInput",
    ]);
  }
  componentDidMount() {
    this.props.vm.addListener("BLOCK_DRAG_END", this.handleBlockDragEnd);
  }
  componentWillUnmount() {
    this.props.vm.removeListener("BLOCK_DRAG_END", this.handleBlockDragEnd);
  }
  handleChangeSpriteDirection(direction: number) {
    this.props.vm.postSpriteInfo({ direction });
  }
  handleChangeSpriteRotationStyle(rotationStyle: VM.RotationStyle) {
    this.props.vm.postSpriteInfo({ rotationStyle });
  }
  handleChangeSpriteName(name: string) {
    this.props.vm.renameSprite(this.props.editingTarget, name);
  }
  handleChangeSpriteSize(size: number) {
    this.props.vm.postSpriteInfo({ size });
  }
  handleChangeSpriteVisibility(visible: boolean) {
    this.props.vm.postSpriteInfo({ visible });
  }
  handleChangeSpriteX(x: number) {
    this.props.vm.postSpriteInfo({ x });
  }
  handleChangeSpriteY(y: number) {
    this.props.vm.postSpriteInfo({ y });
  }
  handleDeleteSprite(id: string) {
    const restoreSprite = this.props.vm.deleteSprite(id);

    const restoreFun = restoreSprite
      ? () => restoreSprite().then(this.handleActivateBlocksTab)
      : () => {};

    this.props.dispatchUpdateRestore({
      restoreFun: restoreFun,
      deletedItem: "Sprite",
    });
  }
  handleDuplicateSprite(id: string) {
    this.props.vm.duplicateSprite(id);
  }
  handleExportSprite(id: string) {
    const sprite = this.props.vm.runtime.getTargetById(id);
    if (!sprite) {
      return;
    }

    const spriteName = sprite.getName();
    const saveLink = document.createElement("a");
    document.body.appendChild(saveLink);

    this.props.vm.exportSprite(id).then((content) => {
      downloadBlob(`${spriteName}.sprite3`, content);
    });
  }
  handleSelectSprite(id: string) {
    this.props.vm.setEditingTarget(id);
    if (this.props.stage && id !== this.props.stage.id) {
      this.props.onHighlightTarget(id);
    }
  }
  handleSurpriseSpriteClick() {
    const surpriseSprites = spriteLibraryContent.filter(
      (sprite) =>
        sprite.tags.indexOf("letters") === -1 &&
        sprite.tags.indexOf("numbers") === -1,
    );
    const item =
      surpriseSprites[Math.floor(Math.random() * surpriseSprites.length)];
    randomizeSpritePosition(item);
    this.props.vm
      .addSprite(JSON.stringify(item))
      .then(this.handleActivateBlocksTab);
  }
  handlePaintSpriteClick() {
    const formatMessage = this.props.intl.formatMessage;
    const emptyItem = emptySprite(
      formatMessage(sharedMessages.sprite, { index: 1 }),
      formatMessage(sharedMessages.pop),
      formatMessage(sharedMessages.costume, { index: 1 }),
    );
    this.props.vm.addSprite(JSON.stringify(emptyItem)).then(() => {
      setTimeout(() => {
        // Wait for targets update to propagate before tab switching
        this.props.onActivateTab(COSTUMES_TAB_INDEX);
      });
    });
  }
  handleActivateBlocksTab() {
    this.props.onActivateTab(BLOCKS_TAB_INDEX);
  }
  handleNewSpriteClick(e: Event) {
    e.preventDefault();
    this.props.onNewSpriteClick(e);
  }
  handleNewSprite(spriteJSONString: string) {
    return this.props.vm
      .addSprite(spriteJSONString)
      .then(this.handleActivateBlocksTab);
  }
  handleFileUploadClick() {
    this.fileInput?.click();
  }
  handleSpriteUpload(e: Event) {
    const storage = this.props.vm.runtime.storage;
    this.props.onShowImporting();
    handleFileUpload(
      e.target,
      (
        buffer: string | ArrayBuffer | null,
        fileType: string,
        fileName: string,
        fileIndex: number,
        fileCount: number,
      ) => {
        spriteUpload(
          buffer,
          fileType,
          fileName,
          storage,
          (newSprite: string) => {
            this.handleNewSprite(newSprite)
              .then(() => {
                if (fileIndex === fileCount - 1) {
                  this.props.onCloseImporting();
                }
              })
              .catch(this.props.onCloseImporting);
          },
          this.props.onCloseImporting,
        );
      },
      this.props.onCloseImporting,
    );
  }
  setFileInput(input: HTMLInputElement) {
    this.fileInput = input;
  }
  handleBlockDragEnd(blocks: VM.BlockExtended[]) {
    if (!this.props.hoveredTarget) {
      return;
    }

    if (
      this.props.hoveredTarget.sprite &&
      this.props.hoveredTarget.sprite !== this.props.editingTarget
    ) {
      this.shareBlocks(
        blocks,
        this.props.hoveredTarget.sprite,
        this.props.editingTarget,
      );
      this.props.onReceivedBlocks(true);
    }
  }
  shareBlocks(
    blocks: VM.BlockExtended[],
    targetId: string,
    optFromTargetId?: string,
  ) {
    // Position the top-level block based on the scroll position.
    const topBlock = blocks.find((block) => block.topLevel);
    if (topBlock) {
      let metrics: Metrics;
      if (this.props.workspaceMetrics.targets[targetId]) {
        metrics = this.props.workspaceMetrics.targets[targetId];
      } else {
        metrics = {
          scrollX: 0,
          scrollY: 0,
          scale: BLOCKS_DEFAULT_SCALE,
        };
      }

      // Determine position of the top-level block based on the target's workspace metrics.
      const { scrollX, scrollY, scale } = metrics;
      const posY = -scrollY + 30;
      let posX;
      if (this.props.isRtl) {
        posX = scrollX + 30;
      } else {
        posX = -scrollX + 30;
      }

      // Actually apply the position!
      topBlock.x = posX / scale;
      topBlock.y = posY / scale;
    }

    return this.props.vm.shareBlocksToTarget(blocks, targetId, optFromTargetId);
  }
  handleDrop(dragInfo: {
    dragType: string;
    index: number;
    newIndex: number;
    payload: {
      bodyUrl: string;
      body: string;
      name: string;
    };
  }) {
    if (!this.props.hoveredTarget) {
      return;
    }

    const { sprite: targetId } = this.props.hoveredTarget;
    if (dragInfo.dragType === DragConstants.SPRITE) {
      // Add one to both new and target index because we are not counting/moving the stage
      this.props.vm.reorderTarget(dragInfo.index + 1, dragInfo.newIndex + 1);
    } else if (dragInfo.dragType === DragConstants.BACKPACK_SPRITE) {
      // TODO storage does not have a way of loading zips right now, and may never need it.
      // So for now just grab the zip manually.
      fetchSprite(dragInfo.payload.bodyUrl).then((sprite3Zip) =>
        this.props.vm.addSprite(sprite3Zip),
      );
    } else if (targetId) {
      // Something is being dragged over one of the sprite tiles or the backdrop.
      // Dropping assets like sounds and costumes duplicate the asset on the
      // hovered target. Shared costumes also become the current costume on that target.
      // However, dropping does not switch the editing target or activate that editor tab.
      // This is based on 2.0 behavior, but seems like it keeps confusing switching to a minimum.
      // it allows the user to share multiple things without switching back and forth.
      if (dragInfo.dragType === DragConstants.COSTUME) {
        this.props.vm.shareCostumeToTarget(dragInfo.index, targetId);
      } else if (targetId && dragInfo.dragType === DragConstants.SOUND) {
        this.props.vm.shareSoundToTarget(dragInfo.index, targetId);
      } else if (dragInfo.dragType === DragConstants.BACKPACK_COSTUME) {
        // In scratch 2, this only creates a new sprite from the costume.
        // We may be able to handle both kinds of drops, depending on where
        // the drop happens. For now, just add the costume.
        this.props.vm.addCostume(
          dragInfo.payload.body,
          // @ts-expect-error Apparently the payload can also be partial? Is the turbowrap typing wrong?
          {
            name: dragInfo.payload.name,
          },
          targetId,
        );
      } else if (dragInfo.dragType === DragConstants.BACKPACK_SOUND) {
        this.props.vm.addSound(
          // @ts-expect-error Apparently the payload can also be partial? Is the turbowrap typing wrong?
          {
            md5: dragInfo.payload.body,
            name: dragInfo.payload.name,
          },
          targetId,
        );
      } else if (dragInfo.dragType === DragConstants.BACKPACK_CODE) {
        fetchCode(dragInfo.payload.bodyUrl)
          .then((blocks) => this.shareBlocks(blocks, targetId))
          .then(() => this.props.vm.refreshWorkspace());
      }
    }
  }
  render() {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      dispatchUpdateRestore,
      isRtl,
      onActivateTab,
      onCloseImporting,
      onHighlightTarget,
      onNewSpriteClick,
      onReceivedBlocks,
      onShowImporting,
      workspaceMetrics,
      ...componentProps
    } = this.props;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return (
      <TargetPaneComponent
        {...componentProps}
        fileInputRef={this.setFileInput}
        onActivateBlocksTab={this.handleActivateBlocksTab}
        onChangeSpriteDirection={this.handleChangeSpriteDirection}
        onChangeSpriteName={this.handleChangeSpriteName}
        onChangeSpriteRotationStyle={this.handleChangeSpriteRotationStyle}
        onChangeSpriteSize={this.handleChangeSpriteSize}
        onChangeSpriteVisibility={this.handleChangeSpriteVisibility}
        onChangeSpriteX={this.handleChangeSpriteX}
        onChangeSpriteY={this.handleChangeSpriteY}
        onDeleteSprite={this.handleDeleteSprite}
        onDrop={this.handleDrop}
        onDuplicateSprite={this.handleDuplicateSprite}
        onExportSprite={this.handleExportSprite}
        onFileUploadClick={this.handleFileUploadClick}
        onPaintSpriteClick={this.handlePaintSpriteClick}
        onSelectSprite={this.handleSelectSprite}
        onSpriteUpload={this.handleSpriteUpload}
        onSurpriseSpriteClick={this.handleSurpriseSpriteClick}
        onNewSpriteClick={this.handleNewSpriteClick}
      />
    );
  }
}

const mapStateToProps = (state: {
  scratchGui: {
    targets: {
      editingTarget: string;
      sprites: Record<string, Sprite>;
      stage: Sprite;
    };
    blockDrag: boolean;
    workspaceMetrics: { targets: { [key: string]: Metrics } };
    modals: { spriteLibrary: boolean };
    hoveredTarget: { sprite: string };
  };
  locales: { isRtl: boolean };
}) => ({
  editingTarget: state.scratchGui.targets.editingTarget,
  hoveredTarget: state.scratchGui.hoveredTarget,
  isRtl: state.locales.isRtl,
  spriteLibraryVisible: state.scratchGui.modals.spriteLibrary,
  sprites: state.scratchGui.targets.sprites,
  stage: state.scratchGui.targets.stage,
  raiseSprites: state.scratchGui.blockDrag,
  workspaceMetrics: state.scratchGui.workspaceMetrics,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onNewSpriteClick: () => {
    dispatch(openSpriteLibrary());
  },
  onRequestCloseSpriteLibrary: () => {
    dispatch(closeSpriteLibrary());
  },
  onActivateTab: (tabIndex: number) => {
    dispatch(activateTab(tabIndex));
  },
  onReceivedBlocks: (receivedBlocks: boolean) => {
    dispatch(setReceivedBlocks(receivedBlocks));
  },
  dispatchUpdateRestore: (restoreState: {
    restoreFun: () => void;
    deletedItem: string;
  }) => {
    dispatch(setRestore(restoreState));
  },
  onHighlightTarget: (id: string) => {
    dispatch(highlightTarget(id));
  },
  onCloseImporting: () =>
    dispatch(closeAlertWithId("importingAsset") as Action),
  onShowImporting: () =>
    dispatch(showStandardAlert("importingAsset") as Action),
});

const mergeProps = (
  stateProps: ReturnType<typeof mapStateToProps>,
  dispatchProps: ReturnType<typeof mapDispatchToProps>,
  ownProps: Props,
) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
  onNewSpriteClick: ownProps.onNewSpriteClick || dispatchProps.onNewSpriteClick,
});

type InjectedProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type ConnectedProps = ReturnType<typeof mergeProps>;

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(TargetPane),
);
