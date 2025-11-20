import { defineMessages } from "react-intl";

const messages = defineMessages({
  copySessionLink: {
    id: "SessionActions.copySessionLink",
    defaultMessage: "Copy Lesson Link",
  },
  deleteSession: {
    id: "SessionActions.deleteSession",
    defaultMessage: "Delete Lesson",
  },
  deleteConfirmationTitle: {
    id: "SessionActions.deleteConfirmation.title",
    defaultMessage: "Delete Lesson",
  },
  deleteConfirmationBody: {
    id: "SessionActions.deleteConfirmation.body",
    defaultMessage: "Are you sure? You can't undo this action afterwards.",
  },
  deleteConfirmationConfirm: {
    id: "SessionActions.deleteConfirmation.confirm",
    defaultMessage: "Delete Lesson",
  },
  deleteConfirmationCancel: {
    id: "SessionActions.deleteConfirmation.cancel",
    defaultMessage: "Cancel",
  },
  deleteSuccessMessage: {
    id: "SessionActions.deleteSuccessMessage",
    defaultMessage: "Lesson deleted successfully",
  },
  deleteErrorMessage: {
    id: "SessionActions.deleteErrorMessage",
    defaultMessage: "There was an error deleting the lesson. Please try again!",
  },
  shareModalTitle: {
    id: "SessionShareModal.title",
    defaultMessage: "Invite Student",
  },
  shareModalSubtitle: {
    id: "SessionShareModal.subtitle",
    defaultMessage: "Share Link",
  },
  shareModalAnonymousLessonInfo: {
    id: "SessionShareModal.anonymousLessonInfo",
    defaultMessage:
      "This Lesson will be shared anonymously. Anyone with this link can join the lesson.",
  },
  shareModalPrivateLessonInfo: {
    id: "SessionShareModal.privateLessonInfo",
    defaultMessage:
      "This Lesson will be shared privately. " +
      "Students will need to login to join the lesson.",
  },
});

export default messages;
