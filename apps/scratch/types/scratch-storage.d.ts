/// <reference path="../node_modules/@turbowarp/types/types/scratch-storage.d.ts" />

// extend type definition
declare namespace ScratchStorageExtended {
  export * from "../node_modules/@turbowarp/types/types/scratch-storage.d.ts";
}

declare module "scratch-storage" {
  declare class ScratchStorage extends GUIScratchStorage {
    scratchFetch: {
      RequestMetadata: {
        ProjectId: string;
      }

      setMetadata: (projectId: string, projectId2: string | number) => void;
      unsetMetadata: (projectId: string) => void;
    };

    setAssetHost(assetHost: string): void;
    setTranslatorFunction(translator: (message: ReactIntl.FormattedMessage.MessageDescriptor) => string): void;
    addOfficialScratchWebStores(): void;
  }
}
