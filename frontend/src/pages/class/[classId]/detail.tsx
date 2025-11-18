import { useRouter } from "next/router";
import { Container } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";
import { useCallback, useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import SwrContent from "@/components/SwrContent";

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
  const { classId } = router.query as {
    classId: string;
  };

  const { data: klass, error, isLoading } = useClass(classId);

  return (
    <>
      <Header
        title={messages.title}
        titleParameters={{
          name: klass?.name ?? "",
        }}
      />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
        </Breadcrumbs>
        <ClassNavigation classId={klass?.id} />
        <SwrContent error={error} isLoading={isLoading} data={klass}>
          {(klass) => (
            <div>
              <PageHeader>{klass.name}</PageHeader>
              <Table bordered role="presentation" data-testid="class-details">
                <tbody>
                  <tr>
                    <td>
                      <FormattedMessage
                        id="ClassDetail.table.teacher"
                        defaultMessage="Teacher"
                      />
                    </td>
                    <td>{klass.teacher.name}</td>
                  </tr>
                  <tr>
                    <td>
                      <FormattedMessage
                        id="ClassDetail.table.numberOfStudents"
                        defaultMessage="Number of Students"
                      />
                    </td>
                    <td>{klass.students.length}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          )}
        </SwrContent>
      </Container>
    </>
  );
};

export default ClassDetail;
