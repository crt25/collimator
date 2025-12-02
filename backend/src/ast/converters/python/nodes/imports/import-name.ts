import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Import_nameContext } from "../../generated/PythonParser";
import { convertDottedAsNames } from "./dotted-as-names";
import { PythonImport } from "./dotted-as-name";

export const convertImportName = (
  visitor: IPythonAstVisitor,
  ctx: Import_nameContext,
): PythonImport[] => convertDottedAsNames(visitor, ctx.dotted_as_names());
