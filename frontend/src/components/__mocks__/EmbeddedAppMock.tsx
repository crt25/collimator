import { forwardRef, useImperativeHandle } from "react";
import { EmbeddedAppRef, Props } from "../EmbeddedApp";

export const createMockedEmbeddedApp = (
  sendRequest: EmbeddedAppRef["sendRequest"],
) =>
  forwardRef<EmbeddedAppRef, Props>(function MockEmbeddedApp({ src }, ref) {
    useImperativeHandle(
      ref,
      () => ({
        sendRequest,
      }),
      [],
    );

    return <iframe src={src} />;
  });
