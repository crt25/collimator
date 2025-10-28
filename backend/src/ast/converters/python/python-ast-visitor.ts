import { ParserRuleContext } from "antlr4";
import {
  isExpressionNode,
  isStatementNode,
} from "src/ast/types/general-ast/helpers/node-type-checks";
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import {
  FunctionDeclarationNode,
  StatementNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { AstNode, AstNodeType } from "src/ast/types/general-ast";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import PythonParserVisitor from "./generated/PythonParserVisitor";
import {
  Annotated_rhsContext,
  AnnotationContext,
  As_patternContext,
  Assert_stmtContext,
  AssignmentContext,
  Assignment_expressionContext,
  AtomContext,
  Await_primaryContext,
  Bitwise_andContext,
  Bitwise_orContext,
  Bitwise_xorContext,
  BlockContext,
  Capture_patternContext,
  Case_blockContext,
  Class_defContext,
  Class_patternContext,
  Closed_patternContext,
  ComparisonContext,
  Complex_numberContext,
  Compound_stmtContext,
  ConjunctionContext,
  DecoratorsContext,
  Default_assignmentContext,
  Del_stmtContext,
  Del_t_atomContext,
  Del_targetContext,
  Del_targetsContext,
  DictContext,
  DictcompContext,
  DisjunctionContext,
  Double_star_patternContext,
  Double_starred_kvpairContext,
  Double_starred_kvpairsContext,
  Elif_stmtContext,
  Else_blockContext,
  EvalContext,
  Except_blockContext,
  Except_star_blockContext,
  ExpressionContext,
  ExpressionsContext,
  FactorContext,
  File_inputContext,
  Finally_blockContext,
  For_if_clauseContext,
  For_if_clausesContext,
  For_stmtContext,
  FstringContext,
  Fstring_conversionContext,
  Fstring_format_specContext,
  Fstring_full_format_specContext,
  Fstring_middleContext,
  Fstring_replacement_fieldContext,
  Func_typeContext,
  Func_type_commentContext,
  Function_defContext,
  GenexpContext,
  Global_stmtContext,
  GroupContext,
  Group_patternContext,
  GuardContext,
  If_stmtContext,
  Imaginary_numberContext,
  Import_stmtContext,
  InteractiveContext,
  InversionContext,
  Items_patternContext,
  Key_value_patternContext,
  Keyword_patternContext,
  Keyword_patternsContext,
  KvpairContext,
  LambdefContext,
  ListContext,
  ListcompContext,
  Literal_exprContext,
  Literal_patternContext,
  Mapping_patternContext,
  Match_stmtContext,
  Maybe_sequence_patternContext,
  Maybe_star_patternContext,
  Named_expressionContext,
  Nonlocal_stmtContext,
  Open_sequence_patternContext,
  Or_patternContext,
  PatternContext,
  Pattern_capture_targetContext,
  PatternsContext,
  Positional_patternsContext,
  PowerContext,
  PrimaryContext,
  Raise_stmtContext,
  Real_numberContext,
  Return_stmtContext,
  Sequence_patternContext,
  SetContext,
  SetcompContext,
  Shift_exprContext,
  Signed_numberContext,
  Signed_real_numberContext,
  Simple_stmtContext,
  Simple_stmtsContext,
  Single_subscript_attribute_targetContext,
  Single_targetContext,
  SliceContext,
  SlicesContext,
  Star_annotationContext,
  Star_atomContext,
  Star_expressionContext,
  Star_expressionsContext,
  Star_named_expressionContext,
  Star_named_expressionsContext,
  Star_patternContext,
  Star_targetContext,
  Star_targetsContext,
  Star_targets_list_seqContext,
  Star_targets_tuple_seqContext,
  Starred_expressionContext,
  StatementContext,
  Statement_newlineContext,
  StatementsContext,
  StringContext,
  StringsContext,
  Subject_exprContext,
  SumContext,
  T_primaryContext,
  Target_with_star_atomContext,
  TermContext,
  Try_stmtContext,
  TupleContext,
  Type_aliasContext,
  Type_expressionsContext,
  Type_param_boundContext,
  Type_param_defaultContext,
  Type_param_starred_defaultContext,
  Value_patternContext,
  While_stmtContext,
  Wildcard_patternContext,
  With_itemContext,
  With_stmtContext,
  Yield_exprContext,
  Yield_stmtContext,
} from "./generated/PythonParser";
import { PythonVisitorReturnValue } from "./python-ast-visitor-return-value";
import {
  convertAnnotatedRhs,
  convertAnnotation,
  convertAsPattern,
  convertAssertStmt,
  convertAssignment,
  convertAssignmentExpression,
  convertAtom,
  convertAwaitPrimary,
  convertBitwiseAnd,
  convertBitwiseOr,
  convertBitwiseXor,
  convertBlock,
  convertCapturePattern,
  convertCaseBlock,
  convertClassDef,
  convertClassPattern,
  convertClosedPattern,
  convertComparison,
  convertComplexNumber,
  convertCompoundStmt,
  convertConjunction,
  convertDecorators,
  convertDefaultAssignment,
  convertDeleteTarget,
  convertDeleteTargetAtom,
  convertDeleteTargets,
  convertDeleteStmt,
  convertDict,
  convertDictComprehension,
  convertDisjunction,
  convertDoubleStarPattern,
  convertDoubleStarredKvpair,
  convertDoubleStarredKvpairs,
  convertElifStmt,
  convertElseBlock,
  convertEval,
  convertExceptBlock,
  convertExceptStarBlock,
  convertExpression,
  convertExpressions,
  convertFactor,
  convertFileInput,
  convertFinallyBlock,
  convertForIfClause,
  convertForIfClauses,
  convertForStmt,
  convertFstring,
  convertFstringConversion,
  convertFstringFormatSpec,
  convertFstringFullFormatSpec,
  convertFstringMiddle,
  convertFstringReplacementField,
  convertFunctionDef,
  convertFuncType,
  convertFuncTypeComment,
  convertGenexp,
  convertGlobalStmt,
  convertGroup,
  convertGroupPattern,
  convertGuard,
  convertIfStmt,
  convertImaginaryNumber,
  convertImportStmt,
  convertInteractive,
  convertInversion,
  convertItemsPattern,
  convertKeyValuePattern,
  convertKeywordPattern,
  convertKeywordPatterns,
  convertKvpair,
  convertLambdef,
  convertList,
  convertListComprehension,
  convertLiteralExpression,
  convertLiteralPattern,
  convertMappingPattern,
  convertMatchStmt,
  convertMaybeSequencePattern,
  convertMaybeStarPattern,
  convertNamedExpression,
  convertNonlocalStmt,
  convertOpenSequencePattern,
  convertOrPattern,
  convertPattern,
  convertPatternCaptureTarget,
  convertPatterns,
  convertPositionalPatterns,
  convertPower,
  convertPrimary,
  convertRaiseStmt,
  convertRealNumber,
  convertReturnStmt,
  convertSequencePattern,
  convertSet,
  convertSetComprehension,
  convertShiftExpr,
  convertSignedNumber,
  convertSignedRealNumber,
  convertSimpleStmt,
  convertSimpleStmts,
  convertSingleSubscriptAttributeTarget,
  convertSingleTarget,
  convertSlice,
  convertSlices,
  convertStarAnnotation,
  convertStarAtom,
  convertStarExpression,
  convertStarExpressions,
  convertStarNamedExpression,
  convertStarNamedExpressions,
  convertStarPattern,
  convertStarredExpression,
  convertStarTarget,
  convertStarTargets,
  convertStarTargetsListSeq,
  convertStarTargetsTupleSeq,
  convertStatement,
  convertStatementNewline,
  convertStatements,
  convertString,
  convertStrings,
  convertSubjectExpr,
  convertSum,
  convertTargetPrimary,
  convertTargetWithStarAtom,
  convertTerm,
  convertTryStmt,
  convertTuple,
  convertTypeAlias,
  convertTypeExpressions,
  convertTypeParamBound,
  convertTypeParamDefault,
  convertTypeParamStarredDefault,
  convertValuePattern,
  convertWhileStmt,
  convertWildcardPattern,
  convertWithItem,
  convertWithStmt,
  convertYieldExpr,
  convertYieldStmt,
  UnexpectedResultError,
} from "./nodes";
import { IPythonAstVisitor } from "./python-ast-visitor-interface";

export class PythonAstVisitor
  extends PythonParserVisitor<PythonVisitorReturnValue>
  implements IPythonAstVisitor
{
  getExpression(
    ctx: ParserRuleContext,
  ): PythonVisitorReturnValue & { node: ExpressionNode } {
    const result = this.visit(ctx);

    if (!isExpressionNode(result.node)) {
      throw UnexpectedResultError.unexpectedNonExpression(result);
    }

    return result as PythonVisitorReturnValue & { node: ExpressionNode };
  }

  getExpressions(ctxs?: ParserRuleContext[]): {
    nodes: ExpressionNode[];
    functionDeclarations: FunctionDeclarationNode[];
  } {
    const results = (ctxs ?? [])
      .filter((ctx) => ctx instanceof ParserRuleContext)
      .map((ctx) => this.getExpression(ctx));

    return {
      nodes: results.map((r) => r.node),
      functionDeclarations: results.flatMap((r) => r.functionDeclarations),
    };
  }

  getStatementSequence = (
    children: (ParserRuleContext | undefined)[],
  ): PythonVisitorReturnValue & {
    node: StatementSequenceNode;
  } => {
    const childValues = children
      .filter((c) => c !== undefined)
      .map((child) => this.visit(child));

    const nodes = childValues.flatMap((v) => {
      if (
        isStatementNode(v.node) &&
        v.node.statementType === StatementNodeType.sequence
      ) {
        // flatten sequences
        return v.node.statements as AstNode[];
      }

      // ignore undefined nodes, i.e. ones that only return function declarations here
      // and collect the function declarations
      return v.node ?? [];
    });
    const functionDeclarations = childValues.flatMap(
      (v) => v.functionDeclarations,
    );

    const statementNodes = nodes.filter(isStatementNode);
    if (statementNodes.length !== nodes.length) {
      const nonStatementNodes = childValues.filter(
        (c) => !isStatementNode(c.node),
      );

      throw new Error(
        `File input can only contain statement nodes. Found non-statement nodes: ${JSON.stringify(nonStatementNodes)}`,
      );
    }

    return {
      node: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.sequence,
        statements: statementNodes,
      } satisfies StatementSequenceNode,
      functionDeclarations,
    };
  };

  getStatements = (
    children: (ParserRuleContext | undefined)[],
  ): PythonVisitorReturnValue & {
    node: StatementNode;
  } => {
    const { node, functionDeclarations } = this.getStatementSequence(children);

    if (node.statements.length === 1) {
      return {
        node: node.statements[0],
        functionDeclarations,
      };
    }

    return { node, functionDeclarations };
  };

  visitChildren(ctx: ParserRuleContext): PythonVisitorReturnValue {
    if (ctx instanceof File_inputContext) {
      return convertFileInput(this, ctx);
    } else if (ctx instanceof InteractiveContext) {
      return convertInteractive(this, ctx);
    } else if (ctx instanceof EvalContext) {
      return convertEval(this, ctx);
    } else if (ctx instanceof Func_typeContext) {
      return convertFuncType(this, ctx);
    } else if (ctx instanceof StatementsContext) {
      return convertStatements(this, ctx);
    } else if (ctx instanceof StatementContext) {
      return convertStatement(this, ctx);
    } else if (ctx instanceof Statement_newlineContext) {
      return convertStatementNewline(this, ctx);
    } else if (ctx instanceof Simple_stmtsContext) {
      return convertSimpleStmts(this, ctx);
    } else if (ctx instanceof Simple_stmtContext) {
      return convertSimpleStmt(this, ctx);
    } else if (ctx instanceof Compound_stmtContext) {
      return convertCompoundStmt(this, ctx);
    } else if (ctx instanceof AssignmentContext) {
      return convertAssignment(this, ctx);
    } else if (ctx instanceof Annotated_rhsContext) {
      return convertAnnotatedRhs(this, ctx);
    } else if (ctx instanceof Return_stmtContext) {
      return convertReturnStmt(this, ctx);
    } else if (ctx instanceof Raise_stmtContext) {
      return convertRaiseStmt(this, ctx);
    } else if (ctx instanceof Global_stmtContext) {
      return convertGlobalStmt(this, ctx);
    } else if (ctx instanceof Nonlocal_stmtContext) {
      return convertNonlocalStmt(this, ctx);
    } else if (ctx instanceof Del_stmtContext) {
      return convertDeleteStmt(this, ctx);
    } else if (ctx instanceof Yield_stmtContext) {
      return convertYieldStmt(this, ctx);
    } else if (ctx instanceof Assert_stmtContext) {
      return convertAssertStmt(this, ctx);
    } else if (ctx instanceof Import_stmtContext) {
      return convertImportStmt(this, ctx);
    } else if (ctx instanceof BlockContext) {
      return convertBlock(this, ctx);
    } else if (ctx instanceof DecoratorsContext) {
      return convertDecorators(this, ctx);
    } else if (ctx instanceof Class_defContext) {
      return convertClassDef(this, ctx);
    } else if (ctx instanceof Function_defContext) {
      return convertFunctionDef(this, ctx);
    } else if (ctx instanceof AnnotationContext) {
      return convertAnnotation(this, ctx);
    } else if (ctx instanceof Star_annotationContext) {
      return convertStarAnnotation(this, ctx);
    } else if (ctx instanceof Default_assignmentContext) {
      return convertDefaultAssignment(this, ctx);
    } else if (ctx instanceof If_stmtContext) {
      return convertIfStmt(this, ctx);
    } else if (ctx instanceof Elif_stmtContext) {
      return convertElifStmt(this, ctx);
    } else if (ctx instanceof Else_blockContext) {
      return convertElseBlock(this, ctx);
    } else if (ctx instanceof While_stmtContext) {
      return convertWhileStmt(this, ctx);
    } else if (ctx instanceof For_stmtContext) {
      return convertForStmt(this, ctx);
    } else if (ctx instanceof With_stmtContext) {
      return convertWithStmt(this, ctx);
    } else if (ctx instanceof With_itemContext) {
      return convertWithItem(this, ctx);
    } else if (ctx instanceof Try_stmtContext) {
      return convertTryStmt(this, ctx);
    } else if (ctx instanceof Except_blockContext) {
      return convertExceptBlock(this, ctx);
    } else if (ctx instanceof Except_star_blockContext) {
      return convertExceptStarBlock(this, ctx);
    } else if (ctx instanceof Finally_blockContext) {
      return convertFinallyBlock(this, ctx);
    } else if (ctx instanceof Match_stmtContext) {
      return convertMatchStmt(this, ctx);
    } else if (ctx instanceof Subject_exprContext) {
      return convertSubjectExpr(this, ctx);
    } else if (ctx instanceof Case_blockContext) {
      return convertCaseBlock(this, ctx);
    } else if (ctx instanceof GuardContext) {
      return convertGuard(this, ctx);
    } else if (ctx instanceof PatternsContext) {
      return convertPatterns(this, ctx);
    } else if (ctx instanceof PatternContext) {
      return convertPattern(this, ctx);
    } else if (ctx instanceof As_patternContext) {
      return convertAsPattern(this, ctx);
    } else if (ctx instanceof Or_patternContext) {
      return convertOrPattern(this, ctx);
    } else if (ctx instanceof Closed_patternContext) {
      return convertClosedPattern(this, ctx);
    } else if (ctx instanceof Literal_patternContext) {
      return convertLiteralPattern(this, ctx);
    } else if (ctx instanceof Literal_exprContext) {
      return convertLiteralExpression(this, ctx);
    } else if (ctx instanceof Complex_numberContext) {
      return convertComplexNumber(this, ctx);
    } else if (ctx instanceof Signed_numberContext) {
      return convertSignedNumber(this, ctx);
    } else if (ctx instanceof Signed_real_numberContext) {
      return convertSignedRealNumber(this, ctx);
    } else if (ctx instanceof Real_numberContext) {
      return convertRealNumber(this, ctx);
    } else if (ctx instanceof Imaginary_numberContext) {
      return convertImaginaryNumber(this, ctx);
    } else if (ctx instanceof Capture_patternContext) {
      return convertCapturePattern(this, ctx);
    } else if (ctx instanceof Pattern_capture_targetContext) {
      return convertPatternCaptureTarget(this, ctx);
    } else if (ctx instanceof Wildcard_patternContext) {
      return convertWildcardPattern(this, ctx);
    } else if (ctx instanceof Value_patternContext) {
      return convertValuePattern(this, ctx);
    } else if (ctx instanceof Group_patternContext) {
      return convertGroupPattern(this, ctx);
    } else if (ctx instanceof Sequence_patternContext) {
      return convertSequencePattern(this, ctx);
    } else if (ctx instanceof Open_sequence_patternContext) {
      return convertOpenSequencePattern(this, ctx);
    } else if (ctx instanceof Maybe_sequence_patternContext) {
      return convertMaybeSequencePattern(this, ctx);
    } else if (ctx instanceof Maybe_star_patternContext) {
      return convertMaybeStarPattern(this, ctx);
    } else if (ctx instanceof Star_patternContext) {
      return convertStarPattern(this, ctx);
    } else if (ctx instanceof Mapping_patternContext) {
      return convertMappingPattern(this, ctx);
    } else if (ctx instanceof Items_patternContext) {
      return convertItemsPattern(this, ctx);
    } else if (ctx instanceof Key_value_patternContext) {
      return convertKeyValuePattern(this, ctx);
    } else if (ctx instanceof Double_star_patternContext) {
      return convertDoubleStarPattern(this, ctx);
    } else if (ctx instanceof Class_patternContext) {
      return convertClassPattern(this, ctx);
    } else if (ctx instanceof Positional_patternsContext) {
      return convertPositionalPatterns(this, ctx);
    } else if (ctx instanceof Keyword_patternsContext) {
      return convertKeywordPatterns(this, ctx);
    } else if (ctx instanceof Keyword_patternContext) {
      return convertKeywordPattern(this, ctx);
    } else if (ctx instanceof Type_aliasContext) {
      return convertTypeAlias(this, ctx);
    } else if (ctx instanceof Type_param_boundContext) {
      return convertTypeParamBound(this, ctx);
    } else if (ctx instanceof Type_param_defaultContext) {
      return convertTypeParamDefault(this, ctx);
    } else if (ctx instanceof Type_param_starred_defaultContext) {
      return convertTypeParamStarredDefault(this, ctx);
    } else if (ctx instanceof ExpressionsContext) {
      return convertExpressions(this, ctx);
    } else if (ctx instanceof ExpressionContext) {
      return convertExpression(this, ctx);
    } else if (ctx instanceof Yield_exprContext) {
      return convertYieldExpr(this, ctx);
    } else if (ctx instanceof Star_expressionsContext) {
      return convertStarExpressions(this, ctx);
    } else if (ctx instanceof Star_expressionContext) {
      return convertStarExpression(this, ctx);
    } else if (ctx instanceof Star_named_expressionsContext) {
      return convertStarNamedExpressions(this, ctx);
    } else if (ctx instanceof Star_named_expressionContext) {
      return convertStarNamedExpression(this, ctx);
    } else if (ctx instanceof Assignment_expressionContext) {
      return convertAssignmentExpression(this, ctx);
    } else if (ctx instanceof Named_expressionContext) {
      return convertNamedExpression(this, ctx);
    } else if (ctx instanceof DisjunctionContext) {
      return convertDisjunction(this, ctx);
    } else if (ctx instanceof ConjunctionContext) {
      return convertConjunction(this, ctx);
    } else if (ctx instanceof InversionContext) {
      return convertInversion(this, ctx);
    } else if (ctx instanceof ComparisonContext) {
      return convertComparison(this, ctx);
    } else if (ctx instanceof Bitwise_orContext) {
      return convertBitwiseOr(this, ctx);
    } else if (ctx instanceof Bitwise_xorContext) {
      return convertBitwiseXor(this, ctx);
    } else if (ctx instanceof Bitwise_andContext) {
      return convertBitwiseAnd(this, ctx);
    } else if (ctx instanceof Shift_exprContext) {
      return convertShiftExpr(this, ctx);
    } else if (ctx instanceof SumContext) {
      return convertSum(this, ctx);
    } else if (ctx instanceof TermContext) {
      return convertTerm(this, ctx);
    } else if (ctx instanceof FactorContext) {
      return convertFactor(this, ctx);
    } else if (ctx instanceof PowerContext) {
      return convertPower(this, ctx);
    } else if (ctx instanceof Await_primaryContext) {
      return convertAwaitPrimary(this, ctx);
    } else if (ctx instanceof PrimaryContext) {
      return convertPrimary(this, ctx);
    } else if (ctx instanceof SlicesContext) {
      return convertSlices(this, ctx);
    } else if (ctx instanceof SliceContext) {
      return convertSlice(this, ctx);
    } else if (ctx instanceof AtomContext) {
      return convertAtom(this, ctx);
    } else if (ctx instanceof GroupContext) {
      return convertGroup(this, ctx);
    } else if (ctx instanceof LambdefContext) {
      return convertLambdef(this, ctx);
    } else if (ctx instanceof Fstring_middleContext) {
      return convertFstringMiddle(this, ctx);
    } else if (ctx instanceof Fstring_replacement_fieldContext) {
      return convertFstringReplacementField(this, ctx);
    } else if (ctx instanceof Fstring_conversionContext) {
      return convertFstringConversion(this, ctx);
    } else if (ctx instanceof Fstring_full_format_specContext) {
      return convertFstringFullFormatSpec(this, ctx);
    } else if (ctx instanceof Fstring_format_specContext) {
      return convertFstringFormatSpec(this, ctx);
    } else if (ctx instanceof FstringContext) {
      return convertFstring(this, ctx);
    } else if (ctx instanceof StringContext) {
      return convertString(this, ctx);
    } else if (ctx instanceof StringsContext) {
      return convertStrings(this, ctx);
    } else if (ctx instanceof ListContext) {
      return convertList(this, ctx);
    } else if (ctx instanceof TupleContext) {
      return convertTuple(this, ctx);
    } else if (ctx instanceof SetContext) {
      return convertSet(this, ctx);
    } else if (ctx instanceof DictContext) {
      return convertDict(this, ctx);
    } else if (ctx instanceof Double_starred_kvpairsContext) {
      return convertDoubleStarredKvpairs(this, ctx);
    } else if (ctx instanceof Double_starred_kvpairContext) {
      return convertDoubleStarredKvpair(this, ctx);
    } else if (ctx instanceof KvpairContext) {
      return convertKvpair(this, ctx);
    } else if (ctx instanceof For_if_clausesContext) {
      return convertForIfClauses(this, ctx);
    } else if (ctx instanceof For_if_clauseContext) {
      return convertForIfClause(this, ctx);
    } else if (ctx instanceof ListcompContext) {
      return convertListComprehension(this, ctx);
    } else if (ctx instanceof SetcompContext) {
      return convertSetComprehension(this, ctx);
    } else if (ctx instanceof GenexpContext) {
      return convertGenexp(this, ctx);
    } else if (ctx instanceof DictcompContext) {
      return convertDictComprehension(this, ctx);
    } else if (ctx instanceof Starred_expressionContext) {
      return convertStarredExpression(this, ctx);
    } else if (ctx instanceof Star_targetsContext) {
      return convertStarTargets(this, ctx);
    } else if (ctx instanceof Star_targets_list_seqContext) {
      return convertStarTargetsListSeq(this, ctx);
    } else if (ctx instanceof Star_targets_tuple_seqContext) {
      return convertStarTargetsTupleSeq(this, ctx);
    } else if (ctx instanceof Star_targetContext) {
      return convertStarTarget(this, ctx);
    } else if (ctx instanceof Target_with_star_atomContext) {
      return convertTargetWithStarAtom(this, ctx);
    } else if (ctx instanceof Star_atomContext) {
      return convertStarAtom(this, ctx);
    } else if (ctx instanceof Single_targetContext) {
      return convertSingleTarget(this, ctx);
    } else if (ctx instanceof Single_subscript_attribute_targetContext) {
      return convertSingleSubscriptAttributeTarget(this, ctx);
    } else if (ctx instanceof T_primaryContext) {
      return convertTargetPrimary(this, ctx);
    } else if (ctx instanceof Del_targetsContext) {
      return convertDeleteTargets(this, ctx);
    } else if (ctx instanceof Del_targetContext) {
      return convertDeleteTarget(this, ctx);
    } else if (ctx instanceof Del_t_atomContext) {
      return convertDeleteTargetAtom(this, ctx);
    } else if (ctx instanceof Type_expressionsContext) {
      return convertTypeExpressions(this, ctx);
    } else if (ctx instanceof Func_type_commentContext) {
      return convertFuncTypeComment(this, ctx);
    } else {
      throw new Error(`Unexpected AST node type: ${ctx.constructor.name}`);
    }
  }
}
