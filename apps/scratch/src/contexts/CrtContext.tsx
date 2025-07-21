import { createContext } from "react";
import { useEmbeddedScratch } from "../hooks/useEmbeddedScratch";

export type CrtContextValue = {
  sendRequest: ReturnType<typeof useEmbeddedScratch>["sendRequest"];
};

export const CrtContext = createContext<CrtContextValue>({
  sendRequest: () => {
    throw new Error("CrtContext not initialized");
  },
});
