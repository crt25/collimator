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
import MenuBarHOC from "@scratch-submodule/scratch-gui/src/containers/menu-bar-hoc.jsx";
import SettingsMenu from "@scratch-submodule/scratch-gui/src/components/menu-bar/settings-menu.jsx";

import {
  autoUpdateProject,
  getIsShowingProject,
  manualUpdateProject,
  requestNewProject,
  saveProjectAsCopy,
} from "@scratch-submodule/scratch-gui/src/reducers/project-state";
import {
  openFileMenu,
  closeFileMenu,
  fileMenuOpen,
  closeEditMenu,
  openLoginMenu,
  settingsMenuOpen,
  openSettingsMenu,
  closeSettingsMenu,
} from "@scratch-submodule/scratch-gui/src/reducers/menus";

import styles from "@scratch-submodule/scratch-gui/src/components/menu-bar/menu-bar.css";

import dropdownCaret from "@scratch-submodule/scratch-gui/src/components/menu-bar/dropdown-caret.svg";
import editIcon from "@scratch-submodule/scratch-gui/src/components/menu-bar/icon--edit.svg";

import sharedMessages from "@scratch-submodule/scratch-gui/src/lib/shared-messages";
import React from "react";
import styled from "@emotion/styled";

const MenuMarginRight = styled.div`
  margin-right: 1rem;
`;

interface Props {
  autoUpdateProject: () => void;
  canChangeLanguage?: boolean;
  canChangeTheme?: boolean;
  canEditTask?: boolean;
  className?: string;
  confirmReadyToReplaceProject: (message: string) => boolean;
  fileMenuOpen: boolean;
  intl: InjectedIntl;
  isRtl: boolean;
  locale: string;
  onClickFile: () => void;
  onClickNew: (canCreateNew?: boolean) => void;
  onClickSave: () => void;
  onClickSaveAsCopy: () => void;
  onClickSettings: () => void;
  onProjectTelemetryEvent?: (event: string, metaData: MetaData) => void;
  onRequestCloseEdit: () => void;
  onRequestCloseFile: () => void;
  onRequestCloseSettings: () => void;
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
  | "fileMenuOpen"
  | "isRtl"
  | "isShowingProject"
  | "locale"
  | "projectTitle"
  | "settingsMenuOpen"
  | "vm"
  // dispatch
  | "autoUpdateProject"
  | "onClickFile"
  | "onRequestCloseFile"
  | "onRequestCloseEdit"
  | "onClickLogin"
  | "onClickSettings"
  | "onRequestCloseSettings"
  | "onClickNew"
  | "onClickSave"
  | "onClickSaveAsCopy";

type MetaData = {
  projectName: string;
  language: string;
  spriteCount: number;
  blocksCount: number;
  costumesCount: number;
  listsCount: number;
  scriptCount: number;
  soundsCount: number;
  variablesCount: number;
};

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
      "handleKeyPress",
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
      this.props.onClickNew(this.props.canEditTask);
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
  handleKeyPress(event: KeyboardEvent) {
    // @ts-expect-error The type definition for bowser is incomplete
    const modifier = bowser.mac ? event.metaKey : event.ctrlKey;
    if (modifier && event.key === "s") {
      this.props.onClickSave();
      event.preventDefault();
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
    fileMenuOpen: fileMenuOpen(state),
    isRtl: state.locales.isRtl,
    isShowingProject: getIsShowingProject(loadingState),
    locale: state.locales.locale,
    settingsMenuOpen: settingsMenuOpen(state),
    vm: state.scratchGui.vm,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<ReduxState>) => ({
  autoUpdateProject: () => dispatch(autoUpdateProject()),
  onClickFile: () => dispatch(openFileMenu()),
  onRequestCloseFile: () => dispatch(closeFileMenu()),
  onRequestCloseEdit: () => dispatch(closeEditMenu()),
  onClickLogin: () => dispatch(openLoginMenu()),
  onClickSettings: () => dispatch(openSettingsMenu()),
  onRequestCloseSettings: () => dispatch(closeSettingsMenu()),
  onClickNew: (needSave?: boolean) => dispatch(requestNewProject(!!needSave)),
  onClickSave: () => dispatch(manualUpdateProject()),
  onClickSaveAsCopy: () => dispatch(saveProjectAsCopy()),
});

type ExternalProps = Omit<Props, ProvidedByHOC | ProvidedByRedux>;

export default compose(
  injectIntl,
  MenuBarHOC,
  connect(mapStateToProps, mapDispatchToProps),
)(MenuBar) as React.FunctionComponent<ExternalProps>;
