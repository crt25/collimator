import React from "react";
import { Action, compose, Dispatch } from "redux";
import { connect } from "react-redux";
import VM from "scratch-vm";
import { InjectedIntl, injectIntl } from "react-intl";

import GUIComponent from "../components/Gui";
import ErrorBoundaryHOC from "@scratch-submodule/scratch-gui/src/lib/error-boundary-hoc.jsx";
import {
  getIsError,
  getIsShowingProject,
} from "@scratch-submodule/scratch-gui/src/reducers/project-state";
import {
  activateTab,
  BLOCKS_TAB_INDEX,
  COSTUMES_TAB_INDEX,
  SOUNDS_TAB_INDEX,
} from "@scratch-submodule/scratch-gui/src/reducers/editor-tab";

import {
  closeCostumeLibrary,
  closeBackdropLibrary,
  closeTelemetryModal,
  openExtensionLibrary,
} from "@scratch-submodule/scratch-gui/src/reducers/modals";

import FontLoaderHOC from "@scratch-submodule/scratch-gui/src/lib/font-loader-hoc.jsx";
import LocalizationHOC from "@scratch-submodule/scratch-gui/src/lib/localization-hoc.jsx";
import SBFileUploaderHOC from "@scratch-submodule/scratch-gui/src/lib/sb-file-uploader-hoc.jsx";
import ProjectFetcherHOC from "@scratch-submodule/scratch-gui/src/lib/project-fetcher-hoc.jsx";
import TitledHOC from "@scratch-submodule/scratch-gui/src/lib/titled-hoc.jsx";
import ProjectSaverHOC from "@scratch-submodule/scratch-gui/src/lib/project-saver-hoc.jsx";
import QueryParserHOC from "@scratch-submodule/scratch-gui/src/lib/query-parser-hoc.jsx";
import storage from "@scratch-submodule/scratch-gui/src/lib/storage";
import vmListenerHOC from "@scratch-submodule/scratch-gui/src/lib/vm-listener-hoc.jsx";
import vmManagerHOC from "@scratch-submodule/scratch-gui/src/lib/vm-manager-hoc.jsx";
import cloudManagerHOC from "@scratch-submodule/scratch-gui/src/lib/cloud-manager-hoc.jsx";
import systemPreferencesHOC from "@scratch-submodule/scratch-gui/src/lib/system-preferences-hoc.jsx";

import { setIsScratchDesktop } from "@scratch-submodule/scratch-gui/src/lib/isScratchDesktop.js";
import { StageSizeMode } from "@scratch-submodule/scratch-gui/src/lib/screen-utils";

const { RequestMetadata, setMetadata, unsetMetadata } = storage.scratchFetch;

const setProjectIdMetadata = (projectId: string | number) => {
  // If project ID is '0' or zero, it's not a real project ID. In that case, remove the project ID metadata.
  // Same if it's null undefined.
  if (projectId && projectId !== "0") {
    setMetadata(RequestMetadata.ProjectId, projectId);
  } else {
    unsetMetadata(RequestMetadata.ProjectId);
  }
};

interface Props {
  vm: VM;
  assetHost?: string;
  children?: React.ReactNode;
  cloudHost?: string;
  error?: unknown | string;
  fetchingProject?: boolean;
  intl?: InjectedIntl;
  isError?: boolean;
  isLoading?: boolean;
  isScratchDesktop: boolean;
  isShowingProject?: boolean;
  isTotallyNormal: boolean;
  loadingStateVisible?: boolean;
  onProjectLoaded: () => void;
  onSeeCommunity?: () => void;
  onStorageInit: (storage: unknown) => void;
  onUpdateProjectId: (projectId: string | number) => void;
  onVmInit: (vm: VM) => void;
  projectHost?: string;
  projectId: string | number;
  telemetryModalVisible?: boolean;
  isRtl: boolean;
  isFullScreen: boolean;
  canUseCloud: boolean;
  canSave: boolean;
  basePath: string;

  backpackHost: string | null;
  backpackVisible: boolean;
  blocksId: string;
  canChangeLanguage: boolean;
  canChangeTheme: boolean;
  canCreateNew: boolean;
  canEditTitle: boolean;
  canManageFiles: boolean;
  canRemix: boolean;
  canCreateCopy: boolean;
  canShare: boolean;
  enableCommunity: boolean;
  isCreating: boolean;
  isShared: boolean;
  showComingSoon: boolean;
  stageSizeMode: StageSizeMode;
}

interface ReduxState {
  scratchGui: {
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
      telemetryModal: boolean;
      tipsLibrary: boolean;
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
    setIsScratchDesktop(this.props.isScratchDesktop);
    this.props.onStorageInit(storage);
    this.props.onVmInit(this.props.vm);
    setProjectIdMetadata(this.props.projectId);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.projectId !== prevProps.projectId) {
      if (this.props.projectId !== null) {
        this.props.onUpdateProjectId(this.props.projectId);
      }
      setProjectIdMetadata(this.props.projectId);
    }
    if (this.props.isShowingProject && !prevProps.isShowingProject) {
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
      /* eslint-disable no-unused-vars */
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
      /* eslint-enable no-unused-vars */
      children,
      fetchingProject,
      isLoading,
      loadingStateVisible,
      ...componentProps
    } = this.props;
    return (
      <GUIComponent
        loading={fetchingProject || isLoading || loadingStateVisible || false}
        {...componentProps}
      >
        {children}
      </GUIComponent>
    );
  }
}

const mapStateToProps = (state: ReduxState) => {
  const loadingState = state.scratchGui.projectState.loadingState;
  return {
    activeTabIndex: state.scratchGui.editorTab.activeTabIndex,
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
    projectId: state.scratchGui.projectState.projectId,
    soundsTabVisible:
      state.scratchGui.editorTab.activeTabIndex === SOUNDS_TAB_INDEX,
    targetIsStage:
      state.scratchGui.targets.stage &&
      state.scratchGui.targets.stage.id ===
        state.scratchGui.targets.editingTarget,
    telemetryModalVisible: state.scratchGui.modals.telemetryModal,
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
  onRequestCloseTelemetryModal: () => dispatch(closeTelemetryModal()),
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
  QueryParserHOC,
  ProjectFetcherHOC,
  TitledHOC,
  ProjectSaverHOC,
  vmListenerHOC,
  vmManagerHOC,
  SBFileUploaderHOC,
  cloudManagerHOC,
  systemPreferencesHOC,
)(ConnectedGUI);

export default WrappedGui;
