import {
  DataTablePageEvent,
  DataTableSortEvent,
  DataTableFilterEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback, useEffect, useState } from "react";
import DataTable, { LazyTableState } from "@/components/DataTable";
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

export interface User {
  id: number;
  name: string;
  role: UserRole;
}

const UserList = ({
  fetchData,
}: {
  fetchData: (
    state: LazyTableState,
  ) => Promise<{ items: User[]; totalCount: number }>;
}) => {
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
      },
      role: {
        value: "",
        matchMode: "contains",
      },
    },
  });

  useEffect(() => {
    setLoading(true);

    fetchData(lazyState).then(({ items, totalCount }) => {
      setTotalRecords(totalCount);
      setClasss(items);
      setLoading(false);
    });
  }, [lazyState, fetchData]);

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
    [intl],
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
    [router],
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
          field="role"
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
