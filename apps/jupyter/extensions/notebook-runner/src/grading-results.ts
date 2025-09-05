export interface OtterGradingResults {
  tests: TestResult[];
}

interface TestResult {
  name: string; // e.g., "Public Tests" or "q1"
  score?: number; // optional because Public Tests may not have a score
  max_score?: number;
  visibility?: "visible" | "hidden" | "after_due_date";
  output: string; // full output of the test
  status?: "passed" | "failed" | "error";
}
