import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  Dotted_nameContext,
  Import_fromContext,
} from "../../generated/PythonParser";
import { convertDottedName } from "./dotted-name";
import { convertImportFromTargets } from "./import-from-targets";
import { PythonImport } from "./dotted-as-name";

export const convertImportFrom = (
  visitor: IPythonAstVisitor,
  ctx: Import_fromContext,
): PythonImport[] => {
  const dottedName = ctx.dotted_name() as Dotted_nameContext | undefined;
  const dots = [
    ...ctx.DOT_list().map((_) => "."),
    ...ctx.ELLIPSIS_list().map((_) => "..."),
  ].join("");

  const prefix = dottedName
    ? dots + convertDottedName(visitor, dottedName) + "."
    : dots;

  return convertImportFromTargets(visitor, ctx.import_from_targets()).map(
    ({ path, alias }) => ({ path: prefix + path, alias }),
  );
};
