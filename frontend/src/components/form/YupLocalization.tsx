import { useEffect } from "react";
import { defineMessages, useIntl } from "react-intl";
import { setLocale } from "yup";

// see https://github.com/jquense/yup/blob/master/src/locale.ts
const messages = defineMessages({
  // Array validation messages
  arrayMin: {
    id: "forms.arrayMin",
    defaultMessage: "$'{path}' field must have at least $'{min}' items",
  },
  arrayMax: {
    id: "forms.arrayMax",
    defaultMessage:
      "$'{path}' field must have less than or equal to $'{max}' items",
  },
  arrayLength: {
    id: "forms.arrayLength",
    defaultMessage: "$'{path}' must have $'{length}' items",
  },

  // Boolean validation message
  booleanIsValue: {
    id: "forms.booleanIsValue",
    defaultMessage: "$'{path}' field must be $'{value}'",
  },

  // Mixed validation messages
  mixedDefault: {
    id: "forms.mixedDefault",
    defaultMessage: "$'{path}' is invalid",
  },
  mixedRequired: {
    id: "forms.mixedRequired",
    defaultMessage: "$'{path}' is a required field",
  },
  mixedDefined: {
    id: "forms.mixedDefined",
    defaultMessage: "$'{path}' must be defined",
  },
  mixedNotNull: {
    id: "forms.mixedNotNull",
    defaultMessage: "$'{path}' cannot be null",
  },
  mixedOneOf: {
    id: "forms.mixedOneOf",
    defaultMessage:
      "$'{path}' must be one of the following values: $'{values}'",
  },
  mixedNotOneOf: {
    id: "forms.mixedNotOneOf",
    defaultMessage:
      "$'{path}' must not be one of the following values: $'{values}'",
  },

  // String validation messages
  stringLength: {
    id: "forms.stringLength",
    defaultMessage: "$'{path}' must be exactly $'{length}' characters",
  },
  stringMin: {
    id: "forms.stringMin",
    defaultMessage: "$'{path}' must be at least $'{min}' characters",
  },
  stringMax: {
    id: "forms.stringMax",
    defaultMessage: "$'{path}' must be at most $'{max}' characters",
  },
  stringMatches: {
    id: "forms.stringMatches",
    defaultMessage: "$'{path}' must match the following: \"$'{regex}'\"",
  },
  stringEmail: {
    id: "forms.stringEmail",
    defaultMessage: "$'{path}' must be a valid email",
  },
  stringUrl: {
    id: "forms.stringUrl",
    defaultMessage: "$'{path}' must be a valid URL",
  },
  stringUuid: {
    id: "forms.stringUuid",
    defaultMessage: "$'{path}' must be a valid UUID",
  },
  stringDatetime: {
    id: "forms.stringDatetime",
    defaultMessage: "$'{path}' must be a valid ISO date-time",
  },
  stringDatetimePrecision: {
    id: "forms.stringDatetimePrecision",
    defaultMessage:
      "$'{path}' must be a valid ISO date-time with a sub-second precision of exactly $'{precision}' digits",
  },
  stringDatetimeOffset: {
    id: "forms.stringDatetimeOffset",
    defaultMessage:
      "$'{path}' must be a valid ISO date-time with UTC \"Z\" timezone",
  },
  stringTrim: {
    id: "forms.stringTrim",
    defaultMessage: "$'{path}' must be a trimmed string",
  },
  stringLowercase: {
    id: "forms.stringLowercase",
    defaultMessage: "$'{path}' must be a lowercase string",
  },
  stringUppercase: {
    id: "forms.stringUppercase",
    defaultMessage: "$'{path}' must be an uppercase string",
  },

  // Number validation messages
  numberMin: {
    id: "forms.numberMin",
    defaultMessage: "$'{path}' must be greater than or equal to $'{min}'",
  },
  numberMax: {
    id: "forms.numberMax",
    defaultMessage: "$'{path}' must be less than or equal to $'{max}'",
  },
  numberLessThan: {
    id: "forms.numberLessThan",
    defaultMessage: "$'{path}' must be less than $'{less}'",
  },
  numberMoreThan: {
    id: "forms.numberMoreThan",
    defaultMessage: "$'{path}' must be greater than $'{more}'",
  },
  numberPositive: {
    id: "forms.numberPositive",
    defaultMessage: "$'{path}' must be a positive number",
  },
  numberNegative: {
    id: "forms.numberNegative",
    defaultMessage: "$'{path}' must be a negative number",
  },
  numberInteger: {
    id: "forms.numberInteger",
    defaultMessage: "$'{path}' must be an integer",
  },

  // Date validation messages
  dateMin: {
    id: "forms.dateMin",
    defaultMessage: "$'{path}' field must be later than $'{min}'",
  },
  dateMax: {
    id: "forms.dateMax",
    defaultMessage: "$'{path}' field must be earlier than $'{max}'",
  },

  // Object validation message
  objectNoUnknown: {
    id: "forms.objectNoUnknown",
    defaultMessage: "$'{path}' field has unspecified keys: $'{unknown}'",
  },
});

const YupLocalization = ({ children }: { children: React.ReactNode }) => {
  const intl = useIntl();

  useEffect(() => {
    setLocale({
      array: {
        min: intl.formatMessage(messages.arrayMin),
        max: intl.formatMessage(messages.arrayMax),
        length: intl.formatMessage(messages.arrayLength),
      },
      boolean: {
        isValue: intl.formatMessage(messages.booleanIsValue),
      },
      mixed: {
        default: intl.formatMessage(messages.mixedDefault),
        required: intl.formatMessage(messages.mixedRequired),
        defined: intl.formatMessage(messages.mixedDefined),
        notNull: intl.formatMessage(messages.mixedNotNull),
        oneOf: intl.formatMessage(messages.mixedOneOf),
        notOneOf: intl.formatMessage(messages.mixedNotOneOf),
      },
      string: {
        length: intl.formatMessage(messages.stringLength),
        min: intl.formatMessage(messages.stringMin),
        max: intl.formatMessage(messages.stringMax),
        matches: intl.formatMessage(messages.stringMatches),
        email: intl.formatMessage(messages.stringEmail),
        url: intl.formatMessage(messages.stringUrl),
        uuid: intl.formatMessage(messages.stringUuid),
        datetime: intl.formatMessage(messages.stringDatetime),
        datetime_precision: intl.formatMessage(
          messages.stringDatetimePrecision,
        ),
        datetime_offset: intl.formatMessage(messages.stringDatetimeOffset),
        trim: intl.formatMessage(messages.stringTrim),
        lowercase: intl.formatMessage(messages.stringLowercase),
        uppercase: intl.formatMessage(messages.stringUppercase),
      },
      number: {
        min: intl.formatMessage(messages.numberMin),
        max: intl.formatMessage(messages.numberMax),
        lessThan: intl.formatMessage(messages.numberLessThan),
        moreThan: intl.formatMessage(messages.numberMoreThan),
        positive: intl.formatMessage(messages.numberPositive),
        negative: intl.formatMessage(messages.numberNegative),
        integer: intl.formatMessage(messages.numberInteger),
      },
      date: {
        min: intl.formatMessage(messages.dateMin),
        max: intl.formatMessage(messages.dateMax),
      },
      object: {
        noUnknown: intl.formatMessage(messages.objectNoUnknown),
      },
    });
  }, [intl, intl.locale]);

  return children;
};

export default YupLocalization;
