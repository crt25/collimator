import { Prisma } from "@prisma/client";
import { hasSoftDelete } from "src/utilities/has-soft-delete";

interface PrismaModelContext {
  update: (args: {
    where: unknown;
    include: unknown;
    select: unknown;
    data: { deletedAt: Date };
  }) => Promise<unknown>;
  updateMany: (args: {
    where: unknown;
    data: { deletedAt: Date };
  }) => Promise<unknown>;
}

/**
 * Soft Delete Extension
 *
 * Intercepts delete operations and converts them to updates that set deletedAt timestamp.
 * This prevents hard deletion of records while maintaining the same API surface.
 *
 * This extension does NOT automatically filter soft-deleted records from read operations.
 * Filtering must be handled explicitly in queries by adding `deletedAt: null` to where clauses.
 *
 * Prisma's extension API doesn't provide fully typed access to sibling operations
 * (e.g., calling `update` from within a `delete` interceptor). We use a type assertion to
 * PrismaModelContext which is safe because all soft-deletable models have update/updateMany methods.
 * This is the pattern recommended in Prisma's official documentation.
 * @see https://www.prisma.io/docs/orm/prisma-client/client-extensions/type-utilities
 */
export const softDeleteExtension = Prisma.defineExtension({
  name: "softDelete",
  query: {
    async $allOperations({ model, operation, args, query }) {
      const softDeletableModels = [
        "User",
        "Class",
        "Student",
        "AuthenticatedStudent",
        "AnonymousStudent",
        "Lesson",
        "Session",
        "Task",
        "Solution",
        "ReferenceSolution",
        "StudentSolution",
        "SolutionAnalysis",
        "RegistrationToken",
        "AuthenticationToken",
        "KeyPair",
        "EncryptedPrivateKey",
        "SolutionTest",
      ];

      if (!hasSoftDelete(model, softDeletableModels)) {
        // skip models that are not soft deletable
        return query(args);
      }

      // Type assertion necessary due to Prisma extension API limitations
      // Safe because all models in softDeletableModels support update/updateMany
      const context = Prisma.getExtensionContext(this) as PrismaModelContext;

      switch (operation) {
        case "delete": {
          return context.update({
            where: args.where,
            include: args.include,
            select: args.select,
            data: { deletedAt: new Date() },
          });
        }
        case "deleteMany": {
          return context.updateMany({
            where: { ...args.where, deletedAt: null },
            data: { deletedAt: new Date() },
          });
        }
        default:
          return query(args);
      }
    },
  },
});
