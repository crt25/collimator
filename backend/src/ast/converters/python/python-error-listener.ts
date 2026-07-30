import { ErrorListener, RecognitionException, Recognizer } from "antlr4";
import { PythonSyntaxErrorDetail } from "./python-syntax-error";

/**
 * Collects lexer/parser syntax errors into a shared list instead of ANTLR's
 * default console logging, so the converter can reject invalid Python with a
 * controlled error rather than crashing on (or silently accepting) the
 * error-recovered parse tree.
 */
export class CollectingErrorListener<TSymbol> extends ErrorListener<TSymbol> {
  constructor(private readonly errors: PythonSyntaxErrorDetail[]) {
    super();
  }

  override syntaxError(
    _recognizer: Recognizer<TSymbol>,
    _offendingSymbol: TSymbol,
    line: number,
    column: number,
    message: string,
    _e: RecognitionException | undefined,
  ): void {
    this.errors.push({ line, column, message });
  }
}
