// https://github.com/scratchfoundation/scratch-gui/blob/develop/src/index.js
declare module "@scratch-submodule/scratch-gui/src" {
  import { FunctionComponent, ReactNode } from "react";
  import { IntlShape } from "react-intl";
  import { Reducer } from "redux";
  import VM from "scratch-vm";

  // https://github.com/scratchfoundation/scratch-gui/blob/develop/src/containers/gui.jsx
  const GUI: FunctionComponent<{
    // required
    vm?: VM;

    // optional
    intl?: IntlShape;
    assetHost?: string;
    children?: ReactNode;
    cloudHost?: string;
    fetchingProject?: boolean;
    isLoading?: boolean;
    isScratchDesktop?: boolean;
    isShowingProject?: boolean;
    isTotallyNormal?: boolean;
    loadingStateVisible?: boolean;
    onProjectLoaded?: () => void;
    onSeeCommunity?: () => void;
    onStorageInit?: () => void;
    onUpdateProjectId?: () => void;
    onVmInit?: () => void;
    projectHost?: string;

    // https?://github.com/scratchfoundation/scratch-gui/blob/develop/src/components/gui/gui.jsx#L374
    accountNavOpen?: boolean;
    activeTabIndex?: number;
    authorId?: string | boolean; // can be false
    authorThumbnailUrl?: string;
    authorUsername?: string | boolean; // can be false
    backdropLibraryVisible?: boolean;
    backpackHost?: string;
    backpackVisible?: boolean;
    basePath?: string;
    blocksTabVisible?: boolean;
    blocksId?: string;
    canChangeLanguage?: boolean;
    canChangeTheme?: boolean;
    canCreateCopy?: boolean;
    canCreateNew?: boolean;
    canEditTitle?: boolean;
    canManageFiles?: boolean;
    canRemix?: boolean;
    canSave?: boolean;
    canShare?: boolean;
    canUseCloud?: boolean;
    cardsVisible?: boolean;
    costumeLibraryVisible?: boolean;
    costumesTabVisible?: boolean;
    enableCommunity?: boolean;
    isCreating?: boolean;
    isFullScreen?: boolean;
    isPlayerOnly?: boolean;
    isRtl?: boolean;
    isShared?: boolean;
    loading?: boolean;
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
    showComingSoon?: boolean;
    soundsTabVisible?: boolean;
    // see https://github.com/scratchfoundation/scratch-gui/blob/d678d609e182ccc5ab557d7d45a3cc3e6430b056/src/lib/layout-constants.js#L7
    stageSizeMode?: "small" | "large";
    targetIsStage?: boolean;
    telemetryModalVisible?: boolean;
    theme?: string;
    tipsLibraryVisible?: boolean;
  }>;

  export default GUI;

  export const AppStateHOC: <P, S, SS>(
    WrappedComponent: Component<P, S, SS>,
    localesOnly?: boolean,
  ) => Component<P, S, SS>;

  // redux
  export const guiReducers: Reducer;

  export const guiInitialState: unknown;
  export const guiMiddleware: unknown;
  export const initEmbedded: unknown;
  export const initPlayer: unknown;
  export const initFullScreen: unknown;
  export const initLocale: unknown;
  export const localesInitialState: unknown;
  export const remixProject: unknown;
  export const setFullScreen: unknown;
  export const setPlayer: unknown;
}
