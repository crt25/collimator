import { useState } from "react";

async function blobToHash(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export const useFileHash = (fileData: Blob | undefined): string => {
  const [blob, setBlob] = useState<Blob>();
  const [hash, setHash] = useState<string>("");

  if (fileData === blob) {
    return hash;
  }

  if (fileData === undefined) {
    return "";
  }

  setBlob(fileData);
  blobToHash(fileData).then(setHash);

  return hash;
};
