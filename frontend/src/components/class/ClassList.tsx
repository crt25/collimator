import {
  DataTablePageEvent,
  DataTableSortEvent,
  DataTableFilterEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback, useState } from "react";
import { ButtonGroup, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import DataTable, { LazyTableState } from "@/components/DataTable";
import { getClassStatusMessage } from "@/i18n/class-status-messages";
import { TableMessages } from "@/i18n/table-messages";
import { ExistingClassWithTeacher } from "@/api/collimator/models/classes/existing-class-with-teacher";
import { useDeleteClass } from "@/api/collimator/hooks/classes/useDeleteClass";
import { useAllClassesLazyTable } from "@/api/collimator/hooks/classes/useAllClasses";
import ConfirmationModal from "../modals/ConfirmationModal";
import SwrContent from "../SwrContent";
import Button, { ButtonVariant } from "../Button";

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
  deleteConfirmationTitle: {
    id: "ClassList.deleteConfirmation.title",
    defaultMessage: "Delete Class",
  },
  deleteConfirmationBody: {
    id: "ClassList.deleteConfirmation.body",
    defaultMessage: "Are you sure you want to delete this class?",
  },
  deleteConfirmationConfirm: {
    id: "ClassList.deleteConfirmation.confirm",
    defaultMessage: "Delete Class",
  },
});

const classNameTemplate = (rowData: ExistingClassWithTeacher) => (
  <span data-testid={`class-${rowData.id}-name`}>{rowData.name}</span>
);

const ClassList = () => {
  const intl = useIntl();
  const router = useRouter();

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
    },
  });

  const { data, isLoading, error } = useAllClassesLazyTable(lazyState);

  const onPage = (event: DataTablePageEvent) => {
    setLazyState((state) => ({ ...state, ...event }));
  };

  const onSort = (event: DataTableSortEvent) => {
    setLazyState((state) => ({ ...state, ...event }));
  };

  const onFilter = (event: DataTableFilterEvent) => {
    setLazyState((state) => ({ ...state, ...event }));
  };

  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [classIdToDelete, setClassIdToDelete] = useState<number | null>(null);
  const deleteClass = useDeleteClass();

  const lastSessionTemplate = useCallback(
    (_rowData: ExistingClassWithTeacher) => (
      <span>
        <FormattedMessage
          id="ClassList.column.lastSession.none"
          defaultMessage="None"
        />
      </span>
    ),
    [],
  );

  const statusTemplate = useCallback(
    (_rowData: ExistingClassWithTeacher) => (
      <span>{intl.formatMessage(getClassStatusMessage("current"))}</span>
    ),
    [intl],
  );

  const actionsTemplate = useCallback(
    (rowData: ExistingClassWithTeacher) => (
      <div data-testid={`class-${rowData.id}-actions`}>
        <Dropdown as={ButtonGroup}>
          <Button
            variant={ButtonVariant.secondary}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/class/${rowData.id}/edit`);
            }}
            data-testid={`class-${rowData.id}-edit-button`}
          >
            <FontAwesomeIcon icon={faEdit} />
          </Button>

          <Dropdown.Toggle
            variant="secondary"
            split
            data-testid={`class-${rowData.id}-actions-dropdown-button`}
          />

          <Dropdown.Menu>
            <Dropdown.Item
              onClick={(e) => {
                e.stopPropagation();

                setClassIdToDelete(rowData.id);
                setShowDeleteConfirmationModal(true);
              }}
              data-testid={`class-${rowData.id}-delete-button`}
            >
              {intl.formatMessage(TableMessages.delete)}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    ),
    [router, intl],
  );

  return (
    <ClassListWrapper data-testid="class-list">
      <SwrContent data={data} isLoading={isLoading} error={error}>
        {(data) => (
          <DataTable
            value={data.items}
            lazy
            filterDisplay="row"
            dataKey="id"
            paginator
            first={lazyState.first}
            rows={10}
            totalRecords={data.totalCount}
            onPage={onPage}
            onSort={onSort}
            sortField={lazyState.sortField}
            sortOrder={lazyState.sortOrder}
            onFilter={onFilter}
            filters={lazyState.filters}
            loading={isLoading}
            onRowClick={(e) =>
              router.push(
                `/class/${(e.data as ExistingClassWithTeacher).id}/detail`,
              )
            }
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
              body={classNameTemplate}
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
                    variant={ButtonVariant.secondary}
                    onClick={() => router.push("class/create")}
                    data-testid="class-create-button"
                  >
                    <FontAwesomeIcon icon={faAdd} />
                  </Button>
                </Dropdown>
              }
            />
          </DataTable>
        )}
      </SwrContent>
      <ConfirmationModal
        isShown={showDeleteConfirmationModal}
        setIsShown={setShowDeleteConfirmationModal}
        onConfirm={
          classIdToDelete ? () => deleteClass(classIdToDelete) : undefined
        }
        isDangerous
        messages={{
          title: messages.deleteConfirmationTitle,
          body: messages.deleteConfirmationBody,
          confirmButton: messages.deleteConfirmationConfirm,
        }}
      />
    </ClassListWrapper>
  );
};

export default ClassList;
