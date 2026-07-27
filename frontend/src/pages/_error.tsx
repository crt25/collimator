import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import NextErrorComponent from "next/error";

const CustomErrorComponent = ({
  statusCode,
  err,
}: {
  statusCode?: number;
  err?: Error;
}) => {
  useEffect(() => {
    if (err) {
      Sentry.captureException(err);
    }
  }, [err]);

  return <NextErrorComponent statusCode={statusCode ?? 404} />;
};

export default CustomErrorComponent;
