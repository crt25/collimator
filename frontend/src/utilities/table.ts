import { DataTableRowClickEvent } from "primereact/datatable";

export const isClickOnRow = (e: DataTableRowClickEvent): boolean => {
  if (
    e.originalEvent.target instanceof Element &&
    (e.originalEvent.target.tagName === "TD" ||
      e.originalEvent.target.tagName === "SPAN")
  ) {
    return true;
  }
  return false;
};
