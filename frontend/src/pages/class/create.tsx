import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { useCallback } from "react";
import { useRouter } from "next/router";
import { toaster } from "@/components/Toaster";
import ClassForm, { ClassFormValues } from "@/components/class/ClassForm";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import { useCreateClass } from "@/api/collimator/hooks/classes/useCreateClass";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeading from "@/components/PageHeading";

const messages = defineMessages({
  title: {
    id: "CreateClass.title",
    defaultMessage: "Create new Class",
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
        await createClass({
          name: formValues.name,
          teacherId: formValues.teacherId,
        });
        toaster.success({
          title: messages.successMessage.defaultMessage,
          action: {
            label: intl.formatMessage(messages.returnToClassList),
            onClick: () => router.back(),
          },
          closable: true,
        });
      } catch {
        toaster.error({
          title: intl.formatMessage(messages.errorMessage),
        });
      }
    },
    [createClass, router, intl],
  );

  return (
    <>
      <Header title={messages.title} />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb />
        </Breadcrumbs>
        <PageHeading>
          <FormattedMessage
            id="CreateClass.header"
            defaultMessage="Create Class"
          />
        </PageHeading>
        <PageHeading variant="description">
          <FormattedMessage
            id="CreateClass.pageDescription"
            defaultMessage=""
          />
        </PageHeading>
        <ClassForm submitMessage={messages.submit} onSubmit={onSubmit} />
      </Container>
    </>
  );
};

export default CreateClass;
