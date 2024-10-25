import {
  DataTablePageEvent,
  DataTableSortEvent,
  DataTableFilterMeta,
  SortOrder,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback, useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHand, faStar } from "@fortawesome/free-regular-svg-icons";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { TableMessages } from "@/i18n/table-messages";

const ProgressListWrapper = styled.div`
  margin: 1rem 0;

  tr {
    cursor: pointer;
  }
`;

const TaskState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TimeOnTask = styled.div``;

const messages = defineMessages({
  nameColumn: {
    id: "ProgressList.columns.name",
    defaultMessage: "Name",
  },
  taskColumn: {
    id: "ProgressList.columns.taskColumn",
    defaultMessage: "Task",
  },
  timeOnTaskColumn: {
    id: "ProgressList.columns.timeOnTask",
    defaultMessage: "Time on Task",
  },
  helpColumn: {
    id: "ProgressList.columns.help",
    defaultMessage: "Help",
  },
  actionsColumn: {
    id: "ProgressList.columns.actions",
    defaultMessage: "Actions",
  },
});

interface UserProgress {
  userId: number;
  name: string;
}

interface LazyTableState {
  first: number;
  rows: number;
  page: number;
  sortField?: string;
  sortOrder?: SortOrder;
  filters: DataTableFilterMeta;
}

const sessions: UserProgress[] = [
  {
    userId: 100,
    name: "Student 1",
  },
  {
    userId: 1,
    name: "Student 2",
  },
  {
    userId: 2,
    name: "Student 3",
  },
  {
    userId: 3,
    name: "Student 4",
  },
  {
    userId: 4,
    name: "Student 5",
  },
  {
    userId: 5,
    name: "Student 6",
  },
  {
    userId: 6,
    name: "Student 7",
  },
  {
    userId: 7,
    name: "Student 8",
  },
];

const taskTemplate = (taskIndex: number) =>
  function TaskTemplate(rowData: UserProgress) {
    return (
      <TaskState>
        <div>
          <FontAwesomeIcon icon={faStar} />
        </div>
        <div>00:00</div>
      </TaskState>
    );
  };

const ProgressList = ({
  classId,
  sessionId,
}: {
  classId: number;
  sessionId: number;
}) => {
  const intl = useIntl();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [Classs, setClasss] = useState<UserProgress[]>([]);
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

  const timeOnTaskTemplate = useCallback(
    (rowData: UserProgress) => <TimeOnTask>00:00</TimeOnTask>,
    [],
  );

  const helpTemplate = useCallback(
    (rowData: UserProgress) => (
      <span>
        <FontAwesomeIcon icon={faHand} />
      </span>
    ),
    [],
  );

  return (
    <ProgressListWrapper>
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
        filters={lazyState.filters}
        loading={loading}
        onRowClick={(e) =>
          router.push(
            `/class/${classId}/session/${sessionId}/progress/user/${(e.data as UserProgress).userId}`,
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
        {new Array(5).fill(0).map((_, i) => (
          <Column
            key={i}
            header={`${intl.formatMessage(messages.taskColumn)} ${i + 1}`}
            body={taskTemplate(i)}
          />
        ))}
        <Column
          header={intl.formatMessage(messages.timeOnTaskColumn)}
          body={timeOnTaskTemplate}
        />
        <Column
          header={intl.formatMessage(messages.helpColumn)}
          body={helpTemplate}
        />
      </DataTable>
    </ProgressListWrapper>
  );
};

export default ProgressList;
