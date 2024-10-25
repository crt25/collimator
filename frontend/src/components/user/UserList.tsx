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
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { getUserRoleMessage, UserRole } from "@/i18n/user-role-messages";
import { TableMessages } from "@/i18n/table-messages";

const UserListWrapper = styled.div`
  margin: 1rem 0;

  tr {
    cursor: pointer;
  }
`;

const messages = defineMessages({
  nameColumn: {
    id: "UserList.columns.name",
    defaultMessage: "Name",
  },
  roleColumn: {
    id: "UserList.columns.role",
    defaultMessage: "Role",
  },
  actionsColumn: {
    id: "UserList.columns.actions",
    defaultMessage: "Actions",
  },
});

interface User {
  id: number;
  name: string;
  role: UserRole;
}

interface LazyTableState {
  first: number;
  rows: number;
  page: number;
  sortField?: string;
  sortOrder?: SortOrder;
  filters: DataTableFilterMeta;
}

const sessions: User[] = [
  {
    id: 100,
    name: "User 1",
    role: UserRole.teacher,
  },
  {
    id: 1,
    name: "User 2",
    role: UserRole.student,
  },
  {
    id: 2,
    name: "User 3",
    role: UserRole.student,
  },
  {
    id: 3,
    name: "User 4",
    role: UserRole.admin,
  },
  {
    id: 4,
    name: "User 5",
    role: UserRole.student,
  },
  {
    id: 5,
    name: "User 6",
    role: UserRole.teacher,
  },
  {
    id: 6,
    name: "User 7",
    role: UserRole.student,
  },
  {
    id: 7,
    name: "User 8",
    role: UserRole.admin,
  },
];

const UserList = () => {
  const intl = useIntl();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [Classs, setClasss] = useState<User[]>([]);
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

  const roleTemplate = useCallback(
    (rowData: User) => (
      <span>{intl.formatMessage(getUserRoleMessage(rowData.role))}</span>
    ),
    [],
  );

  const actionsTemplate = useCallback(
    (rowData: User) => (
      <div>
        <Dropdown as={ButtonGroup}>
          <Button variant="secondary">
            <FontAwesomeIcon
              icon={faEdit}
              onClick={() => router.push(`/user/${rowData.id}/edit`)}
            />
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
    <UserListWrapper>
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
        onRowClick={(e) => router.push(`/user/${(e.data as User).id}/detail`)}
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
          header={intl.formatMessage(messages.roleColumn)}
          filter
          filterPlaceholder={intl.formatMessage(
            TableMessages.searchFilterPlaceholder,
          )}
          filterMatchMode="contains"
          showFilterMenu={false}
          body={roleTemplate}
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
    </UserListWrapper>
  );
};

export default UserList;
