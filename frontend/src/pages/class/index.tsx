import { defineMessages, FormattedMessage } from "react-intl";
import ClassList from "@/components/class/ClassList";
import CrtNavigation from "@/components/CrtNavigation";
import PageLayout from "@/components/layout/Page";

const messages = defineMessages({
  title: {
    id: "ListClasses.header",
    defaultMessage: "Classes",
  },
  heading: {
    id: "ListClasses.pageTitle",
    defaultMessage: "Class Manager",
  },
  description: {
    id: "ListClasses.pageDescription",
    defaultMessage:
      "This page displays the classes you have created. " +
      "Click on a given class to edit the lessons and see your students' progress.",
  },
});

const ListClasses = () => {
  return (
    <PageLayout
      title={messages.title}
      heading={messages.heading}
      description={<FormattedMessage {...messages.description} />}
      breadcrumbs={<CrtNavigation breadcrumb />}
    >
      <ClassList />
    </PageLayout>
  );
};

export default ListClasses;
