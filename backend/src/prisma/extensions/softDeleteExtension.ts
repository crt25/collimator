import { Prisma } from "@prisma/client";
import { withNestedOperations } from "prisma-extension-nested-operations";
import { getModelName, prismaOperations } from "./common";

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
            const { model, operation, args, query, ...rest } = params;

            if (!softDeletableModels.includes(model)) {
              return query(args);
            }

            // Workaround: access transaction context from internal params
            // Root operations in prisma-extension-nested-operations don't receive the transaction client directly.
            // Without this, the extension updates would execute on the base client instead of within the active transaction.
            // This caused premature transaction termination. The solution is to extract the transaction from Prisma's internal params and create an interactive transaction
            // client to make sure the operations are executed within the correct transaction context.
            // @see https://github.com/prisma/prisma/discussions/25034

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const transaction = (rest as any).__internalParams?.transaction;

            const txClient = transaction
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (client as any)._createItxClient(transaction)
              : client;

            switch (operation) {
              case prismaOperations.delete: {
                const clientModel = getModelName(model);
                return await txClient[clientModel].update({
                  where: args.where,
                  include: args.include,
                  select: args.select,
                  data: { deletedAt: new Date() },
                });
              }

              case prismaOperations.deleteMany: {
                const clientModel = getModelName(model);
                return await txClient[clientModel].updateMany({
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
