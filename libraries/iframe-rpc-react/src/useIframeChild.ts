import {
  IframeRpcApplicationResponse,
  IframeRpcPlatformMethods,
  IframeRpcPlatformRequest,
  PlatformCrtIframeApi,
  PlatformHandleRequestMap,
} from "iframe-rpc/src";
import { ParametersOf } from "iframe-rpc/src/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const useIframeChild = (
  handleRequest: PlatformHandleRequestMap,
  onAppAvailable: (
    iframe: HTMLIFrameElement,
    api: PlatformCrtIframeApi,
    /**
     * True when the iframe just fired a load event: its previous document -
     * and any request still in flight to it - is gone. False when the app is
     * re-announced only because the callback identity rotated.
     */
    justLoaded: boolean,
  ) => Promise<void>,
): {
  sendRequest: <Method extends IframeRpcPlatformMethods>(
    method: Method,
    parameters: ParametersOf<
      IframeRpcPlatformRequest & {
        method: Method;
      }
    >,
  ) => Promise<
    IframeRpcApplicationResponse & {
      method: Method;
    }
  >;
  iframeRef: (node: HTMLIFrameElement | null) => void;
} => {
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
  // track which iframe loaded because a replaced iframe may emit a late load event, which must not mark the new iframe as ready
  const currentIframe = useRef<HTMLIFrameElement | null>(null);
  const loadedIframe = useRef<HTMLIFrameElement | null>(null);

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
        if (currentIframe.current !== iframe) {
          return;
        }

        if (!iframe.contentWindow) {
          throw new Error(
            `After iframe load, contentWindow is not available: ${iframe.src}`,
          );
        }

        // finish configuring the API
        const targetOrigin = new URL(iframe.src).origin;
        crtPlatform.current.setOrigin(targetOrigin);
        // a load event represents a new document
        // reject requests owned by the old document
        crtPlatform.current.replaceTarget(iframe.contentWindow);

        loadedIframe.current = iframe;

        try {
          await onAppAvailable(iframe, crtPlatform.current, true);
        } catch (error) {
          // DOM event dispatch does not observe a returned promise.
          // handle the rejection here so failures do not become unhandled rejections
          console.error("Failed to initialize embedded app", error);
        }
      };

      if (loadedIframe.current === iframe) {
        // If the iframe has already been loaded, call immediately.
        // This is necessary when switching content in the embedded app, as
        // the load event may have already fired when the iframe was loaded.
        // Not awaited (we are in a synchronous effect), so guard against an
        // async consumer rejection becoming an unhandled rejection.
        void onAppAvailable(iframe, crtPlatform.current, false).catch(
          console.error,
        );
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
    if (currentIframe.current !== node) {
      currentIframe.current = node;
      loadedIframe.current = null;
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
