export interface QueryResultClass<DtoType, QueryResultType> {
  fromQueryResult(data: QueryResultType): DtoType;
}

export const fromQueryResults = <
  TDto,
  TQueryResult,
  TClass extends QueryResultClass<TDto, TQueryResult>,
>(
  instanceConstructor: TClass,
  results: TQueryResult[],
): TDto[] => results.map(instanceConstructor.fromQueryResult);
