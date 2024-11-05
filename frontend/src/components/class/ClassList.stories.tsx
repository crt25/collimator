import ClassList from "./ClassList";
import { mockFilterSortDataTable } from "../__tests__/data-table";
import { getClassesControllerFindAllResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";

export default {
  component: ClassList,
  title: "ClassList",
};

type Args = Parameters<typeof ClassList>[0];

export const Default = {
  args: {
    fetchData: (state) =>
      Promise.resolve(
        mockFilterSortDataTable(
          getClassesControllerFindAllResponseMock(),
          state,
        ),
      ),
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
