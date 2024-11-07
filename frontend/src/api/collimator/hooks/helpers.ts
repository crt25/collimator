import {
  LazyTableFetchFunction,
  LazyTableResult,
} from "@/components/DataTable";
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
