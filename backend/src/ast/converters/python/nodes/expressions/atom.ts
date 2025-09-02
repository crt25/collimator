import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  LiteralNode,
  VariableNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { FunctionDeclarationNode } from "src/ast/types/general-ast/ast-nodes";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import {
  AtomContext,
  DictcompContext,
  DictContext,
  GenexpContext,
  GroupContext,
  ListcompContext,
  ListContext,
  NameContext,
  SetcompContext,
  SetContext,
  StringsContext,
  TupleContext,
} from "../../generated/PythonParser";

export const convertAtom = (
  visitor: IPythonAstVisitor,
  ctx: AtomContext,
): PythonVisitorReturnValue => {
  const functionDeclarations: FunctionDeclarationNode[] = [];

  const name = ctx.name() as NameContext | undefined;
  if (name) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.variable,
        name: name.getText(),
      } satisfies VariableNode,
      functionDeclarations,
    };
  }

  const strings = ctx.strings() as StringsContext | undefined;
  if (strings) {
    return visitor.visit(strings);
  }

  const tuple = ctx.tuple() as TupleContext | undefined;
  if (tuple) {
    return visitor.visit(tuple);
  }

  const group = ctx.group() as GroupContext | undefined;
  if (group) {
    return visitor.visit(group);
  }

  const genexp = ctx.genexp() as GenexpContext | undefined;
  if (genexp) {
    return visitor.visit(genexp);
  }

  const list = ctx.list() as ListContext | undefined;
  if (list) {
    return visitor.visit(list);
  }

  const listComprehension = ctx.listcomp() as ListcompContext | undefined;
  if (listComprehension) {
    return visitor.visit(listComprehension);
  }

  const dictionary = ctx.dict() as DictContext | undefined;
  if (dictionary) {
    return visitor.visit(dictionary);
  }

  const set = ctx.set_() as SetContext | undefined;
  if (set) {
    return visitor.visit(set);
  }

  const dictionaryComprehension = ctx.dictcomp() as DictcompContext | undefined;
  if (dictionaryComprehension) {
    return visitor.visit(dictionaryComprehension);
  }

  const setComprehension = ctx.setcomp() as SetcompContext | undefined;
  if (setComprehension) {
    return visitor.visit(setComprehension);
  }

  if (ctx.TRUE() || ctx.FALSE()) {
    const value = ctx.TRUE() ? "true" : "false";

    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.literal,
        type: "boolean",
        value,
      } satisfies LiteralNode,
      functionDeclarations,
    };
  }

  if (ctx.NONE()) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.literal,
        type: "none",
        value: "",
      } satisfies LiteralNode,
      functionDeclarations,
    };
  }

  if (ctx.NUMBER()) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.literal,
        type: "number",
        value: ctx.NUMBER().getText(),
      } satisfies LiteralNode,
      functionDeclarations,
    };
  }

  if (ctx.ELLIPSIS()) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.literal,
        type: "ellipsis",
        value: "",
      } satisfies LiteralNode,
      functionDeclarations,
    };
  }

  throw new Error(`Unsupported atom: ${ctx.getText()}`);
};
