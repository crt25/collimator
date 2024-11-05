import {
  LazyTableFetchFunction,
  LazyTableResult,
} from "@/components/DataTable";
import { DtoClass } from "../models/dto-class";

type HasUpToDateData<TData> = {
  data: TData;
  error: undefined;
  isLoading: false;
};
type HasStaleData<TData> = { data: TData; error: undefined; isLoading: true };
type HasData<TData> = HasUpToDateData<TData> | HasStaleData<TData>;

type HasUpToDateError<TError> = {
  data: undefined;
  error: TError;
  isLoading: false;
};

type HasStaleError<TError> = {
  data: undefined;
  error: TError;
  isLoading: true;
};

type HasError<TError> = HasUpToDateError<TError> | HasStaleError<TError>;

type FirstFetch = { data: undefined; error: undefined; isLoading: true };

export type ApiResponse<TData, TError = unknown> =
  | HasData<TData>
  | HasError<TError>
  | FirstFetch;

export const transformSwrOutput = <TDto, TClass, TError>(swrOutput: {
  data?: TDto;
  error?: TError;
  isLoading: boolean;
}): ApiResponse<TClass, TError> => {
  if (swrOutput.data) {
    return {
      ...swrOutput,
      data: swrOutput.data,
      error: undefined,
    } as HasData<TClass>;
  }

  if (swrOutput.error) {
    return {
      ...swrOutput,
      data: undefined,
    } as HasError<TError>;
  }

  return {
    data: undefined,
    error: undefined,
    isLoading: true,
  };
};

type TFromDto = {
  <TDto, TInstance, TClass extends DtoClass<TDto, TInstance>>(
    instanceConstructor: TClass,
    dto: TDto,
  ): TInstance;
  <TDto, TInstance, TClass extends DtoClass<TDto, TInstance>>(
    instanceConstructor: TClass,
    dto: TDto[],
  ): TInstance[];
};

export const fromDto: TFromDto = (instanceConstructor, dto) => {
  if (Array.isArray(dto)) {
    return dto.map((dto) => instanceConstructor.fromDto(dto));
  }

  return instanceConstructor.fromDto(dto);
};

export type LazyTableFetchFunctionWithParameters<TParams, TData> = (
  params?: TParams,
) => LazyTableFetchFunction<TData>;

export const transformToLazyTableResult = <TData>(
  items: TData[],
): LazyTableResult<TData> => ({
  items,
  totalCount: items.length,
});
