import {
  AppIFrameApplicationResponse,
  AppIFramePlatformProcedures,
  AppIFramePlatformRequest,
  PlatformCrtIframeApi,
  PlatformHandleRequestMap,
} from "app-iframe-message/src";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const useIframeChild = (
  handleRequest: PlatformHandleRequestMap,
  onAppAvailable: (
    iframe: HTMLIFrameElement,
    api: PlatformCrtIframeApi,
  ) => Promise<void>,
): {
  sendRequest: <ProcedureName extends AppIFramePlatformProcedures>(
    request: Omit<AppIFramePlatformRequest, "id" | "type"> & {
      procedure: ProcedureName;
    },
  ) => Promise<
    AppIFrameApplicationResponse & {
      procedure: ProcedureName;
      type: "response";
    }
  >;
  iframeRef: (node: HTMLIFrameElement | null) => void;
} => {
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
  const isIFrameLoaded = useRef<boolean>(false);

  const crtPlatform = useRef<PlatformCrtIframeApi>(
    new PlatformCrtIframeApi(handleRequest),
  );

  useEffect(() => {
    crtPlatform.current.setOnRequest(handleRequest);
  }, [handleRequest]);

  // add an event listener to listen for messages from the iFrame
  useEffect(() => {
    const eventHandler = crtPlatform.current.handleWindowMessage.bind(
      crtPlatform.current,
    );

    window.addEventListener("message", eventHandler);

    return (): void => {
      window.removeEventListener("message", eventHandler);
    };
  }, []);

  // after the iframe has been rendered, send a message to the iframe
  useEffect(() => {
    if (iframe) {
      const callback = async (): Promise<void> => {
        if (!iframe.contentWindow) {
          throw new Error(
            `After iframe load, contentWindow is not available: ${iframe.src}`,
          );
        }

        // finish configuring the API
        const targetOrigin = new URL(iframe.src).origin;
        crtPlatform.current.setOrigin(targetOrigin);
        crtPlatform.current.setTarget(iframe.contentWindow);

        isIFrameLoaded.current = true;

        await onAppAvailable(iframe, crtPlatform.current);
      };

      if (isIFrameLoaded.current) {
        // If the iframe has already been loaded, call immediately.
        // This is necessary when switching content in the embedded app, as
        // the load event may have already fired when the iframe was loaded.
        onAppAvailable(iframe, crtPlatform.current);
      }

      iframe.addEventListener("load", callback);

      return (): void => {
        if (iframe) {
          iframe.removeEventListener("load", callback);
        }
      };
    }
  }, [iframe, onAppAvailable]);

  // store the reference to the iframe element in a state value
  // this is only called once when the iframe is mounted
  // and once when it is unmounted due to the empty dependency array
  const getIframeRef = useCallback((node: HTMLIFrameElement | null) => {
    if (node !== null) {
      setIframe(node);
    }

    // see https://legacy.reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  }, []);

  const sendRequest = useMemo(
    () => crtPlatform.current.sendRequest.bind(crtPlatform.current),
    [crtPlatform.current],
  );

  return {
    sendRequest,
    iframeRef: getIframeRef,
  };
};
