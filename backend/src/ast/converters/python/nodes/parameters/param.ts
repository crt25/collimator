import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { AnnotationContext, ParamContext } from "../../generated/PythonParser";

export type Parameter = {
  name: string;
  typeAnnotation: ExpressionNode | null;
  modifier: string | null;
  defaultValue: ExpressionNode | null;
};

export const convertParam = (
  visitor: IPythonAstVisitor,
  ctx: ParamContext,
): Parameter => {
  const name = ctx.name().getText();
  const annotation = ctx.annotation() as AnnotationContext | undefined;

  if (annotation) {
    const typeAnnotation = visitor.getExpression(annotation);
    return {
      name,
      typeAnnotation: typeAnnotation.node,
      modifier: null,
      defaultValue: null,
    };
  }

  return {
    name,
    typeAnnotation: null,
    modifier: null,
    defaultValue: null,
  };
};
