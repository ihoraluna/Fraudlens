"use client";

import { useRef, useState } from "react";

const ACCEPTED_EXTS = [".csv", ".xlsx", ".xls"];
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = (f: File) => {
    const lower = f.name.toLowerCase();
    if (!ACCEPTED_EXTS.some((ext) => lower.endsWith(ext))) {
      setError("Unsupported file type. Please upload a .csv, .xlsx, or .xls file.");
      return;
    }
    // Intentionally no application-level file-size check.
    setError(null);
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndSet(f);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSet(f);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!file || isUploading) return;
    setIsUploading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch(`${API_BASE}/api/sessions/upload`, {
        method: "POST",
        body: form,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.detail || `Upload failed (HTTP ${response.status}).`);
      }

      sessionStorage.setItem("fraudlens_session_id", payload.session_id);
      sessionStorage.setItem("fraudlens_filename", file.name);

      // Avoid relying on Next.js client-router initialization in this flow.
      window.location.assign("/buttons");
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} Check that the Python backend is running at ${API_BASE}.`
          : "Unable to upload the file."
      );
      setIsUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6] text-stone-900">
      <header className="w-full border-b border-stone-200/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#b08d57] to-[#7c5e3c]">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">FraudLens</span>
          </div>
          <span className="hidden rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500 sm:inline-block">
            Temporary processing
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pb-16 sm:px-6">
        <section className="animate-fade-in-up mt-12 w-full max-w-2xl text-center sm:mt-20">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b08d57] to-[#7c5e3c] shadow-lg shadow-[#7c5e3c]/25">
            <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <circle cx="12" cy="11" r="2.5" />
              <path d="M14 13l2 2" />
            </svg>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">FraudLens</h1>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.24em] text-stone-500 sm:text-sm">Fraud Data Analysis</p>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-stone-600 sm:text-[15px]">
            Explore spreadsheet data, check data quality, and flag claims that may need further investigation.
          </p>
        </section>

        <section className="animate-fade-in-up-delay-1 mt-10 w-full max-w-2xl sm:mt-12">
          <div className="rounded-2xl border border-stone-200 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(28,25,23,0.08)]">
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleChange} className="hidden" />
            {!file ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
                }}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-all duration-300 sm:py-16 ${
                  isDragging ? "border-[#8a6d3b] bg-[#fbf7f0]" : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/70"
                }`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                  </svg>
                </div>
                <p className="text-sm font-medium sm:text-base">Drag & drop your file here</p>
                <p className="mt-1 text-xs text-stone-500 sm:text-sm">or <span className="font-medium text-[#7c5e3c] underline underline-offset-2">browse</span> to upload</p>
                <p className="mt-4 rounded-full bg-stone-100 px-3 py-1 text-[11px] font-medium tracking-wide text-stone-500">CSV · XLSX · XLS · No app-level size limit</p>
              </div>
            ) : (
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-[#7c5e3c] shadow-sm ring-1 ring-stone-200">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="mt-0.5 text-xs text-stone-500">{formatSize(file.size)}</p>
                  </div>
                  <button type="button" onClick={() => { setFile(null); setError(null); }} className="rounded-lg px-3 py-1 text-sm text-stone-500 hover:bg-stone-200" aria-label="Remove file">Remove</button>
                </div>
                <button type="button" onClick={handleUpload} disabled={isUploading} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60">
                  {isUploading ? "Uploading and preparing…" : "Upload & Explore Data"}
                </button>
              </div>
            )}
          </div>
          {error && <p role="alert" className="mt-3 break-words text-center text-sm text-red-600">{error}</p>}
          <p className="mt-5 text-center text-[11px] leading-relaxed text-stone-400 sm:text-xs">
            Files are processed temporarily in backend memory and expire after inactivity. No application-level file-size cap is configured, but your computer's available memory and server limits still apply. Avoid uploading sensitive real-world data to this prototype.
          </p>
        </section>
      </main>
    </div>
  );
}
