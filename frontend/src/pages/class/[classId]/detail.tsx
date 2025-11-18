import { useRouter } from "next/router";
import { Container } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";
import { useCallback, useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeading from "@/components/PageHeading";
import CrtNavigation from "@/components/CrtNavigation";
import ClassForm, { ClassFormValues } from "@/components/class/ClassForm";
import { useUpdateClass } from "@/api/collimator/hooks/classes/useUpdateClass";
import { useDeleteClass } from "@/api/collimator/hooks/classes/useDeleteClass";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import SwrContent from "@/components/SwrContent";
import { toaster } from "@/components/Toaster";
import DropdownMenu from "@/components/DropdownMenu";
import { Modal } from "@/components/form/Modal";
import { FlexContainer } from "@/components/Flex";

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
  const deleteClass = useDeleteClass();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classIdToDelete, setClassIdToDelete] = useState<number | null>(null);

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

  const handleDeleteConfirm = useCallback(async () => {
    if (classIdToDelete) {
      try {
        await deleteClass(classIdToDelete);
        toaster.success({
          title: intl.formatMessage(messages.deleteSuccessMessage),
        });
        router.push("/class");
      } catch {
        toaster.error({
          title: intl.formatMessage(messages.deleteErrorMessage),
        });
      }
    }
  }, [classIdToDelete, deleteClass, router, intl]);

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
              <FlexContainer>
                <PageHeading>{klass.name}</PageHeading>

                <DropdownMenu
                  testId="class-actions-dropdown"
                  trigger={intl.formatMessage(messages.actions)}
                  variant="secondary"
                >
                  <DropdownMenu.Item
                    onClick={() => {
                      setClassIdToDelete(klass.id);
                      setShowDeleteModal(true);
                    }}
                    testId="class-delete-button"
                  >
                    {intl.formatMessage(messages.deleteAction)}
                  </DropdownMenu.Item>
                </DropdownMenu>
              </FlexContainer>
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

      {klass && (
        <Modal
          open={showDeleteModal}
          onOpenChange={({ open }) => setShowDeleteModal(open)}
          title={intl.formatMessage(messages.deleteConfirmationTitle, {
            name: klass.name,
          })}
          description={intl.formatMessage(messages.deleteConfirmationBody)}
          confirmButtonText={intl.formatMessage(
            messages.deleteConfirmationConfirm,
          )}
          cancelButtonText={intl.formatMessage(
            messages.deleteConfirmationCancel,
          )}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
};

export default ClassDetail;
