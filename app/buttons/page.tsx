"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type Feature = {
  id: string;
  title: string;
  description: string;
  group: string;
  inputs?: { key: string; label: string; placeholder?: string; type?: string; defaultValue?: string }[];
};

const FEATURES: Feature[] = [
  { id: "head", title: "Read First 5 Rows", description: "Preview the first five records.", group: "A. Read and explore Excel" },
  { id: "tail", title: "Read Last 5 Rows", description: "Preview the last five records.", group: "A. Read and explore Excel" },
  { id: "paginate", title: "Display Rows with Pagination", description: "View a page of rows at a time.", group: "A. Read and explore Excel", inputs: [{ key: "page", label: "Page number", defaultValue: "1", type: "number" }, { key: "page_size", label: "Rows per page", defaultValue: "20", type: "number" }] },
  { id: "columns", title: "Show Column Names", description: "List all column headings.", group: "A. Read and explore Excel" },
  { id: "shape", title: "Show Number of Rows and Columns", description: "Get the dataset dimensions.", group: "A. Read and explore Excel" },
  { id: "dtypes", title: "Show Data Types", description: "Identify the inferred type of each column.", group: "A. Read and explore Excel" },
  { id: "random", title: "Show Random 5 Rows", description: "Preview five randomly selected records.", group: "A. Read and explore Excel" },
  { id: "sheets", title: "Display Excel Sheet Names", description: "List sheet names in the uploaded workbook.", group: "A. Read and explore Excel" },
  { id: "missing", title: "Find Empty Cells", description: "Show the total number of missing cells.", group: "B. Data quality checks" },
  { id: "missing_per_column", title: "Count Missing Values per Column", description: "Count empty cells in each column.", group: "B. Data quality checks" },
  { id: "missing_percentage", title: "Calculate Missing Value Percentage", description: "Calculate missing percentages per column.", group: "B. Data quality checks" },
  { id: "duplicates", title: "Find Duplicate Rows", description: "Count repeated rows.", group: "B. Data quality checks" },
  { id: "duplicate_columns", title: "Find Duplicate Values in a Column", description: "Find repeated values in a selected column.", group: "B. Data quality checks", inputs: [{ key: "column", label: "Column name", placeholder: "e.g. claim_id" }] },
  { id: "empty_columns", title: "Identify Completely Empty Columns", description: "Find columns that contain only missing values.", group: "B. Data quality checks" },
  { id: "date_formats", title: "Check Inconsistent Date Formats", description: "Flag date-like columns with values that fail date parsing.", group: "B. Data quality checks" },
  { id: "mixed_types", title: "Identify Mixed Data Types", description: "Flag columns containing different inferred value types.", group: "B. Data quality checks" },
  { id: "stats", title: "Calculate Sum, Average, Minimum and Maximum", description: "Summarize numeric columns.", group: "C. Data analysis" },
  { id: "describe", title: "Generate Descriptive Statistics", description: "Get count, mean, standard deviation and quantiles.", group: "C. Data analysis" },
  { id: "unique", title: "Count Unique Values per Column", description: "Count distinct values in every column.", group: "C. Data analysis" },
  { id: "frequent", title: "Show Most Frequent Values", description: "Show the top values in a selected column.", group: "C. Data analysis", inputs: [{ key: "column", label: "Column name", placeholder: "e.g. claim_type" }, { key: "limit", label: "Number of values", defaultValue: "10", type: "number" }] },
  { id: "sort", title: "Sort Data", description: "Sort records by a selected column.", group: "C. Data analysis", inputs: [{ key: "column", label: "Column name", placeholder: "e.g. claim_amount" }, { key: "ascending", label: "Ascending? (true/false)", defaultValue: "true" }] },
  { id: "filter", title: "Filter Rows", description: "Filter a column using a condition.", group: "C. Data analysis", inputs: [{ key: "column", label: "Column name", placeholder: "e.g. claim_amount" }, { key: "operator", label: "Operator: eq, ne, gt, gte, lt, lte, contains", defaultValue: "gt" }, { key: "value", label: "Value", placeholder: "e.g. 50000" }] },
  { id: "search", title: "Search Claim or Policy ID", description: "Search all cells for a text value.", group: "C. Data analysis", inputs: [{ key: "query", label: "Search term", placeholder: "Enter claim or policy ID" }] },
  { id: "compare", title: "Compare Two Columns", description: "Compare values in two selected columns.", group: "C. Data analysis", inputs: [{ key: "column", label: "First column", placeholder: "e.g. claimed_amount" }, { key: "column2", label: "Second column", placeholder: "e.g. approved_amount" }] },
  { id: "clean_duplicates_preview", title: "Preview Duplicate Removal", description: "Preview a working copy without duplicate rows.", group: "D. Data cleaning" },
  { id: "fill_missing_preview", title: "Preview Missing-Value Fill", description: "Preview filling missing values in a selected column.", group: "D. Data cleaning", inputs: [{ key: "column", label: "Column name", placeholder: "e.g. claim_amount" }, { key: "value", label: "Replacement value", placeholder: "e.g. 0" }] },
  { id: "trim_preview", title: "Standardize Text Whitespace", description: "Preview trimmed text columns.", group: "D. Data cleaning" },
  { id: "convert_preview", title: "Preview Column Type Conversion", description: "Preview converting a column to a type.", group: "D. Data cleaning", inputs: [{ key: "column", label: "Column name", placeholder: "e.g. claim_amount" }, { key: "target_type", label: "Target type: numeric, string, datetime", defaultValue: "numeric" }] },
  { id: "outliers", title: "Identify Unusually Large or Small Values", description: "Find numeric outliers using the IQR method.", group: "D. Data cleaning", inputs: [{ key: "column", label: "Numeric column", placeholder: "e.g. claim_amount" }] },
  { id: "quality_report", title: "Generate Data Quality Report", description: "Combine missing values, duplicates, and empty columns.", group: "E. Reports" },
  { id: "summary_report", title: "Generate Dataset Statistics Summary", description: "Create an overall dataset summary.", group: "E. Reports" },
  { id: "fraud_duplicate_claims", title: "Flag Potentially Duplicate Claims", description: "Flag records duplicated across selected columns.", group: "F. Fraud-specific features", inputs: [{ key: "columns", label: "Columns, comma-separated", placeholder: "claim_id,policy_id,claim_amount" }] },
  { id: "fraud_amount_threshold", title: "Flag Claims Above an Amount", description: "Flag claims above a threshold.", group: "F. Fraud-specific features", inputs: [{ key: "column", label: "Amount column", placeholder: "claim_amount" }, { key: "threshold", label: "Threshold", placeholder: "50000", type: "number" }] },
  { id: "fraud_repeated_ids", title: "Identify Repeated Claim or Policy IDs", description: "Find repeated values in a selected identifier column.", group: "F. Fraud-specific features", inputs: [{ key: "column", label: "Claim or policy ID column", placeholder: "claim_id" }] },
  { id: "fraud_unusual_amounts", title: "Detect Unusual Claim Amounts", description: "Use IQR to flag unusually high or low amounts.", group: "F. Fraud-specific features", inputs: [{ key: "column", label: "Amount column", placeholder: "claim_amount" }] },
  { id: "fraud_scores", title: "Create Rule-Based Risk Scores", description: "Score records using duplicate, missing, and amount indicators.", group: "F. Fraud-specific features", inputs: [{ key: "amount_column", label: "Amount column (optional)", placeholder: "claim_amount" }, { key: "threshold", label: "High-amount threshold (optional)", placeholder: "50000", type: "number" }] },
  { id: "fraud_top", title: "Rank Top 5 or 10 Claims", description: "Rank records by the rule-based risk score.", group: "F. Fraud-specific features", inputs: [{ key: "limit", label: "Number of claims (5 or 10)", defaultValue: "5", type: "number" }] },
  { id: "fraud_reasons", title: "Show Reasons for Flagged Claims", description: "Explain the rule-based indicators for each flagged record.", group: "F. Fraud-specific features", inputs: [{ key: "amount_column", label: "Amount column (optional)", placeholder: "claim_amount" }, { key: "threshold", label: "High-amount threshold (optional)", placeholder: "50000", type: "number" }] },
];

const GROUPS = [
  "A. Read and explore Excel",
  "B. Data quality checks",
  "C. Data analysis",
  "D. Data cleaning",
  "E. Reports",
  "F. Fraud-specific features",
];

function pretty(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

type SavedResult = {
  id: string;
  featureId: string;
  title: string;
  group: string;
  data: any;
  createdAt: string;
};

export default function ButtonsPage() {
  const [sessionId, setSessionId] = useState("");
  const [filename, setFilename] = useState("Uploaded dataset");
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>({});
  const [results, setResults] = useState<SavedResult[]>([]);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setSessionId(sessionStorage.getItem("fraudlens_session_id") || "");
    setFilename(sessionStorage.getItem("fraudlens_filename") || "Uploaded dataset");
  }, []);

  const runFeature = useCallback(async (feature: Feature) => {
    if (!sessionId) {
      setError("No active dataset session was found. Return to the homepage and upload a file again.");
      return;
    }

    setBusyId(feature.id);
    setError("");
    const params = inputs[feature.id] || {};

    try {
      const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: feature.id, params }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail || "This operation failed.");
      }

      setResults((current) => [
        {
          id: `${feature.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          featureId: feature.id,
          title: feature.title,
          group: feature.group,
          data: payload,
          createdAt: new Date().toLocaleString(),
        },
        ...current,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process this request.");
    } finally {
      setBusyId("");
    }
  }, [sessionId, inputs]);

  const endSession = async () => {
    if (sessionId) {
      try {
        await fetch(`${API_BASE}/api/sessions/${sessionId}`, { method: "DELETE" });
      } catch {
        // The backend session will expire automatically if it cannot be reached.
      }
    }
    sessionStorage.removeItem("fraudlens_session_id");
    sessionStorage.removeItem("fraudlens_filename");
    setSessionId("");
    setResults([]);
    setError("");
    window.location.href = "/";
  };

  const toggleGroup = (group: string) => {
    setOpenGroups((current) =>
      current.includes(group)
        ? current.filter((item) => item !== group)
        : [...current, group]
    );
  };

  const renderResultData = (result: any) => {
    if (result?.kind === "table") {
      const rows = result.rows || [];
      const columns: string[] = result.columns || (rows[0] ? Object.keys(rows[0]) : []);
      return (
        <div className="overflow-x-auto rounded-xl border border-stone-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-600">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="whitespace-nowrap px-4 py-3 font-semibold">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {rows.map((row: Record<string, unknown>, index: number) => (
                <tr key={index} className="hover:bg-stone-50">
                  {columns.map((column) => (
                    <td key={column} className="max-w-xs px-4 py-3 align-top text-stone-700">
                      {pretty(row[column]) || <span className="text-stone-300">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={Math.max(columns.length, 1)} className="px-4 py-8 text-center text-stone-500">
                    No rows matched this operation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <pre className="max-h-[520px] overflow-auto rounded-xl border border-stone-200 bg-white p-4 text-xs leading-relaxed text-stone-700">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900">
      <header className="border-b border-stone-200/70 bg-[#faf9f6]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#b08d57] to-[#7c5e3c] text-sm font-bold text-white">F</span>
            <span className="text-sm font-semibold tracking-tight">FraudLens</span>
          </Link>
          <button
            onClick={endSession}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100 sm:text-sm"
          >
            End Session &amp; Clear Data
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d3b]">Temporary workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Data Explorer</h1>
          <p className="mt-2 text-sm text-stone-600">Choose a Python operation to run on your uploaded file.</p>
          <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs text-stone-600">
            <span className={`h-2 w-2 rounded-full ${sessionId ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span className="max-w-[260px] truncate">{filename}</span>
            <span className="text-stone-300">·</span>
            <span>{sessionId ? "Session active" : "No active session"}</span>
          </div>
        </div>

        {!sessionId && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            No active dataset was found. <Link href="/" className="font-semibold underline">Upload a file on the homepage</Link> to start.
          </div>
        )}

        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Analysis tools</h2>
            <p className="mt-1 text-sm text-stone-500">Expand a category to view the available operations.</p>
          </div>

          <div className="space-y-3">
            {GROUPS.map((group) => {
              const isOpen = openGroups.includes(group);
              const groupFeatures = FEATURES.filter((feature) => feature.group === group);
              return (
                <section key={group} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-stone-50"
                  >
                    <span>
                      <span className="block text-sm font-semibold sm:text-base">{group}</span>
                      <span className="mt-1 block text-xs text-stone-500">{groupFeatures.length} tools available</span>
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-lg text-stone-600">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="grid gap-3 border-t border-stone-100 bg-stone-50/60 p-4 sm:grid-cols-2 lg:grid-cols-3">
                      {groupFeatures.map((feature) => (
                        <div key={feature.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                          <h3 className="text-sm font-semibold">{feature.title}</h3>
                          <p className="mt-1 min-h-10 text-xs leading-relaxed text-stone-500">{feature.description}</p>

                          {feature.inputs && (
                            <div className="mt-3 grid gap-2">
                              {feature.inputs.map((input) => (
                                <label key={input.key} className="block">
                                  <span className="mb-1 block text-[11px] font-medium text-stone-500">{input.label}</span>
                                  <input
                                    type={input.type || "text"}
                                    placeholder={input.placeholder || ""}
                                    value={inputs[feature.id]?.[input.key] ?? input.defaultValue ?? ""}
                                    onChange={(event) =>
                                      setInputs((old) => ({
                                        ...old,
                                        [feature.id]: {
                                          ...(old[feature.id] || {}),
                                          [input.key]: event.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-xs outline-none focus:border-[#b08d57] focus:ring-2 focus:ring-[#b08d57]/15"
                                  />
                                </label>
                              ))}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => runFeature(feature)}
                            disabled={Boolean(busyId) || !sessionId}
                            className="mt-4 w-full rounded-lg bg-stone-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {busyId === feature.id ? "Processing…" : "Run feature"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </section>

        <section id="results" className="scroll-mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Results</h2>
              <p className="mt-1 text-sm text-stone-500">
                {results.length === 0 ? "Your analysis results will appear here." : `${results.length} result${results.length === 1 ? "" : "s"} saved in this session. New results appear first.`}
              </p>
            </div>
            {results.length > 0 && (
              <button
                type="button"
                onClick={() => setResults([])}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition hover:bg-stone-100"
              >
                Clear all results
              </button>
            )}
          </div>

          {error && (
            <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {results.length === 0 && !error && (
            <div className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-12 text-center">
              <p className="text-sm font-medium text-stone-600">No results yet</p>
              <p className="mt-1 text-xs text-stone-400">Open a category above and run any tool to see its output here.</p>
            </div>
          )}

          <div className="space-y-5">
            {results.map((item, index) => (
              <article key={item.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 px-4 py-4 sm:px-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a6d3b]">{item.group}</p>
                    <h3 className="mt-1 text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1 text-[11px] text-stone-400">Result {results.length - index} · {item.createdAt}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResults((current) => current.filter((result) => result.id !== item.id))}
                    className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="p-3 sm:p-5">
                  {renderResultData(item.data)}
                  {item.data?.note && <p className="mt-3 text-xs leading-relaxed text-stone-500">{item.data.note}</p>}
                  <p className="mt-3 text-[11px] text-stone-400">
                    Results are temporary. Fraud indicators are not proof of fraud; review flagged records before taking action.
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200/70 px-4 py-5 text-center text-xs text-stone-400">
        FraudLens · Temporary data processing · Session expires after inactivity
      </footer>
    </div>
  );
}
