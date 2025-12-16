import React from "react";
import { Action, compose, Dispatch } from "redux";
import { connect } from "react-redux";
import VM from "@scratch/scratch-vm";
import { IntlShape, injectIntl } from "react-intl";

import ErrorBoundaryHOC from "@scratch-submodule/packages/scratch-gui/src/lib/error-boundary-hoc.jsx";
import {
  getIsError,
  getIsShowingProject,
  onFetchedProjectData,
} from "@scratch-submodule/packages/scratch-gui/src/reducers/project-state";
import {
  activateTab,
  BLOCKS_TAB_INDEX,
  COSTUMES_TAB_INDEX,
  SOUNDS_TAB_INDEX,
} from "@scratch-submodule/packages/scratch-gui/src/reducers/editor-tab";

import {
  closeCostumeLibrary,
  closeBackdropLibrary,
  openExtensionLibrary,
} from "@scratch-submodule/packages/scratch-gui/src/reducers/modals";
import { ScratchStorage } from "scratch-storage";
import FontLoaderHOC from "@scratch-submodule/packages/scratch-gui/src/lib/font-loader-hoc.jsx";
import LocalizationHOC from "@scratch-submodule/packages/scratch-gui/src/lib/localization-hoc.jsx";
import TitledHOC from "@scratch-submodule/packages/scratch-gui/src/lib/titled-hoc.jsx";
import vmListenerHOC from "@scratch-submodule/packages/scratch-gui/src/lib/vm-listener-hoc.jsx";
import vmManagerHOC from "@scratch-submodule/packages/scratch-gui/src/lib/vm-manager-hoc.jsx";
import systemPreferencesHOC from "@scratch-submodule/packages/scratch-gui/src/lib/system-preferences-hoc.jsx";

import { StageSizeMode } from "@scratch-submodule/packages/scratch-gui/src/lib/screen-utils";
import { GUIStorage } from "@scratch-submodule/packages/scratch-gui/src/gui-config";
import GUIComponent from "../../components/customized-scratch-components/gui/Gui";
import { loadCrtProject } from "../../vm/load-crt-project";
import CrtHoc from "../../components/CrtHoc";
import HashParserHOC from "../../components/customized-scratch-components/HashParserHOC";
import { ScratchCrtConfig } from "../../types/scratch-vm-custom";
import AppStateHOC from "./AppStateHOC";

const GUIComponentTyped = GUIComponent as unknown as React.ComponentType<
  React.ComponentProps<typeof GUIComponent> & {
    children?: React.ReactNode;
  }
>;

const setProjectIdMetadata = (
  storage: ScratchStorage,
  projectId: string | number,
) => {
  const { RequestMetadata, setMetadata, unsetMetadata } = storage.scratchFetch;
  // If project ID is '0' or zero, it's not a real project ID. In that case, remove the project ID metadata.
  // Same if it's null undefined.
  if (projectId && projectId !== "0") {
    setMetadata(RequestMetadata.ProjectId, projectId);
  } else {
    unsetMetadata(RequestMetadata.ProjectId);
  }
};

type Props = {
  vm: VM;
  storage: GUIStorage;
  crtConfig: ScratchCrtConfig;
  assetHost?: string;
  children?: React.ReactNode;
  cloudHost?: string;
  error?: unknown | string;
  fetchingProject?: boolean;
  intl: IntlShape;
  isError?: boolean;
  isLoading?: boolean;
  isScratchDesktop: boolean;
  isShowingProject?: boolean;
  isTotallyNormal: boolean;
  isCreatingNew: boolean;
  loadingStateVisible?: boolean;
  onProjectLoaded?: () => void;
  onSeeCommunity?: () => void;
  onStorageInit?: (storage: ScratchStorage) => void;
  onUpdateProjectId?: (projectId: string | number) => void;
  onVmInit?: (vm: VM) => void;
  projectHost?: string;
  projectId: string | number;
  isRtl: boolean;
  isFullScreen: boolean;
  basePath: string;

  onFetchedProjectData: (projectData: unknown, loadingState: unknown) => void;

  cannotInteractWithBlocks?: boolean;
  canEditTask?: boolean;
  isStandaloneCodeEnabled?: boolean;
  isCodeTabEnabled?: boolean;
  isStageEnabled?: boolean;
  isCostumesTabEnabled?: boolean;
  isSoundsTabEnabled?: boolean;
  cardsVisible?: boolean;
  backpackHost: string | null;
  backpackVisible: boolean;
  blocksId: string;
  canChangeLanguage: boolean;
  canChangeTheme: boolean;
  canCreateNew: boolean;
  canEditTitle: boolean;
  canCreateCopy: boolean;
  isCreating: boolean;
  stageSizeMode: StageSizeMode;
};

type ExternalProps = Pick<
  Props,
  | "cannotInteractWithBlocks"
  | "canEditTask"
  | "isStandaloneCodeEnabled"
  | "isCodeTabEnabled"
  | "isStageEnabled"
  | "isCostumesTabEnabled"
  | "isSoundsTabEnabled"
  | "onStorageInit"
  | "basePath"
> & {
  isFullScreen?: boolean;
  isPlayerOnly?: boolean;
  isTelemetryEnabled?: boolean;
  showTelemetryModal?: boolean;
  isEmbedded?: boolean;
};

interface ReduxState {
  scratchGui: {
    config: {
      storage: GUIStorage;
    };
    projectState: {
      loadingState: string;
      error: unknown | string;
      projectId: string | number;
    };
    editorTab: {
      activeTabIndex: number;
    };
    alerts: {
      visible: boolean;
    };
    cards: {
      visible: boolean;
    };
    mode: {
      isFullScreen: boolean;
      isPlayerOnly: boolean;
    };
    modals: {
      backdropLibrary: boolean;
      connectionModal: boolean;
      costumeLibrary: boolean;
      loadingProject: boolean;
      tipsLibrary: boolean;
      debugModal: boolean;
      telemetryModal: boolean;
    };
    targets: {
      stage: {
        id: string;
      };
      editingTarget: string;
    };
    vm: VM;
  };
  locales: {
    isRtl: boolean;
  };
}

class GUI extends React.Component<Props> {
  componentDidMount() {
    const storage = this.props.storage;

    if (this.props.onStorageInit) {
      this.props.onStorageInit(storage.scratchStorage);
    }

    if (this.props.onVmInit) {
      this.props.onVmInit(this.props.vm);
    }

    setProjectIdMetadata(storage.scratchStorage, this.props.projectId);

    if (storage.setAssetHost) {
      storage.setAssetHost("https://assets.scratch.mit.edu");
    }

    if (storage.setTranslatorFunction) {
      storage.setTranslatorFunction(this.props.intl.formatMessage);
    }
    storage.scratchStorage
      .load(
        storage.scratchStorage.AssetType.Project,
        "0",
        storage.scratchStorage.DataFormat.JSON,
      )
      .then((projectAsset) => {
        if (projectAsset) {
          loadCrtProject(
            this.props.vm,
            (projectAsset as unknown as { data: ArrayBuffer }).data,
          );
        } else {
          throw new Error("Could not load default project");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.projectId !== prevProps.projectId) {
      if (this.props.projectId !== null && this.props.onUpdateProjectId) {
        this.props.onUpdateProjectId(this.props.projectId);
      }
      setProjectIdMetadata(
        this.props.storage.scratchStorage,
        this.props.projectId,
      );
    }
    if (
      this.props.isShowingProject &&
      !prevProps.isShowingProject &&
      this.props.onProjectLoaded
    ) {
      // this only notifies container when a project changes from not yet loaded to loaded
      // At this time the project view in www doesn't need to know when a project is unloaded
      this.props.onProjectLoaded();
    }
  }

  render() {
    if (this.props.isError) {
      throw new Error(
        `Error in Scratch GUI [location=${window.location}]: ${this.props.error}`,
      );
    }
    const {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      assetHost,
      cloudHost,
      error,
      isError,
      isScratchDesktop,
      isShowingProject,
      onProjectLoaded,
      onStorageInit,
      onUpdateProjectId,
      onVmInit,
      projectHost,
      projectId,
      isCreatingNew,
      onFetchedProjectData,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      children,
      fetchingProject,
      isLoading,
      loadingStateVisible,
      ...componentProps
    } = this.props;
    return (
      <GUIComponentTyped
        loading={fetchingProject || isLoading || loadingStateVisible || false}
        {...componentProps}
      >
        {children}
      </GUIComponentTyped>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  ownProps: {
    platform: string;
  },
) => {
  const loadingState = state.scratchGui.projectState.loadingState;
  return {
    storage: state.scratchGui.config.storage,
    alertsVisible: state.scratchGui.alerts.visible,
    backdropLibraryVisible: state.scratchGui.modals.backdropLibrary,
    blocksTabVisible:
      state.scratchGui.editorTab.activeTabIndex === BLOCKS_TAB_INDEX,
    cardsVisible: state.scratchGui.cards.visible,
    connectionModalVisible: state.scratchGui.modals.connectionModal,
    costumeLibraryVisible: state.scratchGui.modals.costumeLibrary,
    costumesTabVisible:
      state.scratchGui.editorTab.activeTabIndex === COSTUMES_TAB_INDEX,
    error: state.scratchGui.projectState.error,
    isError: getIsError(loadingState),
    isFullScreen: state.scratchGui.mode.isFullScreen,
    isPlayerOnly: state.scratchGui.mode.isPlayerOnly,
    isRtl: state.locales.isRtl,
    isShowingProject: getIsShowingProject(loadingState),
    loadingStateVisible: state.scratchGui.modals.loadingProject,
    platform: ownProps.platform,
    projectId: state.scratchGui.projectState.projectId,
    soundsTabVisible:
      state.scratchGui.editorTab.activeTabIndex === SOUNDS_TAB_INDEX,
    targetIsStage:
      state.scratchGui.targets.stage &&
      state.scratchGui.targets.stage.id ===
        state.scratchGui.targets.editingTarget,
    tipsLibraryVisible: state.scratchGui.modals.tipsLibrary,
    vm: state.scratchGui.vm,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  onExtensionButtonClick: () => dispatch(openExtensionLibrary()),
  onActivateTab: (tab: number) => dispatch(activateTab(tab)),
  onActivateCostumesTab: () => dispatch(activateTab(COSTUMES_TAB_INDEX)),
  onActivateSoundsTab: () => dispatch(activateTab(SOUNDS_TAB_INDEX)),
  onRequestCloseBackdropLibrary: () => dispatch(closeBackdropLibrary()),
  onRequestCloseCostumeLibrary: () => dispatch(closeCostumeLibrary()),
  onFetchedProjectData: (projectData: unknown, loadingState: unknown) =>
    dispatch(onFetchedProjectData(projectData, loadingState) as Action),
});

const ConnectedGUI = injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(GUI),
);

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedGui = compose(
  LocalizationHOC,
  ErrorBoundaryHOC("Top Level App"),
  FontLoaderHOC,
  TitledHOC,
  vmListenerHOC,
  vmManagerHOC,
  systemPreferencesHOC,
)(ConnectedGUI);

// Analogous to https://github.com/scratchfoundation/scratch-gui/blob/develop/src/playground/render-gui.jsx#L37
const DoubleWrapedGui = AppStateHOC<ExternalProps>(
  // @ts-expect-error The type inference based on the jsdoc is off
  HashParserHOC(CrtHoc(WrappedGui)),
  false,
  undefined,
);

export default DoubleWrapedGui;
