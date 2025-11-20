import { useRouter } from "next/router";
import { Container } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";
import { useCallback } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/header/Header";
import PageHeading from "@/components/PageHeading";
import CrtNavigation from "@/components/CrtNavigation";
import ClassForm, { ClassFormValues } from "@/components/class/ClassForm";
import { useUpdateClass } from "@/api/collimator/hooks/classes/useUpdateClass";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import SwrContent from "@/components/SwrContent";
import { toaster } from "@/components/Toaster";
import ClassActions from "@/components/class/ClassActions";

const messages = defineMessages({
  title: {
    id: "ClassDetail.title",
    defaultMessage: "Class - {name}",
  },
  submit: {
    id: "ClassDetail.submit",
    defaultMessage: "Save Class",
  },
  actions: {
    id: "ClassDetail.actions",
    defaultMessage: "Actions",
  },
  successMessage: {
    id: "ClassDetail.successMessage",
    defaultMessage: "Successfully saved changes",
  },
  errorMessage: {
    id: "ClassDetail.errorMessage",
    defaultMessage:
      "There was an error saving the changes. Please try to save again!",
  },
  deleteAction: {
    id: "ClassDetail.deleteAction",
    defaultMessage: "Delete Class",
  },
  deleteConfirmationTitle: {
    id: "ClassDetail.deleteConfirmation.title",
    defaultMessage: 'Delete Class: "{name}"',
  },
  deleteConfirmationBody: {
    id: "ClassDetail.deleteConfirmation.body",
    defaultMessage: "Are you sure? You can't undo this action afterwards.",
  },
  deleteConfirmationConfirm: {
    id: "ClassDetail.deleteConfirmation.confirm",
    defaultMessage: "Delete Class",
  },
  deleteConfirmationCancel: {
    id: "ClassDetail.deleteConfirmation.cancel",
    defaultMessage: "Cancel",
  },
  deleteSuccessMessage: {
    id: "ClassDetail.deleteSuccessMessage",
    defaultMessage: "Class deleted successfully",
  },
  deleteErrorMessage: {
    id: "ClassDetail.deleteErrorMessage",
    defaultMessage: "There was an error deleting the class. Please try again!",
  },
  returnToClassList: {
    id: "ClassDetail.returnToClassList",
    defaultMessage: "Return to Class List",
  },
});

const ClassDetail = () => {
  const intl = useIntl();
  const router = useRouter();
  const { classId } = router.query as { classId: string };
  const { data: klass, error, isLoading } = useClass(classId);
  const updateClass = useUpdateClass();

  const onSubmit = useCallback(
    async (formValues: ClassFormValues) => {
      if (klass) {
        try {
          await updateClass(klass.id, {
            name: formValues.name,
            teacherId: formValues.teacherId,
          });
          toaster.success({
            title: intl.formatMessage(messages.successMessage),
          });
        } catch {
          toaster.error({
            title: intl.formatMessage(messages.errorMessage),
          });
        }
      }
    },
    [intl, klass, updateClass],
  );

  return (
    <>
      <Header
        title={messages.title}
        titleParameters={{ name: klass?.name ?? "" }}
      />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
        </Breadcrumbs>
        <SwrContent error={error} isLoading={isLoading} data={klass}>
          {(klass) => (
            <>
              <PageHeading actions={<ClassActions klass={klass} />}>
                {klass.name}
              </PageHeading>{" "}
              <ClassNavigation classId={klass?.id} />
              <ClassForm
                submitMessage={messages.submit}
                initialValues={{
                  name: klass.name,
                  teacherId: klass.teacher.id,
                }}
                onSubmit={onSubmit}
              />
            </>
          )}
        </SwrContent>
      </Container>
    </>
  );
};

export default ClassDetail;
