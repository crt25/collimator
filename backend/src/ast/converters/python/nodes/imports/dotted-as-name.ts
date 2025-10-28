import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Dotted_as_nameContext } from "../../generated/PythonParser";
import { convertDottedName } from "./dotted-name";

export type PythonImport = {
  path: string;
  alias: string | null;
};

export const convertDottedAsName = (
  visitor: IPythonAstVisitor,
  ctx: Dotted_as_nameContext,
): PythonImport => {
  const path = convertDottedName(visitor, ctx.dotted_name());
  if (ctx.AS()) {
    return {
      path,
      alias: ctx.name().getText(),
    };
  }

  return { path, alias: null };
};
