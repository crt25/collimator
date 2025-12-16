import bindAll from "lodash.bindall";
import React from "react";
import { connect } from "react-redux";

import {
  defaultProjectId,
  getIsFetchingWithoutId,
  setProjectId,
} from "@scratch-submodule/packages/scratch-gui/src/reducers/project-state";
import { Dispatch } from "redux";

/* Higher Order Component to get the project id from location.hash
 * @param {React.Component} WrappedComponent: component to render
 * @returns {React.Component} component with hash parsing behavior
 */
const HashParserHOC = function <
  T extends {
    isFetchingWithoutId?: boolean;
    setProjectId: (projectId: string) => void;
    reduxProjectId: string | number;
  },
>(
  WrappedComponent: React.ComponentType<
    Omit<T, "isFetchingWithoutId" | "reduxProjectId" | "setProjectId">
  >,
) {
  class HashParserComponent extends React.Component<T> {
    constructor(props: T) {
      super(props);
      bindAll(this, ["handleHashChange"]);
    }

    componentDidMount() {
      window.addEventListener("hashchange", this.handleHashChange);
      this.handleHashChange();
    }

    componentWillUnmount() {
      window.removeEventListener("hashchange", this.handleHashChange);
    }

    handleHashChange() {
      const hashMatch = /#(\d+)/.exec(window.location.hash);
      const hashProjectId =
        hashMatch === null ? defaultProjectId : hashMatch[1];

      this.props.setProjectId(hashProjectId.toString());
    }

    render() {
      const {
        isFetchingWithoutId: _isFetchingWithoutIdProp,
        reduxProjectId: _reduxProjectId,
        setProjectId: _setProjectIdProp,
        ...componentProps
      } = this.props;

      return <WrappedComponent {...componentProps} />;
    }
  }

  type State = {
    scratchGui: {
      projectState: {
        loadingState: {
          isFetchingWithoutId: boolean;
        };
        projectId: string | number;
      };
    };
  };

  const mapStateToProps = (state: State) => {
    const loadingState = state.scratchGui.projectState.loadingState;

    return {
      isFetchingWithoutId: getIsFetchingWithoutId(loadingState),
      reduxProjectId: state.scratchGui.projectState.projectId,
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch) => ({
    setProjectId: (projectId: string | number) => {
      dispatch(setProjectId(projectId));
    },
  });

  const mergeProps = (
    stateProps: ReturnType<typeof mapStateToProps>,
    dispatchProps: ReturnType<typeof mapDispatchToProps>,
    ownProps: T,
  ) => ({
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
  });

  return connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    // @ts-expect-error not sure what is wrong
  )(HashParserComponent);
};

export { HashParserHOC as default };
