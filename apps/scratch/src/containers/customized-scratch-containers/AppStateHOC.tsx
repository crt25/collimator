import React from "react";

import { EditorState } from "@scratch-submodule/packages/scratch-gui/src/lib/editor-state";
import { GUIConfigFactory } from "@scratch-submodule/packages/scratch-gui/src/gui-config";
import { AppStateProviderHOC } from "./AppStateProviderHOC";

/**
 * Higher Order Component to provide redux state. If an `intl` prop is provided
 * it will override the internal `intl` redux state
 *
 * @param WrappedComponent - component to provide state for
 * @param localesOnly - only provide the locale state, not everything
 *                      required by the GUI. Used to exclude excess state when
 *                      only rendering modals, not the GUI.
 * @param configFactory - The configuration to use.
 *
 * @returns component with redux and intl state provided
 */
const AppStateHOC = <
  TProps extends {
    isFullScreen?: boolean;
    isPlayerOnly?: boolean;
    isTelemetryEnabled?: boolean;
    showTelemetryModal?: boolean;
    isEmbedded?: boolean;
  },
>(
  WrappedComponent: React.ComponentType<TProps>,
  localesOnly?: boolean,
  configFactory?: GUIConfigFactory,
): React.ComponentType<TProps> => {
  const AppStateProvider = AppStateProviderHOC<TProps>(WrappedComponent);

  class AppStateWrapper extends React.Component<TProps> {
    private appState: EditorState;

    constructor(props: TProps) {
      super(props);

      this.appState = new EditorState(
        {
          localesOnly,
          isFullScreen: props.isFullScreen,
          isPlayerOnly: props.isPlayerOnly,
          showTelemetryModal: props.showTelemetryModal,
          isEmbedded: props.isEmbedded,
        },
        // @ts-expect-error The typing of EditorState is wrong.
        configFactory,
      );
    }

    render() {
      return (
        <AppStateProvider
          appState={this.appState}
          localesOnly={localesOnly}
          {...this.props}
        />
      );
    }
  }

  return AppStateWrapper;
};

export default AppStateHOC;
