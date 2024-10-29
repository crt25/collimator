/* eslint-disable @typescript-eslint/no-empty-object-type */
import { useMemo } from "react";
import { useIntl } from "react-intl";
import * as yup from "yup";

export type YupSchemaParameters<
  C extends yup.Maybe<yup.AnyObject> = yup.AnyObject,
  S extends yup.ObjectShape = {},
> = Parameters<typeof yup.object<C, S>>;

export type YupSchema<
  C extends yup.Maybe<yup.AnyObject> = yup.AnyObject,
  S extends yup.ObjectShape = {},
> = ReturnType<typeof yup.object<C, S>>;

export type YupRequiredSchema<
  C extends yup.Maybe<yup.AnyObject> = yup.AnyObject,
  S extends yup.ObjectShape = {},
> = ReturnType<YupSchema<C, S>["required"]>;

export const useYupSchema = <
  C extends yup.Maybe<yup.AnyObject> = yup.AnyObject,
  S extends yup.ObjectShape = {},
>(
  ...args: YupSchemaParameters<C, S>
): YupRequiredSchema<C, S> => {
  const intl = useIntl();

  return useMemo<YupRequiredSchema<C, S>>(
    () => yup.object<C, S>(...args).required(),
    // the schema implicitly depends on the locale
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [intl.locale],
  );
};
