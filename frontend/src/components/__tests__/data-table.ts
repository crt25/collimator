import { LazyTableState } from "../DataTable";

export const mockFilterSortDataTable = <T>(
  data: T[],
  state: LazyTableState,
  customFilters?: Record<string, (filterValue: string, item: T) => boolean>,
): { items: T[]; totalCount: number } => {
  let rows = [...data];
  const sortField = state.sortField;
  if (sortField) {
    (rows as unknown as Record<string, string>[]).sort((a, b) => {
      if (state.sortOrder === 1) {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });
  }

  Object.keys(state.filters).forEach((key) => {
    const filter = state.filters[key];

    if ("value" in filter) {
      if (customFilters && customFilters[key]) {
        rows = rows.filter((c) => customFilters[key]!(filter.value, c));
        return;
      }

      rows = rows.filter((c) =>
        (c as unknown as Record<string, string>)[key].includes(filter.value),
      );
    }
  });

  return {
    items: rows.slice(state.first, state.first + state.rows),
    totalCount: rows.length,
  };
};
