import { useParams } from "react-router-dom";
import Gui from "../containers/Gui";
import VM from "scratch-vm";
import { useCallback, useEffect, useState } from "react";
import {
  AppIFrameMessage,
  AppIFrameResponse,
} from "../../../../frontend/src/types/app-iframe-message";
import { patchScratchVm } from "../vm";
import { saveCrtProject } from "../vm/save-crt-project";
import { loadCrtProject } from "../vm/load-crt-project";

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

const Solve = () => {
  const { _sessionId, _taskId } = useParams();
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
    async (event: MessageEvent) => {
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
              result: new Blob([vm.toJSON()], {
                type: "application/json",
              }),
            });
          }
          break;
        case "getTask":
          if (vm) {
            saveCrtProject(vm).then((content) => {
              respondToMessageEvent(event, {
                procedure: "getTask",
                result: content,
              });
            });
          }
          break;
        case "loadTask":
          if (vm) {
            const sb3Project = await message.arguments.arrayBuffer();

            loadCrtProject(vm, sb3Project).then(() => {
              respondToMessageEvent(event, {
                procedure: "loadTask",
              });
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

  return (
    <Gui
      canEditTask={true}
      isCostumesTabEnabled={false}
      isSoundsTabEnabled={false}
      onStorageInit={(storageInstance: {
        addOfficialScratchWebStores: () => void;
      }) => storageInstance.addOfficialScratchWebStores()}
      basePath="/"
      onVmInit={(vm: VM) => {
        setVm(vm);
        patchScratchVm(vm);
      }}
    />
  );
};

export default Solve;
