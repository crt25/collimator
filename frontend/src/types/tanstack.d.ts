import { RowData } from "@tanstack/react-table";
import { ColumnType } from "./tanstack-types";
declare module "@tanstack/react-table" {
  // The TValue generic is required by TanStack Table but not used in our extension so we disable the unused vars rule for it.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    columnType?: ColumnType;
    icon?: React.ReactNode;
    linkHref?: string;
  }
}
