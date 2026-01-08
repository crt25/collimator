import { Buffer } from "buffer";
import * as fs from "fs";
import * as path from "path";
import archiver from "archiver";

export const zipDirectory = (sourceDir: string): Promise<Buffer> => {
  const archive = archiver("zip", { zlib: { level: 9 } });

  const tempPath = fs.mkdtempSync("task-zip");
  const tempFile = path.resolve(tempPath, "my-task.zip");
  const stream = fs.createWriteStream(tempFile);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => {
      const file = fs.readFileSync(tempFile);

      fs.rmSync(tempPath, { recursive: true, force: true });

      return resolve(file);
    });
    archive.finalize();
  });
};
