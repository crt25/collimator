import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppIFrameMessage,
  AppIFrameRequest,
  AppIFrameResponse,
} from "../../../../frontend/src/types/app-iframe-message";

const MAX_COUNTER = 1000000;

const sendMessage = (
  window: Window | MessagePort | ServiceWorker,
  message: AppIFrameMessage,
  targetOrigin: string,
): void =>
  window.postMessage(message, {
    targetOrigin: targetOrigin,
  });

const respondToMessageEvent = (
  event: MessageEvent,
  message: Omit<AppIFrameResponse, "id" | "type">,
): void => {
  if (!event.source) {
    console.error("Cannot respond to event without source:", event);
    return;
  }

  return sendMessage(
    event.source,
    {
      id: event.data.id,
      type: "response",
      ...message,
    } as AppIFrameMessage,
    event.origin,
  );
};

export const useIframeParent = (
  handleRequest: (
    request: AppIFrameRequest,
    respondToMessageEvent: (
      message: Omit<AppIFrameResponse, "id" | "type">,
    ) => void,
  ) => Promise<void>,
): {
  isInIframe: boolean;
  hasLoaded: boolean;

  sendRequest: <ProcedureName extends AppIFrameMessage["procedure"]>(
    request: Omit<AppIFrameRequest, "id" | "type"> & {
      procedure: ProcedureName;
    },
  ) => Promise<AppIFrameResponse & { procedure: ProcedureName }>;
} => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [taskOrigin, setTaskOrigin] = useState<string | null>(null);

  const counter = useRef<number>(0);
  const pendingRequests = useRef<{
    [key: number]: (response: AppIFrameResponse) => void;
  }>({});

  const sendRequest = useCallback(
    <ProcedureName extends AppIFrameMessage["procedure"]>(
      request: Omit<AppIFrameRequest, "id" | "type"> & {
        procedure: ProcedureName;
      },
    ): Promise<AppIFrameResponse & { procedure: ProcedureName }> => {
      if (!taskOrigin) {
        return Promise.reject(
          new Error(
            "Cannot send messages (yet) because no task origin has been set (i.e. no task has been loaded so far)",
          ),
        );
      }

      return new Promise((resolve) => {
        // store the resolve function in the pendingRequests object
        pendingRequests.current[counter.current] = (
          response: AppIFrameResponse,
        ): void => {
          if (response.procedure !== request.procedure) {
            console.error("Invalid response procedure", response, request);
            return;
          }

          resolve(response as AppIFrameResponse & { procedure: ProcedureName });
        };

        // send the message to the iframe
        sendMessage(
          window.parent,
          // add a unique id to the message
          {
            id: counter.current,
            type: "request",
            ...request,
          } as AppIFrameMessage,
          taskOrigin,
        );

        // increment the counter
        counter.current = (counter.current + 1) % MAX_COUNTER;
      });
    },
    [taskOrigin],
  );

  // a callback function that listens for messages from the parent window
  const handleParentWindowMessage = useCallback(
    async (event: MessageEvent) => {
      if (event.source !== window.parent) {
        return;
      }

      const message = event.data as AppIFrameMessage;

      if (message.type === "response") {
        // get the resolve function from the pendingRequests object
        const resolve = pendingRequests.current[message.id];
        if (!resolve) {
          console.error("No resolve function found for message", message);
        }

        // call the resolve function with the message
        resolve(message);
        // remove the resolve function from the pendingRequests object
        delete pendingRequests.current[message.id];

        return;
      }

      if (message.procedure === "loadTask") {
        setTaskOrigin(event.origin);
      }

      return handleRequest(message, (response) =>
        respondToMessageEvent(event, response),
      );
    },
    [handleRequest],
  );

  // when mounting, check whether we are in an iframe
  useEffect(() => {
    if (window.parent && window.parent !== window) {
      setIsInIframe(true);
    }

    // also only set the hasLoaded variable after the rendering finished
    setHasLoaded(true);
  }, []);

  // add an event listener to listen for messages from the iFrame
  useEffect(() => {
    if (isInIframe) {
      window.addEventListener("message", handleParentWindowMessage);

      return (): void => {
        window.removeEventListener("message", handleParentWindowMessage);
      };
    }
  }, [handleParentWindowMessage, isInIframe]);

  return {
    isInIframe,
    hasLoaded,
    sendRequest,
  };
};
