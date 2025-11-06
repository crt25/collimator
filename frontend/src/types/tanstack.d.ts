import "@tanstack/react-table";

enum ColumnType {
  text = "text",
  icon = "icon",
  link = "link",
  tags = "tags",
}

declare module "@tanstack/react-table" {
  interface ColumnMeta {
    columnType?: ColumnType;
    icon?: React.ReactNode;
    linkHref?: string;
  }
}
