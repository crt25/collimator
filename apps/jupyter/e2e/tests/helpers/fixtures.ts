import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FileData, fileData } from "./host";

const fixtures = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "fixtures",
);

const zip = (name: string): FileData =>
  fileData(readFileSync(path.join(fixtures, name)), "application/zip");

/**
 * A task as a teacher would import it: a zip containing a single notebook.
 */
export const genericNotebookTask = (): FileData => zip("task.zip");

/**
 * Not a task at all.
 */
export const invalidTask = (): FileData =>
  fileData(Buffer.from("this is not a task"), "text/plain");

// zip archives start with the bytes "PK"
export const isZip = (content: Buffer): boolean =>
  content.subarray(0, 2).toString("latin1") === "PK";
