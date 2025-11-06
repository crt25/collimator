import { RowData } from "@tanstack/react-table";
import { ColumnType } from "./tanstack-types";
declare module "@tanstack/react-table" {
  interface ColumnMeta {
    columnType?: ColumnType;
    icon?: React.ReactNode;
    linkHref?: string;
  }
}
