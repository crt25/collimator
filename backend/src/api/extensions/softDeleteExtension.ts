import { Prisma } from "@prisma/client";
import { hasSoftDelete } from "src/utilities/has-soft-delete";

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
      ];

      if (!hasSoftDelete(model, softDeletableModels)) {
        // skip models that are not soft deletable
        return query(args);
      }

      switch (operation) {
        case "delete": {
          return query({
            ...args,
            data: { deletedAt: new Date() },
          });
        }

        case "deleteMany":
          return query({
            ...args,
            data: { ...args.data, deletedAt: new Date() },
          });

        case "findMany":
        case "findUnique": {
          return query({
            ...args,
            where: { ...args.where, deletedAt: null },
          });
        }

        default:
          return query(args);
      }
    },
  },
});
