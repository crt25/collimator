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
import Tag from "@/components/Tag";
import Tags from "@/components/Tags";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { TableMessages } from "@/i18n/table-messages";

const LessonListWrapper = styled.div`
  margin: 1rem 0;

  tr {
    cursor: pointer;
  }
`;

const messages = defineMessages({
  nameColumn: {
    id: "LessonList.columns.name",
    defaultMessage: "Name",
  },
  tagsColumn: {
    id: "LessonList.columns.tags",
    defaultMessage: "Tags",
  },
  usedByColumn: {
    id: "LessonList.columns.usedBy",
    defaultMessage: "Used By",
  },
  actionsColumn: {
    id: "LessonList.columns.actions",
    defaultMessage: "Actions",
  },
});

export interface Lesson {
  id: number;
  name: string;
  tags: string[];
  usedBy: string[];
}

interface LazyTableState {
  first: number;
  rows: number;
  page: number;
  sortField?: string;
  sortOrder?: SortOrder;
  filters: DataTableFilterMeta;
}

const sessions: Lesson[] = [
  {
    id: 100,
    name: "Lesson 1",
    tags: ["blue", "red", "green"],
    usedBy: ["2017a", "2020c", "2022d"],
  },
  {
    id: 1,
    name: "Lesson 2",
    tags: ["blue", "red", "green"],
    usedBy: ["2017a", "2017b", "2017c"],
  },
  {
    id: 2,
    name: "Lesson 3",
    tags: ["blue", "red"],
    usedBy: ["2017a", "2020a", "2022a"],
  },
  {
    id: 3,
    name: "Lesson 4",
    tags: ["blue"],
    usedBy: ["2017a", "2016c", "2016d"],
  },
  {
    id: 4,
    name: "Lesson 5",
    tags: ["green"],
    usedBy: ["2017a", "2020c", "2022d"],
  },
  {
    id: 5,
    name: "Lesson 6",
    tags: ["blue", "red", "green"],
    usedBy: ["2019a", "2020f", "2022a"],
  },
  {
    id: 6,
    name: "Lesson 7",
    tags: ["red", "green"],
    usedBy: ["2018a", "2020c", "2023d"],
  },
  {
    id: 7,
    name: "Lesson 8",
    tags: ["blue", "green"],
    usedBy: ["2017a", "2022d"],
  },
];

const LessonList = () => {
  const intl = useIntl();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [lessons, setLessons] = useState<Lesson[]>([]);
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
      setLessons(sessions);
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

  const tagsTemplate = useCallback(
    (rowData: Lesson) => (
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

  const usedByTemplate = useCallback(
    (rowData: Lesson) => (
      <Tags>
        {rowData.usedBy.map((className, index) => (
          <Tag key={index} id={className}>
            {className}
          </Tag>
        ))}
      </Tags>
    ),
    [],
  );

  const actionsTemplate = useCallback(
    (rowData: Lesson) => (
      <div>
        <Dropdown as={ButtonGroup}>
          <Button variant="secondary">
            <FontAwesomeIcon
              icon={faEdit}
              onClick={() => router.push(`/lesson/${rowData.id}/edit`)}
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
    <LessonListWrapper>
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
          router.push(`/lesson/${(e.data as Lesson).id}/detail`)
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
          header={intl.formatMessage(messages.usedByColumn)}
          body={usedByTemplate}
        />
        <Column
          header={intl.formatMessage(messages.actionsColumn)}
          body={actionsTemplate}
          filter
          filterElement={
            <Dropdown as={ButtonGroup}>
              <Button
                variant="secondary"
                onClick={() => router.push("lesson/create")}
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
    </LessonListWrapper>
  );
};

export default LessonList;
