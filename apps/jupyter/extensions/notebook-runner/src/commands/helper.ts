import { ContentsManager } from "@jupyterlab/services";
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
import { writeBinaryToVirtualFilesystem } from "../utils";
import { DirectoryNotFoundError } from "../errors/task-errors";
import { EmbeddedPythonCallbacks } from "../iframe-api";

export const kernelPaths = {
  data: "/data",
  src: "/src",
  gradingData: "/grading_data",
  gradingSrc: "/grading_src",
  student: "/student",
  autograder: "/autograder",
  results: "/results.pkl",
  resultsJson: "/results.json",
} as const;

export const copyRequiredFoldersToKernel = async (
  kernel: IKernelConnection,
  contentsManager: ContentsManager,
): Promise<void> => {
  await copyFolderToKernel(
    kernel,
    contentsManager,
    EmbeddedPythonCallbacks.dataLocation,
    kernelPaths.data,
  );
  await copyFolderToKernel(
    kernel,
    contentsManager,
    EmbeddedPythonCallbacks.srcLocation,
    kernelPaths.src,
  );
  await copyFolderToKernel(
    kernel,
    contentsManager,
    EmbeddedPythonCallbacks.gradingDataLocation,
    kernelPaths.gradingData,
  );
  await copyFolderToKernel(
    kernel,
    contentsManager,
    EmbeddedPythonCallbacks.gradingSrcLocation,
    kernelPaths.gradingSrc,
  );
};

const copyFolderToKernel = async (
  kernel: IKernelConnection,
  contents: ContentsManager,
  sourcePath: string,
  destPath: string,
): Promise<void> => {
  try {
    const folder = await contents.get(sourcePath, { content: true });

    if (folder.type !== "directory") {
      throw new DirectoryNotFoundError(sourcePath);
    }

    await kernel.requestExecute({
      code: `
      from pathlib import Path
      Path("${destPath}").mkdir(parents=True, exist_ok=True)
      `,
    }).done;

    for (const item of folder.content || []) {
      const itemPath = `${sourcePath}/${item.name}`;
      const itemDestPath = `${destPath}/${item.name}`;

      if (item.type === "directory") {
        // Recursively copy subdirectory
        await copyFolderToKernel(kernel, contents, itemPath, itemDestPath);
        continue;
      }

      const file = await contents.get(itemPath, {
        content: true,
        format: "base64",
      });

      await writeBinaryToVirtualFilesystem(kernel, itemDestPath, file.content);
    }
  } catch (e) {
    console.error(
      `Error copying folder from ${sourcePath} to ${destPath} in Pyodide:`,
      e,
    );
  }
};
