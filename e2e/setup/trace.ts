/**
 * Minimal timing trace for the e2e test environment.
 *
 * When E2E_TRACE_FILE is set (to an absolute path), every process taking part
 * in a run (the Playwright runner, the setup script, the workers) appends one
 * JSON line per measured step to that file. `yarn trace:report <file>` turns
 * the file into a readable timeline. Without the variable all functions are
 * no-ops.
 */
import { appendFileSync } from "fs";

const traceFile = process.env.E2E_TRACE_FILE;

export const isTracing = traceFile !== undefined && traceFile !== "";

export type TraceEvent = {
  // start of the step, milliseconds since the epoch
  t: number;
  // duration in milliseconds, absent for point-in-time marks
  dur?: number;
  pid: number;
  // where the event comes from: "runner", "setup" or "worker-<n>"
  scope: string;
  name: string;
  detail?: string;
};

const getScope = (): string => {
  if (process.env.E2E_TRACE_SCOPE) {
    return process.env.E2E_TRACE_SCOPE;
  }

  // set by Playwright in worker processes
  const workerIndex = process.env.TEST_WORKER_INDEX;

  return workerIndex !== undefined ? `worker-${workerIndex}` : "runner";
};

export const traceEvent = (event: Omit<TraceEvent, "pid" | "scope">): void => {
  if (!isTracing) {
    return;
  }

  try {
    appendFileSync(
      traceFile as string,
      JSON.stringify({ ...event, pid: process.pid, scope: getScope() }) + "\n",
    );
  } catch {
    // tracing must never break a test run
  }
};

export const traceMark = (name: string, detail?: string): void =>
  traceEvent({ t: Date.now(), name, detail });

export const traceDuration = (
  name: string,
  startedAt: number,
  detail?: string,
): void =>
  traceEvent({ t: startedAt, dur: Date.now() - startedAt, name, detail });

/**
 * Measures how long the callback takes, whether it succeeds or throws.
 */
export const traceSpan = async <T>(
  name: string,
  callback: () => Promise<T> | T,
  detail?: string,
): Promise<T> => {
  const startedAt = Date.now();

  try {
    return await callback();
  } finally {
    traceDuration(name, startedAt, detail);
  }
};
