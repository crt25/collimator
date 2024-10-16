import { useParams } from "react-router-dom";
import Gui from "../containers/Gui";
import { registerCustomBlocks } from "../blocks/blocks";
import VM from "scratch-vm";
import { useCallback, useEffect, useState } from "react";
import {
  AppIFrameMessage,
  AppIFrameResponse,
} from "../../../../frontend/src/types/app-iframe-message";

const respondToMessageEvent = (
  event: MessageEvent,
  message: Omit<AppIFrameResponse, "id" | "type">,
) => {
  if (!event.source) {
    console.error("Cannot respond to event without source:", event);
    return;
  }

  event.source.postMessage(
    {
      id: event.data.id,
      type: "response",
      ...message,
    } as AppIFrameMessage,
    {
      targetOrigin: event.origin,
    },
  );
};

export const Solve = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sessionId, taskId } = useParams();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [vm, setVm] = useState<VM | null>(null);

  useEffect(() => {
    if (window.parent && window.parent !== window) {
      setIsInIframe(true);
    }

    setHasLoaded(true);
  }, []);

  // a callback function that listens for messages from the parent window
  const handleParentWindowMessage = useCallback(
    (event: MessageEvent) => {
      if (event.source !== window.parent) {
        return;
      }

      const message = event.data as AppIFrameMessage;

      if (message.type === "response") {
        console.error(
          `Response in AppIFrameMessage message: '${JSON.stringify(message)}'`,
        );
        return;
      }

      switch (message.procedure) {
        case "getHeight":
          respondToMessageEvent(event, {
            procedure: "getHeight",
            result: document.body.scrollHeight,
          });
          break;
        case "getSubmission":
          if (vm) {
            respondToMessageEvent(event, {
              procedure: "getSubmission",
              result: vm.toJSON(),
            });
          }
          break;
        default:
          break;
      }
    },
    [vm],
  );

  // add an event listener to listen for messages from the iFrame
  useEffect(() => {
    if (isInIframe) {
      window.addEventListener("message", handleParentWindowMessage);

      return () => {
        window.removeEventListener("message", handleParentWindowMessage);
      };
    }
  }, [handleParentWindowMessage, isInIframe]);

  if (!hasLoaded) {
    return null;
  }

  /*if (!isInIframe) {
    return (
      <div>Tasks can only be solved in the context of the CRT application.</div>
    );
  }*/

  return (
    <Gui
      showMenuBar={true}
      canEditTask={true}
      onStorageInit={(storageInstance: {
        addOfficialScratchWebStores: () => void;
      }) => storageInstance.addOfficialScratchWebStores()}
      basePath="/"
      onVmInit={(vm: VM) => {
        setVm(vm);
        registerCustomBlocks(vm);
      }}
    />
  );
};
