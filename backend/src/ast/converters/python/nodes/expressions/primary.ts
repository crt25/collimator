import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { FunctionCallExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node/function-call-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import {
  ArgumentsContext,
  AtomContext,
  GenexpContext,
  PrimaryContext,
} from "../../generated/PythonParser";
import {
  fieldAccessOperator,
  functionInvocationOperator,
  namedParameterOperator,
} from "../../operators";
import { convertArguments } from "./arguments";
import { PythonFunctionArguments } from "./args";

export const convertPrimary = (
  visitor: IPythonAstVisitor,
  ctx: PrimaryContext,
): PythonVisitorReturnValue => {
  const atom = ctx.atom() as AtomContext | undefined;

  if (atom) {
    return visitor.visit(atom);
  }

  const primary = visitor.getExpression(ctx.primary());

  if (ctx.DOT()) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: fieldAccessOperator,
        operands: [
          primary.node,
          {
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.literal,
            type: "string",
            value: ctx.name().getText(),
          } satisfies LiteralNode,
        ],
      } satisfies OperatorNode,
      functionDeclarations: primary.functionDeclarations,
    };
  }

  const genexp = ctx.genexp() as GenexpContext | undefined;

  if (genexp) {
    return visitor.visit(genexp);
  }

  if (ctx.LPAR() && ctx.RPAR()) {
    let args: PythonFunctionArguments = {
      unnamed: [],
      named: [],
    };

    const a = ctx.arguments() as ArgumentsContext | undefined;
    if (a) {
      args = convertArguments(visitor, a);
    }

    const fnArguments = [
      ...args.unnamed,
      ...args.named.map(
        (a) =>
          ({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: namedParameterOperator,
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: a.name,
              } satisfies LiteralNode,
              a.expression,
            ],
          }) satisfies OperatorNode,
      ),
    ];

    if (primary.node.expressionType === ExpressionNodeType.variable) {
      return {
        node: {
          nodeType: AstNodeType.expression,
          expressionType: ExpressionNodeType.functionCall,
          name: primary.node.name,
          arguments: fnArguments,
        } satisfies FunctionCallExpressionNode,
        functionDeclarations: primary.functionDeclarations,
      };
    }

    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: functionInvocationOperator,
        operands: [primary.node, ...fnArguments],
      } satisfies OperatorNode,
      functionDeclarations: primary.functionDeclarations,
    };
  }

  if (ctx.LSQB() && ctx.RSQB()) {
    const slices = visitor.getExpression(ctx.slices());

    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: "slice",
        operands: [primary.node, slices.node],
      } satisfies OperatorNode,
      functionDeclarations: [
        ...primary.functionDeclarations,
        ...slices.functionDeclarations,
      ],
    };
  }

  throw new Error(`Unsupported primary expression: ${ctx.getText()}`);
};
