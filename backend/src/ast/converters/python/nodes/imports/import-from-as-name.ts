import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Import_from_as_nameContext } from "../../generated/PythonParser";
import { PythonImport } from "./dotted-as-name";

export const convertImportFromAsName = (
  _visitor: IPythonAstVisitor,
  ctx: Import_from_as_nameContext,
): PythonImport => {
  const [path, ...optionalAlias] = ctx.name_list().map((n) => n.getText());

  if (ctx.AS()) {
    return {
      path,
      alias: optionalAlias[0],
    };
  }

  return { path, alias: null };
};
