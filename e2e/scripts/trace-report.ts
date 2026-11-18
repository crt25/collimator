/**
 * Prints a timeline from a trace file written during a run with E2E_TRACE_FILE.
 *
 * Usage: yarn trace:report <trace file>
 */
import { readFileSync } from "fs";
import { TraceEvent } from "../setup/trace";

const file = process.argv[2];

if (!file) {
  throw new Error("Usage: trace-report.ts <trace file>");
}

const events: TraceEvent[] = readFileSync(file, "utf-8")
  .split("\n")
  .filter((line) => line.trim() !== "")
  .map((line) => JSON.parse(line))
  .sort((a: TraceEvent, b: TraceEvent) => a.t - b.t);

if (events.length === 0) {
  throw new Error(`No events in ${file}`);
}

const t0 = events[0].t;
const end = events.reduce(
  (latest, event) => Math.max(latest, event.t + (event.dur ?? 0)),
  t0,
);

const seconds = (ms: number): string => (ms / 1000).toFixed(1).padStart(7);
const shorten = (text: string, length: number): string =>
  text.length > length ? text.slice(0, length - 1) + "…" : text;

const heading = (title: string): void => {
  console.log(`\n${title}\n${"-".repeat(title.length)}`);
};

const isTest = (event: TraceEvent): boolean => event.name === "test";
const isBrowser = (event: TraceEvent): boolean =>
  event.name.startsWith("browser:");

console.log(
  `Trace: ${events.length} events, ${seconds(end - t0).trim()}s from the first to the last`,
);

// 1) everything that is not a test or a browser request, in order
heading("Timeline (start s | duration s | where | what)");
for (const event of events.filter((e) => !isTest(e) && !isBrowser(e))) {
  console.log(
    `${seconds(event.t - t0)} ${event.dur === undefined ? "      ·" : seconds(event.dur)}  ${event.scope.padEnd(9)} ${event.name}${event.detail ? ` [${event.detail}]` : ""}`,
  );
}

// 2) totals per step
heading("Totals per step (count | total s | average s | longest s)");
const byName = new Map<string, number[]>();
for (const event of events.filter((e) => e.dur !== undefined)) {
  byName.set(event.name, [...(byName.get(event.name) ?? []), event.dur ?? 0]);
}

[...byName.entries()]
  .map(([name, durations]) => ({
    name,
    count: durations.length,
    total: durations.reduce((sum, duration) => sum + duration, 0),
    max: Math.max(...durations),
  }))
  .sort((a, b) => b.total - a.total)
  .forEach(({ name, count, total, max }) =>
    console.log(
      `${count.toString().padStart(5)} ${seconds(total)} ${seconds(total / count)} ${seconds(max)}  ${name}`,
    ),
  );

// 3) tests, with the time the browser spent waiting for pages and slow requests
heading(
  "Tests (start s | duration s | of which page loads s | slow requests s | where | status and title)",
);
const sumWithin = (test: TraceEvent, name: string): number =>
  events
    .filter(
      (event) =>
        event.name === name &&
        event.scope === test.scope &&
        event.t >= test.t &&
        event.t <= test.t + (test.dur ?? 0),
    )
    .reduce((sum, event) => sum + (event.dur ?? 0), 0);

for (const test of events.filter(isTest)) {
  console.log(
    `${seconds(test.t - t0)} ${seconds(test.dur ?? 0)} ${seconds(sumWithin(test, "browser: page load"))} ${seconds(sumWithin(test, "browser: slow request"))}  ${test.scope.padEnd(9)} ${shorten(test.detail ?? "", 90)}`,
  );
}

// 4) the slowest things the browser waited for
heading("Slowest browser requests (duration s | where | request)");
events
  .filter(isBrowser)
  .sort((a, b) => (b.dur ?? 0) - (a.dur ?? 0))
  .slice(0, 25)
  .forEach((event) =>
    console.log(
      `${seconds(event.dur ?? 0)}  ${event.scope.padEnd(9)} ${event.name.replace("browser: ", "")}: ${shorten(event.detail ?? "", 110)}`,
    ),
  );
