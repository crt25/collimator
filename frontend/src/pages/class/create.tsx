import { defineMessages, useIntl } from "react-intl";
import { useCallback } from "react";
import { useRouter } from "next/router";
import { toaster } from "@/components/Toaster";
import ClassForm, { ClassFormValues } from "@/components/class/ClassForm";
import CrtNavigation from "@/components/CrtNavigation";
import { useCreateClass } from "@/api/collimator/hooks/classes/useCreateClass";
import PageLayout from "@/components/layout/Page";

const messages = defineMessages({
  title: {
    id: "CreateClass.title",
    defaultMessage: "Create Class",
  },
  header: {
    id: "CreateClass.header",
    defaultMessage: "Create Class",
  },
  description: {
    id: "CreateClass.pageDescription",
    defaultMessage: "",
  },
  submit: {
    id: "CreateClass.submit",
    defaultMessage: "Create Class",
  },
  successMessage: {
    id: "CreateClass.successMessage",
    defaultMessage: "Class created successfully",
  },
  errorMessage: {
    id: "CreateClass.errorMessage",
    defaultMessage:
      "There was an error creating the new Class. Please try to save again!",
  },
  returnToClassList: {
    id: "CreateClass.returnToClassList",
    defaultMessage: "Return to Class List",
  },
});

const CreateClass = () => {
  const intl = useIntl();
  const router = useRouter();
  const createClass = useCreateClass();

  const onSubmit = useCallback(
    async (formValues: ClassFormValues) => {
      try {
        const response = await createClass({
          name: formValues.name,
          teacherId: formValues.teacherId,
        });

        toaster.success({
          title: intl.formatMessage(messages.successMessage),
          action: {
            label: intl.formatMessage(messages.returnToClassList),
            onClick: () => router.push(`/class`),
          },
          meta: {
            actionTestId: "go-back-to-class-list",
          },
          closable: true,
        });

        router.push(`/class/${response.id}/detail`);
      } catch {
        toaster.error({
          title: intl.formatMessage(messages.errorMessage),
        });
      }
    },
    [createClass, router, intl],
  );

  return (
    <PageLayout
      title={messages.title}
      heading={messages.header}
      breadcrumbs={<CrtNavigation breadcrumb />}
    >
      <ClassForm submitMessage={messages.submit} onSubmit={onSubmit} />
    </PageLayout>
  );
};

export default CreateClass;
