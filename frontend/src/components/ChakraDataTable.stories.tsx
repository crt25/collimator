import { Meta, StoryObj } from "@storybook/react";
import { ColumnDef } from "@tanstack/react-table";
import { LuClock, LuUser } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";
import { FiXCircle } from "react-icons/fi";
import ChakraDataTable from "./ChakraDataTable";
import { ColumnType } from "@/types/tanstack-types";

type TaskData = {
  id: number;
  name: string;
  firstTask: string;
  greatHomework: string;
  task3: string;
  status: string;
};

const columns: ColumnDef<TaskData>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "firstTask",
    header: "First Task",
  },
  {
    accessorKey: "greatHomework",
    header: "Great Homework",
  },
  {
    accessorKey: "task3",
    header: "Task 3",
  },
];

const columnsWithMeta: ColumnDef<TaskData>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: {
      columnType: ColumnType.link,
      linkHref: "/tasks",
      icon: <LuUser />,
    },
  },
  {
    accessorKey: "firstTask",
    header: "First Task",
    meta: {
      columnType: ColumnType.tags,
    },
  },
  {
    accessorKey: "greatHomework",
    header: "Great Homework",
    meta: {
      columnType: ColumnType.text,
    },
  },
  {
    accessorKey: "task3",
    header: "Task 3",
    meta: {
      columnType: ColumnType.tags,
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      columnType: ColumnType.icon,
    },
    cell: ({ row }) => {
      const status = row.original.status;
      if (status === "done") return <FaCheckCircle />;
      if (status === "in progress") return <LuClock />;
      return <FiXCircle />;
    },
  },
];

const sampleData: TaskData[] = [
  {
    id: 1,
    name: "Enthusiastic Alligator",
    firstTask: "done",
    greatHomework: "Editing",
    task3: "Not started",
    status: "done",
  },
  {
    id: 2,
    name: "Brave Buffalo",
    firstTask: "in progress",
    greatHomework: "Review",
    task3: "Started",
    status: "in progress",
  },
  {
    id: 3,
    name: "Curious Cat",
    firstTask: "done",
    greatHomework: "Complete",
    task3: "In progress",
    status: "done",
  },
  {
    id: 4,
    name: "Daring Dragon",
    firstTask: "not started",
    greatHomework: "Pending",
    task3: "Not started",
    status: "not started",
  },
  {
    id: 5,
    name: "Energetic Elephant",
    firstTask: "done",
    greatHomework: "Editing",
    task3: "Complete",
    status: "done",
  },
  {
    id: 6,
    name: "Friendly Fox",
    firstTask: "in progress",
    greatHomework: "Review",
    task3: "Not started",
    status: "in progress",
  },
];

const meta = {
  component: ChakraDataTable<TaskData>,
  title: "Components/ChakraDataTable",
  tags: ["autodocs"],
} satisfies Meta<typeof ChakraDataTable<TaskData>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: sampleData,
    columns,
  },
};

export const WithAllFeatures: Story = {
  args: {
    data: sampleData,
    columns: columnsWithMeta,
    isLoading: false,
    variant: "outline",
    features: {
      sorting: true,
      pagination: {
        pageSize: 4,
      },
      columnFiltering: {
        columns: [
          { accessorKey: "name", label: "Name" },
          { accessorKey: "firstTask", label: "First Task" },
          { accessorKey: "greatHomework", label: "Great Homework" },
          { accessorKey: "task3", label: "Task 3" },
        ],
      },
      rowSelection: true,
      columnVisibility: true,
      columnOrdering: true,
      columnPinning: {
        left: [],
        right: [],
      },
      expanding: true,
      columnFaceting: {
        columns: [
          { accessorKey: "firstTask", label: "First Task" },
          { accessorKey: "task3", label: "Task 3" },
        ],
      },
      globalFaceting: true,
    },
    onRowClick: (row) => {
      alert(`Clicked on ${row.name}`);
    },
  },
};
