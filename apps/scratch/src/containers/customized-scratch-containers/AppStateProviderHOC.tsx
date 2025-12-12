import React from "react";
import { Provider } from "react-redux";

import { EditorState } from "@scratch-submodule/packages/scratch-gui/src/lib/editor-state";
import {
  setPlayer,
  setFullScreen,
  setEmbedded,
} from "@scratch-submodule/packages/scratch-gui/src/reducers/mode.js";
import ConnectedIntlProvider from "@scratch-submodule/packages/scratch-gui/src/lib/connected-intl-provider.jsx";

/**
 * Wraps the editor into the redux state contained within an EditorState instance.
 *
 * @param WrappedComponent - component to provide state for
 *
 * @returns component with redux and intl state provided
 */
export const AppStateProviderHOC = <TProps extends object>(
  WrappedComponent: React.ComponentType<TProps>,
) => {
  type ExtendedProps = TProps & {
    isFullScreen?: boolean;
    isPlayerOnly?: boolean;
    isTelemetryEnabled?: boolean;
    showTelemetryModal?: boolean;
    isEmbedded?: boolean;
    localesOnly?: boolean;
    appState: EditorState;
  };

  class AppStateWrapper extends React.Component<ExtendedProps> {
    componentDidUpdate(prevProps: ExtendedProps) {
      if (this.props.localesOnly) return;
      if (prevProps.isPlayerOnly !== this.props.isPlayerOnly) {
        this.props.appState.store.dispatch(setPlayer(this.props.isPlayerOnly));
      }
      if (prevProps.isFullScreen !== this.props.isFullScreen) {
        this.props.appState.store.dispatch(
          setFullScreen(this.props.isFullScreen),
        );
      }
      if (prevProps.isEmbedded !== this.props.isEmbedded) {
        this.props.appState.store.dispatch(setEmbedded(this.props.isEmbedded));
      }
    }

    render() {
      const {
        appState,
        isFullScreen: _isFullScreen,
        isPlayerOnly: _isPlayerOnly,
        showTelemetryModal: _showTelemetryModal,
        isEmbedded: _isEmbedded,
        ...componentProps
      } = this.props;

      const props = componentProps as TProps;

      return (
        <Provider store={appState.store}>
          <ConnectedIntlProvider>
            <WrappedComponent {...props} />
          </ConnectedIntlProvider>
        </Provider>
      );
    }
  }

  return AppStateWrapper;
};
