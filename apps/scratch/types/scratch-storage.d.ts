/// <reference path="../node_modules/@turbowarp/types/types/scratch-storage.d.ts" />

// extend type definition
declare namespace ScratchStorageExtended {
  export * from "../node_modules/@turbowarp/types/types/scratch-storage.d.ts";
}

declare class GUIScratchStorageExtended extends GUIScratchStorage {
  scratchFetch: {
    RequestMetadata: {
      ProjectId: string;
    }

    setMetadata: (projectId: string, projectId2: string | number) => void;
    unsetMetadata: (projectId: string) => void;
  };
}

declare module "scratch-storage" {
  export = StorageExtended;
  export default StorageExtended;
}
