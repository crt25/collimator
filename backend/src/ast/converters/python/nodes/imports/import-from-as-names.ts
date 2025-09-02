import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Import_from_as_namesContext } from "../../generated/PythonParser";
import { PythonImport } from "./dotted-as-name";
import { convertImportFromAsName } from "./import-from-as-name";

export const convertImportFromAsNames = (
  visitor: IPythonAstVisitor,
  ctx: Import_from_as_namesContext,
): PythonImport[] =>
  ctx
    .import_from_as_name_list()
    .map((i) => convertImportFromAsName(visitor, i));
