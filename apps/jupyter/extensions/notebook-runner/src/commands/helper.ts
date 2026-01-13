import { Contents, ContentsManager } from "@jupyterlab/services";
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
import { showErrorMessage } from "@jupyterlab/apputils";
import {
  executePythonInKernel,
  writeBinaryToVirtualFilesystem,
} from "../utils";
import { DirectoryNotFoundError } from "../errors/task-errors";
import { EmbeddedPythonCallbacks } from "../iframe-api";
import {
  AssignNotebookFormatException,
  CannotReadNotebookException,
} from "../errors/otter-errors";

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
  await copyFolderToKernelIfExists(
    kernel,
    contentsManager,
    EmbeddedPythonCallbacks.dataLocation,
    kernelPaths.data,
  );

  await copyFolderToKernelIfExists(
    kernel,
    contentsManager,
    EmbeddedPythonCallbacks.srcLocation,
    kernelPaths.src,
  );

  await copyFolderToKernelIfExists(
    kernel,
    contentsManager,
    EmbeddedPythonCallbacks.gradingDataLocation,
    kernelPaths.gradingData,
  );

  await copyFolderToKernelIfExists(
    kernel,
    contentsManager,
    EmbeddedPythonCallbacks.gradingSrcLocation,
    kernelPaths.gradingSrc,
  );
};

const copyFolderToKernelIfExists = async (
  kernel: IKernelConnection,
  contents: ContentsManager,
  sourcePath: string,
  destPath: string,
): Promise<void> => {
  try {
    await copyFolderToKernel(kernel, contents, sourcePath, destPath);
  } catch (error) {
    if (error instanceof DirectoryNotFoundError) {
      console.warn(
        `Warning: ${error.message}. Continuing without copying ${sourcePath} folder.`,
      );
    } else {
      throw error; // Re-throw if it's a different error
    }
  }
};

const copyFolderToKernel = async (
  kernel: IKernelConnection,
  contents: ContentsManager,
  sourcePath: string,
  destPath: string,
): Promise<void> => {
  let folder: Contents.IModel;

  try {
    folder = await contents.get(sourcePath, { content: true });
  } catch (e) {
    console.debug(
      `Error accessing ${sourcePath}:`,
      e,
      ". Treating as not found.",
    );

    throw new DirectoryNotFoundError(sourcePath);
  }

  if (folder.type !== "directory") {
    throw new DirectoryNotFoundError(sourcePath);
  }

  await executePythonInKernel({
    kernel,
    code: `
      from pathlib import Path
      Path("${destPath}").mkdir(parents=True, exist_ok=True)
      `,
  });

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
};

export const handleOtterCommandError = (error: unknown): void => {
  if (error instanceof AssignNotebookFormatException) {
    showErrorMessage(
      "Notebook Format Error",
      `There was an error with the format of the notebook used for assignment: ${error.message}`,
    );
    return;
  }

  if (error instanceof CannotReadNotebookException) {
    showErrorMessage(
      "Cannot Read Notebook",
      `The notebook runner could not read the notebook at ${error.message}. Try again if it keeps failing, report this issue.`,
    );
    return;
  }

  showErrorMessage(
    "Error Running Assign",
    `An unexpected error occurred while running the assign command: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
};
