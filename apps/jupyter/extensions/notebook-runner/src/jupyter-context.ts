import { createContext } from "react";
import { AppCrtIframeApi } from "./iframe-rpc/src";

export type JupyterContextValue = {
  sendRequest: AppCrtIframeApi["sendRequest"];
};

export const JupyterContext = createContext<JupyterContextValue>({
  sendRequest: () => {
    throw new Error("JupyterContext not initialized");
  },
});
