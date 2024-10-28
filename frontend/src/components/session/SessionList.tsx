import {
  DataTablePageEvent,
  DataTableSortEvent,
  DataTableFilterEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback, useEffect, useRef, useState } from "react";
import DataTable, { LazyTableState } from "@/components/DataTable";
import { Button, ButtonGroup, Dropdown, Modal } from "react-bootstrap";
import Tag from "@/components/Tag";
import Tags from "@/components/Tags";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { TableMessages } from "@/i18n/table-messages";
import { useRouter } from "next/router";
import { ModalMessages } from "@/i18n/modal-messages";
import CreateSessionForm, {
  CreateSessionFormValues,
  SessionFormRef,
} from "./CreateSessionForm";

const SessionListWrapper = styled.div`
  margin: 1rem 0;

  tr {
    cursor: pointer;
  }
`;

const messages = defineMessages({
  nameColumn: {
    id: "SessionList.columns.name",
    defaultMessage: "Name",
  },
  tagsColumn: {
    id: "SessionList.columns.tags",
    defaultMessage: "Tags",
  },
  startedAtColumn: {
    id: "SessionList.columns.startedAt",
    defaultMessage: "Started at",
  },
  finishedAtColumn: {
    id: "SessionList.columns.finishedAt",
    defaultMessage: "Finished at",
  },
  actionsColumn: {
    id: "SessionList.columns.actions",
    defaultMessage: "Actions",
  },
});

export interface Session {
  id: number;
  name: string;
  tags: string[];
  startedAt?: Date;
  finishedAt?: Date;
}

const SessionList = ({
  classId,
  fetchData,
}: {
  classId: number;
  fetchData: (
    state: LazyTableState,
  ) => Promise<{ items: Session[]; totalCount: number }>;
}) => {
  const router = useRouter();
  const intl = useIntl();

  const createSessionForm = useRef<SessionFormRef | null>(null);
  const [showSessionModal, setShowAddSessionModal] = useState(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [lessons, setLessons] = useState<Session[]>([]);
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

  useEffect(() => {
    setLoading(true);

    fetchData(lazyState).then(({ items, totalCount }) => {
      setTotalRecords(totalCount);
      setLessons(items);
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

  const onCreateNewSession = useCallback((values: CreateSessionFormValues) => {
    console.log(values);
  }, []);

  const tagsTemplate = useCallback(
    (rowData: Session) => (
      <Tags>
        {rowData.tags.map((tag, index) => (
          <Tag key={index} id={tag}>
            {tag}
          </Tag>
        ))}
      </Tags>
    ),
    [],
  );

  const startedAtTemplate = useCallback(
    (rowData: Session) =>
      rowData.startedAt && (
        <time>
          {intl.formatDate(rowData.startedAt)}{" "}
          {intl.formatTime(rowData.startedAt)}
        </time>
      ),
    [intl],
  );

  const finishedAtTemplate = useCallback(
    (rowData: Session) =>
      rowData.finishedAt && (
        <time>
          {intl.formatDate(rowData.startedAt)}{" "}
          {intl.formatTime(rowData.finishedAt)}
        </time>
      ),
    [intl],
  );

  const actionsTemplate = useCallback(
    (_rowData: Session) => (
      <div>
        <Dropdown as={ButtonGroup}>
          <Button variant="secondary">
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
    <SessionListWrapper>
      <Modal
        show={showSessionModal}
        onHide={() => setShowAddSessionModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="SessionList.createSessionModal.title"
              defaultMessage="Create Session"
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <FormattedMessage
              id="SessionList.createSessionModal.description"
              description="Description for the create session modal where a user can select from a list of lessons to create a new session for a given class"
              defaultMessage="You can create a new session for this class by selecting a lesson from the list below."
            />
          </p>
          <CreateSessionForm
            ref={createSessionForm}
            lessonOptions={[{ value: 1, label: "Lesson 1" }]}
            onSubmit={onCreateNewSession}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddSessionModal(false)}
          >
            {intl.formatMessage(ModalMessages.cancel)}
          </Button>
          <Button
            variant="primary"
            onClick={() => createSessionForm.current?.triggerSubmit()}
          >
            <FormattedMessage
              id="SessionList.createSessionModal.submit"
              defaultMessage="Create Session"
            />
          </Button>
        </Modal.Footer>
      </Modal>
      <DataTable
        value={lessons}
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
        onRowClick={(e) =>
          router.push(
            `/class/${classId}/session/${(e.data as Session).id}/progress`,
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
        />
        <Column
          header={intl.formatMessage(messages.tagsColumn)}
          filter
          filterPlaceholder={intl.formatMessage(
            TableMessages.searchFilterPlaceholder,
          )}
          filterMatchMode="contains"
          showFilterMenu={false}
          body={tagsTemplate}
        />
        <Column
          field="startedAt"
          header={intl.formatMessage(messages.startedAtColumn)}
          sortable
          body={startedAtTemplate}
        />
        <Column
          field="finishedAt"
          header={intl.formatMessage(messages.finishedAtColumn)}
          sortable
          body={finishedAtTemplate}
        />
        <Column
          header={intl.formatMessage(messages.actionsColumn)}
          body={actionsTemplate}
          filter
          filterElement={
            <Dropdown as={ButtonGroup}>
              <Button
                variant="secondary"
                onClick={() => setShowAddSessionModal(true)}
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
    </SessionListWrapper>
  );
};

export default SessionList;
