import { useEffect, useState } from "react";

async function blobToHash(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export const useFileHash = (fileData: Blob | undefined): string => {
  const [hash, setHash] = useState<string>("");

  useEffect(() => {
    if (fileData === undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHash("");
      return;
    }

    let isCancelled = false;

    blobToHash(fileData).then((hash) => {
      if (isCancelled) {
        return;
      }

      setHash(hash);
    });

    return (): void => {
      isCancelled = true;
    };
  }, [fileData]);

  return hash;
};
