import { Prisma } from "@prisma/client";
import { withNestedOperations } from "prisma-extension-nested-operations";
import { prismaOperations } from "./common";

const getSoftDeletableModels = (): string[] => {
  return Prisma.dmmf.datamodel.models
    .filter((model) => model.fields.some((field) => field.name === "deletedAt"))
    .map((model) => model.name);
};

const softDeletableModels = getSoftDeletableModels();

export const softDeleteExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      $allModels: {
        $allOperations: withNestedOperations({
          async $rootOperation(params) {
            const { model, operation, args, query } = params;

            if (!softDeletableModels.includes(model)) {
              return query(args);
            }

            switch (operation) {
              case prismaOperations.delete: {
                return await client[model.toLowerCase()].update({
                  where: args.where,
                  include: args.include,
                  select: args.select,
                  data: { deletedAt: new Date() },
                });
              }

              case prismaOperations.deleteMany: {
                return await client[model.toLowerCase()].updateMany({
                  where: { ...args.where, deletedAt: null },
                  data: { deletedAt: new Date() },
                });
              }

              default:
                return query(args);
            }
          },
          async $allNestedOperations(params) {
            const { model, operation, args, query } = params;

            if (!softDeletableModels.includes(model)) {
              return await query(args, operation);
            }

            switch (operation) {
              case prismaOperations.delete: {
                return await query(
                  {
                    where: args.where,
                    data: { deletedAt: new Date() },
                  },
                  prismaOperations.update,
                );
              }

              case prismaOperations.deleteMany: {
                return await query(
                  {
                    where: { ...args.where, deletedAt: null },
                    data: { deletedAt: new Date() },
                  },
                  prismaOperations.updateMany,
                );
              }

              default:
                return await query(args, operation);
            }
          },
        }),
      },
    },
  });
});
