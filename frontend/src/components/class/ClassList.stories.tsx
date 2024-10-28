import { ClassStatus } from "@/i18n/class-status-messages";
import ClassList from "./ClassList";
import { mockFilterSortDataTable } from "../__tests__/data-table";

export default {
  component: ClassList,
  title: "ClassList",
};

const mockClasses = [
  {
    id: 1,
    name: "Class 1",
    lastSession: {
      id: 1,
      name: "Session 2",
    },
    status: ClassStatus.current,
  },
  {
    id: 2,
    name: "Class 2",
    lastSession: {
      id: 1,
      name: "Session 1",
    },
    status: ClassStatus.current,
  },
  {
    id: 3,
    name: "Class 3",
    lastSession: null,
    status: ClassStatus.current,
  },
  {
    id: 4,
    name: "Class 4",
    lastSession: {
      id: 1,
      name: "Session 5",
    },
    status: ClassStatus.past,
  },
  {
    id: 5,
    name: "Class 5",
    lastSession: {
      id: 1,
      name: "Session 3",
    },
    status: ClassStatus.current,
  },
  {
    id: 6,
    name: "Class 6",
    lastSession: {
      id: 1,
      name: "Session 2",
    },
    status: ClassStatus.past,
  },
  {
    id: 7,
    name: "Class 7",
    lastSession: {
      id: 1,
      name: "Session 7",
    },
    status: ClassStatus.current,
  },
  {
    id: 8,
    name: "Class 8",
    lastSession: null,
    status: ClassStatus.past,
  },
  {
    id: 9,
    name: "Class 9",
    lastSession: null,
    status: ClassStatus.past,
  },
  {
    id: 10,
    name: "Class 10",
    lastSession: null,
    status: ClassStatus.past,
  },
  {
    id: 11,
    name: "Class 11",
    lastSession: null,
    status: ClassStatus.past,
  },
];

type Args = Parameters<typeof ClassList>[0];

export const Default = {
  args: {
    fetchData: (state) =>
      Promise.resolve(mockFilterSortDataTable(mockClasses, state)),
  } as Args,
};

export const Empty = {
  args: {
    fetchData: () => Promise.resolve({ items: [], totalCount: 0 }),
  } as Args,
};

export const Loading = {
  args: {
    fetchData: () => new Promise(() => {}),
  } as Args,
};
