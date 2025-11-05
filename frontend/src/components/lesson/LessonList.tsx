import {
  DataTablePageEvent,
  DataTableSortEvent,
  DataTableFilterEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import Tags from "@/components/Tags";
import Tag from "@/components/Tag";
import DataTable, { LazyTableState } from "@/components/DataTable";
import { TableMessages } from "@/i18n/table-messages";
import Button, { ButtonVariant } from "../Button";
import DropdownMenu from "../DropdownMenu";

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

const LessonList = ({
  fetchData,
}: {
  fetchData: (
    state: LazyTableState,
  ) => Promise<{ items: Lesson[]; totalCount: number }>;
}) => {
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
      },
      tags: {
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
        <DropdownMenu
          trigger={
            <Button
              variant={ButtonVariant.secondary}
              onClick={() => {
                router.push(`/lesson/${rowData.id}/edit`);
              }}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          }
        >
          <DropdownMenu.Item
            onClick={() => {
              router.push(`/lesson/${rowData.id}/edit`);
            }}
          >
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={() => console.log("Action 2")}>
            Action 2
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={() => console.log("Action 3")}>
            Action 3
          </DropdownMenu.Item>
        </DropdownMenu>
      </div>
    ),
    [router],
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
          field="tags"
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
            <DropdownMenu
              trigger={
                <Button
                  variant={ButtonVariant.secondary}
                  onClick={() => router.push("lesson/create")}
                >
                  <FontAwesomeIcon icon={faAdd} />
                </Button>
              }
            >
              <DropdownMenu.Item onClick={() => console.log("Action 1")}>
                Action
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => console.log("Action 2")}>
                Another action
              </DropdownMenu.Item>
              <DropdownMenuItem onClick={() => console.log("Action 3")}>
                Something else
              </DropdownMenu.Item>
            </DropdownMenu>
          }
        />
      </DataTable>
    </LessonListWrapper>
  );
};

export default LessonList;
