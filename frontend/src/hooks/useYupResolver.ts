import { useCallback, useEffect, useRef } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues } from "react-hook-form";

export type YupResolverFactoryParameters<TFieldValues extends FieldValues> =
  Parameters<typeof yupResolver<TFieldValues>>;

export type YupResolver<TFieldValues extends FieldValues> = ReturnType<
  typeof yupResolver<TFieldValues>
>;

type YupResolverParameters<TFieldValues extends FieldValues> = Parameters<
  YupResolver<TFieldValues>
>;

type YupResolverReturnType<TFieldValues extends FieldValues> = ReturnType<
  YupResolver<TFieldValues>
>;

export const useYupResolver = <TFieldValues extends FieldValues>(
  ...factoryArgs: YupResolverFactoryParameters<TFieldValues>
): YupResolver<TFieldValues> => {
  // initialize a reference s.t. the resolver can always use the latest schema
  // this is necessary because the react hook form does not update it's resolver
  // but yup stores the i18n messages in the schema
  const resolverRef = useRef<YupResolver<TFieldValues>>(
    yupResolver<TFieldValues>(...factoryArgs),
  );

  // update the resolver when the factory arguments change
  useEffect(() => {
    resolverRef.current = yupResolver<TFieldValues>(...factoryArgs);
  }, [factoryArgs]);

  return useCallback(
    (
      ...args: YupResolverParameters<TFieldValues>
    ): YupResolverReturnType<TFieldValues> => resolverRef.current(...args),
    // the dependency array is empty as the react-hook form never updates the resolver anyway
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
};
