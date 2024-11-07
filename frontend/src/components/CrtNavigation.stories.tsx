import { ExistingClass } from "@/api/collimator/models/classes/existing-class";
import Breadcrumbs from "./Breadcrumbs";
import CrtNavigation from "./CrtNavigation";
import { getClassesControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { ExistingUser } from "@/api/collimator/models/users/existing-user";
import { getUsersControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";

export default {
  component: CrtNavigation,
  title: "CrtNavigation",
};

type Args = Parameters<typeof CrtNavigation>[0];

export const Default = {
  args: {} as Args,
};

const renderWithinBreadcrumbs = (args: Args) => (
  <Breadcrumbs>
    <CrtNavigation {...args} />
  </Breadcrumbs>
);

export const AsUserBreadcrumb = {
  args: {
    user: ExistingUser.fromDto(getUsersControllerFindOneV0ResponseMock()),
    breadcrumb: true,
  } as Args,
  render: renderWithinBreadcrumbs,
};

const klass = getClassesControllerFindOneV0ResponseMock();

export const AsClassBreadcrumb = {
  args: {
    klass: ExistingClass.fromDto({...klass, teacherId: klass.teacher.id}),
    breadcrumb: true,
  } as Args,
  render: renderWithinBreadcrumbs,
};

export const AsLessonBreadcrumb = {
  args: {
    lessonId: 1,
    breadcrumb: true,
  } as Args,
  render: renderWithinBreadcrumbs,
};
