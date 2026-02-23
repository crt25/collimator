import styled from "@emotion/styled";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  useIframeChild,
  PlatformCrtIframeApi,
  Submission,
} from "iframe-rpc-react/src";
import { FormattedMessage } from "react-intl";
import ProgressSpinner from "./ProgressSpinner";

const APP_IFRAME_LOAD_TIMEOUT = 30000;

const LoadingWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  background-color: #fff;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  text-align: center;
  padding: 16px;
`;

const IFrameWrapper = styled.div`
  width: 100%;

  flex-grow: 1;

  position: relative;
  display: flex;
  flex-direction: column;
`;

const StyledIFrame = styled.iframe`
  width: 100%;
  border: none;

  flex-grow: 1;
`;

export class IFrameUnavailableError extends Error {
  constructor() {
    super("Iframe is not available");
  }
}

const LoadingState = {
  loading: "loading",
  available: "available",
  error: "error",
} as const;

type LoadingState = (typeof LoadingState)[keyof typeof LoadingState];

export interface EmbeddedAppRef {
  sendRequest: ReturnType<typeof useIframeChild>["sendRequest"];
}

export interface Props {
  src: string;
  onAppAvailable?: () => void;
  onAppError?: (error: Error) => void;
  onReceiveSubmission?: (submission: Submission) => void;
  onSolutionRun?: (solution: Blob) => void;
  onReceiveTaskSolution?: (solution: Blob) => void;
  onStudentAppActivity?: (
    action: string,
    data: Record<string, unknown>,
    solution: Blob,
  ) => void;
}

const EmbeddedApp = forwardRef<EmbeddedAppRef, Props>(function EmbeddedApp(
  {
    src,
    onAppAvailable,
    onAppError,
    onReceiveSubmission,
    onSolutionRun,
    onStudentAppActivity,
    onReceiveTaskSolution,
  },
  ref,
) {
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.loading,
  );
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setLoadingState(LoadingState.loading);
  }

  const onAvailable = useCallback(
    async (iframe: HTMLIFrameElement, api: PlatformCrtIframeApi) => {
      const response = await api.sendRequest("getHeight", undefined);

      iframe.style.height = `${response.result}px`;

      setLoadingState(LoadingState.available);
      onAppAvailable?.();
    },
    [onAppAvailable],
  );

  const { sendRequest, iframeRef } = useIframeChild(
    {
      postSubmission: async (request) => {
        onReceiveSubmission?.(request.params);
      },
      postTaskSolution: async (request) => {
        onReceiveTaskSolution?.(request.params.solution);
      },
      postSolutionRun: async (request) => {
        onSolutionRun?.(request.params);
      },
      postStudentAppActivity: async (request) => {
        onStudentAppActivity?.(
          request.params.action,
          request.params.data,
          request.params.solution,
        );
      },
    },
    onAvailable,
  );

  useEffect(() => {
    if (loadingState !== LoadingState.loading) {
      return;
    }

    const timeout = setTimeout(() => {
      if (loadingState === LoadingState.loading) {
        const error = new IFrameUnavailableError();

        setLoadingState(LoadingState.error);
        onAppError?.(error);
      }
    }, APP_IFRAME_LOAD_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [loadingState, onAppError]);

  useImperativeHandle(
    ref,
    () => ({
      sendRequest,
    }),
    [sendRequest],
  );

  return (
    // add key to the iframe to force a re-render when the src changes
    // https://www.aleksandrhovhannisyan.com/blog/react-iframes-back-navigation-bug/
    <IFrameWrapper>
      <StyledIFrame
        key={src}
        src={src}
        ref={iframeRef}
        allow="fullscreen; camera; microphone"
        sandbox="allow-scripts allow-same-origin allow-downloads allow-forms allow-modals"
        referrerPolicy="no-referrer-when-downgrade"
        loading="lazy"
      />
      {loadingState === LoadingState.loading && (
        <LoadingWrapper>
          <ProgressSpinner />
        </LoadingWrapper>
      )}
      {loadingState === LoadingState.error && (
        <LoadingWrapper>
          <ErrorMessage>
            <FormattedMessage
              id="EmbeddedApp.errorMessage"
              defaultMessage="Failed to load the app. Please try again later."
            />
          </ErrorMessage>
        </LoadingWrapper>
      )}
    </IFrameWrapper>
  );
});

export default EmbeddedApp;
