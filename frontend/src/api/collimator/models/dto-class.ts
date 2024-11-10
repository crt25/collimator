export interface DtoClass<DtoType, InstanceType> {
  fromDto(dto: DtoType): InstanceType;
}
