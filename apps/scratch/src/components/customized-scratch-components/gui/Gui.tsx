import classNames from "classnames";
import omit from "lodash.omit";
import {
  defineMessages,
  FormattedMessage,
  InjectedIntl,
  injectIntl,
} from "react-intl";
import { connect } from "react-redux";
import MediaQuery from "react-responsive";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import tabStyles from "react-tabs/style/react-tabs.css";
import Renderer from "scratch-render";
import VM from "scratch-vm";

import CostumeTab from "@scratch-submodule/scratch-gui/src/containers/costume-tab.jsx";
import SoundTab from "@scratch-submodule/scratch-gui/src/containers/sound-tab.jsx";
import Loader from "@scratch-submodule/scratch-gui/src/components/loader/loader.jsx";
import Box from "@scratch-submodule/scratch-gui/src/components/box/box.jsx";
import CostumeLibrary from "@scratch-submodule/scratch-gui/src/containers/costume-library.jsx";
import BackdropLibrary from "@scratch-submodule/scratch-gui/src/containers/backdrop-library.jsx";
import Watermark from "@scratch-submodule/scratch-gui/src/containers/watermark.jsx";

import Backpack from "@scratch-submodule/scratch-gui/src/containers/backpack.jsx";
import WebGlModal from "@scratch-submodule/scratch-gui/src/containers/webgl-modal.jsx";
import TipsLibrary from "@scratch-submodule/scratch-gui/src/containers/tips-library.jsx";
import Cards from "@scratch-submodule/scratch-gui/src/containers/cards.jsx";
import Alerts from "@scratch-submodule/scratch-gui/src/containers/alerts.jsx";
import DragLayer from "@scratch-submodule/scratch-gui/src/containers/drag-layer.jsx";
import ConnectionModal from "@scratch-submodule/scratch-gui/src/containers/connection-modal.jsx";

import layout, {
  BLOCKS_DEFAULT_SCALE,
  STAGE_SIZE_MODES,
} from "@scratch-submodule/scratch-gui/src/lib/layout-constants";
import {
  resolveStageSize,
  StageSizeMode,
} from "@scratch-submodule/scratch-gui/src/lib/screen-utils";
import {
  ColorTheme,
  themeMap,
} from "@scratch-submodule/scratch-gui/src/lib/themes";

import styles from "@scratch-submodule/scratch-gui/src/components/gui/gui.css";
import crtStyles from "./gui.css";
import addExtensionIcon from "@scratch-submodule/scratch-gui/src/components/gui/icon--extensions.svg";
import codeIcon from "@scratch-submodule/scratch-gui/src/components/gui/icon--code.svg";
import costumesIcon from "@scratch-submodule/scratch-gui/src/components/gui/icon--costumes.svg";
import soundsIcon from "@scratch-submodule/scratch-gui/src/components/gui/icon--sounds.svg";
import { useEffect } from "react";

import Blocks from "../../../containers/customized-scratch-containers/Blocks";
import TargetPane from "../../../containers/customized-scratch-containers/TargetPane";
import StageWrapper from "../stage-wrapper/StageWrapper";

const messages = defineMessages({
  addExtension: {
    id: "gui.gui.addExtension",
    description: "Button to add an extension in the target pane",
    defaultMessage: "Add Extension",
  },
});

// Cache this value to only retrieve it once the first time.
// Assume that it doesn't change for a session.
let isRendererSupported: boolean | null = null;

const GUIComponent = (props: {
  // required
  vm: VM;
  intl: InjectedIntl;

  // optional
  assetHost?: string;
  cloudHost?: string;
  fetchingProject?: boolean;
  isLoading?: boolean;
  isShowingProject?: boolean;
  loadingStateVisible?: boolean;
  onProjectLoaded?: () => void;
  onStorageInit?: () => void;
  onUpdateProjectId?: () => void;
  onVmInit?: () => void;
  projectHost?: string;

  alertsVisible?: boolean;
  connectionModalVisible?: boolean;
  activeTabIndex?: number;
  backdropLibraryVisible?: boolean;
  backpackHost?: string | null;
  backpackVisible?: boolean;
  basePath: string;
  blocksTabVisible?: boolean;
  blocksId?: string;
  canEditTask?: boolean;
  isCostumesTabEnabled?: boolean;
  isSoundsTabEnabled?: boolean;
  cardsVisible?: boolean;
  costumeLibraryVisible?: boolean;
  costumesTabVisible?: boolean;
  isCreating: boolean;
  isFullScreen: boolean;
  isPlayerOnly?: boolean;
  isRtl: boolean;
  loading: boolean;
  logo?: string;
  onActivateCostumesTab?: () => void;
  onActivateSoundsTab?: () => void;
  onActivateTab?: () => void;
  onExtensionButtonClick?: () => void;
  onRequestCloseBackdropLibrary?: () => void;
  onRequestCloseCostumeLibrary?: () => void;
  onShowPrivacyPolicy?: () => void;
  onTabSelect?: () => void;
  onTaskProgress?: (totalAssertions: number, passedAssertions: number) => void;
  soundsTabVisible?: boolean;
  // see https://github.com/scratchfoundation/scratch-gui/blob/d678d609e182ccc5ab557d7d45a3cc3e6430b056/src/lib/layout-constants.js#L7
  stageSizeMode: StageSizeMode;
  targetIsStage?: boolean;
  theme: ColorTheme;
  tipsLibraryVisible?: boolean;
}) => {
  const {
    activeTabIndex,
    alertsVisible,
    basePath,
    backdropLibraryVisible,
    backpackHost,
    backpackVisible,
    blocksId,
    blocksTabVisible,
    cardsVisible,
    canEditTask,
    isCostumesTabEnabled,
    isSoundsTabEnabled,
    connectionModalVisible,
    costumeLibraryVisible,
    costumesTabVisible,
    intl,
    isCreating,
    isFullScreen,
    isPlayerOnly,
    isRtl,
    loading,
    onActivateCostumesTab,
    onActivateSoundsTab,
    onActivateTab,
    onExtensionButtonClick,
    onRequestCloseBackdropLibrary,
    onRequestCloseCostumeLibrary,
    soundsTabVisible,
    stageSizeMode,
    targetIsStage,
    theme,
    tipsLibraryVisible,
    vm,
    onTaskProgress,
    ...componentProps
  } = omit(props, "dispatch");

  const tabClassNames = {
    tabs: styles.tabs,
    tab: classNames(tabStyles.reactTabsTab, styles.tab),
    tabList: classNames(tabStyles.reactTabsTabList, styles.tabList),
    tabPanel: classNames(tabStyles.reactTabsTabPanel, styles.tabPanel),
    tabPanelSelected: classNames(
      tabStyles.reactTabsTabPanelSelected,
      styles.isSelected,
    ),
    tabSelected: classNames(tabStyles.reactTabsTabSelected, styles.isSelected),
  };

  if (isRendererSupported === null) {
    isRendererSupported = Renderer.isSupported();
  }

  useEffect(() => {
    const enableAssertions = () => vm.runtime.emit("ENABLE_ASSERTIONS");

    if (!canEditTask) {
      // if we cannot edit the task, we always enable assertions
      // if the extension is loaded

      const onAssertionsChecked = (
        totalAssertions: number,
        passedAssertions: number,
      ) => onTaskProgress && onTaskProgress(totalAssertions, passedAssertions);

      // enable assertions as soon as the extension is loaded
      vm.runtime.on("ASSERTIONS_EXTENSION_LOADED", enableAssertions);
      vm.runtime.on("ASSERTIONS_CHECKED", onAssertionsChecked);

      // or if the extension is already loaded, enable them now
      enableAssertions();

      return () => {
        // when effect is cleaned up, remove event listeners
        vm.runtime.removeListener(
          "ASSERTIONS_EXTENSION_LOADED",
          enableAssertions,
        );

        vm.runtime.off("ASSERTIONS_CHECKED", onAssertionsChecked);

        // and disable assertions that were enabled automatically
        vm.runtime.emit("DISABLE_ASSERTIONS");
      };
    }

    // otherwise we only enable assertions if the user has enabled them
    // return no-op cleanup function
    return () => {};
  }, [vm.runtime, canEditTask, onTaskProgress]);

  return (
    <MediaQuery minWidth={layout.fullSizeMinWidth}>
      {(isFullSize) => {
        const stageSize = resolveStageSize(stageSizeMode, isFullSize);

        return isPlayerOnly ? (
          <StageWrapper
            isFullScreen={isFullScreen}
            isRendererSupported={isRendererSupported || false}
            isRtl={isRtl}
            loading={loading}
            stageSize={STAGE_SIZE_MODES.large}
            vm={vm}
            canEditTask={canEditTask}
          />
        ) : (
          <Box
            className={styles.pageWrapper}
            dir={isRtl ? "rtl" : "ltr"}
            {...componentProps}
          >
            {loading ? <Loader /> : null}
            {isCreating ? <Loader messageId="gui.loader.creating" /> : null}
            {isRendererSupported ? null : <WebGlModal isRtl={isRtl} />}
            {tipsLibraryVisible ? <TipsLibrary /> : null}
            {cardsVisible ? <Cards /> : null}
            {alertsVisible ? (
              <Alerts className={styles.alertsContainer} />
            ) : null}
            {connectionModalVisible ? <ConnectionModal vm={vm} /> : null}
            {costumeLibraryVisible ? (
              <CostumeLibrary
                vm={vm}
                onRequestClose={onRequestCloseCostumeLibrary}
              />
            ) : null}
            {backdropLibraryVisible ? (
              <BackdropLibrary
                vm={vm}
                onRequestClose={onRequestCloseBackdropLibrary}
              />
            ) : null}
            <Box className={crtStyles.bodyWrapper}>
              <Box className={styles.flexWrapper}>
                <Box className={styles.editorWrapper}>
                  <Tabs
                    forceRenderTabPanel
                    className={tabClassNames.tabs}
                    selectedIndex={activeTabIndex}
                    selectedTabClassName={tabClassNames.tabSelected}
                    selectedTabPanelClassName={tabClassNames.tabPanelSelected}
                    onSelect={onActivateTab}
                  >
                    <TabList className={tabClassNames.tabList}>
                      <Tab className={tabClassNames.tab}>
                        <img draggable={false} src={codeIcon} />
                        <FormattedMessage
                          defaultMessage="Code"
                          description="Button to get to the code panel"
                          id="gui.gui.codeTab"
                        />
                      </Tab>
                      {isCostumesTabEnabled && (
                        <Tab
                          className={tabClassNames.tab}
                          onClick={onActivateCostumesTab}
                        >
                          <img draggable={false} src={costumesIcon} />
                          {targetIsStage ? (
                            <FormattedMessage
                              defaultMessage="Backdrops"
                              description="Button to get to the backdrops panel"
                              id="gui.gui.backdropsTab"
                            />
                          ) : (
                            <FormattedMessage
                              defaultMessage="Costumes"
                              description="Button to get to the costumes panel"
                              id="gui.gui.costumesTab"
                            />
                          )}
                        </Tab>
                      )}
                      {isSoundsTabEnabled && (
                        <Tab
                          className={tabClassNames.tab}
                          onClick={onActivateSoundsTab}
                        >
                          <img draggable={false} src={soundsIcon} />
                          <FormattedMessage
                            defaultMessage="Sounds"
                            description="Button to get to the sounds panel"
                            id="gui.gui.soundsTab"
                          />
                        </Tab>
                      )}
                    </TabList>
                    <TabPanel className={tabClassNames.tabPanel}>
                      <Box className={styles.blocksWrapper}>
                        <Blocks
                          canEditTask={canEditTask}
                          key={`${blocksId}/${theme}`}
                          grow={1}
                          isVisible={blocksTabVisible}
                          options={{
                            media: `${basePath}static/${themeMap[theme].blocksMediaFolder}/`,
                            zoom: {
                              controls: true,
                              wheel: true,
                              startScale: BLOCKS_DEFAULT_SCALE,
                            },
                            grid: {
                              spacing: 40,
                              length: 2,
                              colour: "#ddd",
                            },
                            comments: true,
                            collapse: false,
                            sounds: false,
                          }}
                          stageSize={stageSize}
                          theme={theme}
                          vm={vm}
                        />
                      </Box>
                      {canEditTask && (
                        <Box className={styles.extensionButtonContainer}>
                          <button
                            className={styles.extensionButton}
                            title={intl.formatMessage(messages.addExtension)}
                            onClick={onExtensionButtonClick}
                            data-testid="add-extension-button"
                          >
                            <img
                              className={styles.extensionButtonIcon}
                              draggable={false}
                              src={addExtensionIcon}
                            />
                          </button>
                        </Box>
                      )}
                      <Box className={styles.watermark}>
                        <Watermark />
                      </Box>
                    </TabPanel>
                    {isCostumesTabEnabled && (
                      <TabPanel className={tabClassNames.tabPanel}>
                        {costumesTabVisible ? <CostumeTab vm={vm} /> : null}
                      </TabPanel>
                    )}
                    {isSoundsTabEnabled && (
                      <TabPanel className={tabClassNames.tabPanel}>
                        {soundsTabVisible ? <SoundTab vm={vm} /> : null}
                      </TabPanel>
                    )}
                  </Tabs>
                  {backpackVisible ? <Backpack host={backpackHost} /> : null}
                </Box>

                <Box
                  className={classNames(
                    styles.stageAndTargetWrapper,
                    styles[stageSize],
                  )}
                >
                  <StageWrapper
                    isFullScreen={isFullScreen}
                    isRendererSupported={isRendererSupported || false}
                    isRtl={isRtl}
                    isStageInteractive={canEditTask}
                    stageSize={stageSize}
                    vm={vm}
                    canEditTask={canEditTask}
                  />
                  <Box className={styles.targetWrapper}>
                    <TargetPane
                      isStageSelectorVisible={canEditTask}
                      isAddNewSpriteButtonVisible={canEditTask}
                      isSpriteInfoEnabled={canEditTask}
                      isDeleteSpriteButtonVisible={canEditTask}
                      isDuplicateSpriteButtonVisible={canEditTask}
                      isExportSpriteButtonVisible={canEditTask}
                      stageSize={stageSize}
                      vm={vm}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
            <DragLayer />
          </Box>
        );
      }}
    </MediaQuery>
  );
};

const mapStateToProps = (state: {
  scratchGui: {
    timeTravel: {
      year: number;
    };
    stageSize: {
      stageSize: StageSizeMode;
    };
    theme: {
      theme: ColorTheme;
    };
  };
}) => ({
  // This is the button's mode, as opposed to the actual current state
  blocksId: state.scratchGui.timeTravel.year.toString(),
  stageSizeMode: state.scratchGui.stageSize.stageSize,
  theme: state.scratchGui.theme.theme,
});

export default injectIntl(connect(mapStateToProps)(GUIComponent));
