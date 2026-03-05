import { Prisma } from "@prisma/client";
import { withNestedOperations } from "prisma-extension-nested-operations";
import { getModelName, prismaOperations } from "./common";
import {
  buildForeignKeyWhereClause,
  CascadeMode,
  EntityId,
  extractEntityId,
  fieldsToSelect,
  getChildRelations,
  getModelPrimaryKeyFields,
  SOFT_DELETE_FIELD,
} from "./softDeleteHelpers";

const MAX_CASCADE_DEPTH = 10;

// Prisma doesn't export the interactive transaction client type publicly,
// so we use 'any' here. The tx object is obtained from Prisma's internal
// _createItxClient method which returns an untyped client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxClient = any;

/**
 * Recursively cascade delete to all children of a parent entity.
 * Uses depth-first traversal to ensure grandchildren are deleted before children.
 *
 * @param tx - Transaction client for all operations
 * @param parentModel - Name of the parent model (e.g., "Task", "Solution")
 * @param parentId - ID of the parent record (number or composite key object)
 * @param mode - 'soft' for soft-deletable children (updateMany with deletedAt),
 *               'hard' for non-soft-deletable children (deleteMany)
 * @param deletedAt - Timestamp for soft-deletes (required for soft mode, ignored for hard)
 * @param depth - Current recursion depth (starts at 0)
 * @throws Error if cascade depth limit is exceeded
 */
async function cascadeDelete(
  tx: TxClient,
  parentModel: Prisma.ModelName,
  parentId: EntityId,
  mode: CascadeMode,
  deletedAt: Date | null,
  depth: number = 0,
): Promise<void> {
  if (depth >= MAX_CASCADE_DEPTH) {
    throw new Error(
      `Cascade depth limit (${MAX_CASCADE_DEPTH}) exceeded at ${parentModel}. This may indicate a circular reference.`,
    );
  }

  const children = getChildRelations(parentModel, mode);

  if (children.length === 0) return;

  // For soft-delete, filter by deletedAt: null to only find non-deleted children
  const filterByDeletedAt = mode === CascadeMode.Soft;

  for (const child of children) {
    const clientModel = getModelName(child.model);
    const childPkFields = getModelPrimaryKeyFields(child.model);

    const childRecords = await tx[clientModel].findMany({
      where: buildForeignKeyWhereClause(
        child,
        parentModel,
        parentId,
        filterByDeletedAt,
      ),
      select: fieldsToSelect(childPkFields),
    });

    // Depth-first: recurse BEFORE deleting this level
    for (const record of childRecords) {
      await cascadeDelete(
        tx,
        child.model,
        extractEntityId(record, childPkFields),
        mode,
        deletedAt,
        depth + 1,
      );
    }

    // Delete all children of this type
    if (mode === CascadeMode.Soft) {
      await tx[clientModel].updateMany({
        where: buildForeignKeyWhereClause(child, parentModel, parentId, true),
        data: { [SOFT_DELETE_FIELD]: deletedAt },
      });
    } else {
      await tx[clientModel].deleteMany({
        where: buildForeignKeyWhereClause(child, parentModel, parentId, false),
      });
    }
  }
}

// ============================================================================
// Extension Definition
// ============================================================================

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

            const deletedAt = new Date();
            const clientModel = getModelName(model);
            const modelName = model as Prisma.ModelName;
            const pkFields = getModelPrimaryKeyFields(modelName);

            switch (operation) {
              case prismaOperations.delete: {
                // Get the parent ID for cascading
                const entityId = extractEntityId(args.where, pkFields);

                // Cascade to children BEFORE soft-deleting parent
                // This ensures child records still have valid FK references during cascade
                await cascadeDelete(
                  txClient,
                  modelName,
                  entityId,
                  CascadeMode.Soft,
                  deletedAt,
                );
                await cascadeDelete(
                  txClient,
                  modelName,
                  entityId,
                  CascadeMode.Hard,
                  null,
                );

                // Now soft-delete the parent
                return await txClient[clientModel].update({
                  where: args.where,
                  include: args.include,
                  select: args.select,
                  data: { deletedAt },
                });
              }

              case prismaOperations.deleteMany: {
                // Find all records matching the where clause (only non-deleted)
                const records = await txClient[clientModel].findMany({
                  where: { ...args.where, deletedAt: null },
                  select: fieldsToSelect(pkFields),
                });

                // Cascade for each record before bulk soft-delete
                for (const record of records) {
                  const entityId = extractEntityId(record, pkFields);
                  await cascadeDelete(
                    txClient,
                    modelName,
                    entityId,
                    CascadeMode.Soft,
                    deletedAt,
                  );
                  await cascadeDelete(
                    txClient,
                    modelName,
                    entityId,
                    CascadeMode.Hard,
                    null,
                  );
                }

                // Bulk soft-delete all parents
                return await txClient[clientModel].updateMany({
                  where: { ...args.where, deletedAt: null },
                  data: { deletedAt },
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
