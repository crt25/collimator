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

const StyledIFrame = styled.iframe`
  width: 100%;
  border: none;

  flex-grow: 1;
`;

const MAX_COUNTER = 1000000;
let counter = 0;

const postMessageToIFrame = (
  iFrame: HTMLIFrameElement,
  message: AppIFrameMessage,
) => {
  if (!iFrame.contentWindow) {
    console.error(
      "Cannot post message to iframe without content window:",
      iFrame,
    );
    return;
  }

  // get target origin from the iframe's src attribute
  const targetOrigin = new URL(iFrame.src).origin;

  iFrame.contentWindow.postMessage(message, {
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

interface Props {
  src: string;
}

const EmbeddedApp = forwardRef<EmbeddedAppRef, Props>(function EmbeddedApp(
  { src },
  ref,
) {
  const [iFrame, setIFrame] = useState<HTMLIFrameElement | null>(null);
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
      if (iFrame && isIFrameLoaded.current) {
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

          // send the message to the iFrame
          postMessageToIFrame(
            iFrame,
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

      return Promise.reject("No iFrame available");
    },
    [iFrame],
  );

  useImperativeHandle(
    ref,
    () => ({
      sendRequest,
    }),
    [sendRequest],
  );

  // a callback function that listens for messages from the iFrame
  const handleIFrameMessage = useCallback(
    (event: MessageEvent) => {
      if (event.source !== iFrame?.contentWindow) {
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
    [iFrame],
  );

  // add an event listener to listen for messages from the iFrame
  useEffect(() => {
    window.addEventListener("message", handleIFrameMessage);

    return () => {
      window.removeEventListener("message", handleIFrameMessage);
    };
  }, [handleIFrameMessage]);

  // after the iFrame has been rendered, send a message to the iFrame
  useEffect(() => {
    if (iFrame) {
      const callback = async () => {
        isIFrameLoaded.current = true;

        const response = await sendRequest({
          procedure: "getHeight",
        });

        iFrame.style.height = `${response.result}px`;
      };
      iFrame.addEventListener("load", callback);

      return () => {
        if (iFrame) {
          iFrame.removeEventListener("load", callback);
        }
      };
    }
  }, [iFrame, sendRequest]);

  // store the reference to the iFrame element in a state value
  // this is only called once when the iFrame is mounted
  // and once when it is unmounted due to the empty dependency array
  const getIFramRef = useCallback((node: HTMLIFrameElement | null) => {
    if (node !== null) {
      setIFrame(node);
    }

    // see https://legacy.reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledIFrame
      src={src}
      ref={getIFramRef}
      allow="fullscreen; camera; microphone"
      sandbox="allow-scripts allow-same-origin allow-downloads"
      referrerPolicy="no-referrer-when-downgrade"
      loading="lazy"
    />
  );
});

export default EmbeddedApp;
