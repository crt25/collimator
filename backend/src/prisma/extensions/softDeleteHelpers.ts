import { Prisma } from "@prisma/client";

export const SOFT_DELETE_FIELD = "deletedAt" as const;

/**
 * Type for entity ID - can be simple integer or composite key object.
 * Used for both parent and child record identification during cascade.
 */
export type EntityId = number | Record<string, unknown>;

/**
 * Represents a parent-child relation for cascade operations.
 * Used for both soft-deletable children (have deletedAt) and hard-deletable children
 * (no deletedAt, onDelete: Cascade in schema).
 */
export interface ChildRelation {
  model: Prisma.ModelName;
  foreignKey: string;
  /** Present only for relations referencing composite primary keys */
  compositeFields?: readonly string[];
}

export enum CascadeMode {
  Soft = "soft",
  Hard = "hard",
}

// ============================================================================
// DMMF Helpers
// ============================================================================

/**
 * Gets the primary key field names for a given model.
 * Returns the @id field name for simple keys, or all @@id fields for composite keys.
 */
export function getModelPrimaryKeyFields(
  modelName: Prisma.ModelName,
): string[] {
  const modelDef = Prisma.dmmf.datamodel.models.find(
    (m) => m.name === modelName,
  );

  if (!modelDef) {
    throw new Error(
      `Model "${modelName}" not found in Prisma DMMF. This indicates a schema mismatch.`,
    );
  }

  // Check for composite primary key (@@id)
  if (modelDef.primaryKey?.fields && modelDef.primaryKey.fields.length > 0) {
    return [...modelDef.primaryKey.fields];
  }

  // Find the @id field - it has isId = true
  const idField = modelDef.fields.find((f) => f.isId);
  return idField ? [idField.name] : ["id"];
}

/**
 * Builds a select clause from field names: ["a", "b"] => { a: true, b: true }
 */
export function fieldsToSelect(fields: string[]): Record<string, true> {
  return Object.fromEntries(fields.map((f) => [f, true])) as Record<
    string,
    true
  >;
}

/**
 * Extracts entity ID from a record based on primary key fields.
 */
export function extractEntityId(
  record: Record<string, unknown>,
  pkFields: string[],
): EntityId {
  if (pkFields.length === 1) {
    return record[pkFields[0]] as number;
  }
  // Composite key - build object with all PK fields
  return Object.fromEntries(pkFields.map((f) => [f, record[f]]));
}

// ============================================================================
// Relation Cache
// ============================================================================

let softDeleteCache: Map<Prisma.ModelName, ChildRelation[]> | null = null;
let hardDeleteCache: Map<Prisma.ModelName, ChildRelation[]> | null = null;

/**
 * Builds both relation caches from Prisma DMMF.
 */
function buildRelationCaches(): void {
  softDeleteCache = new Map<Prisma.ModelName, ChildRelation[]>();
  hardDeleteCache = new Map<Prisma.ModelName, ChildRelation[]>();

  // First pass: identify which models have composite primary keys
  const compositeKeyModels = new Map<string, readonly string[]>();
  for (const model of Prisma.dmmf.datamodel.models) {
    if (model.primaryKey?.fields && model.primaryKey.fields.length > 1) {
      compositeKeyModels.set(model.name, model.primaryKey.fields);
    }
  }

  // Second pass: find all parent-child relations
  for (const model of Prisma.dmmf.datamodel.models) {
    const hasSoftDelete = model.fields.some(
      (field) => field.name === SOFT_DELETE_FIELD,
    );

    for (const field of model.fields) {
      if (field.kind !== "object" || !field.relationFromFields?.length) {
        continue;
      }

      const parentModelName = field.type as Prisma.ModelName;

      if (hasSoftDelete) {
        // Soft-deletable child -> add to softDeleteCache
        const childRelation: ChildRelation = {
          model: model.name as Prisma.ModelName,
          foreignKey: field.relationFromFields[0],
          compositeFields: compositeKeyModels.has(parentModelName)
            ? field.relationFromFields
            : undefined,
        };

        if (!softDeleteCache.has(parentModelName)) {
          softDeleteCache.set(parentModelName, []);
        }
        softDeleteCache.get(parentModelName)!.push(childRelation);
      } else if (field.relationOnDelete === "Cascade") {
        // Hard-deletable child with Cascade -> add to hardDeleteCache
        const childRelation: ChildRelation = {
          model: model.name as Prisma.ModelName,
          foreignKey: field.relationFromFields[0],
          compositeFields: compositeKeyModels.has(parentModelName)
            ? field.relationFromFields
            : undefined,
        };

        if (!hardDeleteCache.has(parentModelName)) {
          hardDeleteCache.set(parentModelName, []);
        }
        hardDeleteCache.get(parentModelName)!.push(childRelation);
      }
    }
  }
}

/**
 * Gets child relations for a parent model based on cascade mode.
 */
export function getChildRelations(
  parentModel: Prisma.ModelName,
  mode: CascadeMode,
): ChildRelation[] {
  if (softDeleteCache === null || hardDeleteCache === null) {
    buildRelationCaches();
  }
  const cache = mode === CascadeMode.Soft ? softDeleteCache! : hardDeleteCache!;
  return cache.get(parentModel) ?? [];
}

// ============================================================================
// Where Clause Building
// ============================================================================

/**
 * Builds a where clause for finding child records by foreign key.
 * Handles both simple integer FKs and composite FKs.
 */
export function buildForeignKeyWhereClause(
  child: ChildRelation,
  parentModel: Prisma.ModelName,
  parentId: EntityId,
  includeDeletedAtFilter: boolean,
): Record<string, unknown> {
  const whereClause: Record<string, unknown> = includeDeletedAtFilter
    ? { [SOFT_DELETE_FIELD]: null }
    : {};

  if (child.compositeFields && typeof parentId === "object") {
    // Composite FK - map parent PK fields to child FK fields positionally
    const parentPkFields = getModelPrimaryKeyFields(parentModel);
    for (let i = 0; i < child.compositeFields.length; i++) {
      whereClause[child.compositeFields[i]] = parentId[parentPkFields[i]];
    }
  } else {
    // Simple integer FK
    whereClause[child.foreignKey] = parentId;
  }

  return whereClause;
}
