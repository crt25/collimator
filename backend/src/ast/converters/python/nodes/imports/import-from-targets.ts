import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Import_from_targetsContext } from "../../generated/PythonParser";
import { PythonImport } from "./dotted-as-name";
import { convertImportFromAsNames } from "./import-from-as-names";

export const convertImportFromTargets = (
  visitor: IPythonAstVisitor,
  ctx: Import_from_targetsContext,
): PythonImport[] => {
  if (ctx.STAR()) {
    return [{ path: "*", alias: null }];
  }

  return convertImportFromAsNames(visitor, ctx.import_from_as_names());
};
