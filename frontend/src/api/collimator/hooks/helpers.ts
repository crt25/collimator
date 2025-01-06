import { mutate } from "swr";
import { LazyTableResult } from "@/components/DataTable";
import { DtoClass } from "../models/dto-class";

export type ApiResponse<TData, TError extends Error> = {
  data?: TData;
  error?: TError;
  isLoading: boolean;
};

export const fromDtos = <
  TDto,
  TInstance,
  TClass extends DtoClass<TDto, TInstance>,
>(
  instanceConstructor: TClass,
  dtos: TDto[],
): TInstance[] => dtos.map((dto) => instanceConstructor.fromDto(dto));

export const transformToLazyTableResult = <TData>(
  items: TData[],
): LazyTableResult<TData> => ({
  items,
  totalCount: items.length,
});

/**
 * Computes a key consisting of two strings to be used with SWR.
 * The first element is the URL without any params to allow easier invalidation.
 * The second element is the URL with the params to allow for caching and re-use.
 * @param getUrl A function that, given the params, returns the URL.
 * @param params The params for the getUrl function.
 * @returns A swr key consisting of two strings.
 */
export const getSwrParamererizedKey = <TParams>(
  getUrl: (params?: TParams) => string,
  params?: TParams,
): [string, string] => [getUrl(), getUrl(params)];

type Mutate = typeof mutate;

/**
 * Invalidates the cache for a parameterized URL whose SWR key
 * was computed using getSwrParamererizedKey.
 * @param mutate The mutate function from useSWRConfig.
 * @param getUrl The function that computes the URL. Will be called without params.
 * @returns The promise returned by mutate.
 */
export const invalidateParameterizedKey = <TParams>(
  mutate: Mutate,
  getUrl: (params?: TParams) => string,
): void => {
  mutate((key) => {
    return (
      Array.isArray(key) &&
      key.length >= 1 &&
      typeof key[0] === "string" &&
      key[0].startsWith(getUrl())
    );
  });
};

export const getIdOrNaN = (id?: string | number): number =>
  typeof id === "number" ? id : parseInt(id ?? "no id", 10);
