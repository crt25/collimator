import { ContentsManager } from "@jupyterlab/services";
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";

export const copyFolderToKernel = async (
  kernel: IKernelConnection,
  contents: ContentsManager,
  sourcePath: string,
  destPath: string,
): Promise<void> => {
  try {
    const folder = await contents.get(sourcePath, { content: true });

    if (folder.type !== "directory") {
      throw new Error(`${sourcePath} is not a directory`);
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
        await copyFolderToKernel(kernel, contents, itemPath, itemDestPath);
      } else {
        const file = await contents.get(itemPath, {
          content: true,
          format: "base64",
        });
        await kernel.requestExecute({
          code: `
          import base64
          from pathlib import Path

          Path("${itemDestPath}").parent.mkdir(parents=True, exist_ok=True)
          with open("${itemDestPath}", "wb") as f:
              f.write(base64.b64decode("${file.content}"))
          `,
        }).done;
      }
    }
  } catch (e) {
    console.error(
      `Error copying folder from ${sourcePath} to ${destPath} in Pyodide:`,
      e,
    );
  }
};
