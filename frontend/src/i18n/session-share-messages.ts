import { defineMessages } from "react-intl";

export const SessionShareMessages = defineMessages({
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
