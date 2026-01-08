import {
  Cell,
  Column,
  TableOptions,
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
  flexRender,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import {
  LuArrowDownNarrowWide,
  LuArrowUpNarrowWide,
  LuArrowUpDown,
} from "react-icons/lu";
import { defineMessages, useIntl } from "react-intl";
import Link from "next/link";
import { chakra, Table, HStack, Icon, Spinner } from "@chakra-ui/react";
import { ColumnType } from "@/types/tanstack-types";
import { DataTablePagination } from "./Pagination";
import Input, { InputVariety } from "./form/Input";
import Tag from "./Tag";
import DropdownMenu from "./DropdownMenu";

export enum ColumnSize {
  sm = 32,
  md = 64,
}

type DataTableColumn = {
  accessorKey: string;
  label: string;
};

const DefaultPageSize = 10;

interface DataTableFeatures {
  columnOrdering?: boolean;
  columnPinning?: {
    left?: string[];
    right?: string[];
  };
  columnSizing?: boolean;
  columnVisibility?: boolean;
  columnFiltering?: {
    columns: DataTableColumn[];
  };
  fuzzyFiltering?: boolean;
  columnFaceting?: {
    columns: DataTableColumn[];
  };
  globalFaceting?: boolean;
  grouping?: {
    columns: DataTableColumn[];
  };
  expanding?: boolean;
  rowPinning?: {
    top?: number[];
    bottom?: number[];
  };
  rowSelection?: boolean;
  sorting?: boolean;
  virtualization?: boolean;
}

interface ChakraDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  onRowClick?: (
    row: T,
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
  ) => void;
  features?: DataTableFeatures;
  variant?: "outline" | "line";
  includeSearchBar?: boolean;
  emptyStateElement: React.ReactNode;
  highlightedRowId?: number;
}

const InputWrapper = chakra("div", {
  base: {
    marginBottom: "lg",
    width: "{inputWidths.md}",
  },
});

const HeaderContent = chakra("div", {
  base: {
    display: "flex",
    gap: "sm",
    alignItems: "center",
  },
});

const FilterContainer = chakra("div", {
  base: {
    display: "flex",
    gap: "md",
    alignItems: "center",
  },
});

const TableContainer = chakra("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "sm",
  },
});

type SortDirection = ReturnType<Column<unknown, unknown>["getIsSorted"]>;

const SortIcon = ({ sortDirection }: { sortDirection: SortDirection }) => {
  if (sortDirection === "asc") {
    return <LuArrowUpNarrowWide size={16} />;
  }

  if (sortDirection === "desc") {
    return <LuArrowDownNarrowWide size={16} />;
  }

  return <LuArrowUpDown size={16} />;
};

const messages = defineMessages({
  filterByPlaceholder: {
    id: "datatable.placeholder.filterBy",
    defaultMessage: "Search",
  },
  filterDropdownTrigger: {
    id: "datatable.label.filterBy",
    defaultMessage: "Filter by...",
  },
});

export const ChakraDataTable = <T extends { id: number }>({
  data,
  columns,
  isLoading,
  onRowClick,
  features,
  emptyStateElement,
  variant = "outline",
  includeSearchBar = false,
  highlightedRowId,
}: ChakraDataTableProps<T>) => {
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
    pageSize: DefaultPageSize,
  });

  const rowModels = useMemo(() => {
    const models: {
      getCoreRowModel: ReturnType<typeof getCoreRowModel<T>>;
      getSortedRowModel?: ReturnType<typeof getSortedRowModel<T>>;
      getFilteredRowModel?: ReturnType<typeof getFilteredRowModel<T>>;
      getPaginationRowModel?: ReturnType<typeof getPaginationRowModel<T>>;
      getExpandedRowModel?: ReturnType<typeof getExpandedRowModel<T>>;
      getGroupedRowModel?: ReturnType<typeof getGroupedRowModel<T>>;
      getFacetedRowModel?: ReturnType<typeof getFacetedRowModel<T>>;
      getFacetedUniqueValues?: ReturnType<typeof getFacetedUniqueValues<T>>;
      getFacetedMinMaxValues?: ReturnType<typeof getFacetedMinMaxValues<T>>;
    } = {
      getCoreRowModel: getCoreRowModel(),
    };

    if (features?.sorting) {
      models.getSortedRowModel = getSortedRowModel();
    }

    if (features?.columnFiltering) {
      models.getFilteredRowModel = getFilteredRowModel();
    }

    models.getPaginationRowModel = getPaginationRowModel();

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

  const state = useMemo(() => {
    const stateObject: {
      sorting?: SortingState;
      columnFilters?: ColumnFiltersState;
      pagination?: PaginationState;
      rowSelection?: RowSelectionState;
      columnVisibility?: VisibilityState;
      columnOrder?: ColumnOrderState;
      columnPinning?: ColumnPinningState;
      grouping?: GroupingState;
      expanded?: ExpandedState;
    } = {};

    if (features?.sorting) {
      stateObject.sorting = sorting;
    }

    if (features?.columnFiltering?.columns) {
      stateObject.columnFilters = columnFilters;
    }

    stateObject.pagination = pagination;

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

  const callbacks = useMemo(() => {
    const callbacksObject: {
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
        updater:
          | ColumnOrderState
          | ((old: ColumnOrderState) => ColumnOrderState),
      ) => void;
    } = {};

    if (features?.sorting) {
      callbacksObject.onSortingChange = setSorting;
    }

    if (features?.columnFiltering?.columns) {
      callbacksObject.onColumnFiltersChange = setColumnFilters;
    }

    callbacksObject.onPaginationChange = setPagination;

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
    enableSortingRemoval: false,
    enableSorting: false,
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
    return <Spinner size="xl" />;
  }

  if (data.length === 0) {
    return emptyStateElement;
  }

  const currentColumnLabel =
    features?.columnFiltering?.columns?.find(
      (col) => col.accessorKey === filterColumn,
    )?.label || intl.formatMessage(messages.filterDropdownTrigger);

  const getFilterValueAsString = (value: unknown): string => {
    return typeof value === "string" ? value : "";
  };

  const wrapWithIcon = (content: React.ReactNode, icon?: React.ReactNode) => {
    return icon ? (
      <HStack>
        <Icon>{icon}</Icon>
        <span>{content}</span>
      </HStack>
    ) : (
      content
    );
  };

  const cellWrapper = ({ cell }: { cell: Cell<T, unknown> }) => {
    const columnType =
      cell.column.columnDef.meta?.columnType ?? ColumnType.text;

    const icon = cell.column.columnDef.meta?.icon;
    const linkHref = cell.column.columnDef.meta?.linkHref;

    const renderedContent = flexRender(
      cell.column.columnDef.cell,
      cell.getContext(),
    );

    switch (columnType) {
      case ColumnType.tags:
        return <Tag id={cell.id}>{wrapWithIcon(renderedContent, icon)}</Tag>;

      case ColumnType.icon:
        return <Icon>{renderedContent}</Icon>;

      case ColumnType.link:
        return (
          <Link href={linkHref || "#"}>
            {wrapWithIcon(renderedContent, icon)}
          </Link>
        );

      case ColumnType.text:
      default:
        return <>{wrapWithIcon(renderedContent, icon)}</>;
    }
  };

  return (
    <TableContainer>
      {features?.columnFiltering && includeSearchBar && (
        <FilterContainer>
          <InputWrapper>
            <Input
              value={getFilterValueAsString(
                table.getColumn(filterColumn)?.getFilterValue(),
              )}
              onChange={(e) =>
                table.getColumn(filterColumn)?.setFilterValue(e.target.value)
              }
              placeholder={intl.formatMessage(messages.filterByPlaceholder)}
              variety={InputVariety.Search}
            />
          </InputWrapper>

          {features.columnFiltering.columns.length > 1 && (
            <DropdownMenu trigger={currentColumnLabel}>
              {features.columnFiltering.columns.map((col) => (
                <DropdownMenu.Item
                  key={col.accessorKey}
                  onClick={() => setFilterColumn(col.accessorKey)}
                >
                  {col.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu>
          )}
        </FilterContainer>
      )}

      <Table.Root interactive={!!onRowClick} variant={variant}>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader
                  key={header.id}
                  onClick={
                    features?.sorting && header.column.getCanSort()
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                  width={`${header.getSize()}px`}
                >
                  <HeaderContent>
                    <div>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </div>
                    {features?.sorting && header.column.getCanSort() && (
                      <SortIcon sortDirection={header.column.getIsSorted()} />
                    )}
                  </HeaderContent>
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          ))}
        </Table.Header>

        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Table.Row
              key={row.id}
              onClick={(e) => onRowClick?.(row.original, e)}
              backgroundColor={
                row.original.id === highlightedRowId ? "gray.200" : undefined
              }
            >
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id}>{cellWrapper({ cell })}</Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {table.getPageCount() > 1 && (
        <DataTablePagination
          pageIndex={table.getState().pagination.pageIndex}
          pageCount={table.getPageCount()}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          onPageChange={(pageIndex) => table.setPageIndex(pageIndex)}
        />
      )}
    </TableContainer>
  );
};

export default ChakraDataTable;
