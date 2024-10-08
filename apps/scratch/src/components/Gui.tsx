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
import TargetPane from "@scratch-submodule/scratch-gui/src/containers/target-pane.jsx";
import SoundTab from "@scratch-submodule/scratch-gui/src/containers/sound-tab.jsx";
import StageWrapper from "@scratch-submodule/scratch-gui/src/containers/stage-wrapper.jsx";
import Loader from "@scratch-submodule/scratch-gui/src/components/loader/loader.jsx";
import Box from "@scratch-submodule/scratch-gui/src/components/box/box.jsx";
import MenuBar from "@scratch-submodule/scratch-gui/src/components/menu-bar/menu-bar.jsx";
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
import TelemetryModal from "@scratch-submodule/scratch-gui/src/components/telemetry-modal/telemetry-modal.jsx";

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
import addExtensionIcon from "@scratch-submodule/scratch-gui/src/components/gui/icon--extensions.svg";
import codeIcon from "@scratch-submodule/scratch-gui/src/components/gui/icon--code.svg";
import costumesIcon from "@scratch-submodule/scratch-gui/src/components/gui/icon--costumes.svg";
import soundsIcon from "@scratch-submodule/scratch-gui/src/components/gui/icon--sounds.svg";
import { ReactNode } from "react";

//import Blocks from "@scratch-submodule/scratch-gui/src/containers/blocks.jsx";
import Blocks from "../containers/Blocks";

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
  children?: ReactNode;
  cloudHost?: string;
  fetchingProject?: boolean;
  isLoading?: boolean;
  isScratchDesktop?: boolean;
  isShowingProject?: boolean;
  isTotallyNormal: boolean;
  loadingStateVisible?: boolean;
  onProjectLoaded?: () => void;
  onSeeCommunity?: () => void;
  onStorageInit?: () => void;
  onUpdateProjectId?: () => void;
  onVmInit?: () => void;
  projectHost?: string;

  alertsVisible?: boolean;
  connectionModalVisible?: boolean;
  isTelemetryEnabled?: boolean;
  accountNavOpen?: boolean;
  activeTabIndex?: number;
  authorId?: string | boolean; // can be false
  authorThumbnailUrl?: string;
  authorUsername?: string | boolean; // can be false
  backdropLibraryVisible?: boolean;
  backpackHost: string | null;
  backpackVisible: boolean;
  basePath: string;
  blocksTabVisible?: boolean;
  blocksId?: string;
  canChangeLanguage: boolean;
  canChangeTheme: boolean;
  canCreateCopy: boolean;
  canCreateNew: boolean;
  canEditTitle: boolean;
  canManageFiles: boolean;
  canRemix: boolean;
  canSave: boolean;
  canShare: boolean;
  canUseCloud: boolean;
  cardsVisible?: boolean;
  costumeLibraryVisible?: boolean;
  costumesTabVisible?: boolean;
  enableCommunity: boolean;
  isCreating: boolean;
  isFullScreen: boolean;
  isPlayerOnly?: boolean;
  isRtl: boolean;
  isShared: boolean;
  loading: boolean;
  logo?: string;
  onActivateCostumesTab?: () => void;
  onActivateSoundsTab?: () => void;
  onActivateTab?: () => void;
  onClickAccountNav?: () => void;
  onClickLogo?: () => void;
  onCloseAccountNav?: () => void;
  onExtensionButtonClick?: () => void;
  onLogOut?: () => void;
  onOpenRegistration?: () => void;
  onRequestCloseBackdropLibrary?: () => void;
  onRequestCloseCostumeLibrary?: () => void;
  onRequestCloseTelemetryModal?: () => void;
  onShare?: () => void;
  onShowPrivacyPolicy?: () => void;
  onStartSelectingFileUpload?: () => void;
  onTabSelect?: () => void;
  onTelemetryModalCancel?: () => void;
  onTelemetryModalOptIn?: () => void;
  onTelemetryModalOptOut?: () => void;
  onToggleLoginOpen?: () => void;
  renderLogin?: () => void;
  onProjectTelemetryEvent?: () => void;
  onClickAbout?: () => void;
  showComingSoon: boolean;
  soundsTabVisible?: boolean;
  // see https://github.com/scratchfoundation/scratch-gui/blob/d678d609e182ccc5ab557d7d45a3cc3e6430b056/src/lib/layout-constants.js#L7
  stageSizeMode: StageSizeMode;
  targetIsStage?: boolean;
  telemetryModalVisible?: boolean;
  theme: ColorTheme;
  tipsLibraryVisible?: boolean;
}) => {
  const {
    accountNavOpen,
    activeTabIndex,
    alertsVisible,
    authorId,
    authorThumbnailUrl,
    authorUsername,
    basePath,
    backdropLibraryVisible,
    backpackHost,
    backpackVisible,
    blocksId,
    blocksTabVisible,
    cardsVisible,
    canChangeLanguage,
    canChangeTheme,
    canCreateNew,
    canEditTitle,
    canManageFiles,
    canRemix,
    canSave,
    canCreateCopy,
    canShare,
    canUseCloud,
    children,
    connectionModalVisible,
    costumeLibraryVisible,
    costumesTabVisible,
    enableCommunity,
    intl,
    isCreating,
    isFullScreen,
    isPlayerOnly,
    isRtl,
    isShared,
    isTelemetryEnabled,
    isTotallyNormal,
    loading,
    logo,
    renderLogin,
    onClickAbout,
    onClickAccountNav,
    onCloseAccountNav,
    onLogOut,
    onOpenRegistration,
    onToggleLoginOpen,
    onActivateCostumesTab,
    onActivateSoundsTab,
    onActivateTab,
    onClickLogo,
    onExtensionButtonClick,
    onProjectTelemetryEvent,
    onRequestCloseBackdropLibrary,
    onRequestCloseCostumeLibrary,
    onRequestCloseTelemetryModal,
    onSeeCommunity,
    onShare,
    onShowPrivacyPolicy,
    onStartSelectingFileUpload,
    onTelemetryModalCancel,
    onTelemetryModalOptIn,
    onTelemetryModalOptOut,
    showComingSoon,
    soundsTabVisible,
    stageSizeMode,
    targetIsStage,
    telemetryModalVisible,
    theme,
    tipsLibraryVisible,
    vm,
    ...componentProps
  } = omit(props, "dispatch");

  if (children) {
    return <Box {...componentProps}>{children}</Box>;
  }

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
          >
            {alertsVisible ? (
              <Alerts className={styles.alertsContainer} />
            ) : null}
          </StageWrapper>
        ) : (
          <Box
            className={styles.pageWrapper}
            dir={isRtl ? "rtl" : "ltr"}
            {...componentProps}
          >
            {telemetryModalVisible ? (
              <TelemetryModal
                isRtl={isRtl}
                isTelemetryEnabled={isTelemetryEnabled}
                onCancel={onTelemetryModalCancel}
                onOptIn={onTelemetryModalOptIn}
                onOptOut={onTelemetryModalOptOut}
                onRequestClose={onRequestCloseTelemetryModal}
                onShowPrivacyPolicy={onShowPrivacyPolicy}
              />
            ) : null}
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
            <MenuBar
              accountNavOpen={accountNavOpen}
              authorId={authorId}
              authorThumbnailUrl={authorThumbnailUrl}
              authorUsername={authorUsername}
              canChangeLanguage={canChangeLanguage}
              canChangeTheme={canChangeTheme}
              canCreateCopy={canCreateCopy}
              canCreateNew={canCreateNew}
              canEditTitle={canEditTitle}
              canManageFiles={canManageFiles}
              canRemix={canRemix}
              canSave={canSave}
              canShare={canShare}
              className={styles.menuBarPosition}
              enableCommunity={enableCommunity}
              isShared={isShared}
              isTotallyNormal={isTotallyNormal}
              logo={logo}
              renderLogin={renderLogin}
              showComingSoon={showComingSoon}
              onClickAbout={onClickAbout}
              onClickAccountNav={onClickAccountNav}
              onClickLogo={onClickLogo}
              onCloseAccountNav={onCloseAccountNav}
              onLogOut={onLogOut}
              onOpenRegistration={onOpenRegistration}
              onProjectTelemetryEvent={onProjectTelemetryEvent}
              onSeeCommunity={onSeeCommunity}
              onShare={onShare}
              onStartSelectingFileUpload={onStartSelectingFileUpload}
              onToggleLoginOpen={onToggleLoginOpen}
            />
            <Box className={styles.bodyWrapper}>
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
                    </TabList>
                    <TabPanel className={tabClassNames.tabPanel}>
                      <Box className={styles.blocksWrapper}>
                        <Blocks
                          key={`${blocksId}/${theme}`}
                          canUseCloud={canUseCloud}
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
                      <Box className={styles.extensionButtonContainer}>
                        <button
                          className={styles.extensionButton}
                          title={intl.formatMessage(messages.addExtension)}
                          onClick={onExtensionButtonClick}
                        >
                          <img
                            className={styles.extensionButtonIcon}
                            draggable={false}
                            src={addExtensionIcon}
                          />
                        </button>
                      </Box>
                      <Box className={styles.watermark}>
                        <Watermark />
                      </Box>
                    </TabPanel>
                    <TabPanel className={tabClassNames.tabPanel}>
                      {costumesTabVisible ? <CostumeTab vm={vm} /> : null}
                    </TabPanel>
                    <TabPanel className={tabClassNames.tabPanel}>
                      {soundsTabVisible ? <SoundTab vm={vm} /> : null}
                    </TabPanel>
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
                    stageSize={stageSize}
                    vm={vm}
                  />
                  <Box className={styles.targetWrapper}>
                    <TargetPane stageSize={stageSize} vm={vm} />
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
