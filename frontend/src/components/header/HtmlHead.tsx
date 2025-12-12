import React from "react";
import {
  defineMessages,
  MessageDescriptor,
  PrimitiveType,
  useIntl,
} from "react-intl";
import Head from "next/head";

const messages = defineMessages({
  applicationName: {
    id: "Header.applicationName",
    defaultMessage: "ClassMosaic",
  },
});

const HtmlHead = ({
  title,
  titleParameters,
  description,
}: {
  title: MessageDescriptor;
  titleParameters?: Record<string, PrimitiveType>;
  description?: MessageDescriptor;
}) => {
  const intl = useIntl();

  return (
    <Head>
      <title>
        {`${intl.formatMessage(messages.applicationName)} - ${intl.formatMessage(title, titleParameters)}`}
      </title>
      {description && (
        <meta name="description" content={intl.formatMessage(description)} />
      )}
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default HtmlHead;
