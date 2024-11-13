import {
  AppIFrameMessage,
  AppIFrameRequest,
  AppIFrameResponse,
} from "@/types/app-iframe-message";
import styled from "@emotion/styled";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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

const MAX_COUNTER = 1000000;
let counter = 0;

const postMessageToIFrame = (
  iframe: HTMLIFrameElement,
  message: AppIFrameMessage,
) => {
  if (!iframe.contentWindow) {
    console.error(
      "Cannot post message to iframe without content window:",
      iframe,
    );
    return;
  }

  // get target origin from the iframe's src attribute
  const targetOrigin = new URL(iframe.src).origin;

  iframe.contentWindow.postMessage(message, {
    targetOrigin,
  });
};

export interface EmbeddedAppRef {
  sendRequest<ProcedureName extends AppIFrameRequest["procedure"]>(
    request: Omit<AppIFrameRequest, "id" | "type"> & {
      procedure: ProcedureName;
    },
  ): Promise<AppIFrameResponse & { procedure: ProcedureName }>;
}

export interface Props {
  src: string;
  onAppAvailable?: () => void;
}

const EmbeddedApp = forwardRef<EmbeddedAppRef, Props>(function EmbeddedApp(
  { src, onAppAvailable },
  ref,
) {
  const [iframe, setIFrame] = useState<HTMLIFrameElement | null>(null);
  const [isAppAvailable, setIsAppAvailable] = useState<boolean>(false);
  const isIFrameLoaded = useRef<boolean>(false);

  const pendingRequests = useRef<{
    [key: number]: (response: AppIFrameResponse) => void;
  }>({});

  const sendRequest = useCallback(
    <ProcedureName extends AppIFrameMessage["procedure"]>(
      request: Omit<AppIFrameRequest, "id" | "type"> & {
        procedure: ProcedureName;
      },
    ): Promise<AppIFrameResponse & { procedure: ProcedureName }> => {
      if (iframe && isIFrameLoaded.current) {
        return new Promise((resolve) => {
          // store the resolve function in the pendingRequests object
          pendingRequests.current[counter] = (response: AppIFrameResponse) => {
            if (response.procedure !== request.procedure) {
              console.error("Invalid response procedure", response, request);
              return;
            }

            resolve(
              response as AppIFrameResponse & { procedure: ProcedureName },
            );
          };

          // send the message to the iframe
          postMessageToIFrame(
            iframe,
            // add a unique id to the message
            {
              id: counter,
              type: "request",
              ...request,
            } as AppIFrameMessage,
          );

          // increment the counter
          counter = (counter + 1) % MAX_COUNTER;
        });
      }

      return Promise.reject(new Error("No iframe available"));
    },
    [iframe],
  );

  useImperativeHandle(
    ref,
    () => ({
      sendRequest,
    }),
    [sendRequest],
  );

  // a callback function that listens for messages from the iframe
  const handleIFrameMessage = useCallback(
    (event: MessageEvent) => {
      if (event.source !== iframe?.contentWindow) {
        return;
      }

      const message = event.data as AppIFrameMessage;

      if (message.type === "request") {
        console.error("Requests are not supported");
        return;
      }

      // get the resolve function from the pendingRequests object
      const resolve = pendingRequests.current[message.id];
      if (!resolve) {
        console.error("No resolve function found for message", message);
      }

      // call the resolve function with the message
      resolve(message);
      // remove the resolve function from the pendingRequests object
      delete pendingRequests.current[message.id];
    },
    [iframe],
  );

  // add an event listener to listen for messages from the iframe
  useEffect(() => {
    window.addEventListener("message", handleIFrameMessage);

    return () => {
      window.removeEventListener("message", handleIFrameMessage);
    };
  }, [handleIFrameMessage]);

  // after the iframe has been rendered, send a message to the iframe
  useEffect(() => {
    if (iframe) {
      const callback = async () => {
        isIFrameLoaded.current = true;

        const response = await sendRequest({
          procedure: "getHeight",
        });

        iframe.style.height = `${response.result}px`;

        setIsAppAvailable(true);
        if (onAppAvailable) {
          onAppAvailable();
        }
      };

      iframe.addEventListener("load", callback);

      return () => {
        if (iframe) {
          iframe.removeEventListener("load", callback);
        }
      };
    }
  }, [iframe, sendRequest, onAppAvailable]);

  // store the reference to the iframe element in a state value
  // this is only called once when the iframe is mounted
  // and once when it is unmounted due to the empty dependency array
  const getIFramRef = useCallback((node: HTMLIFrameElement | null) => {
    if (node !== null) {
      setIFrame(node);
    }

    // see https://legacy.reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <IFrameWrapper>
      <StyledIFrame
        src={src}
        ref={getIFramRef}
        allow="fullscreen; camera; microphone"
        sandbox="allow-scripts allow-same-origin allow-downloads allow-forms"
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
