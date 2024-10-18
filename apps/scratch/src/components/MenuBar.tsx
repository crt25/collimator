import classNames from "classnames";
import { connect } from "react-redux";
import { compose, Dispatch } from "redux";
import { FormattedMessage, InjectedIntl, injectIntl } from "react-intl";
import bindAll from "lodash.bindall";
import bowser from "bowser";

import VM from "scratch-vm";

import Box from "@scratch-submodule/scratch-gui/src/components/box/box.jsx";
import MenuBarMenu from "@scratch-submodule/scratch-gui/src/components/menu-bar/menu-bar-menu.jsx";
import {
  MenuItem,
  MenuSection,
} from "@scratch-submodule/scratch-gui/src/components/menu/menu.jsx";
import SB3Downloader from "@scratch-submodule/scratch-gui/src/containers/sb3-downloader.jsx";
import MenuBarHOC from "@scratch-submodule/scratch-gui/src/containers/menu-bar-hoc.jsx";
import SettingsMenu from "@scratch-submodule/scratch-gui/src/components/menu-bar/settings-menu.jsx";

import { openTipsLibrary } from "@scratch-submodule/scratch-gui/src/reducers/modals";
import {
  isTimeTravel220022BC,
  isTimeTravel1920,
  isTimeTravel1990,
  isTimeTravel2020,
  isTimeTravelNow,
  setTimeTravel,
} from "@scratch-submodule/scratch-gui/src/reducers/time-travel";
import {
  autoUpdateProject,
  getIsUpdating,
  getIsShowingProject,
  manualUpdateProject,
  requestNewProject,
  saveProjectAsCopy,
} from "@scratch-submodule/scratch-gui/src/reducers/project-state";
import {
  openFileMenu,
  closeFileMenu,
  fileMenuOpen,
  openEditMenu,
  closeEditMenu,
  editMenuOpen,
  openLoginMenu,
  openModeMenu,
  modeMenuOpen,
  settingsMenuOpen,
  openSettingsMenu,
  closeSettingsMenu,
} from "@scratch-submodule/scratch-gui/src/reducers/menus";

import styles from "@scratch-submodule/scratch-gui/src/components/menu-bar/menu-bar.css";

import dropdownCaret from "@scratch-submodule/scratch-gui/src/components/menu-bar/dropdown-caret.svg";
import editIcon from "@scratch-submodule/scratch-gui/src/components/menu-bar/icon--edit.svg";

import ninetiesLogo from "@scratch-submodule/scratch-gui/src/components/menu-bar/nineties_logo.svg";
import catLogo from "@scratch-submodule/scratch-gui/src/components/menu-bar/cat_logo.svg";
import prehistoricLogo from "@scratch-submodule/scratch-gui/src/components/menu-bar/prehistoric-logo.svg";
import oldtimeyLogo from "@scratch-submodule/scratch-gui/src/components/menu-bar/oldtimey-logo.svg";

import sharedMessages from "@scratch-submodule/scratch-gui/src/lib/shared-messages";
import React from "react";
import styled from "@emotion/styled";

const MenuMarginRight = styled.div`
  margin-right: 1rem;
`;

type TimeTravelMode = "NOW" | "2020" | "1990" | "1920" | "220022BC";

interface Props {
  autoUpdateProject: () => void;
  canChangeLanguage?: boolean;
  canChangeTheme?: boolean;
  canEditTask?: boolean;
  className?: string;
  confirmReadyToReplaceProject: (message: string) => boolean;
  currentLocale: string;
  editMenuOpen: boolean;
  fileMenuOpen: boolean;
  intl: InjectedIntl;
  isRtl: boolean;
  isUpdating: boolean;
  locale: string;
  logo: string;
  mode1920: boolean;
  mode1990: boolean;
  mode2020: boolean;
  mode220022BC: boolean;
  modeMenuOpen: boolean;
  modeNow: boolean;
  onClickEdit: () => void;
  onClickFile: () => void;
  onClickLogo?: () => void;
  onClickMode: () => void;
  onClickNew: (canCreateNew: boolean) => void;
  onClickSave: () => void;
  onClickSaveAsCopy: () => void;
  onClickSettings: () => void;
  onOpenTipLibrary: () => void;
  onRequestCloseEdit: () => void;
  onRequestCloseFile: () => void;
  onRequestCloseSettings: () => void;
  onSetTimeTravelMode: (mode: TimeTravelMode) => void;
  onStartSelectingFileUpload?: () => void;
  projectTitle: string;
  settingsMenuOpen: boolean;
  shouldSaveBeforeTransition: () => boolean;
  vm: VM;
}

type ProvidedByHOC =
  | "confirmReadyToReplaceProject"
  | "shouldSaveBeforeTransition";

type ProvidedByRedux =
  // state
  | "currentLocale"
  | "fileMenuOpen"
  | "editMenuOpen"
  | "isRtl"
  | "isUpdating"
  | "isShowingProject"
  | "locale"
  | "modeMenuOpen"
  | "projectTitle"
  | "settingsMenuOpen"
  | "vm"
  | "mode220022BC"
  | "mode1920"
  | "mode1990"
  | "mode2020"
  | "modeNow"
  // dispatch
  | "autoUpdateProject"
  | "onOpenTipLibrary"
  | "onClickFile"
  | "onRequestCloseFile"
  | "onClickEdit"
  | "onRequestCloseEdit"
  | "onClickLogin"
  | "onClickMode"
  | "onClickSettings"
  | "onRequestCloseSettings"
  | "onClickNew"
  | "onClickSave"
  | "onClickSaveAsCopy"
  | "onSetTimeTravelMode";

type WaitForUpdate = (shouldWait: boolean) => void;

type LoadingState =
  | "NOT_LOADED"
  | "ERROR"
  | "AUTO_UPDATING"
  | "CREATING_COPY"
  | "CREATING_NEW"
  | "FETCHING_NEW_DEFAULT"
  | "FETCHING_WITH_ID"
  | "LOADING_VM_FILE_UPLOAD"
  | "LOADING_VM_NEW_DEFAULT"
  | "LOADING_VM_WITH_ID"
  | "MANUAL_UPDATING"
  | "REMIXING"
  | "SHOWING_WITH_ID"
  | "SHOWING_WITHOUT_ID"
  | "UPDATING_BEFORE_COPY"
  | "UPDATING_BEFORE_NEW";

interface ReduxState {
  scratchGui: {
    projectTitle: string;
    projectState: {
      loadingState: LoadingState;
    };
    vm: VM;
  };
  locales: {
    locale: string;
    isRtl: boolean;
  };
}

class MenuBar extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    bindAll(this, [
      "handleClickNew",
      "handleClickSave",
      "handleClickSaveAsCopy",
      "handleSetMode",
      "handleKeyPress",
      "handleRestoreOption",
      "getSaveToComputerHandler",
      "restoreOptionMessage",
    ]);
  }
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyPress);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyPress);
  }
  handleClickNew() {
    // if the project is dirty, and user owns the project, we will autosave.
    // but if they are not logged in and can't save, user should consider
    // downloading or logging in first.
    // Note that if user is logged in and editing someone else's project,
    // they'll lose their work.
    const readyToReplaceProject = this.props.confirmReadyToReplaceProject(
      this.props.intl.formatMessage(sharedMessages.replaceProjectWarning),
    );
    this.props.onRequestCloseFile();
    if (readyToReplaceProject) {
      this.props.onClickNew(this.props.canEditTask ? true : false);
    }
    this.props.onRequestCloseFile();
  }
  handleClickSave() {
    this.props.onClickSave();
    this.props.onRequestCloseFile();
  }
  handleClickSaveAsCopy() {
    this.props.onClickSaveAsCopy();
    this.props.onRequestCloseFile();
  }
  handleClickSeeCommunity(waitForUpdate: WaitForUpdate) {
    if (this.props.shouldSaveBeforeTransition()) {
      this.props.autoUpdateProject(); // save before transitioning to project page
      waitForUpdate(true); // queue the transition to project page
    } else {
      waitForUpdate(false); // immediately transition to project page
    }
  }
  handleSetMode(mode: TimeTravelMode) {
    return () => {
      // Turn on/off filters for modes.
      if (mode === "1920") {
        document.documentElement.style.filter =
          "brightness(.9)contrast(.8)sepia(1.0)";
        document.documentElement.style.height = "100%";
      } else if (mode === "1990") {
        document.documentElement.style.filter = "hue-rotate(40deg)";
        document.documentElement.style.height = "100%";
      } else {
        document.documentElement.style.filter = "";
        document.documentElement.style.height = "";
      }

      // Change logo for modes
      const logo = document.getElementById("logo_img");
      if (logo && "src" in logo) {
        if (mode === "1990") {
          logo.src = ninetiesLogo;
        } else if (mode === "2020") {
          logo.src = catLogo;
        } else if (mode === "1920") {
          logo.src = oldtimeyLogo;
        } else if (mode === "220022BC") {
          logo.src = prehistoricLogo;
        } else {
          logo.src = this.props.logo;
        }
      }

      this.props.onSetTimeTravelMode(mode);
    };
  }
  handleRestoreOption(restoreFun: () => void) {
    return () => {
      restoreFun();
      this.props.onRequestCloseEdit();
    };
  }
  handleKeyPress(event: KeyboardEvent) {
    // @ts-expect-error The type definition for bowser is incomplete
    const modifier = bowser.mac ? event.metaKey : event.ctrlKey;
    if (modifier && event.key === "s") {
      this.props.onClickSave();
      event.preventDefault();
    }
  }
  getSaveToComputerHandler(downloadProjectCallback: () => void) {
    return () => {
      this.props.onRequestCloseFile();
      downloadProjectCallback();
    };
  }
  restoreOptionMessage(deletedItem: string) {
    switch (deletedItem) {
      case "Sprite":
        return (
          <FormattedMessage
            defaultMessage="Restore Sprite"
            description="Menu bar item for restoring the last deleted sprite."
            id="gui.menuBar.restoreSprite"
          />
        );
      case "Sound":
        return (
          <FormattedMessage
            defaultMessage="Restore Sound"
            description="Menu bar item for restoring the last deleted sound."
            id="gui.menuBar.restoreSound"
          />
        );
      case "Costume":
        return (
          <FormattedMessage
            defaultMessage="Restore Costume"
            description="Menu bar item for restoring the last deleted costume."
            id="gui.menuBar.restoreCostume"
          />
        );
      default: {
        return (
          <FormattedMessage
            defaultMessage="Restore"
            description="Menu bar item for restoring the last deleted item in its disabled state." /* eslint-disable-line max-len */
            id="gui.menuBar.restore"
          />
        );
      }
    }
  }
  render() {
    const createCopyMessage = (
      <FormattedMessage
        defaultMessage="Save as a copy"
        description="Menu bar item for saving as a copy"
        id="gui.menuBar.saveAsCopy"
      />
    );
    const newProjectMessage = (
      <FormattedMessage
        defaultMessage="New"
        description="Menu bar item for creating a new project"
        id="gui.menuBar.new"
      />
    );

    return (
      <Box className={classNames(this.props.className, styles.menuBar)}>
        <div className={styles.mainMenu}>
          <div className={styles.fileGroup}>
            <div className={classNames(styles.menuBarItem)}>
              <img
                id="logo_img"
                alt="Scratch"
                className={classNames(styles.scratchLogo, {
                  [styles.clickable]:
                    typeof this.props.onClickLogo !== "undefined",
                })}
                draggable={false}
                src={this.props.logo}
                onClick={this.props.onClickLogo}
              />
            </div>

            {this.props.canEditTask && (
              <div
                className={classNames(styles.menuBarItem, styles.hoverable, {
                  [styles.active]: this.props.fileMenuOpen,
                })}
                onMouseUp={this.props.onClickFile}
              >
                <img src={editIcon} />
                <span className={styles.collapsibleLabel}>
                  <FormattedMessage
                    defaultMessage="Edit"
                    description="Text for edit dropdown menu"
                    id="gui.menuBar.edit"
                  />
                </span>
                <img src={dropdownCaret} />
                <MenuBarMenu
                  className={classNames(styles.menuBarMenu)}
                  open={this.props.fileMenuOpen}
                  place={this.props.isRtl ? "left" : "right"}
                  onRequestClose={this.props.onRequestCloseFile}
                >
                  <MenuSection>
                    <MenuItem onClick={this.handleClickNew}>
                      {newProjectMessage}
                    </MenuItem>
                  </MenuSection>

                  <MenuSection>
                    <MenuItem onClick={this.handleClickSaveAsCopy}>
                      {createCopyMessage}
                    </MenuItem>
                  </MenuSection>

                  {false && (
                    <MenuSection>
                      <MenuItem onClick={this.props.onStartSelectingFileUpload}>
                        {this.props.intl.formatMessage(
                          sharedMessages.loadFromComputerTitle,
                        )}
                      </MenuItem>
                      <SB3Downloader>
                        {(className, downloadProjectCallback) => (
                          <MenuItem
                            className={className}
                            onClick={this.getSaveToComputerHandler(
                              downloadProjectCallback,
                            )}
                          >
                            <FormattedMessage
                              defaultMessage="Save to your computer"
                              description="Menu bar item for downloading a project to your computer" // eslint-disable-line max-len
                              id="gui.menuBar.downloadToComputer"
                            />
                          </MenuItem>
                        )}
                      </SB3Downloader>
                    </MenuSection>
                  )}
                </MenuBarMenu>
              </div>
            )}
          </div>
          {(this.props.canChangeTheme || this.props.canChangeLanguage) && (
            <SettingsMenu
              canChangeLanguage={this.props.canChangeLanguage}
              canChangeTheme={this.props.canChangeTheme}
              isRtl={true}
              onRequestClose={this.props.onRequestCloseSettings}
              onRequestOpen={this.props.onClickSettings}
              settingsMenuOpen={this.props.settingsMenuOpen}
            />
          )}
          <MenuMarginRight />
        </div>
      </Box>
    );
  }
}

const mapStateToProps = (state: ReduxState) => {
  const loadingState = state.scratchGui.projectState.loadingState;
  return {
    currentLocale: state.locales.locale,
    fileMenuOpen: fileMenuOpen(state),
    editMenuOpen: editMenuOpen(state),
    isRtl: state.locales.isRtl,
    isUpdating: getIsUpdating(loadingState),
    isShowingProject: getIsShowingProject(loadingState),
    locale: state.locales.locale,
    modeMenuOpen: modeMenuOpen(state),
    settingsMenuOpen: settingsMenuOpen(state),
    vm: state.scratchGui.vm,
    mode220022BC: isTimeTravel220022BC(state),
    mode1920: isTimeTravel1920(state),
    mode1990: isTimeTravel1990(state),
    mode2020: isTimeTravel2020(state),
    modeNow: isTimeTravelNow(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<ReduxState>) => ({
  autoUpdateProject: () => dispatch(autoUpdateProject()),
  onOpenTipLibrary: () => dispatch(openTipsLibrary()),
  onClickFile: () => dispatch(openFileMenu()),
  onRequestCloseFile: () => dispatch(closeFileMenu()),
  onClickEdit: () => dispatch(openEditMenu()),
  onRequestCloseEdit: () => dispatch(closeEditMenu()),
  onClickLogin: () => dispatch(openLoginMenu()),
  onClickMode: () => dispatch(openModeMenu()),
  onClickSettings: () => dispatch(openSettingsMenu()),
  onRequestCloseSettings: () => dispatch(closeSettingsMenu()),
  onClickNew: (needSave: boolean) => dispatch(requestNewProject(needSave)),
  onClickSave: () => dispatch(manualUpdateProject()),
  onClickSaveAsCopy: () => dispatch(saveProjectAsCopy()),
  onSetTimeTravelMode: (mode: TimeTravelMode) => dispatch(setTimeTravel(mode)),
});

type ExternalProps = Omit<Props, ProvidedByHOC | ProvidedByRedux>;

export default compose(
  injectIntl,
  MenuBarHOC,
  connect(mapStateToProps, mapDispatchToProps),
)(MenuBar) as React.FunctionComponent<ExternalProps>;
