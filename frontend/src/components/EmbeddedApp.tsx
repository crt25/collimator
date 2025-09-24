import styled from "@emotion/styled";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import {
  useIframeChild,
  PlatformCrtIframeApi,
  Submission,
} from "iframe-rpc-react/src";
import ProgressSpinner from "./ProgressSpinner";

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

export interface EmbeddedAppRef {
  sendRequest: ReturnType<typeof useIframeChild>["sendRequest"];
}

export interface Props {
  src: string;
  onAppAvailable?: () => void;
  onReceiveSubmission?: (submission: Submission) => void;
  onSolutionRun?: (solution: Blob) => void;
  onStudentActivity?: (action: string, blockId: string) => void;
}

const EmbeddedApp = forwardRef<EmbeddedAppRef, Props>(function EmbeddedApp(
  {
    src,
    onAppAvailable,
    onReceiveSubmission,
    onSolutionRun,
    onStudentActivity,
  },
  ref,
) {
  const [isAppAvailable, setIsAppAvailable] = useState<boolean>(false);

  const onAvailable = useCallback(
    async (iframe: HTMLIFrameElement, api: PlatformCrtIframeApi) => {
      const response = await api.sendRequest("getHeight", undefined);

      iframe.style.height = `${response.result}px`;

      setIsAppAvailable(true);

      if (onAppAvailable) {
        onAppAvailable();
      }
    },
    [onAppAvailable],
  );

  const { sendRequest, iframeRef } = useIframeChild(
    {
      postSubmission: async (request) => {
        onReceiveSubmission?.(request.params);
      },
      postSolutionRun: async (request) => {
        onSolutionRun?.(request.params);
      },
      postStudentActivity: async (request) => {
        onStudentActivity?.(request.params.action, request.params.blockId);
      },
    },
    onAvailable,
  );

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
      {!isAppAvailable && (
        <LoadingWrapper>
          <ProgressSpinner />
        </LoadingWrapper>
      )}
    </IFrameWrapper>
  );
});

export default EmbeddedApp;
