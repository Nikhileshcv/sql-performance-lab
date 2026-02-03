import { useState } from "react";
import { runQuery } from "./api";

/** Supported scenarios */
const SCENARIOS = [
  {
    id: "missing-index",
    label: "Missing Index (Orders by Customer)"
  },
  {
    id: "cursor",
    label: "Cursor vs Set-Based Aggregation"
  }
];

export default function App() {
  const [scenario, setScenario] = useState(SCENARIOS[0].id);
  const [slowResult, setSlowResult] = useState<any>(null);
  const [optResult, setOptResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function runComparison() {
    setLoading(true);
    setSlowResult(null);
    setOptResult(null);

    try {
      const slow = await runQuery(scenario, "slow");
      const opt = await runQuery(scenario, "optimized");

      setSlowResult(slow);
      setOptResult(opt);
    } catch (e) {
      alert("Error calling backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 32, fontFamily: "Arial, sans-serif" }}>
      <h1>SQL Performance Lab</h1>
      <p>
        Interactive demo showing <strong>why SQL queries become slow</strong>{" "}
        and how optimizations change execution behavior.
      </p>

      {/* Scenario Selector */}
      <div style={{ marginBottom: 20 }}>
        <label>
          Scenario:&nbsp;
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          >
            {SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={runComparison}
          style={{ marginLeft: 12, padding: "6px 12px" }}
        >
          Run Comparison
        </button>
      </div>

      {loading && <p>Running queries...</p>}

      {slowResult && optResult && (
        <>
          <ComparisonView slow={slowResult} optimized={optResult} />
          <ExecutionChart
            slowMs={slowResult.timeMs}
            optMs={optResult.timeMs}
          />
          <ExplanationPanel scenario={scenario} />
          <ScaleSimulator />
          <TimingNote />
        </>
      )}
    </div>
  );
}

/* ===========================
   SIDE-BY-SIDE COMPARISON
=========================== */

function ComparisonView({
  slow,
  optimized
}: {
  slow: any;
  optimized: any;
}) {
  return (
    <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
      <ResultCard title="Slow Query" result={slow} />
      <ResultCard title="Optimized Query" result={optimized} />
    </div>
  );
}

function ResultCard({
  title,
  result
}: {
  title: string;
  result: any;
}) {
  return (
    <div
      style={{
        flex: 1,
        border: "1px solid #ccc",
        borderRadius: 6,
        padding: 16
      }}
    >
      <h3>{title}</h3>
      <p>
        <strong>Execution Time:</strong> {result.timeMs} ms
      </p>
      <OptimizerInsight plan={result.plan} />
      <pre style={{ maxHeight: 260, overflow: "auto" }}>
        {result.plan}
      </pre>
    </div>
  );
}

function OptimizerInsight({ plan }: { plan: string }) {
  const lower = plan.toLowerCase();
  let decision = "Unknown";

  if (lower.includes("tablescan")) decision = "Table Scan (slow path)";
  if (lower.includes("index")) decision = "Index Scan (fast path)";

  return (
    <p style={{ fontStyle: "italic", color: "#555" }}>
      Optimizer decision: {decision}
    </p>
  );
}

/* ===========================
   EXECUTION TIME BAR CHART
=========================== */

function ExecutionChart({
  slowMs,
  optMs
}: {
  slowMs: number;
  optMs: number;
}) {
  const max = Math.max(slowMs, optMs, 1);

  return (
    <div style={{ marginTop: 40 }}>
      <h3>Execution Time Comparison</h3>
      <Bar label="Slow Query" value={slowMs} max={max} color="#dc2626" />
      <Bar
        label="Optimized Query"
        value={optMs}
        max={max}
        color="#16a34a"
      />
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  color
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const width = Math.max(5, (value / max) * 100);

  return (
    <div style={{ marginBottom: 12 }}>
      <div>
        {label}: {value} ms
      </div>
      <div
        style={{
          height: 20,
          width: `${width}%`,
          backgroundColor: color,
          borderRadius: 4
        }}
      />
    </div>
  );
}

/* ===========================
   EXPLANATION PANEL
=========================== */

function ExplanationPanel({ scenario }: { scenario: string }) {
  if (scenario === "missing-index") {
    return (
      <div style={panelStyle}>
        <h3>Why is the query slow?</h3>
        <ul>
          <li>No index exists on <code>customer_id</code></li>
          <li>The database must scan every row in the orders table</li>
          <li>This results in unnecessary CPU and memory usage</li>
        </ul>

        <h3>How does indexing make it fast?</h3>
        <ul>
          <li>An index lets the database jump directly to matching rows</li>
          <li>Fewer rows scanned means less work</li>
          <li>The optimizer switches from table scan to index scan</li>
        </ul>
      </div>
    );
  }

  if (scenario === "cursor") {
    return (
      <div style={panelStyle}>
        <h3>Why is cursor-based logic slow?</h3>
        <ul>
          <li>Rows are processed one-by-one in application code</li>
          <li>More CPU overhead and looping</li>
          <li>Database optimizations cannot be applied</li>
        </ul>

        <h3>Why is set-based SQL faster?</h3>
        <ul>
          <li>Aggregation is done inside the database engine</li>
          <li>Optimized algorithms and memory access</li>
          <li>Much better scalability</li>
        </ul>
      </div>
    );
  }

  return null;
}

const panelStyle = {
  marginTop: 30,
  background: "#f9fafb",
  padding: 16,
  borderRadius: 6
};

/* ===========================
   SCALE SIMULATOR
=========================== */

function ScaleSimulator() {
  const [rows, setRows] = useState(100_000);

  return (
    <div style={{ marginTop: 30 }}>
      <h3>What happens at production scale?</h3>

      <input
        type="range"
        min={10000}
        max={10000000}
        step={10000}
        value={rows}
        onChange={(e) => setRows(Number(e.target.value))}
        style={{ width: "100%" }}
      />

      <p>Rows: {rows.toLocaleString()}</p>

      <p>
        Estimated table scan cost: ~{Math.round(rows / 1000)} ms
        <br />
        Estimated index scan cost: ~{Math.round(Math.log2(rows))} ms
      </p>
    </div>
  );
}

/* ===========================
   TIMING DISCLAIMER
=========================== */

function TimingNote() {
  return (
    <p style={{ marginTop: 20, color: "#555" }}>
      Execution time may vary due to caching and in-memory execution.
      Execution plans are the reliable indicator of performance at scale.
    </p>
  );
}
