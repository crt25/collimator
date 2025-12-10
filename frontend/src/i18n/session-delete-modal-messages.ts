import { defineMessages } from "react-intl";

export const SessionDeleteModalMessages = defineMessages({
  title: {
    id: "SessionDeleteModal.title",
    defaultMessage: "Delete Lesson",
  },
  body: {
    id: "SessionDeleteModal.body",
    defaultMessage: "Are you sure? You can't undo this action afterwards.",
  },
  confirm: {
    id: "SessionDeleteModal.confirm",
    defaultMessage: "Delete Lesson",
  },
  cancel: {
    id: "SessionDeleteModal.cancel",
    defaultMessage: "Cancel",
  },
  success: {
    id: "SessionDeleteModal.success",
    defaultMessage: "Lesson deleted successfully",
  },
  error: {
    id: "SessionDeleteModal.error",
    defaultMessage: "There was an error deleting the lesson. Please try again!",
  },
});

export const ClassDeleteModalMessages = defineMessages({
  title: {
    id: "ClassDeleteModal.title",
    defaultMessage: "Delete Class",
  },
  body: {
    id: "ClassDeleteModal.body",
    defaultMessage: "Are you sure? You can't undo this action afterwards.",
  },
  confirm: {
    id: "ClassDeleteModal.confirm",
    defaultMessage: "Delete Class",
  },
  cancel: {
    id: "ClassDeleteModal.cancel",
    defaultMessage: "Cancel",
  },
  success: {
    id: "ClassDeleteModal.success",
    defaultMessage: "Class deleted successfully",
  },
  error: {
    id: "ClassDeleteModal.error",
    defaultMessage: "There was an error deleting the class. Please try again!",
  },
});
