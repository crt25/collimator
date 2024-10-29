import { mockFilterSortDataTable } from "../__tests__/data-table";
import ProgressList, { UserProgress } from "./ProgressList";

export default {
  component: ProgressList,
  title: "ProgressList",
};

const progressList: UserProgress[] = [
  {
    userId: 1,
    name: "Student 1",
  },
  {
    userId: 2,
    name: "Student 2",
  },
  {
    userId: 3,
    name: "Student 3",
  },
  {
    userId: 4,
    name: "Student 4",
  },
  {
    userId: 5,
    name: "Student 5",
  },
  {
    userId: 6,
    name: "Student 6",
  },
  {
    userId: 7,
    name: "Student 7",
  },
  {
    userId: 8,
    name: "Student 8",
  },
  {
    userId: 9,
    name: "Student 9",
  },
  {
    userId: 10,
    name: "Student 10",
  },
  {
    userId: 11,
    name: "Student 11",
  },
  {
    userId: 12,
    name: "Student 12",
  },
];

type Args = Parameters<typeof ProgressList>[0];

export const Default = {
  args: {
    classId: 1,
    sessionId: 1,
    fetchData: (state) =>
      Promise.resolve(mockFilterSortDataTable(progressList, state)),
  } as Args,
};

export const Empty = {
  args: {
    classId: 1,
    sessionId: 1,
    fetchData: () => Promise.resolve({ items: [], totalCount: 0 }),
  } as Args,
};

export const Loading = {
  args: {
    classId: 1,
    sessionId: 1,
    fetchData: () => new Promise(() => {}),
  } as Args,
};
