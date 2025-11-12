import {
  Cell,
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
  LuArrowUp,
  LuArrowDown,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import styled from "@emotion/styled";
import { defineMessages, useIntl } from "react-intl";
import Link from "next/link";
import { chakra, Table, HStack, Icon, Spinner } from "@chakra-ui/react";
import { DataTablePagination } from "./Pagination";
import Input, { InputType } from "./form/Input";
import Tag from "./Tag";
import Button, { ButtonVariant } from "./Button";
import DropdownMenu from "./DropdownMenu";

enum ColumnType {
  text = "text",
  icon = "icon",
  link = "link",
  tags = "tags",
}

type DataTableColumn = {
  accessorKey: string;
  label: string;
};

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
  pagination?: {
    pageSize: number;
  };
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
  onRowClick?: (row: T) => void;
  features?: DataTableFeatures;
  variant?: "outline" | "line";
}

const TableWrapper = styled.div`
  margin-bottom: 3rem;
`;

const InputWrapper = styled.div`
  margin-bottom: 2rem;
`;

const ColumnHeader = styled(Table.ColumnHeader)`
  &.sortable {
    cursor: pointer;
  }

  &.not-sortable {
    cursor: default;
  }
`;

const TableRow = styled(Table.Row)`
  &.clickable {
    cursor: pointer;
  }

  &.not-clickable {
    cursor: default;
  }
`;

const PaginationButton = styled(Button)`
  background-color: #000;
  color: #fff;
`;

const PaginationIconButton = styled(IconButton)`
  background-color: transparent !important;

  &:hover:not(:disabled) {
    background-color: transparent !important;
  }

  &:active:not(:disabled) {
    background-color: transparent !important;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const PaginationContentWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StyledTableCell = styled(Table.Cell)`
  border-bottom: 1px solid var(--border-color);
`;

const SortIcon = ({ isSorted }: { isSorted: false | "asc" | "desc" }) => {
  if (isSorted === "asc") {
    return <LuArrowUp size={16} />;
  }

  return <LuArrowDown size={16} />;
};

const messages = defineMessages({
  filterByPlaceholder: {
    id: "datatable.placeholder.filterBy",
    defaultMessage: "Search...",
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
  variant = "outline",
}: ChakraDataTableProps<T>) => {
  const intl = useIntl();

  const headerClassName = features?.sorting ? "sortable" : "not-sortable";
  const rowClassName = onRowClick ? "clickable" : "not-clickable";

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
    return <Spinner size="xl" />;
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
      <HStack gap={2}>
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
    <TableWrapper>
      <TableContainer>
        {features?.columnFiltering && (
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
                type={InputType.Search}
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

        <Table.Root size="md" interactive={!!onRowClick} variant={variant}>
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <ColumnHeader
                    key={header.id}
                    onClick={
                      features?.sorting && header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    className={headerClassName}
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
                        <SortIcon isSorted={header.column.getIsSorted()} />
                      )}
                    </HeaderContent>
                  </ColumnHeader>
                ))}
              </TableRow>
            ))}
          </Table.Header>

          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} onClick={() => onRowClick?.(row.original)}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{cellWrapper({ cell })}</TableCell>
                ))}
              </TableRow>
            ))}
          </Table.Body>
        </TableRoot>

        {features?.pagination && table.getPageCount() > 1 && (
          <DataTablePagination
            pageIndex={table.getState().pagination.pageIndex}
            pageCount={table.getPageCount()}
            canPreviousPage={table.getCanPreviousPage()}
            canNextPage={table.getCanNextPage()}
            onPageChange={(pageIndex) => table.setPageIndex(pageIndex)}
          />
        )}
      </TableContainer>
    </TableWrapper>
  );
};

export default ChakraDataTable;
