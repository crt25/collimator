import { NestedOperation } from "prisma-extension-nested-operations";

const nestedOperations = {
  where: "where",
  include: "include",
  select: "select",
  create: "create",
  update: "update",
  upsert: "upsert",
  connectOrCreate: "connectOrCreate",
  connect: "connect",
  disconnect: "disconnect",
  createMany: "createMany",
  updateMany: "updateMany",
  delete: "delete",
  deleteMany: "deleteMany",
} as const satisfies Record<NestedOperation, NestedOperation>;

export const prismaOperations = {
  ...nestedOperations,
  findUnique: "findUnique",
  findFirst: "findFirst",
  findMany: "findMany",
  findUniqueOrThrow: "findUniqueOrThrow",
  findFirstOrThrow: "findFirstOrThrow",
  count: "count",
  aggregate: "aggregate",
  groupBy: "groupBy",
} as const;

export const getModelName = (model: string): string => {
  return model[0].toLowerCase() + model.slice(1);
};
