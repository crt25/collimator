import {
  DataTablePageEvent,
  DataTableSortEvent,
  DataTableFilterEvent,
  DataTableFilterMeta,
  SortOrder,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback, useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import { Button, ButtonGroup, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import {
  ClassStatus,
  getClassStatusMessage,
} from "@/i18n/class-status-messages";
import { TableMessages } from "@/i18n/table-messages";

const ClassListWrapper = styled.div`
  margin: 1rem 0;

  tr {
    cursor: pointer;
  }
`;

const messages = defineMessages({
  nameColumn: {
    id: "ClassList.columns.name",
    defaultMessage: "Name",
  },
  lastSessionColumn: {
    id: "ClassList.columns.lastSession",
    defaultMessage: "Last Session",
  },
  statusColumn: {
    id: "ClassList.columns.status",
    defaultMessage: "Status",
  },
  actionsColumn: {
    id: "ClassList.columns.actions",
    defaultMessage: "Actions",
  },
});

export interface Class {
  id: number;
  name: string;
  lastSession: {
    id: number;
    name: string;
  } | null;
  status: ClassStatus;
}

interface LazyTableState {
  first: number;
  rows: number;
  page: number;
  sortField?: string;
  sortOrder?: SortOrder;
  filters: DataTableFilterMeta;
}

const sessions: Class[] = [
  {
    id: 100,
    name: "Class 1",
    lastSession: {
      id: 1,
      name: "Session 2",
    },
    status: ClassStatus.current,
  },
  {
    id: 1,
    name: "Class 2",
    lastSession: {
      id: 1,
      name: "Session 1",
    },
    status: ClassStatus.current,
  },
  {
    id: 2,
    name: "Class 3",
    lastSession: null,
    status: ClassStatus.current,
  },
  {
    id: 3,
    name: "Class 4",
    lastSession: {
      id: 1,
      name: "Session 5",
    },
    status: ClassStatus.past,
  },
  {
    id: 4,
    name: "Class 5",
    lastSession: {
      id: 1,
      name: "Session 3",
    },
    status: ClassStatus.current,
  },
  {
    id: 5,
    name: "Class 6",
    lastSession: {
      id: 1,
      name: "Session 2",
    },
    status: ClassStatus.past,
  },
  {
    id: 6,
    name: "Class 7",
    lastSession: {
      id: 1,
      name: "Session 7",
    },
    status: ClassStatus.current,
  },
  {
    id: 7,
    name: "Class 8",
    lastSession: null,
    status: ClassStatus.past,
  },
];

const ClassList = () => {
  const intl = useIntl();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [Classs, setClasss] = useState<Class[]>([]);
  const [lazyState, setLazyState] = useState<LazyTableState>({
    first: 0,
    rows: 10,
    page: 1,
    sortField: undefined,
    sortOrder: undefined,
    filters: {
      name: {
        value: "",
        matchMode: "contains",
        constraints: [{ matchMode: "contains", value: null }],
      },
    },
  });

  useEffect(() => {
    setLoading(true);

    const fetchData = (state: LazyTableState) => Promise.resolve(sessions);

    fetchData(lazyState).then((sessions) => {
      setTotalRecords(sessions.length);
      setClasss(sessions);
      setLoading(false);
    });
  }, [lazyState]);

  const onPage = (event: DataTablePageEvent) => {
    setLazyState((state) => ({ ...state, ...event }));
  };

  const onSort = (event: DataTableSortEvent) => {
    setLazyState((state) => ({ ...state, ...event }));
  };

  const onFilter = (event: DataTableFilterEvent) => {
    setLazyState((state) => ({ ...state, ...event }));
  };

  const lastSessionTemplate = useCallback(
    (rowData: Class) => (
      <span>
        {rowData.lastSession ? (
          rowData.lastSession.name
        ) : (
          <FormattedMessage
            id="ClassList.column.lastSession.none"
            defaultMessage="None"
          />
        )}
      </span>
    ),
    [],
  );

  const statusTemplate = useCallback(
    (rowData: Class) => (
      <span>{intl.formatMessage(getClassStatusMessage(rowData.status))}</span>
    ),
    [],
  );

  const actionsTemplate = useCallback(
    (rowData: Class) => (
      <div>
        <Dropdown as={ButtonGroup}>
          <Button
            variant="secondary"
            onClick={() => router.push(`/class/${rowData.id}/edit`)}
          >
            <FontAwesomeIcon icon={faEdit} />
          </Button>

          <Dropdown.Toggle variant="secondary" split />

          <Dropdown.Menu>
            <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
            <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    ),
    [],
  );

  return (
    <ClassListWrapper>
      <DataTable
        value={Classs}
        lazy
        filterDisplay="row"
        dataKey="id"
        paginator
        first={lazyState.first}
        rows={10}
        totalRecords={totalRecords}
        onPage={onPage}
        onSort={onSort}
        sortField={lazyState.sortField}
        sortOrder={lazyState.sortOrder}
        onFilter={onFilter}
        filters={lazyState.filters}
        loading={loading}
        onRowClick={(e) => router.push(`/class/${(e.data as Class).id}/detail`)}
      >
        <Column
          field="name"
          header={intl.formatMessage(messages.nameColumn)}
          sortable
          filter
          filterPlaceholder={intl.formatMessage(
            TableMessages.searchFilterPlaceholder,
          )}
          filterMatchMode="contains"
          showFilterMenu={false}
        />
        <Column
          header={intl.formatMessage(messages.lastSessionColumn)}
          body={lastSessionTemplate}
        />
        <Column
          header={intl.formatMessage(messages.statusColumn)}
          body={statusTemplate}
        />
        <Column
          header={intl.formatMessage(messages.actionsColumn)}
          body={actionsTemplate}
          filter
          filterElement={
            <Dropdown as={ButtonGroup}>
              <Button
                variant="secondary"
                onClick={() => router.push("class/create")}
              >
                <FontAwesomeIcon icon={faAdd} />
              </Button>

              <Dropdown.Toggle variant="secondary" split />

              <Dropdown.Menu>
                <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          }
        />
      </DataTable>
    </ClassListWrapper>
  );
};

export default ClassList;
