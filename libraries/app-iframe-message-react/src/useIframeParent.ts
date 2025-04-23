import {
  AppCrtIframeApi,
  AppHandleRequestMap,
  AppIFrameApplicationProcedures,
  AppIFrameApplicationRequest,
  AppIFramePlatformResponse,
} from "app-iframe-message/src";
import { useEffect, useMemo, useRef, useState } from "react";

export const useIframeParent = (
  handleRequest: AppHandleRequestMap,
): {
  isInIframe: boolean;
  hasLoaded: boolean;

  sendRequest: <ProcedureName extends AppIFrameApplicationProcedures>(
    request: Omit<AppIFrameApplicationRequest, "id" | "type"> & {
      procedure: ProcedureName;
    },
  ) => Promise<
    AppIFramePlatformResponse & { procedure: ProcedureName; type: "response" }
  >;
} => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [taskOrigin, setTaskOrigin] = useState<string | null>(null);

  const modifiedHandleRequest = useMemo(
    () => ({
      ...handleRequest,
      loadTask: async (
        ...args: Parameters<typeof handleRequest.loadTask>
      ): ReturnType<typeof handleRequest.loadTask> => {
        setTaskOrigin(args[1].origin);

        return handleRequest.loadTask(...args);
      },
    }),
    [handleRequest],
  );

  const crtPlatform = useRef<AppCrtIframeApi>(
    new AppCrtIframeApi(modifiedHandleRequest),
  );

  useEffect(() => {
    crtPlatform.current.setOnRequest(modifiedHandleRequest);
  }, [modifiedHandleRequest]);

  useEffect(() => {
    crtPlatform.current.setOrigin(taskOrigin);
  }, [taskOrigin]);

  // when mounting, check whether we are in an iframe
  useEffect(() => {
    if (window.parent && window.parent !== window) {
      crtPlatform.current.setTarget(window.parent);
      setIsInIframe(true);
    }

    // also only set the hasLoaded variable after the rendering finished
    setHasLoaded(true);
  }, []);

  // add an event listener to listen for messages from the iFrame
  useEffect(() => {
    const eventHandler = crtPlatform.current.handleWindowMessage.bind(
      crtPlatform.current,
    );

    if (isInIframe) {
      window.addEventListener("message", eventHandler);

      return (): void => {
        window.removeEventListener("message", eventHandler);
      };
    }
  }, [isInIframe]);

  const sendRequest = useMemo(
    () => crtPlatform.current.sendRequest.bind(crtPlatform.current),
    [crtPlatform.current],
  );

  return {
    isInIframe,
    hasLoaded,
    sendRequest,
  };
};
