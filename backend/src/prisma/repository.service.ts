import { Injectable } from "@nestjs/common";

interface Repository<
  T,
  WhereInput,
  WhereUniqueInput,
  OrderByWithRelationInput,
  CreateInput,
  UpdateInput,
> {
  findUnique(parameters: {
    where: WhereUniqueInput;
    include?: any; // TODO: fix this
  }): Promise<T | null>;

  findMany(parameters: {
    skip?: number;
    take?: number;
    cursor?: WhereUniqueInput;
    where?: WhereInput;
    orderBy?: OrderByWithRelationInput;
  }): Promise<T[]>;

  create(parameters: { data: CreateInput }): Promise<T>;

  update(parameters: {
    data: UpdateInput;
    where: WhereUniqueInput;
  }): Promise<T>;

  delete(parameters: { where: WhereUniqueInput }): Promise<T>;
}

@Injectable()
export abstract class RepositoryService<
  T,
  CreateT extends { toInput(): CreateInput },
  UpdateT extends { toInput(): UpdateInput },
  WhereInput,
  WhereUniqueInput,
  OrderByWithRelationInput,
  CreateInput,
  UpdateInput,
> {
  constructor(
    protected repository: Repository<
      T,
      WhereInput,
      WhereUniqueInput,
      OrderByWithRelationInput,
      CreateInput,
      UpdateInput
    >,
  ) {}

  async findUnique({
    where,
    include,
  }: {
    where: WhereUniqueInput;
    include?: any; // TODO: fix this
  }): Promise<T | null> {
    return this.repository.findUnique({
      where,
      include,
    });
  }

  async findMany({
    skip,
    take,
    cursor,
    where,
    orderBy,
    include,
  }: {
    skip?: number;
    take?: number;
    cursor?: WhereUniqueInput;
    where?: WhereInput;
    orderBy?: OrderByWithRelationInput;
    include?: any; // TODO: fix this
  }): Promise<T[]> {
    return this.repository.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(data: CreateT): Promise<T> {
    return this.repository.create({
      data: data.toInput(),
    });
  }

  async update({
    data,
    where,
  }: {
    where: WhereUniqueInput;
    data: UpdateT;
  }): Promise<T> {
    return this.repository.update({
      data: data.toInput(),
      where,
    });
  }

  async delete(where: WhereUniqueInput): Promise<T> {
    return this.repository.delete({
      where,
    });
  }
}
