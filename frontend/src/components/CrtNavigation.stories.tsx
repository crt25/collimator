import { ExistingClass } from "@/api/collimator/models/classes/existing-class";
import Breadcrumbs from "./Breadcrumbs";
import CrtNavigation from "./CrtNavigation";
import { getClassesControllerFindOneResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { ExistingUser } from "@/api/collimator/models/users/existing-user";
import { getUsersControllerFindOneResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";

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
    user: ExistingUser.fromDto(getUsersControllerFindOneResponseMock()),
    breadcrumb: true,
  } as Args,
  render: renderWithinBreadcrumbs,
};

export const AsClassBreadcrumb = {
  args: {
    klass: ExistingClass.fromDto(getClassesControllerFindOneResponseMock()),
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
