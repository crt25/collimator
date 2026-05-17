import { Prisma } from "@prisma/client";
import { withNestedOperations } from "prisma-extension-nested-operations";
import { getModelName, prismaOperations } from "./common";
import {
  AnyModelWhereInput,
  buildChildWhereClause,
  CascadeMode,
  flattenCompoundUniqueSelectors,
  getChildRelations,
  SOFT_DELETE_FIELD,
} from "./softDeleteHelpers";

const MAX_CASCADE_DEPTH = 10;

// Prisma doesn't export the interactive transaction client type publicly,
// so we use 'any' here. The tx object is obtained from Prisma's internal
// _createItxClient method which returns an untyped client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxClient = any;

/**
 * Soft- or hard-deletes all rows of `model` matching `where`, and recursively
 * cascades the same operation to all descendants.
 *
 * Instead of materializing parent IDs at every level (which required
 * `findMany` per level and per-row recursion -- O(rows * relations * depth)
 * round-trips), this implementation cascades the parent's `where` clause down
 * through Prisma relation filters. Each descendant model therefore needs only
 * a single `updateMany` / `deleteMany` whose `where` chains back to the root
 * through `EXISTS` subqueries on the FK columns. Total query count is bounded
 * by the schema topology (edges in the descendant subgraph), independent of
 * the data size.
 *
 * Traversal is post-order at the schema-graph level: descendants are processed
 * before this level, so each statement sees the chain still alive
 * (`deletedAt: null` is required at every soft-deletable hop). The same
 * deepest-first order makes the cascade idempotent on repeated deletions.
 *
 * @param tx - Transaction client for all operations
 * @param model - The model to delete (e.g., "Task", "Solution")
 * @param where - Where clause matching the row(s) of `model` to delete.
 *                For soft mode this should already include `deletedAt: null`.
 * @param mode - 'soft' for soft-deletable models (updateMany with deletedAt),
 *               'hard' for non-soft-deletable models (deleteMany)
 * @param deletedAt - Timestamp for soft-deletes (required for soft mode, ignored for hard)
 * @param depth - Current recursion depth (starts at 0)
 * @throws Error if cascade depth limit is exceeded
 */
async function cascadeDelete(
  tx: TxClient,
  model: Prisma.ModelName,
  where: AnyModelWhereInput,
  mode: CascadeMode,
  deletedAt: Date | null,
  depth: number = 0,
): Promise<void> {
  if (depth >= MAX_CASCADE_DEPTH) {
    throw new Error(
      `Cascade depth limit (${MAX_CASCADE_DEPTH}) exceeded at ${model}. This may indicate a circular reference.`,
    );
  }

  // Descendants first (post-order).
  await cascadeDeleteChildrenOf(tx, model, where, mode, deletedAt, depth);

  // Then this level.
  const clientModel = getModelName(model);
  if (mode === CascadeMode.Soft) {
    await tx[clientModel].updateMany({
      where,
      data: { [SOFT_DELETE_FIELD]: deletedAt },
    });
  } else {
    await tx[clientModel].deleteMany({ where });
  }
}

/**
 * Cascades deletion only to the descendants of `parentModel` matching
 * `parentWhere`, without touching `parentModel` itself. Used at the top level
 * because the root row is updated separately by the caller (to preserve
 * `include` / `select` semantics for `delete`).
 *
 * For soft cascade, each hop is gated on `deletedAt: null` so that:
 *  - already-deleted rows keep their original timestamp
 *  - a previously-broken (already-deleted) intermediate ancestor stops the
 *    cascade at that branch (preserves prior behavior)
 */
async function cascadeDeleteChildrenOf(
  tx: TxClient,
  parentModel: Prisma.ModelName,
  parentWhere: AnyModelWhereInput,
  mode: CascadeMode,
  deletedAt: Date | null,
  depth: number = 0,
): Promise<void> {
  const isSoftCascade = mode === CascadeMode.Soft;

  for (const child of getChildRelations(parentModel, mode)) {
    const childWhere = buildChildWhereClause(child, parentWhere, isSoftCascade);
    await cascadeDelete(
      tx,
      child.model,
      childWhere,
      mode,
      deletedAt,
      depth + 1,
    );
  }
}

/**
 * Top-level entry point for cascading a delete from a soft-deletable root.
 *
 * Builds the cascade seed (the user's `where` with `deletedAt: null` so we
 * only walk descendants whose ancestor chain is still alive), then cascades
 * into all soft- and hard-deletable descendants. The root row itself is NOT
 * touched here -- callers update it separately (via `update` to preserve
 * `include` / `select` for `delete`, or via `updateMany` for `deleteMany`).
 *
 * Returns the seed so `deleteMany` callers can reuse it for the final
 * `updateMany` on the root.
 */
const startCascadeDelete = async (
  tx: TxClient,
  model: Prisma.ModelName,
  where: AnyModelWhereInput | undefined,
  deletedAt: Date,
): Promise<AnyModelWhereInput> => {
  // The user's `where` may be a `WhereUniqueInput` containing compound
  // selectors (e.g., `taskId_hash` for an `@@id([taskId, hash])`). Those are
  // valid for the root row but rejected by Prisma inside relation filters,
  // which the cascade nests this seed into. Flatten them upfront.
  const flattenedWhere = flattenCompoundUniqueSelectors(model, where);

  // The double cast widens away the model-specific where type: the literal
  // `deletedAt: null` is incompatible with non-soft-deletable members of the
  // `AnyModelWhereInput` union, and TS can't narrow on the soft-deletable
  // ones from this context.
  const seed = {
    ...flattenedWhere,
    [SOFT_DELETE_FIELD]: null,
  } as unknown as AnyModelWhereInput;

  await cascadeDeleteChildrenOf(tx, model, seed, CascadeMode.Soft, deletedAt);
  await cascadeDeleteChildrenOf(tx, model, seed, CascadeMode.Hard, null);

  return seed;
};

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

            switch (operation) {
              case prismaOperations.delete: {
                await startCascadeDelete(
                  txClient,
                  modelName,
                  args.where,
                  deletedAt,
                );

                return await txClient[clientModel].update({
                  where: args.where,
                  include: args.include,
                  select: args.select,
                  data: { deletedAt },
                });
              }

              case prismaOperations.deleteMany: {
                const seed = await startCascadeDelete(
                  txClient,
                  modelName,
                  args.where,
                  deletedAt,
                );

                return await txClient[clientModel].updateMany({
                  where: seed,
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
