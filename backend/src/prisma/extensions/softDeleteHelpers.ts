import { Prisma } from "@prisma/client";

export const SOFT_DELETE_FIELD = "deletedAt" as const;

/**
 * Represents a parent-child relation for cascade operations.
 * Used for both soft-deletable children (have deletedAt) and hard-deletable children
 * (no deletedAt, onDelete: Cascade in schema).
 *
 * `relationFieldName` is the name of the relation field on the CHILD model that
 * points back to the parent (e.g., `lesson` on `LessonTask`). We use the relation
 * field rather than scalar foreign-key columns so that cascade `where` clauses
 * can traverse the chain via Prisma relation filters, transparently supporting
 * composite primary keys / composite foreign keys.
 */
export interface ChildRelation {
  model: Prisma.ModelName;
  relationFieldName: string;
}

export enum CascadeMode {
  Soft = "soft",
  Hard = "hard",
}

export type AnyModelWhereInput = NonNullable<
  Prisma.TypeMap["model"][Prisma.ModelName]["operations"]["findMany"]["args"]["where"]
>;

// ============================================================================
// Relation Cache
// ============================================================================

let cacheBuilt = false;
let softDeleteCache = new Map<Prisma.ModelName, ChildRelation[]>();
let hardDeleteCache = new Map<Prisma.ModelName, ChildRelation[]>();

/**
 * Builds both relation caches from Prisma DMMF.
 */
const buildRelationCaches = (): void => {
  softDeleteCache = new Map<Prisma.ModelName, ChildRelation[]>();
  hardDeleteCache = new Map<Prisma.ModelName, ChildRelation[]>();

  for (const model of Prisma.dmmf.datamodel.models) {
    const hasSoftDelete = model.fields.some(
      (field) => field.name === SOFT_DELETE_FIELD,
    );

    for (const field of model.fields) {
      if (field.kind !== "object" || !field.relationFromFields?.length) {
        continue;
      }

      const parentModelName = field.type as Prisma.ModelName;
      const childRelation: ChildRelation = {
        model: model.name as Prisma.ModelName,
        relationFieldName: field.name,
      };

      if (hasSoftDelete) {
        if (!softDeleteCache.has(parentModelName)) {
          softDeleteCache.set(parentModelName, []);
        }
        softDeleteCache.get(parentModelName)!.push(childRelation);
      } else if (field.relationOnDelete === "Cascade") {
        if (!hardDeleteCache.has(parentModelName)) {
          hardDeleteCache.set(parentModelName, []);
        }
        hardDeleteCache.get(parentModelName)!.push(childRelation);
      }
    }
  }
  cacheBuilt = true;
};

/**
 * Gets child relations for a parent model based on cascade mode.
 */
export const getChildRelations = (
  parentModel: Prisma.ModelName,
  mode: CascadeMode,
): ChildRelation[] => {
  if (!cacheBuilt) {
    buildRelationCaches();
  }

  const cache = mode === CascadeMode.Soft ? softDeleteCache : hardDeleteCache;

  return cache.get(parentModel) ?? [];
};

// ============================================================================
// Compound unique selector flattening
// ============================================================================

/**
 * Structural shape shared by Prisma DMMF's `primaryKey` and `uniqueIndexes`
 * entries: a multi-field `@@id` / `@@unique` constraint, optionally given a
 * custom name (otherwise its `WhereUniqueInput` selector key defaults to the
 * fields joined with `_`).
 */
type CompoundConstraint = NonNullable<
  (typeof Prisma.dmmf.datamodel.models)[number]["primaryKey"]
>;

const isMultiField = (
  constraint: CompoundConstraint | null | undefined,
): constraint is CompoundConstraint =>
  constraint != null && constraint.fields.length > 1;

const selectorKeyFor = (constraint: CompoundConstraint): string =>
  constraint.name ?? constraint.fields.join("_");

const compoundUniqueKeysByModel = new Map<Prisma.ModelName, Set<string>>();

/**
 * Returns the set of compound unique selector keys for a model. These are the
 * synthetic keys Prisma exposes in `WhereUniqueInput` for multi-field `@@id`
 * and `@@unique` constraints (e.g., `taskId_hash` for `@@id([taskId, hash])`,
 * or the custom `name:` when provided).
 */
const getCompoundUniqueKeys = (model: Prisma.ModelName): Set<string> => {
  const cached = compoundUniqueKeysByModel.get(model);
  if (cached) return cached;

  const modelDef = Prisma.dmmf.datamodel.models.find((m) => m.name === model);
  const compoundConstraints = [
    modelDef?.primaryKey,
    ...(modelDef?.uniqueIndexes ?? []),
  ].filter(isMultiField);

  const keys = new Set(compoundConstraints.map(selectorKeyFor));
  compoundUniqueKeysByModel.set(model, keys);
  return keys;
};

/**
 * Rewrites a `WhereUniqueInput`-shaped object into a `WhereInput`-compatible
 * one by flattening compound unique selectors into their constituent scalar
 * fields. For example: `{ taskId_hash: { taskId: 1, hash: ... } }` becomes
 * `{ taskId: 1, hash: ... }`.
 *
 * Required because the cascade reuses the root's `where` inside descendant
 * relation filters, and Prisma rejects compound selector keys there (they
 * only exist on `WhereUniqueInput`).
 */
export const flattenCompoundUniqueSelectors = (
  model: Prisma.ModelName,
  where: AnyModelWhereInput | undefined,
): AnyModelWhereInput => {
  if (!where) return {} as AnyModelWhereInput;

  const compoundKeys = getCompoundUniqueKeys(model);
  if (compoundKeys.size === 0) return where;

  const whereEntries = Object.entries(where as Record<string, unknown>);
  const flattened: Record<string, unknown> = {};

  for (const [field, value] of whereEntries) {
    const isCompoundSelector =
      compoundKeys.has(field) && typeof value === "object" && value !== null;

    if (isCompoundSelector) {
      Object.assign(flattened, value);
    } else {
      flattened[field] = value;
    }
  }

  return flattened as AnyModelWhereInput;
};

// ============================================================================
// Where Clause Building
// ============================================================================

/**
 * Builds a where clause for cascading into a child table by referencing the
 * parent through the child's relation field. The resulting filter compiles to
 * an EXISTS / join on the parent table, so a single statement can walk an
 * arbitrarily deep ancestor chain without needing to materialize intermediate
 * PKs in application code.
 *
 * For soft-cascade, the child's own `deletedAt: null` guard is added so that
 * already-soft-deleted rows keep their original timestamp (idempotency), and
 * also so that running the cascade deepest-first remains correct: by the time
 * a higher-level statement runs, descendants are already marked but matched
 * the previous statement before that happened.
 */
export const buildChildWhereClause = (
  child: ChildRelation,
  parentWhere: AnyModelWhereInput,
  includeDeletedAtFilter: boolean,
): AnyModelWhereInput => {
  return {
    ...(includeDeletedAtFilter ? { [SOFT_DELETE_FIELD]: null } : {}),
    [child.relationFieldName]: parentWhere,
  } as AnyModelWhereInput;
};
