import { messages } from "../i18n/messages";
import { formatMessage } from "../i18n/intl";
import { OtterError } from "./otter-errors";

/**
 * The grading kernel could not be prepared within the allotted time.
 *
 * The message is translated because it is user-facing: it travels over the
 * iframe RPC to the embedding app, which renders it in the toast shown to the
 * student or teacher whose save just failed.
 *
 * This lives outside `otter-errors` on purpose: that module is imported by
 * `utils`, and pulling the i18n bundle in there would drag it into every
 * consumer of the kernel helpers.
 */
export class OtterKernelNotReadyError extends OtterError {
  constructor() {
    super(formatMessage(messages.kernelNotReadyBody));
  }
}
