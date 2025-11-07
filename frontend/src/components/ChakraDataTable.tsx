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
} from "@tanstack/react-table";
import { Table, HStack, Stack, Icon, Spinner } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { LuArrowUp, LuArrowDown } from "react-icons/lu";
import styled from "@emotion/styled";
import { defineMessages, useIntl } from "react-intl";
import Link from "next/link";
import Input from "./form/Input";
import Tag from "./Tag";
import Button from "./Button";
import DropdownMenu from "./DropdownMenu";
import {
  DataTableCallbacks,
  RowModels,
  DataTableState,
  DatatableProps,
  ColumnType,
} from "@/types/tanstack-types";

const TableWrapper = styled.div`
  margin: 1rem 0;
`;

const SortIcon = ({ isSorted }: { isSorted: false | "asc" | "desc" }) => {
  if (isSorted === "asc") {
    return <LuArrowUp size={16} />;
  }

  return <LuArrowDown size={16} />;
};

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
                  <Table.Cell key={cell.id}>{cellWrapper({ cell })}</Table.Cell>
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
