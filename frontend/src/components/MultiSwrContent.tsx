import { useMemo } from "react";
import ErrorMessage from "./ErrorMessage";
import ProgressSpinner from "./ProgressSpinner";

const logModule = "[MultiSwrContent]";

const areAllElementsDefined = <TData extends readonly unknown[] | []>(
  data: TData,
): data is {
  -readonly [P in keyof TData]: Exclude<TData[P], undefined>;
} => data.every((d) => d !== undefined);

const MultiSwrContent = <TData extends readonly unknown[] | []>({
  children,
  data,
  isLoading,
  errors,
}: {
  data: TData;
  children: (data: {
    -readonly [P in keyof TData]: Exclude<TData[P], undefined>;
  }) => React.ReactNode;
  errors: (Error | undefined)[];
  isLoading: boolean[];
}) => {
  if (data.length !== isLoading.length || data.length !== errors.length) {
    throw new Error("data, isLoading, and errors must have the same length");
  }

  const nonLoadingErrors = errors.filter(
    (error, index) => error !== undefined && !isLoading[index],
  );

  const nonLoadingErrorsWithoutStaleData = nonLoadingErrors.filter(
    (_error, index) => data[index] === undefined,
  );

  const renderedChildren = useMemo(() => {
    if (areAllElementsDefined(data)) {
      return children(data);
    }

    return null;
  }, [children, data]);

  if (nonLoadingErrors.length > 0) {
    console.error(`${logModule} Failed to load:`, nonLoadingErrors);
  }

  if (nonLoadingErrorsWithoutStaleData.length > 0) {
    return nonLoadingErrorsWithoutStaleData
      .filter((e) => e !== undefined)
      .map((error, index) => <ErrorMessage key={index} error={error} />);
  }

  if (renderedChildren !== null) {
    return renderedChildren;
  }

  return isLoading.find((loading) => loading) ? <ProgressSpinner /> : null;
};

export default MultiSwrContent;
