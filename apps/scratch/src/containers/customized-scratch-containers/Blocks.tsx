import bindAll from "lodash.bindall";
import debounce from "lodash.debounce";
import defaultsDeep from "lodash.defaultsdeep";
import React from "react";
import VM, {
  ExtensionInfoBlock,
  ExtensionInfoExtended,
  Monitors,
  VariableType,
} from "scratch-vm";

import log from "@scratch-submodule/scratch-gui/src/lib/log.js";
import Prompt from "@scratch-submodule/scratch-gui/src/containers/prompt.jsx";
import BlocksComponent from "@scratch-submodule/scratch-gui/src/components/blocks/blocks.jsx";
import extensionData from "@scratch-submodule/scratch-gui/src/lib/libraries/extensions/index.jsx";
import CustomProcedures from "@scratch-submodule/scratch-gui/src/containers/custom-procedures.jsx";
import ErrorBoundaryHOC from "@scratch-submodule/scratch-gui/src/lib/error-boundary-hoc.jsx";
import DropAreaHOC from "@scratch-submodule/scratch-gui/src/lib/drop-area-hoc.jsx";
import DragConstants from "@scratch-submodule/scratch-gui/src/lib/drag-constants";
import defineDynamicBlock from "@scratch-submodule/scratch-gui/src/lib/define-dynamic-block";
import {
  ColorTheme,
  getColorsForTheme,
} from "@scratch-submodule/scratch-gui/src/lib/themes";
import {
  injectExtensionBlockTheme,
  injectExtensionCategoryTheme,
} from "@scratch-submodule/scratch-gui/src/lib/themes/blockHelpers";

import { connect } from "react-redux";
import { updateToolbox } from "@scratch-submodule/scratch-gui/src/reducers/toolbox";
import { activateColorPicker } from "@scratch-submodule/scratch-gui/src/reducers/color-picker";
import {
  closeExtensionLibrary,
  openSoundRecorder,
  openConnectionModal,
} from "@scratch-submodule/scratch-gui/src/reducers/modals";
import {
  activateCustomProcedures,
  deactivateCustomProcedures,
} from "@scratch-submodule/scratch-gui/src/reducers/custom-procedures";
import { setConnectionModalExtensionId } from "@scratch-submodule/scratch-gui/src/reducers/connection-modal";
import { updateMetrics } from "@scratch-submodule/scratch-gui/src/reducers/workspace-metrics";
import { isTimeTravel2020 } from "@scratch-submodule/scratch-gui/src/reducers/time-travel";

import {
  activateTab,
  SOUNDS_TAB_INDEX,
} from "@scratch-submodule/scratch-gui/src/reducers/editor-tab";
import { StageDisplaySize } from "@scratch-submodule/scratch-gui/src/lib/screen-utils";
import ScratchBlocks, { Flyout, Workspace } from "scratch-blocks";
import { Action, Dispatch } from "redux";
import VMScratchBlocks from "@scratch-submodule/scratch-gui/src/lib/blocks";
import makeToolboxXML from "../../blocks/make-toolbox-xml";
import {
  addBlockConfigButtons,
  updateSingleBlockConfigButton,
} from "../../blocks/block-config";
import BlockConfig from "../../components/block-config/BlockConfig";
import { UpdateBlockToolboxEvent } from "../../events/update-block-toolbox";
import { filterNonNull } from "../../utilities/filter-non-null";
import {
  addFreezeButtonsToStack,
  freezeTaskBlocks,
  removeFreezeButtons,
} from "../../blocks/freeze-task-blocks";
import {
  isBlockBeingDragged,
  isBlockInsertionMarker,
  isBlocksCanvas,
  isWithinStack,
  isVisualTopOfStack,
} from "../../utilities/scratch-selectors";
import { getCrtColorsTheme } from "../../blocks/colors";
import { isBlockPartOfLargeStack } from "../../utilities/scratch-block-stack-utils";
import ExtensionLibrary from "./ExtensionLibrary";
import type { CrtContextValue } from "../../contexts/CrtContext";

// reverse engineered from https://github.com/scratchfoundation/scratch-vm/blob/613399e9a9a333eef5c8fb5e846d5c8f4f9536c6/src/engine/blocks.js#L312
interface WorkspaceChangeEvent {
  type:
  | "create"
  | "change"
  | "move"
  | "dragOutside"
  | "endDrag"
  | "delete"
  | "var_create"
  | "var_rename"
  | "var_delete"
  | "comment_create"
  | "comment_change"
  | "comment_move"
  | "comment_delete";

  blockId?: string;
  recordUndo?: boolean;
  xml?: Element;
  oldXml?: Element;
}

const addFunctionListener = (
  object: unknown,
  property: string,
  callback: () => void,
) => {
  if (typeof object !== "object") {
    throw new Error("Cannot add function listener on non-object");
  }

  const typedObject = object as { [key: string]: unknown };

  if (property in typedObject) {
    const oldFn = typedObject[property];

    if (typeof oldFn !== "function") {
      throw new Error("Cannot add function listener on non-function");
    }

    typedObject[property] = function (...args: unknown[]) {
      const result = oldFn.apply(this, args);
      callback.apply(this, []);
      return result;
    };
  }
};

const suppressStackClicks =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  (listener: Function) => (e: { element: unknown }) => {
    if (e.element === "stackclick" || e.element === "click") {
      // suppress stack click events
      // https://github.com/scratchfoundation/scratch-vm/blob/bea39123bd3001a054981bfcd4ad2233f99d63aa/src/engine/blocks.js#L327
      return;
    }

    listener(e);
  };

const DroppableBlocks = DropAreaHOC([DragConstants.BACKPACK_CODE])(
  BlocksComponent,
);

interface Metrics {
  targetID: string;
  scrollX: number;
  scrollY: number;
  scale: number;
}

interface Props {
  vm: VM;
  stageSize: StageDisplaySize;
  locale: string;
  anyModalVisible?: boolean;
  showFlyout: boolean;
  canEditTask?: boolean;
  customProceduresVisible?: boolean;
  extensionLibraryVisible?: boolean;
  isRtl?: boolean;
  isVisible?: boolean;
  messages: string;
  onActivateColorPicker: (callback?: () => void) => void;
  onActivateCustomProcedures: (data: HTMLElement, callback: () => void) => void;
  onOpenConnectionModal: (extensionId: string) => void;
  onOpenSoundRecorder: () => void;
  onRequestCloseCustomProcedures: (data: Element | undefined) => void;
  onRequestCloseExtensionLibrary: () => void;
  options: {
    media?: string;
    zoom?: {
      controls: boolean;
      wheel: boolean;
      startScale: number;
    };
    grid?: {
      spacing: number;
      length: number;
      colour: string;
    };
    comments?: boolean;
    collapse?: boolean;
    sounds?: boolean;
  };
  theme: ColorTheme;
  toolboxXML: string;
  updateMetrics: (metrics: Metrics) => void;
  updateToolboxState: (xml: string) => void;
  useCatBlocks?: boolean;
  workspaceMetrics: {
    targets: Record<string, Metrics>;
  };
  sendRequest?: CrtContextValue["sendRequest"];
}

type PromptCallback = (
  input: string,
  varNames: string[],
  variableOptions: { scope: "global" | "local"; isCloud: boolean },
) => void;

interface State {
  prompt: {
    callback: PromptCallback;
    message: string;
    defaultValue: string;
    varType: VariableType;
    title: string;
    showVariableOptions: boolean;
    showCloudOption: boolean;
  } | null;
}

class Blocks extends React.Component<Props, State> {
  private ScratchBlocks: typeof ScratchBlocks;
  private toolboxUpdateQueue: (() => void)[];
  private workspace?: Workspace;
  private blocks?: HTMLElement;
  private _renderedToolboxXML?: string;
  private setToolboxRefreshEnabled?: (enabled: boolean) => void;
  private toolboxUpdateTimeout?: number;

  constructor(props: Props) {
    super(props);
    this.ScratchBlocks = VMScratchBlocks(props.vm, false);

    bindAll(this, [
      "attachVM",
      "detachVM",
      "getToolboxXML",
      "handleCategorySelected",
      "handleConnectionModalStart",
      "handleDrop",
      "handleStatusButtonUpdate",
      "handleOpenSoundRecorder",
      "handlePromptStart",
      "handlePromptCallback",
      "handlePromptClose",
      "handleCustomProceduresClose",
      "onScriptGlowOn",
      "onScriptGlowOff",
      "onBlockGlowOn",
      "onBlockGlowOff",
      "handleMonitorsUpdate",
      "handleExtensionAdded",
      "handleBlocksInfoUpdate",
      "onTargetsUpdate",
      "onVisualReport",
      "onWorkspaceUpdate",
      "onWorkspaceMetricsChange",
      "setBlocks",
      "setLocale",
      "requestToolboxUpdate",
      "onWorkspaceChange",
      "onBlocksChange",
      "onProjectLoaded",
    ]);
    this.ScratchBlocks.prompt = this.handlePromptStart;
    this.ScratchBlocks.statusButtonCallback = this.handleConnectionModalStart;
    this.ScratchBlocks.recordSoundCallback = this.handleOpenSoundRecorder;

    this.state = {
      prompt: null,
    };
    this.onTargetsUpdate = debounce(this.onTargetsUpdate, 100);
    this.toolboxUpdateQueue = [];
  }

  componentDidMount() {
    this.ScratchBlocks = VMScratchBlocks(
      this.props.vm,
      this.props.useCatBlocks || false,
    );
    this.ScratchBlocks.prompt = this.handlePromptStart;
    this.ScratchBlocks.statusButtonCallback = this.handleConnectionModalStart;
    this.ScratchBlocks.recordSoundCallback = this.handleOpenSoundRecorder;

    this.ScratchBlocks.FieldColourSlider.activateEyedropper_ =
      this.props.onActivateColorPicker;
    this.ScratchBlocks.Procedures.externalProcedureDefCallback =
      this.props.onActivateCustomProcedures;
    this.ScratchBlocks.ScratchMsgs.setLocale(this.props.locale);

    const workspaceConfig = defaultsDeep({}, this.props.options, {
      rtl: this.props.isRtl,
      toolbox: this.props.toolboxXML,
      colours: getCrtColorsTheme(this.props.theme),
      // if we hide the flyout, move it to the top (https://github.com/scratchfoundation/scratch-blocks/blob/2e3a31e555a611f0c48d7c57074e2e54104c04ce/core/options.js#L90C7-L90C23)
      // where the flyout is seemingly ignored by the scrollbars :)
      horizontalLayout: !this.props.showFlyout,
    });

    if (!this.blocks) {
      throw new Error("Blocks element not set");
    }

    this.workspace = this.ScratchBlocks.inject(this.blocks, workspaceConfig);

    // Register buttons under new callback keys for creating variables,
    // lists, and procedures from extensions.
    const toolboxWorkspace = this.getWorkspaceFlyout().getWorkspace();

    const varListButtonCallback = (opt_type: string) => () => {
      return this.ScratchBlocks.Variables.createVariable(
        this.getWorkspace(),
        undefined,
        opt_type,
      );
    };
    const procButtonCallback = () => {
      this.ScratchBlocks.Procedures.createProcedureDefCallback_(
        this.getWorkspace(),
      );
    };

    toolboxWorkspace.registerButtonCallback(
      "MAKE_A_VARIABLE",
      varListButtonCallback(""),
    );
    toolboxWorkspace.registerButtonCallback(
      "MAKE_A_LIST",
      varListButtonCallback("list"),
    );
    toolboxWorkspace.registerButtonCallback(
      "MAKE_A_PROCEDURE",
      procButtonCallback,
    );

    // Store the xml of the toolbox that is actually rendered.
    // This is used in componentDidUpdate instead of prevProps, because
    // the xml can change while e.g. on the costumes tab.
    this._renderedToolboxXML = this.props.toolboxXML;

    // we actually never want the workspace to enable "refresh toolbox" - this basically re-renders the
    // entire toolbox every time we reset the workspace.  We call updateToolbox as a part of
    // componentDidUpdate so the toolbox will still correctly be updated
    this.setToolboxRefreshEnabled =
      this.workspace.setToolboxRefreshEnabled.bind(this.workspace);

    this.workspace.setToolboxRefreshEnabled = () => {
      if (!this.setToolboxRefreshEnabled) {
        throw new Error("setToolboxRefreshEnabled not set");
      }

      this.setToolboxRefreshEnabled(false);
    };

    // @todo change this when blockly supports UI events
    addFunctionListener(
      this.getWorkspace(),
      "translate",
      this.onWorkspaceMetricsChange,
    );
    addFunctionListener(
      this.getWorkspace(),
      "zoom",
      this.onWorkspaceMetricsChange,
    );

    this.attachVM();
    // Only update blocks/vm locale when visible to avoid sizing issues
    // If locale changes while not visible it will get handled in didUpdate
    if (this.props.isVisible) {
      this.setLocale();
    }

    if (!this.props.showFlyout && this.blocks) {
      const elementsToHide = [
        this.blocks.querySelector<SVGSVGElement>("svg.blocklyFlyout"),
        this.blocks.querySelector<HTMLDivElement>("div.blocklyToolboxDiv"),
        this.blocks.querySelector<HTMLDivElement>("svg.blocklyFlyoutScrollbar"),
      ];

      for (const element of elementsToHide) {
        element?.classList.add("d-none");
      }
    }

    // update the toolbox when an update is requested
    window.addEventListener(
      UpdateBlockToolboxEvent.eventName,
      this.requestToolboxUpdate,
    );

    // observe the block canvas for when a new block is added to the svg
    const canvas = this.blocks.querySelector(isBlocksCanvas);

    if (!canvas) {
      throw new Error("Could not find the block canvas");
    }

    const observer = new MutationObserver(this.onBlocksChange);
    observer.observe(canvas, { childList: true, subtree: true });

    // trigger onNewStacks for any existing stacks
    this.onNewStacks([
      ...this.blocks.querySelectorAll<SVGGElement>(
        `${isBlocksCanvas} ${isVisualTopOfStack}`,
      ),
    ]);
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return (
      this.state.prompt !== nextState.prompt ||
      this.props.isVisible !== nextProps.isVisible ||
      this._renderedToolboxXML !== nextProps.toolboxXML ||
      this.props.extensionLibraryVisible !==
      nextProps.extensionLibraryVisible ||
      this.props.customProceduresVisible !==
      nextProps.customProceduresVisible ||
      this.props.locale !== nextProps.locale ||
      this.props.anyModalVisible !== nextProps.anyModalVisible ||
      this.props.stageSize !== nextProps.stageSize
    );
  }

  componentDidUpdate(prevProps: Props) {
    // If any modals are open, call hideChaff to close z-indexed field editors
    if (this.props.anyModalVisible && !prevProps.anyModalVisible) {
      this.ScratchBlocks.hideChaff();
    }

    // Only rerender the toolbox when the blocks are visible and the xml is
    // different from the previously rendered toolbox xml.
    // Do not check against prevProps.toolboxXML because that may not have been rendered.
    if (
      this.props.isVisible &&
      this.props.toolboxXML !== this._renderedToolboxXML
    ) {
      this.requestToolboxUpdate();
    }

    if (this.props.isVisible === prevProps.isVisible) {
      if (this.props.stageSize !== prevProps.stageSize) {
        // force workspace to redraw for the new stage size
        window.dispatchEvent(new Event("resize"));
      }
      return;
    }
    // @todo hack to resize blockly manually in case resize happened while hidden
    // @todo hack to reload the workspace due to gui bug #413
    if (this.props.isVisible) {
      // Scripts tab
      this.getWorkspace().setVisible(true);
      if (
        prevProps.locale !== this.props.locale ||
        this.props.locale !== this.props.vm.getLocale()
      ) {
        // call setLocale if the locale has changed, or changed while the blocks were hidden.
        // vm.getLocale() will be out of sync if locale was changed while not visible
        this.setLocale();
      } else {
        this.refreshWorkspace();
      }

      window.dispatchEvent(new Event("resize"));
    } else {
      this.getWorkspace().setVisible(false);
    }
  }

  componentWillUnmount() {
    this.detachVM();
    this.getWorkspace().dispose();
    clearTimeout(this.toolboxUpdateTimeout);

    // Clear the flyout blocks so that they can be recreated on mount.
    this.props.vm.clearFlyoutBlocks();
  }

  refreshWorkspace() {
    this.props.vm.refreshWorkspace();
    this.requestToolboxUpdate();
  }

  requestToolboxUpdate() {
    clearTimeout(this.toolboxUpdateTimeout);
    this.toolboxUpdateTimeout = setTimeout(() => {
      this.updateToolbox();
    }, 0) as unknown as number;
  }

  setLocale() {
    this.ScratchBlocks.ScratchMsgs.setLocale(this.props.locale);
    this.props.vm.setLocale(this.props.locale, this.props.messages).then(() => {
      const flyout = this.getWorkspaceFlyout();

      flyout.setRecyclingEnabled(false);
      this.refreshWorkspace();
      this.withToolboxUpdates(() => {
        flyout.setRecyclingEnabled(true);
      });
    });
  }

  updateToolbox() {
    this.toolboxUpdateTimeout = undefined;

    const workspace = this.getWorkspace();
    if (!workspace.toolbox_) {
      return;
    }

    const categoryId = workspace.toolbox_.getSelectedCategoryId();
    const offset = workspace.toolbox_.getCategoryScrollOffset();
    workspace.updateToolbox(this.props.toolboxXML);
    this._renderedToolboxXML = this.props.toolboxXML;

    // In order to catch any changes that mutate the toolbox during "normal runtime"
    // (variable changes/etc), re-enable toolbox refresh.
    // Using the setter function will rerender the entire toolbox which we just rendered.
    workspace.toolboxRefreshEnabled_ = true;

    const currentCategoryPos =
      workspace.toolbox_.getCategoryPositionById(categoryId);
    const currentCategoryLen =
      workspace.toolbox_.getCategoryLengthById(categoryId);

    if (offset < currentCategoryLen) {
      workspace.toolbox_.setFlyoutScrollPos(currentCategoryPos + offset);
    } else {
      workspace.toolbox_.setFlyoutScrollPos(currentCategoryPos);
    }

    const queue = this.toolboxUpdateQueue;
    this.toolboxUpdateQueue = [];
    queue.forEach((fn) => fn());

    if (this.blocks) {
      addBlockConfigButtons(this.props.vm, this.blocks, this.props.canEditTask);

      if (!this.props.canEditTask) {
        freezeTaskBlocks(this.props.vm, this.blocks);
      }
    }
  }

  withToolboxUpdates(fn: () => void) {
    // if there is a queued toolbox update, we need to wait
    if (this.toolboxUpdateTimeout) {
      this.toolboxUpdateQueue.push(fn);
    } else {
      fn();
    }
  }

  attachVM() {
    this.getWorkspace().addChangeListener(
      suppressStackClicks(this.props.vm.blockListener),
    );
    this.getWorkspace().addChangeListener(this.onWorkspaceChange);

    const flyoutWorkspace = this.getWorkspaceFlyout().getWorkspace();
    flyoutWorkspace.addChangeListener(
      suppressStackClicks(this.props.vm.flyoutBlockListener),
    );
    flyoutWorkspace.addChangeListener(
      suppressStackClicks(this.props.vm.monitorBlockListener),
    );

    this.props.vm.addListener("SCRIPT_GLOW_ON", this.onScriptGlowOn);
    this.props.vm.addListener("SCRIPT_GLOW_OFF", this.onScriptGlowOff);
    this.props.vm.addListener("BLOCK_GLOW_ON", this.onBlockGlowOn);
    this.props.vm.addListener("BLOCK_GLOW_OFF", this.onBlockGlowOff);
    this.props.vm.addListener("VISUAL_REPORT", this.onVisualReport);
    this.props.vm.addListener("workspaceUpdate", this.onWorkspaceUpdate);
    this.props.vm.addListener("targetsUpdate", this.onTargetsUpdate);
    this.props.vm.addListener("MONITORS_UPDATE", this.handleMonitorsUpdate);
    this.props.vm.addListener("EXTENSION_ADDED", this.handleExtensionAdded);
    this.props.vm.addListener("BLOCKSINFO_UPDATE", this.handleBlocksInfoUpdate);
    this.props.vm.addListener(
      "PERIPHERAL_CONNECTED",
      this.handleStatusButtonUpdate,
    );
    this.props.vm.addListener(
      "PERIPHERAL_DISCONNECTED",
      this.handleStatusButtonUpdate,
    );
    this.props.vm.runtime.on("PROJECT_LOADED", this.onProjectLoaded);
  }

  detachVM() {
    this.props.vm.removeListener("SCRIPT_GLOW_ON", this.onScriptGlowOn);
    this.props.vm.removeListener("SCRIPT_GLOW_OFF", this.onScriptGlowOff);
    this.props.vm.removeListener("BLOCK_GLOW_ON", this.onBlockGlowOn);
    this.props.vm.removeListener("BLOCK_GLOW_OFF", this.onBlockGlowOff);
    this.props.vm.removeListener("VISUAL_REPORT", this.onVisualReport);
    this.props.vm.removeListener("workspaceUpdate", this.onWorkspaceUpdate);
    this.props.vm.removeListener("targetsUpdate", this.onTargetsUpdate);
    this.props.vm.removeListener("MONITORS_UPDATE", this.handleMonitorsUpdate);
    this.props.vm.removeListener("EXTENSION_ADDED", this.handleExtensionAdded);
    this.props.vm.removeListener(
      "BLOCKSINFO_UPDATE",
      this.handleBlocksInfoUpdate,
    );
    this.props.vm.removeListener(
      "PERIPHERAL_CONNECTED",
      this.handleStatusButtonUpdate,
    );
    this.props.vm.removeListener(
      "PERIPHERAL_DISCONNECTED",
      this.handleStatusButtonUpdate,
    );
    this.props.vm.runtime.off("PROJECT_LOADED", this.onProjectLoaded);
  }

  onProjectLoaded = () => {
    const workspace = this.getWorkspace();

    const blockId =
      workspace
        .getAllBlocks()
        // @ts-expect-error The typing is not correct for getAllBlocks
        .find((b) => b["type"] === "event_whenflagclicked")?.id ??
      // @ts-expect-error The typing is not correct for getAllBlocks
      workspace.getAllBlocks()?.id;

    if (blockId) {
      workspace.centerOnBlock(blockId);
    } else {
      workspace.scrollCenter();
    }

    if (this.blocks && !this.props.canEditTask) {
      // the project is frequently reloaded in dev mode,
      // so we need to re-freeze the blocks on reload.
      freezeTaskBlocks(this.props.vm, this.blocks);
    }
  };

  updateToolboxBlockValue(id: string, value: string) {
    this.withToolboxUpdates(() => {
      const block = this.getWorkspaceFlyout().getWorkspace().getBlockById(id);
      if (block) {
        if (!block.inputList) {
          throw new Error("Cannot update block without input list");
        }

        block.inputList[0].fieldRow[0].setValue(value);
      }
    });
  }

  onTargetsUpdate() {
    const editingTarget = this.props.vm.editingTarget;
    if (editingTarget && this.getWorkspace().getFlyout()) {
      ["glide", "move", "set"].forEach((prefix) => {
        this.updateToolboxBlockValue(
          `${prefix}x`,
          Math.round(editingTarget.x).toString(),
        );
        this.updateToolboxBlockValue(
          `${prefix}y`,
          Math.round(editingTarget.y).toString(),
        );
      });
    }
  }

  onWorkspaceMetricsChange() {
    const target = this.props.vm.editingTarget;
    if (target && target.id) {
      // Dispatch updateMetrics later, since onWorkspaceMetricsChange may be (very indirectly)
      // called from a reducer, i.e. when you create a custom procedure.
      // TODO: Is this a vehement hack?
      setTimeout(() => {
        const workspace = this.getWorkspace();

        this.props.updateMetrics({
          targetID: target.id,
          scrollX: workspace.scrollX,
          scrollY: workspace.scrollY,
          scale: workspace.scale,
        });
      }, 0);
    }
  }

  onScriptGlowOn(data: { id: string }) {
    this.getWorkspace().glowStack(data.id, true);
  }

  onScriptGlowOff(data: { id: string }) {
    this.getWorkspace().glowStack(data.id, false);
  }

  onBlockGlowOn(data: { id: string }) {
    this.getWorkspace().glowBlock(data.id, true);
  }

  onBlockGlowOff(data: { id: string }) {
    this.getWorkspace().glowBlock(data.id, false);
  }

  onVisualReport(data: { id: string; value: unknown }) {
    this.getWorkspace().reportValue(data.id, data.value);
  }

  getToolboxXML() {
    // Use try/catch because this requires digging pretty deep into the VM
    // Code inside intentionally ignores several error situations (no stage, etc.)
    // Because they would get caught by this try/catch
    try {
      let { editingTarget: target } = this.props.vm;
      const { runtime } = this.props.vm;

      const stage = runtime.getTargetForStage();
      if (!stage) {
        throw new Error("Stage not found");
      }

      if (!target) target = stage; // If no editingTarget, use the stage

      const stageCostumes = stage.getCostumes();
      const targetCostumes = target.getCostumes();
      const targetSounds = target.getSounds();
      const dynamicBlocksXML = injectExtensionCategoryTheme(
        this.props.vm.runtime.getBlocksXML(target),
        this.props.theme,
      ) as {
        id: string;
        xml: string;
      }[];

      return makeToolboxXML(
        false,
        target.isStage,
        target.id,
        getColorsForTheme(this.props.theme),
        dynamicBlocksXML,
        targetCostumes[targetCostumes.length - 1].name,
        stageCostumes[stageCostumes.length - 1].name,
        targetSounds.length > 0
          ? targetSounds[targetSounds.length - 1].name
          : "",
        this.props.canEditTask ? null : this.props.vm.crtConfig?.allowedBlocks,
      );
    } catch {
      return null;
    }
  }

  onWorkspaceUpdate(data: { xml: string }) {
    // When we change sprites, update the toolbox to have the new sprite's blocks
    const toolboxXML = this.getToolboxXML();
    if (toolboxXML) {
      this.props.updateToolboxState(toolboxXML);
    }

    if (
      this.props.vm.editingTarget &&
      !this.props.workspaceMetrics.targets[this.props.vm.editingTarget.id]
    ) {
      this.onWorkspaceMetricsChange();
    }

    const workspace = this.getWorkspace();

    // Remove and reattach the workspace listener (but allow flyout events)
    workspace.removeChangeListener(this.props.vm.blockListener);
    workspace.removeChangeListener(this.onWorkspaceChange);
    const dom = this.ScratchBlocks.Xml.textToDom(data.xml);
    try {
      this.ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(dom, workspace);
    } catch (error: unknown) {
      // The workspace is likely incomplete. What did update should be
      // functional.
      //
      // Instead of throwing the error, by logging it and continuing as
      // normal lets the other workspace update processes complete in the
      // gui and vm, which lets the vm run even if the workspace is
      // incomplete. Throwing the error would keep things like setting the
      // correct editing target from happening which can interfere with
      // some blocks and processes in the vm.
      if (
        typeof error === "object" &&
        error &&
        "message" in error &&
        error.message
      ) {
        error.message = `Workspace Update Error: ${error.message}`;
      }
      log.error(error);
    }
    workspace.addChangeListener(
      suppressStackClicks(this.props.vm.blockListener),
    );
    workspace.addChangeListener(this.onWorkspaceChange);

    if (
      this.props.vm.editingTarget &&
      this.props.workspaceMetrics.targets[this.props.vm.editingTarget.id]
    ) {
      const { scrollX, scrollY, scale } =
        this.props.workspaceMetrics.targets[this.props.vm.editingTarget.id];

      workspace.scrollX = scrollX;
      workspace.scrollY = scrollY;
      workspace.scale = scale;
      workspace.resize();
    }

    // Clear the undo state of the workspace since this is a
    // fresh workspace and we don't want any changes made to another sprites
    // workspace to be 'undone' here.
    workspace.clearUndo();
  }

  handleMonitorsUpdate(monitors: Monitors) {
    // Update the checkboxes of the relevant monitors.
    // TODO: What about monitors that have fields? See todo in scratch-vm blocks.js changeBlock:
    // https://github.com/LLK/scratch-vm/blob/2373f9483edaf705f11d62662f7bb2a57fbb5e28/src/engine/blocks.js#L569-L576
    const flyout = this.getWorkspaceFlyout();

    if (!flyout.setCheckboxState) {
      // if only the code is shown, this function will not exist
      return;
    }

    for (const monitor of monitors.values()) {
      const blockId = monitor.get("id") as string;
      const isVisible = monitor.get("visible") as boolean;
      flyout.setCheckboxState(blockId, isVisible);
      // We also need to update the isMonitored flag for this block on the VM, since it's used to determine
      // whether the checkbox is activated or not when the checkbox is re-displayed (e.g. local variables/blocks
      // when switching between sprites).
      const block = this.props.vm.runtime.monitorBlocks.getBlock(blockId);
      if (block) {
        block.isMonitored = isVisible;
      }
    }
  }

  handleExtensionAdded(categoryInfo: ExtensionInfoExtended) {
    const defineBlocks = (
      blockInfoArray: (
        | {
          json: Record<string, unknown>;
        }
        | ExtensionInfoBlock
      )[],
    ) => {
      if (blockInfoArray && blockInfoArray.length > 0) {
        const staticBlocksJson: Record<string, unknown>[] = [];
        const dynamicBlocksInfo: ExtensionInfoBlock[] = [];

        blockInfoArray.forEach((blockInfo) => {
          if (
            "info" in blockInfo &&
            blockInfo.info &&
            blockInfo.info.isDynamic
          ) {
            dynamicBlocksInfo.push(blockInfo);
          } else if (blockInfo.json) {
            staticBlocksJson.push(
              injectExtensionBlockTheme(
                blockInfo.json,
                this.props.theme,
              ) as Record<string, unknown>,
            );
          }
          // otherwise it's a non-block entry such as '---'
        });

        this.ScratchBlocks.defineBlocksWithJsonArray(staticBlocksJson);
        dynamicBlocksInfo.forEach((blockInfo) => {
          // This is creating the block factory / constructor -- NOT a specific instance of the block.
          // The factory should only know static info about the block: the category info and the opcode.
          // Anything else will be picked up from the XML attached to the block instance.
          const extendedOpcode = `${categoryInfo.id}_${blockInfo.info.opcode}`;
          const blockDefinition = defineDynamicBlock(
            this.ScratchBlocks,
            categoryInfo,
            blockInfo,
            extendedOpcode,
          );
          this.ScratchBlocks.Blocks[extendedOpcode] = blockDefinition;
        });
      }
    };

    // scratch-blocks implements a menu or custom field as a special kind of block ("shadow" block)
    // these actually define blocks and MUST run regardless of the UI state
    defineBlocks(
      Object.getOwnPropertyNames(categoryInfo.customFieldTypes).map(
        (fieldTypeName) =>
          categoryInfo.customFieldTypes[fieldTypeName].scratchBlocksDefinition,
      ),
    );
    defineBlocks(categoryInfo.menus);
    defineBlocks(categoryInfo.blocks);

    // Update the toolbox with new blocks if possible
    const toolboxXML = this.getToolboxXML();
    if (toolboxXML) {
      this.props.updateToolboxState(toolboxXML);
    }
  }

  handleBlocksInfoUpdate(categoryInfo: ExtensionInfoExtended) {
    // @todo Later we should replace this to avoid all the warnings from redefining blocks.
    this.handleExtensionAdded(categoryInfo);
  }

  handleCategorySelected(categoryId: string) {
    const extension = extensionData.find(
      (ext) => ext.extensionId === categoryId,
    );
    if (extension && extension.launchPeripheralConnectionFlow) {
      this.handleConnectionModalStart(categoryId);
    }

    this.withToolboxUpdates(() => {
      this.getWorkspace().toolbox_?.setSelectedCategoryById(categoryId);
    });
  }

  setBlocks(blocks: HTMLElement) {
    this.blocks = blocks;
  }

  onBlocksChange(changes: MutationRecord[]) {
    const blockChanges = changes.filter(
      (change) =>
        change.type === "childList" &&
        // we only care about nodes added to the block canvas
        change.target instanceof Element &&
        change.target.matches(isBlocksCanvas),
    );

    // handle new block stacks
    this.onNewStacks(
      blockChanges
        // we only care about added nodes
        .flatMap((change) => [...change.addedNodes])
        .filter(
          (node): node is SVGGElement =>
            // filter out non svg groups
            node instanceof SVGGElement &&
            // filter out blocks that are being dragged
            !node.matches(isBlockBeingDragged) &&
            // and any insertion markers
            !node.matches(isBlockInsertionMarker) &&
            // and filter out non-stack blocks (i.e. they must not be a child of another block)
            node.matches(isVisualTopOfStack),
        ),
    );

    // handle deleted block stacks
    blockChanges
      // we only care about removed nodes
      .flatMap((change) => [...change.removedNodes])
      .filter(
        (node): node is SVGGElement =>
          node instanceof SVGGElement &&
          // filter out blocks that are being dragged
          !node.matches(isBlockBeingDragged) &&
          // and any insertion markers
          !node.matches(isBlockInsertionMarker) &&
          // only select blocks that are part of a stack (and not the top of the stack)
          node.matches(isWithinStack),
      )
      .forEach((node) => removeFreezeButtons(this.props.vm, node));
  }

  onNewStacks(newStacks: SVGGElement[]) {
    newStacks.forEach((stack) => {
      addFreezeButtonsToStack(this.props.vm, stack, this.props.canEditTask);
    });
  }

  handlePromptStart(
    message: string,
    defaultValue: string,
    callback: PromptCallback,
    optTitle?: string,
    optVarType?: string,
  ) {
    const title = optTitle
      ? optTitle
      : this.ScratchBlocks.Msg.VARIABLE_MODAL_TITLE;

    const varType =
      typeof optVarType === "string"
        ? optVarType
        : this.ScratchBlocks.SCALAR_VARIABLE_TYPE;

    const showVariableOptions = // This flag means that we should show variable/list options about scope
      optVarType !== this.ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE &&
      title !== this.ScratchBlocks.Msg.RENAME_VARIABLE_MODAL_TITLE &&
      title !== this.ScratchBlocks.Msg.RENAME_LIST_MODAL_TITLE;

    this.setState({
      prompt: {
        callback,
        message,
        defaultValue,
        title,
        varType,
        showVariableOptions,
        showCloudOption: false,
      },
    });
  }

  handleConnectionModalStart(extensionId: string) {
    this.props.onOpenConnectionModal(extensionId);
  }

  handleStatusButtonUpdate() {
    this.ScratchBlocks.refreshStatusButtons(this.getWorkspace());
  }

  handleOpenSoundRecorder() {
    this.props.onOpenSoundRecorder();
  }

  /*
   * Pass along information about proposed name and variable options (scope and isCloud)
   * and additional potentially conflicting variable names from the VM
   * to the variable validation prompt callback used in scratch-blocks.
   */
  handlePromptCallback(
    input: string,
    variableOptions: { scope: "global" | "local"; isCloud: boolean },
  ) {
    if (!this.state.prompt) {
      throw new Error("Prompt not set");
    }

    this.state.prompt.callback(
      input,
      this.props.vm.runtime.getAllVarNamesOfType(this.state.prompt.varType),
      variableOptions,
    );
    this.handlePromptClose();
  }

  handlePromptClose() {
    this.setState({ prompt: null });
  }

  handleCustomProceduresClose(data: Element | undefined) {
    this.props.onRequestCloseCustomProcedures(data);
    const ws = this.getWorkspace();
    ws.refreshToolboxSelection_();
    ws.toolbox_?.scrollToCategoryById("myBlocks");
  }

  handleDrop(dragInfo: {
    payload: {
      bodyUrl: string;
    };
  }) {
    fetch(dragInfo.payload.bodyUrl)
      .then((response) => response.json())
      .then((blocks) => {
        if (!this.props.vm.editingTarget) {
          throw new Error("No editing target found");
        }

        return this.props.vm.shareBlocksToTarget(
          blocks,
          this.props.vm.editingTarget.id,
        );
      })
      .then(() => {
        this.refreshWorkspace();
      });
  }

  getWorkspace(): Workspace {
    if (!this.workspace) {
      throw new Error("No workspace was found");
    }

    return this.workspace;
  }

  getWorkspaceFlyout(): Flyout {
    const flyout = this.getWorkspace().getFlyout();

    if (!flyout) {
      throw new Error("No flyout was found");
    }

    return flyout;
  }

  onWorkspaceChange(event: WorkspaceChangeEvent) {
    if (!this.blocks) {
      // if the blocks are not yet mounted, ignore the event
      return;
    }
    if (event.type === "move" || event.type === "create") {
      // if a block is moved or created, we should get this block and check the stacksize
      // determining if all stacks are above the minimum required
      if (event.blockId) {
        const block = this.getWorkspace().getBlockById(event.blockId);
        if (block) {
          const isLargeStack = isBlockPartOfLargeStack(block, 2);
          if (isLargeStack) {
            try {
              if (this.props.sendRequest) {
                this.props.sendRequest("postStudentActivity", {
                  action: event.type,
                  blockId: event.blockId,
                });
              }
            } catch (err) {
              console.error("Student activity tracking failed", err);
            }
          }
        }
      }
    }

    if (["create", "delete"].includes(event.type)) {
      let xml: Element | undefined;

      if (event.type === "create" && event.xml) {
        xml = event.xml;
      } else if (event.type === "delete" && event.oldXml) {
        xml = event.oldXml;
      }

      if (!xml) {
        console.error("Could not find xml in event", event);
        return;
      }

      // create a new element to be able to use querySelectorAll on it, otherwise
      // only the children are matched against the selector
      const el = document.createElement("div");
      el.appendChild(xml);

      const opcodes = [...el.querySelectorAll("block[type]")]
        .map((element) => element.getAttribute("type"))
        .filter(filterNonNull);

      // update the block config button for the blocks
      for (const opcode of opcodes) {
        updateSingleBlockConfigButton(
          this.props.vm,
          this.blocks,
          opcode,
          this.props.canEditTask,
        );
      }

      if (
        event.type === "delete" &&
        // when switching sprites, blocks are also deleted but with
        // recordUndo set to false
        event.recordUndo &&
        event.blockId &&
        this.props.canEditTask
      ) {
        // remove the config for this task block
        delete this.props.vm.crtConfig?.freezeStateByBlockId[event.blockId];
      }
    }
  }

  render() {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      canEditTask,
      anyModalVisible,
      showFlyout,
      customProceduresVisible,
      extensionLibraryVisible,
      options,
      stageSize,
      vm,
      isRtl,
      isVisible,
      onActivateColorPicker,
      onOpenConnectionModal,
      onOpenSoundRecorder,
      updateToolboxState,
      onActivateCustomProcedures,
      onRequestCloseExtensionLibrary,
      onRequestCloseCustomProcedures,
      toolboxXML,
      updateMetrics: updateMetricsProp,
      useCatBlocks,
      workspaceMetrics,
      sendRequest,
      ...props
    } = this.props;
    /* eslint-enable @typescript-eslint/no-unused-vars */

    return (
      <>
        <DroppableBlocks
          componentRef={this.setBlocks}
          onDrop={this.handleDrop}
          {...props}
        />
        <BlockConfig vm={this.props.vm} />
        {this.state.prompt ? (
          <Prompt
            defaultValue={this.state.prompt.defaultValue}
            isStage={vm.runtime.getEditingTarget()?.isStage}
            showListMessage={
              this.state.prompt.varType ===
              this.ScratchBlocks.LIST_VARIABLE_TYPE
            }
            label={this.state.prompt.message}
            showCloudOption={this.state.prompt.showCloudOption}
            showVariableOptions={this.state.prompt.showVariableOptions}
            title={this.state.prompt.title}
            vm={vm}
            onCancel={this.handlePromptClose}
            onOk={this.handlePromptCallback}
          />
        ) : null}
        {extensionLibraryVisible ? (
          <ExtensionLibrary
            vm={vm}
            onCategorySelected={this.handleCategorySelected}
            onRequestClose={onRequestCloseExtensionLibrary}
          />
        ) : null}
        {customProceduresVisible ? (
          <CustomProcedures
            options={{
              media: options.media,
            }}
            onRequestClose={this.handleCustomProceduresClose}
          />
        ) : null}
      </>
    );
  }
}

const mapStateToProps = (state: {
  scratchGui: {
    modals: Record<string, boolean>;
    mode: { isFullScreen: boolean };
    toolbox: { toolboxXML: string };
    customProcedures: { active: boolean };
    workspaceMetrics: { targets: Record<string, Metrics> };
  };
  locales: { isRtl: boolean; locale: string; messages: string };
}) => ({
  anyModalVisible:
    Object.keys(state.scratchGui.modals).some(
      (key) => state.scratchGui.modals[key],
    ) || state.scratchGui.mode.isFullScreen,
  extensionLibraryVisible: state.scratchGui.modals.extensionLibrary,
  isRtl: state.locales.isRtl,
  locale: state.locales.locale,
  messages: state.locales.messages,
  toolboxXML: state.scratchGui.toolbox.toolboxXML,
  customProceduresVisible: state.scratchGui.customProcedures.active,
  workspaceMetrics: state.scratchGui.workspaceMetrics,
  useCatBlocks: isTimeTravel2020(state),
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  onActivateColorPicker: (callback?: () => void) =>
    dispatch(activateColorPicker(callback)),
  onActivateCustomProcedures: (data: HTMLElement, callback: () => void) =>
    dispatch(activateCustomProcedures(data, callback) as Action),
  onOpenConnectionModal: (id: string) => {
    dispatch(setConnectionModalExtensionId(id));
    dispatch(openConnectionModal());
  },
  onOpenSoundRecorder: () => {
    dispatch(activateTab(SOUNDS_TAB_INDEX));
    dispatch(openSoundRecorder());
  },
  onRequestCloseExtensionLibrary: () => {
    dispatch(closeExtensionLibrary());
  },
  onRequestCloseCustomProcedures: (data: Element | undefined) => {
    dispatch(deactivateCustomProcedures(data || null) as Action);
  },
  updateToolboxState: (toolboxXml: string) => {
    dispatch(updateToolbox(toolboxXml));
  },
  updateMetrics: (metrics: unknown) => {
    dispatch(updateMetrics(metrics));
  },
});

export default ErrorBoundaryHOC("Blocks")(
  connect(mapStateToProps, mapDispatchToProps)(Blocks),
);
