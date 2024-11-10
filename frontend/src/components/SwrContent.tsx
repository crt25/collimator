import MultiSwrContent from "./MultiSwrContent";

const SwrContent = <TData extends unknown>({
  data,
  children,
  error,
  isLoading,
}: {
  data: TData | undefined;
  children: (data: TData) => React.ReactNode;
  error?: Error;
  isLoading: boolean;
}) => (
  <MultiSwrContent data={[data]} errors={[error]} isLoading={[isLoading]}>
    {([data]) => children(data)}
  </MultiSwrContent>
);

export default SwrContent;
