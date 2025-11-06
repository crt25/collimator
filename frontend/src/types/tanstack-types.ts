import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  PaginationState,
  RowSelectionState,
  VisibilityState,
  ExpandedState,
  GroupingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  ColumnOrderState,
  ColumnPinningState,
} from "@tanstack/react-table";

export enum ColumnType {
  text = "text",
  icon = "icon",
  link = "link",
  tags = "tags",
}

type DataTableColumn = {
  accessorKey: string;
  label: string;
};

/**
 * This interface defines the set of features that can be enabled for the custom DataTable component.
 * @see https://tanstack.com/table/latest/docs/introduction (feature-guides section)
 */
interface DataTableFeatures {
  /**
   * This allows column ordering functionality.
   */
  columnOrdering?: boolean;

  /**
   * This allows column pinning functionality.
   */
  columnPinning?: {
    left?: string[];
    right?: string[];
  };

  /**
   * This allows column sizing functionality.
   * Users can resize columns manually or automatically.
   */
  columnSizing?: boolean;

  /**
   * This allows column visibility toggle.
   */
  columnVisibility?: boolean;

  /**
   * This allows column-specific filtering
   * Users can filter data by specific column values
   */
  columnFiltering?: {
    columns: DataTableColumn[];
  };

  /**
   * This enables fuzzy filtering.
   * Allows for approximate string matching when filtering
   */
  fuzzyFiltering?: boolean;

  /**
   * This generates lists of unique values for specific columns in the table
   */
  columnFaceting?: {
    columns: DataTableColumn[];
  };

  /**
   * This generates lists of unique values for all columns from the table's data.
   */
  globalFaceting?: boolean;

  /**
   * This allows rows to be grouped by specific column values.
   */
  grouping?: {
    columns: DataTableColumn[];
  };

  /**
   * This allows additional rows of data related to a specific row to be shown/hidden.
   */
  expanding?: boolean;

  /**
   * This divides the table data into pages.
   */
  pagination?: {
    pageSize: number;
  };

  /**
   * This allows rows to be pinned to the top or bottom of the table
   */
  rowPinning?: {
    top?: number[];
    bottom?: number[];
  };

  /**
   * This allows users to select rows using checkboxes.
   */
  rowSelection?: boolean;

  /**
   * This allows users to sort data by clicking on column headers.
   */
  sorting?: boolean;

  /**
   * This renders only visible rows to improve performance with large datasets.
   */
  virtualization?: boolean;
}

export interface DatatableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  features?: DataTableFeatures;
  variant?: "outline" | "line";
}

export interface RowModels<T> {
  getCoreRowModel: ReturnType<typeof getCoreRowModel<T>>;
  getSortedRowModel?: ReturnType<typeof getSortedRowModel<T>>;
  getFilteredRowModel?: ReturnType<typeof getFilteredRowModel<T>>;
  getFacetedRowModel?: ReturnType<typeof getFacetedRowModel<T>>;
  getFacetedUniqueValues?: ReturnType<typeof getFacetedUniqueValues<T>>;
  getFacetedMinMaxValues?: ReturnType<typeof getFacetedMinMaxValues<T>>;
  getPaginationRowModel?: ReturnType<typeof getPaginationRowModel<T>>;
  getExpandedRowModel?: ReturnType<typeof getExpandedRowModel<T>>;
  getGroupedRowModel?: ReturnType<typeof getGroupedRowModel<T>>;
}

export interface DataTableState {
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  pagination?: PaginationState;
  rowSelection?: RowSelectionState;
  columnVisibility?: VisibilityState;
  columnOrder?: ColumnOrderState;
  columnPinning?: ColumnPinningState;
  grouping?: GroupingState;
  expanded?: ExpandedState;
}

export interface DataTableCallbacks {
  onSortingChange?: (
    updater: SortingState | ((old: SortingState) => SortingState),
  ) => void;
  onColumnFiltersChange?: (
    updater:
      | ColumnFiltersState
      | ((old: ColumnFiltersState) => ColumnFiltersState),
  ) => void;
  onPaginationChange?: (
    updater: PaginationState | ((old: PaginationState) => PaginationState),
  ) => void;
  onRowSelectionChange?: (
    updater:
      | RowSelectionState
      | ((old: RowSelectionState) => RowSelectionState),
  ) => void;
  onColumnVisibilityChange?: (
    updater: VisibilityState | ((old: VisibilityState) => VisibilityState),
  ) => void;
  onGroupingChange?: (
    updater: GroupingState | ((old: GroupingState) => GroupingState),
  ) => void;
  onExpandedChange?: (
    updater: ExpandedState | ((old: ExpandedState) => ExpandedState),
  ) => void;
  onColumnPinningChange?: (
    updater:
      | ColumnPinningState
      | ((old: ColumnPinningState) => ColumnPinningState),
  ) => void;
  onColumnOrderChange?: (
    updater: ColumnOrderState | ((old: ColumnOrderState) => ColumnOrderState),
  ) => void;
}
