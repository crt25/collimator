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
  useReactTable,
  flexRender,
  getExpandedRowModel,
  getGroupedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  TableOptions,
  ColumnOrderState,
  ColumnPinningState,
} from "@tanstack/react-table";

import { Table, HStack, Stack } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { LuArrowUp, LuArrowDown } from "react-icons/lu";
import styled from "@emotion/styled";
import { defineMessages, useIntl } from "react-intl";
import Input from "./form/Input";
import Button from "./Button";
import Dropdown, { DropdownItem } from "./Dropdown";

const TableWrapper = styled.div`
  margin: 1rem 0;
`;

const SortIcon = ({ isSorted }: { isSorted: false | "asc" | "desc" }) => {
  if (isSorted === "asc") {
    return <LuArrowUp size={16} />;
  }

  return <LuArrowDown size={16} />;
};

export type DataTableColumn = {
  accessorKey: string;
  label: string;
};

/**
 * This interface defines the set of features that can be enabled for the custom DataTable component.
 * @see https://tanstack.com/table/latest/docs/introduction (feature-guides section)
 */
export interface DataTableFeatures {
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

interface RowModels<T> {
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

interface DataTableState {
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

interface DataTableCallbacks {
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

const messages = defineMessages({
  searchPlaceholder: {
    id: "datatable.placeholder.search",
    defaultMessage: "Search...",
  },
  inputLabel: {
    id: "datatable.label.search",
    defaultMessage: "Search",
  },
  filterByPlaceholder: {
    id: "datatable.placeholder.filterBy",
    defaultMessage: "Search...",
  },
  filterDropdownTrigger: {
    id: "datatable.label.filterBy",
    defaultMessage: "Filter by...",
  },
  previousButton: {
    id: "datatable.button.previous",
    defaultMessage: "Previous",
  },
  nextButton: {
    id: "datatable.button.next",
    defaultMessage: "Next",
  },
  pageInfo: {
    id: "datatable.label.pageInfo",
    defaultMessage: "Page {pageIndex} of {pageCount}",
  },
  loadingState: {
    id: "datatable.state.loading",
    defaultMessage: "Loading...",
  },
});

export const ChakraDataTable = <T extends { id: number }>({
  data,
  columns,
  isLoading,
  onRowClick,
  features,
  variant = "outline",
}: DatatableProps<T>) => {
  const intl = useIntl();

  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanding, setExpanding] = useState<ExpandedState>({});

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filterColumn, setFilterColumn] = useState<string>(
    features?.columnFiltering?.columns?.[0]?.accessorKey || "",
  );

  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: features?.columnPinning?.left || [],
    right: features?.columnPinning?.right || [],
  });
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: features?.pagination?.pageSize || 10,
  });

  const rowModels = useMemo((): Partial<RowModels<T>> => {
    const models: Partial<RowModels<T>> = {
      getCoreRowModel: getCoreRowModel(),
    };

    if (features?.sorting) {
      models.getSortedRowModel = getSortedRowModel();
    }

    if (features?.columnFiltering) {
      models.getFilteredRowModel = getFilteredRowModel();
    }

    if (features?.pagination) {
      models.getPaginationRowModel = getPaginationRowModel();
    }

    if (features?.grouping) {
      models.getGroupedRowModel = getGroupedRowModel();
    }

    if (features?.expanding) {
      models.getExpandedRowModel = getExpandedRowModel();
    }

    if (features?.columnFaceting?.columns || features?.globalFaceting) {
      models.getFacetedRowModel = getFacetedRowModel();
      models.getFacetedUniqueValues = getFacetedUniqueValues();
      models.getFacetedMinMaxValues = getFacetedMinMaxValues();
    }

    return models;
  }, [features]);

  const state = useMemo((): DataTableState => {
    const stateObject: DataTableState = {};

    if (features?.sorting) {
      stateObject.sorting = sorting;
    }

    if (features?.columnFiltering?.columns) {
      stateObject.columnFilters = columnFilters;
    }

    if (features?.pagination) {
      stateObject.pagination = pagination;
    }

    if (features?.rowSelection) {
      stateObject.rowSelection = rowSelection;
    }

    if (features?.columnVisibility) {
      stateObject.columnVisibility = columnVisibility;
    }

    if (features?.columnOrdering) {
      stateObject.columnOrder = columnOrder;
    }

    if (features?.columnPinning) {
      stateObject.columnPinning = columnPinning;
    }

    if (features?.grouping) {
      stateObject.grouping = grouping;
    }

    if (features?.expanding) {
      stateObject.expanded = expanding;
    }

    return stateObject;
  }, [
    features,
    sorting,
    columnFilters,
    pagination,
    rowSelection,
    columnVisibility,
    columnOrder,
    columnPinning,
    grouping,
    expanding,
  ]);

  const callbacks = useMemo((): DataTableCallbacks => {
    const callbacksObject: DataTableCallbacks = {};

    if (features?.sorting) {
      callbacksObject.onSortingChange = setSorting;
    }

    if (features?.columnFiltering?.columns) {
      callbacksObject.onColumnFiltersChange = setColumnFilters;
    }

    if (features?.pagination) {
      callbacksObject.onPaginationChange = setPagination;
    }

    if (features?.rowSelection) {
      callbacksObject.onRowSelectionChange = setRowSelection;
    }

    if (features?.columnVisibility) {
      callbacksObject.onColumnVisibilityChange = setColumnVisibility;
    }

    if (features?.columnOrdering) {
      callbacksObject.onColumnOrderChange = setColumnOrder;
    }

    if (features?.columnPinning) {
      callbacksObject.onColumnPinningChange = setColumnPinning;
    }

    if (features?.grouping) {
      callbacksObject.onGroupingChange = setGrouping;
    }

    if (features?.expanding) {
      callbacksObject.onExpandedChange = setExpanding;
    }

    return callbacksObject;
  }, [features]);

  const buildTableConfig = (): TableOptions<T> => ({
    data,
    columns,
    state,
    getCoreRowModel: getCoreRowModel<T>(),
    ...(rowModels.getSortedRowModel && {
      getSortedRowModel: rowModels.getSortedRowModel,
    }),
    ...(rowModels.getFilteredRowModel && {
      getFilteredRowModel: rowModels.getFilteredRowModel,
    }),
    ...(rowModels.getPaginationRowModel && {
      getPaginationRowModel: rowModels.getPaginationRowModel,
    }),
    ...(rowModels.getExpandedRowModel && {
      getExpandedRowModel: rowModels.getExpandedRowModel,
    }),
    ...(rowModels.getGroupedRowModel && {
      getGroupedRowModel: rowModels.getGroupedRowModel,
    }),
    ...(rowModels.getFacetedRowModel && {
      getFacetedRowModel: rowModels.getFacetedRowModel,
    }),
    ...(rowModels.getFacetedUniqueValues && {
      getFacetedUniqueValues: rowModels.getFacetedUniqueValues,
    }),
    ...(rowModels.getFacetedMinMaxValues && {
      getFacetedMinMaxValues: rowModels.getFacetedMinMaxValues,
    }),
    ...callbacks,
  });

  const table = useReactTable(buildTableConfig());

  if (isLoading) {
    // TODO: Add a better loading state
    return <div>Loading...</div>;
  }
  const currentColumnLabel =
    features?.columnFiltering?.columns?.find(
      (col) => col.accessorKey === filterColumn,
    )?.label || intl.formatMessage(messages.filterDropdownTrigger);

  const getFilterValueAsString = (value: unknown): string => {
    return typeof value === "string" ? value : "";
  };

  return (
    <TableWrapper>
      <Stack gap={4}>
        {features?.columnFiltering && (
          <HStack gap={4}>
            <Input
              value={getFilterValueAsString(
                table.getColumn(filterColumn)?.getFilterValue(),
              )}
              onChange={(e) =>
                table.getColumn(filterColumn)?.setFilterValue(e.target.value)
              }
              placeholder={intl.formatMessage(messages.filterByPlaceholder)}
            />

            <Dropdown trigger={currentColumnLabel}>
              {features.columnFiltering.columns.map((col) => (
                <DropdownItem
                  key={col.accessorKey}
                  onClick={() => setFilterColumn(col.accessorKey)}
                >
                  {col.label}
                </DropdownItem>
              ))}
            </Dropdown>
          </HStack>
        )}

        <Table.Root size="md" interactive={!!onRowClick} variant={variant}>
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeader
                    key={header.id}
                    onClick={
                      features?.sorting
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    style={{
                      cursor: features?.sorting ? "pointer" : "default",
                    }}
                  >
                    <HStack gap={2}>
                      <div>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </div>
                      {features?.sorting && (
                        <SortIcon isSorted={header.column.getIsSorted()} />
                      )}
                    </HStack>
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            ))}
          </Table.Header>

          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Table.Row
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                style={{ cursor: onRowClick ? "pointer" : "default" }}
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {features?.pagination && (
          <HStack justify="center" gap={2}>
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {intl.formatMessage(messages.previousButton)}
            </Button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {intl.formatMessage(messages.nextButton)}
            </Button>
          </HStack>
        )}
      </Stack>
    </TableWrapper>
  );
};

export default ChakraDataTable;
