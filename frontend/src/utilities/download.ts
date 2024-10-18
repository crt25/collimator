export const downloadBlob = (blob: Blob, fileName: string): void => {
  const a = document.createElement("a");
  a.classList.add("d-none");
  document.body.appendChild(a);

  const url = window.URL.createObjectURL(blob);

  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);

  a.remove();
};
