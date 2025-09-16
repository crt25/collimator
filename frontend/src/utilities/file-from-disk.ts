export const readSingleFileFromDisk = (): Promise<Blob> => {
  const fileInput = document.createElement("input");
  fileInput.classList.add("d-none");
  fileInput.setAttribute("multiple", "false");

  document.body.appendChild(fileInput);

  return new Promise<Blob>((resolve, reject) => {
    let handled = false;

    fileInput.type = "file";
    fileInput.addEventListener("change", () => {
      if (!fileInput.files) {
        reject(new Error("No files found"));
        return;
      }

      if (fileInput.files.length > 1) {
        reject(new Error("Only one file is allowed"));
        return;
      }

      const file = fileInput.files[0];
      if (!file) {
        reject(new Error("No file found"));
        return;
      }

      resolve(file);
      fileInput.remove();
    });

    const handleFocus = () => {
      setTimeout(() => {
        if (!handled){
          reject(new Error("File reading was cancelled"));
          fileInput.remove();
        }
        window.removeEventListener("focus", handleFocus);
      }, 0);
    };
    window.addEventListener("focus", handleFocus);

    fileInput.click();
  }).catch((error) => {
    fileInput.remove();
    throw error;
  });
};
