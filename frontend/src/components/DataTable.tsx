import styled from "@emotion/styled";
import { DataTable as PrimeDataTable } from "primereact/datatable";

const DataTable = styled(PrimeDataTable)`
  border: var(--foreground-color) 1px solid;
  border-radius: var(--border-radius);

  thead {
    th {
      color: var(--background-color);
      background-color: var(--foreground-color);
    }
  }

  th,
  td {
    padding: 1rem 1rem;
  }

  tr {
    border-bottom: var(--foreground-color) 1px solid;

    &:hover {
      background-color: var(--background-color-secondary);
    }
  }

  .p-column-filter.p-fluid.p-column-filter-row,
  .p-column-header-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }

  input {
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
    border: var(--foreground-color) 1px solid;
  }

  .p-paginator-bottom.p-paginator.p-component {
    color: var(--background-color);
    background-color: var(--foreground-color);

    button {
      color: var(--background-color);

      padding: 0.5rem 1rem;
      border-radius: var(--border-radius);
      border: none;

      :disabled {
        color: #bbb;
      }
    }
  }
`;

export default DataTable;
