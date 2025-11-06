import "@tanstack/react-table";

enum ColumnType {
  text = "text",
  icon = "icon",
  tags = "tags",
}

declare module "@tanstack/react-table" {
  interface ColumnMeta {
    columnType?: ColumnType;
    icon?: React.ReactNode;
  }
}
