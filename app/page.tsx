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

// --- Types ---
type InsuranceCategory = "Motor" | "Health" | "Property" | "Travel" | "Personal Accident" | "Other";

type AssessmentForm = {
  claimNumber: string;
  policyNumber: string;
  customerId: string;
  insuranceCategory: InsuranceCategory;
  claimType: string;
  claimStatus: string;
  claimDate: string;
  
  policyStartDate: string;
  policyExpiryDate: string;
  policyType: string;
  coverageAmount: string;
  previousClaims: string;
  policyActive: string;

  incidentDate: string;
  incidentLocation: string;
  accidentSeverity: string;
  policeReport: string;
  witnesses: string;
  incidentDescription: string;

  claimAmount: string;
  approvedAmount: string;
  estimatedLoss: string;
  actualLoss: string;
  deductible: string;
  repairCost: string;
  medicalCost: string;

  identityVerified: string;
  policyVerified: string;
  documentsVerified: string;
  incidentVerified: string;
  financialVerified: string;
  externalVerification: string;
  statementsConsistent: string;
  delayedReporting: string;
  suspiciousDocuments: string;

  garageVerified: string;
  hospitalVerified: string;
  surveyorVerified: string;
  travelDocsVerified: string;
  disabilityVerified: string;

  investigatorObservations: string;
  documentsAwaited: string;
};

type RiskFactor = { rule: string; points: number; type: "Risk" | "Missing" | "Financial" };

type AssessmentResult = {
  score: number;
  completeness: number;
  steps: string[];
  breakdown: RiskFactor[];
  missingInfo: string[];
  financialFlags: string[];
};

// --- Initial States (Neutral Defaults) ---
const initialFormState: AssessmentForm = {
  claimNumber: "", policyNumber: "", customerId: "", insuranceCategory: "Motor", claimType: "Accident", claimStatus: "Pending", claimDate: "",
  policyStartDate: "", policyExpiryDate: "", policyType: "", coverageAmount: "", previousClaims: "", policyActive: "",
  incidentDate: "", incidentLocation: "", accidentSeverity: "", policeReport: "", witnesses: "", incidentDescription: "",
  claimAmount: "", approvedAmount: "", estimatedLoss: "", actualLoss: "", deductible: "", repairCost: "", medicalCost: "",
  identityVerified: "", policyVerified: "", documentsVerified: "", incidentVerified: "", financialVerified: "", externalVerification: "", statementsConsistent: "", delayedReporting: "", suspiciousDocuments: "",
  garageVerified: "", hospitalVerified: "", surveyorVerified: "", travelDocsVerified: "", disabilityVerified: "",
  investigatorObservations: "", documentsAwaited: ""
};

const NATURE_OF_LOSS_MAP: Record<InsuranceCategory, string[]> = {
  "Motor": ["Accident", "Theft", "Fire", "Natural Disaster", "Third Party Liability"],
  "Health": ["Hospitalisation", "Surgery", "Critical Illness", "Outpatient Care", "Maternity"],
  "Property": ["Fire", "Flood", "Earthquake", "Burglary", "Structural Damage"],
  "Travel": ["Trip Cancellation", "Medical Emergency", "Lost Baggage", "Flight Delay"],
  "Personal Accident": ["Accidental Death", "Permanent Disability", "Temporary Disability"],
  "Other": ["General Liability", "Business Interruption", "Other"]
};

export default function Home() {
  // Upload State
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Assessment State
  const [form, setForm] = useState<AssessmentForm>(initialFormState);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const validateAndSet = (f: File) => {
    const lower = f.name.toLowerCase();
    if (!ACCEPTED_EXTS.some((ext) => lower.endsWith(ext))) {
      setError("Unsupported file type. Please upload a .csv, .xlsx, or .xls file.");
      return;
    }
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
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/api/sessions/upload`, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || `Upload failed.`);

      sessionStorage.setItem("fraudlens_session_id", payload.session_id);
      sessionStorage.setItem("fraudlens_filename", file.name);
      window.location.assign("/buttons");
    } catch (err) {
      setError(err instanceof Error ? `${err.message} Check backend.` : "Unable to upload.");
      setIsUploading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "insuranceCategory") {
        updated.claimType = NATURE_OF_LOSS_MAP[value as InsuranceCategory][0];
      }
      return updated;
    });
  };

  const calculateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssessing(true);

    setTimeout(() => {
      let score = 0;
      const steps: string[] = [];
      const breakdown: RiskFactor[] = [];
      const missingInfo: string[] = [];
      const financialFlags: string[] = [];

      const addRisk = (rule: string, points: number, type: "Risk" | "Missing" | "Financial") => {
        score += points;
        breakdown.push({ rule, points, type });
      };

      const addMissing = (fieldName: string) => {
        const formatted = fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        if (!missingInfo.includes(formatted)) missingInfo.push(formatted);
      };

      // --- 1. Core Verification Checks ---
      if (form.identityVerified === "No") addRisk("Identity not verified", 15, "Risk");
      if (form.policyVerified === "No") addRisk("Policy details not verified", 15, "Risk");
      if (form.incidentVerified === "No") addRisk("Incident details not verified", 20, "Risk");
      if (form.financialVerified === "No") addRisk("Financial documents not verified", 15, "Risk");
      if (form.statementsConsistent === "No") addRisk("Inconsistent statements", 15, "Risk");
      if (form.suspiciousDocuments === "Yes") addRisk("Suspicious documents detected", 30, "Risk");
      if (form.suspiciousDocuments === "Under Review") addRisk("Documents under review", 15, "Risk");
      
      // Track Pending as Missing Information (Not Risk)
      if (form.documentsVerified === "Pending" || form.documentsVerified === "") addMissing("Supporting Documents Verification");
      if (form.documentsVerified === "No") addRisk("Supporting documents rejected/missing", 20, "Risk");

      // --- 2. Incident / Policy Checks ---
      if (form.delayedReporting === "Yes") addRisk("Delayed reporting", 15, "Risk");

      // Refined Police Report Rule
      if (form.policeReport === "No") {
        if (form.accidentSeverity === "Major" || form.claimType === "Theft" || form.claimType === "Burglary") {
          addRisk("Major incident reported without police report", 15, "Risk");
        } else {
          addMissing("Police Report (Minor Incident)");
        }
      }

      const prevClaims = parseInt(form.previousClaims) || 0;
      if (prevClaims >= 3) addRisk("High previous claim history", 15, "Risk");

      // Early Claim Check
      if (form.policyStartDate && form.incidentDate) {
        const start = new Date(form.policyStartDate).getTime();
        const incident = new Date(form.incidentDate).getTime();
        if (incident - start < 30 * 24 * 60 * 60 * 1000) {
          addRisk("Incident occurred within 30 days of policy inception", 20, "Risk");
        }
      }

      // --- 3. Financial Checks ---
      const claimAmt = parseFloat(form.claimAmount) || 0;
      const estLoss = parseFloat(form.estimatedLoss) || 0;
      const actLoss = parseFloat(form.actualLoss) || 0;
      const appAmt = parseFloat(form.approvedAmount) || 0;
      const ded = parseFloat(form.deductible) || 0;

      if (claimAmt > 0 && estLoss > 0 && claimAmt > estLoss * 1.5) {
        addRisk("Claimed exceeds estimated loss by >50%", 20, "Financial");
        financialFlags.push(`Claimed (₹${claimAmt}) is significantly higher than Estimated Loss (₹${estLoss}).`);
      }
      if (claimAmt > 0 && actLoss > 0 && claimAmt > actLoss * 1.2) {
        addRisk("Claimed exceeds actual verified loss by >20%", 15, "Financial");
        financialFlags.push(`Claimed (₹${claimAmt}) exceeds verified Actual Loss (₹${actLoss}).`);
      }
      if (claimAmt > 0 && appAmt > 0 && appAmt < claimAmt * 0.5) {
        addRisk("Approved is <50% of claimed", 10, "Financial");
        financialFlags.push(`Approved (₹${appAmt}) is less than half of Claimed (₹${claimAmt}).`);
      }
      if (claimAmt > 0 && ded > 0 && claimAmt <= ded) {
        addRisk("Claimed amount does not exceed deductible", 10, "Financial");
        financialFlags.push(`Claimed (₹${claimAmt}) is lower than or equal to the Deductible (₹${ded}).`);
      }

      // --- 4. Category Specific Verifications ---
      if (form.insuranceCategory === "Motor") {
        if (form.garageVerified === "No") addRisk("Garage / Repair Shop rejected verification", 15, "Risk");
        if (form.garageVerified === "Pending" || form.garageVerified === "") addMissing("Garage Verification");
      }
      if (form.insuranceCategory === "Health") {
        if (form.hospitalVerified === "No") addRisk("Hospital / Medical Records rejected verification", 15, "Risk");
        if (form.hospitalVerified === "Pending" || form.hospitalVerified === "") addMissing("Hospital Verification");
      }
      if (form.insuranceCategory === "Property") {
        if (form.surveyorVerified === "No") addRisk("Surveyor / Damage rejected verification", 15, "Risk");
        if (form.surveyorVerified === "Pending" || form.surveyorVerified === "") addMissing("Surveyor Verification");
      }
      if (form.insuranceCategory === "Travel") {
        if (form.travelDocsVerified === "No") addRisk("Travel documents rejected verification", 15, "Risk");
        if (form.travelDocsVerified === "Pending" || form.travelDocsVerified === "") addMissing("Travel Docs Verification");
      }
      if (form.insuranceCategory === "Personal Accident") {
        if (form.disabilityVerified === "No") addRisk("Disability / Medical certificate rejected", 15, "Risk");
        if (form.disabilityVerified === "Pending" || form.disabilityVerified === "") addMissing("Disability Certificate Verification");
      }

      // --- 5. Completeness Calculation (Dynamic based on category) ---
      let applicableFields = Object.keys(form).filter(k => !["investigatorObservations", "documentsAwaited"].includes(k));
      
      // Remove fields not relevant to the selected category
      if (form.insuranceCategory !== "Motor") applicableFields = applicableFields.filter(k => !["repairCost", "garageVerified"].includes(k));
      if (form.insuranceCategory !== "Health") applicableFields = applicableFields.filter(k => !["medicalCost", "hospitalVerified"].includes(k));
      if (form.insuranceCategory !== "Property") applicableFields = applicableFields.filter(k => k !== "surveyorVerified");
      if (form.insuranceCategory !== "Travel") applicableFields = applicableFields.filter(k => k !== "travelDocsVerified");
      if (form.insuranceCategory !== "Personal Accident") applicableFields = applicableFields.filter(k => k !== "disabilityVerified");

      // Count missing required fields for the report
      const requiredFields = ["claimNumber", "policyNumber", "customerId", "claimDate", "policyStartDate", "policyExpiryDate", "incidentDate", "incidentLocation", "incidentDescription", "claimAmount", "estimatedLoss"];
      requiredFields.forEach(field => {
        if (!form[field as keyof AssessmentForm]) addMissing(field);
      });

      // Calculate % based on filled applicable fields
      let filledFieldsCount = 0;
      applicableFields.forEach(k => {
         const val = form[k as keyof AssessmentForm];
         // A field is considered "filled" if it has a value and isn't "Not Applicable" or "Unknown"
         if (val !== "" && val !== "Not Applicable" && val !== "Unknown") {
             filledFieldsCount++;
         }
      });
      
      let completeness = Math.round((filledFieldsCount / applicableFields.length) * 100);
      if (completeness > 100) completeness = 100;

      // Cap score
      if (score > 100) score = 100;

      // --- 6. Recommended Steps ---
      if (score > 60) steps.push("Escalate to the Special Investigations Unit (SIU).");
      if (form.documentsVerified !== "Yes") steps.push("Obtain and verify all required supporting documents.");
      if (financialFlags.length > 0) steps.push("Conduct a detailed reconciliation of claimed vs. estimated financials.");
      if (form.insuranceCategory === "Motor" && form.garageVerified !== "Yes") steps.push("Contact the repair facility to validate the repair estimate.");
      if (form.insuranceCategory === "Health" && form.hospitalVerified !== "Yes") steps.push("Request medical records directly from the hospital.");
      if (form.insuranceCategory === "Property" && form.surveyorVerified !== "Yes") steps.push("Assign a surveyor to validate the property damage.");
      if (form.insuranceCategory === "Travel" && form.travelDocsVerified !== "Yes") steps.push("Verify flight tickets, baggage tags, and travel itineraries.");
      if (form.insuranceCategory === "Personal Accident" && form.disabilityVerified !== "Yes") steps.push("Validate medical/disability certificates from a recognized authority.");
      if (steps.length === 0) steps.push("Proceed with standard claim processing.");

      setResult({ score, completeness, steps, breakdown, missingInfo, financialFlags });
      setIsAssessing(false);
      document.getElementById("assessment-result")?.scrollIntoView({ behavior: "smooth" });
    }, 600);
  };

  const clearAssessment = () => {
    setForm(initialFormState);
    setResult(null);
  };

    const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus("sending");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "c69e9045-a7e0-4d59-a818-7fe5b8fb1007",
          name: contactName,
          email: contactEmail || "Not provided",
          message: contactMessage,
          subject: "New Submission from Website FraudLens", // <--- ADD THIS LINE
        }),
      });

      const result = await response.json();
      if (result.success) {
        setContactStatus("success");
        setContactName("");
        setContactEmail("");
        setContactMessage("");
      } else {
        setContactStatus("error");
      }
    } catch (error) {
      setContactStatus("error");
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
        
        {/* --- Section 1: Bulk Upload --- */}
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
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
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
                <p className="mt-4 rounded-full bg-stone-100 px-3 py-1 text-[11px] font-medium tracking-wide text-stone-500">CSV · XLSX · XLS</p>
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
                  <button type="button" onClick={() => { setFile(null); setError(null); }} className="rounded-lg px-3 py-1 text-sm text-stone-500 hover:bg-stone-200">Remove</button>
                </div>
                <button type="button" onClick={handleUpload} disabled={isUploading} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60">
                  {isUploading ? "Uploading and preparing…" : "Upload & Explore Data"}
                </button>
              </div>
            )}
          </div>
          {error && <p role="alert" className="mt-3 text-center text-sm text-red-600">{error}</p>}
        </section>

        {/* --- Divider --- */}
        <div className="my-16 flex w-full max-w-3xl items-center gap-4">
          <div className="h-px flex-1 bg-stone-200"></div>
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">Or Assess a Single Claim</span>
          <div className="h-px flex-1 bg-stone-200"></div>
        </div>

        {/* --- Section 2: Individual Claim Assessment --- */}
        <section className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">General Insurance Claim Assessment</h2>
            <p className="mt-2 text-sm text-stone-600">Select a category and enter claim details for a preliminary risk assessment.</p>
          </div>

          <form onSubmit={calculateAssessment} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            
            {/* A. Basic Info */}
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#8a6d3b]">A. Basic Claim Information</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-full sm:col-span-1">
                  <label className="mb-1 block text-xs font-medium text-stone-800">Insurance Category</label>
                  <select name="insuranceCategory" value={form.insuranceCategory} onChange={handleFormChange} className="w-full rounded-lg border border-[#b08d57] bg-[#faf9f6] px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-[#b08d57]/30">
                    {Object.keys(NATURE_OF_LOSS_MAP).map(cat => <option key={cat} value={cat}>{cat} Insurance</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Claim Number</label>
                  <input type="text" name="claimNumber" value={form.claimNumber} onChange={handleFormChange} required placeholder="CLM-2026-001" className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Policy Number</label>
                  <input type="text" name="policyNumber" value={form.policyNumber} onChange={handleFormChange} required placeholder="POL-10245" className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Customer / Insured ID</label>
                  <input type="text" name="customerId" value={form.customerId} onChange={handleFormChange} required placeholder="CUST-1001" className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Nature of Claim</label>
                  <select name="claimType" value={form.claimType} onChange={handleFormChange} className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]">
                    {NATURE_OF_LOSS_MAP[form.insuranceCategory].map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Claim Status</label>
                  <select name="claimStatus" value={form.claimStatus} onChange={handleFormChange} className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]">
                    <option>Pending</option><option>Approved</option><option>Rejected</option><option>Under Investigation</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Claim Date</label>
                  <input type="date" name="claimDate" value={form.claimDate} onChange={handleFormChange} required className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
              </div>
            </div>

            {/* B. Policy Info */}
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#8a6d3b]">B. Policy Information</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Policy Inception Date</label>
                  <input type="date" name="policyStartDate" value={form.policyStartDate} onChange={handleFormChange} className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Policy Expiry Date</label>
                  <input type="date" name="policyExpiryDate" value={form.policyExpiryDate} onChange={handleFormChange} className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Coverage Type</label>
                  <input type="text" name="policyType" value={form.policyType} onChange={handleFormChange} placeholder="Comprehensive / Basic" className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Sum Insured (₹)</label>
                  <input type="number" name="coverageAmount" value={form.coverageAmount} onChange={handleFormChange} className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Previous Claims</label>
                  <input type="number" name="previousClaims" value={form.previousClaims} onChange={handleFormChange} placeholder="0" className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Policy Status</label>
                  <select name="policyActive" value={form.policyActive} onChange={handleFormChange} className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]">
                    <option value="" disabled>Select...</option>
                    <option>Active</option><option>Lapsed</option><option>Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* C. Incident Info */}
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#8a6d3b]">C. Incident / Loss Information</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Date of Loss / Incident</label>
                  <input type="date" name="incidentDate" value={form.incidentDate} onChange={handleFormChange} className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Location of Loss</label>
                  <input type="text" name="incidentLocation" value={form.incidentLocation} onChange={handleFormChange} placeholder="City / Region" className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Severity of Loss</label>
                  <select name="accidentSeverity" value={form.accidentSeverity} onChange={handleFormChange} className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]">
                    <option value="" disabled>Select...</option>
                    <option>Minor</option><option>Moderate</option><option>Major</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Police / Authority Report</label>
                  <select name="policeReport" value={form.policeReport} onChange={handleFormChange} className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]">
                    <option value="" disabled>Select...</option>
                    <option>Yes</option><option>No</option><option>Not Applicable</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Witnesses Available</label>
                  <select name="witnesses" value={form.witnesses} onChange={handleFormChange} className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]">
                    <option value="" disabled>Select...</option>
                    <option>Yes</option><option>No</option><option>Unknown</option>
                  </select>
                </div>
                <div className="col-span-full">
                  <label className="mb-1 block text-xs font-medium text-stone-600">Description of Incident</label>
                  <input type="text" name="incidentDescription" value={form.incidentDescription} onChange={handleFormChange} placeholder="Brief summary of what happened..." className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
              </div>
            </div>

            {/* D. Financial Info */}
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#8a6d3b]">D. Financial Information</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Claimed Amount (₹)</label>
                  <input type="number" name="claimAmount" value={form.claimAmount} onChange={handleFormChange} placeholder="50000" className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Estimated Loss (₹)</label>
                  <input type="number" name="estimatedLoss" value={form.estimatedLoss} onChange={handleFormChange} placeholder="45000" className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Actual / Verified Loss (₹)</label>
                  <input type="number" name="actualLoss" value={form.actualLoss} onChange={handleFormChange} placeholder="40000" className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Approved Amount (₹)</label>
                  <input type="number" name="approvedAmount" value={form.approvedAmount} onChange={handleFormChange} placeholder="If applicable" className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Deductible / Excess (₹)</label>
                  <input type="number" name="deductible" value={form.deductible} onChange={handleFormChange} placeholder="5000" className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                </div>
                
                {/* Category Specific Financials */}
                {form.insuranceCategory === "Motor" && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#8a6d3b]">Repair Cost (₹)</label>
                    <input type="number" name="repairCost" value={form.repairCost} onChange={handleFormChange} placeholder="20000" className="w-full rounded-lg border border-[#b08d57]/50 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                  </div>
                )}
                {form.insuranceCategory === "Health" && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#8a6d3b]">Medical Cost (₹)</label>
                    <input type="number" name="medicalCost" value={form.medicalCost} onChange={handleFormChange} placeholder="15000" className="w-full rounded-lg border border-[#b08d57]/50 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]" />
                  </div>
                )}
              </div>
            </div>

            {/* E. Verification Info */}
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#8a6d3b]">E. Verification Information</h3>
              <p className="mb-4 text-xs text-stone-500 italic">Leave as "Not Assessed" if you have not yet checked this information. Unverified items will be listed separately.</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Identity Verified", name: "identityVerified" },
                  { label: "Policy Verified", name: "policyVerified" },
                  { label: "Supporting Documents Verified", name: "documentsVerified" },
                  { label: "Incident Details Verified", name: "incidentVerified" },
                  { label: "Financial Documents Verified", name: "financialVerified" },
                  { label: "Statements Consistent", name: "statementsConsistent" },
                  { label: "Reporting Delayed", name: "delayedReporting" },
                  { label: "Suspicious Documents", name: "suspiciousDocuments" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="mb-1 block text-xs font-medium text-stone-600">{field.label}</label>
                    <select name={field.name} value={form[field.name as keyof AssessmentForm]} onChange={handleFormChange} className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]">
                      {field.name === "suspiciousDocuments" ? (
                        <><option value="" disabled>Select...</option><option>No</option><option>Yes</option><option>Under Review</option></>
                      ) : field.name === "delayedReporting" ? (
                        <><option value="" disabled>Select...</option><option>No</option><option>Yes</option><option>Unknown</option></>
                      ) : (
                        <><option value="" disabled>Select...</option><option>Yes</option><option>No</option><option>Pending</option><option>Unknown</option><option>Not Applicable</option></>
                      )}
                    </select>
                  </div>
                ))}
                
                {/* Category Specific Verifications */}
                {form.insuranceCategory === "Motor" && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#8a6d3b]">Garage / Repair Shop Verified</label>
                    <select name="garageVerified" value={form.garageVerified} onChange={handleFormChange} className="w-full rounded-lg border border-[#b08d57]/50 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]">
                      <option value="" disabled>Select...</option><option>Yes</option><option>No</option><option>Pending</option>
                    </select>
                  </div>
                )}
                {form.insuranceCategory === "Health" && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#8a6d3b]">Hospital / Medical Records Verified</label>
                    <select name="hospitalVerified" value={form.hospitalVerified} onChange={handleFormChange} className="w-full rounded-lg border border-[#b08d57]/50 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]">
                      <option value="" disabled>Select...</option><option>Yes</option><option>No</option><option>Pending</option>
                    </select>
                  </div>
                )}
                {form.insuranceCategory === "Property" && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#8a6d3b]">Surveyor / Damage Verified</label>
                    <select name="surveyorVerified" value={form.surveyorVerified} onChange={handleFormChange} className="w-full rounded-lg border border-[#b08d57]/50 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]">
                      <option value="" disabled>Select...</option><option>Yes</option><option>No</option><option>Pending</option>
                    </select>
                  </div>
                )}
                {form.insuranceCategory === "Travel" && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#8a6d3b]">Travel Docs Verified</label>
                    <select name="travelDocsVerified" value={form.travelDocsVerified} onChange={handleFormChange} className="w-full rounded-lg border border-[#b08d57]/50 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]">
                      <option value="" disabled>Select...</option><option>Yes</option><option>No</option><option>Pending</option>
                    </select>
                  </div>
                )}
                {form.insuranceCategory === "Personal Accident" && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#8a6d3b]">Disability Certificate Verified</label>
                    <select name="disabilityVerified" value={form.disabilityVerified} onChange={handleFormChange} className="w-full rounded-lg border border-[#b08d57]/50 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]">
                      <option value="" disabled>Select...</option><option>Yes</option><option>No</option><option>Pending</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* F. Observations */}
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#8a6d3b]">F. Investigation Observations</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Investigator Observations</label>
                  <textarea name="investigatorObservations" value={form.investigatorObservations} onChange={handleFormChange} rows={2} className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]"></textarea>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Documents Awaited</label>
                  <textarea name="documentsAwaited" value={form.documentsAwaited} onChange={handleFormChange} rows={2} className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]"></textarea>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={clearAssessment} className="rounded-xl border border-stone-200 px-6 py-3 text-sm font-medium text-stone-600 hover:bg-stone-50">Clear Form</button>
              <button type="submit" disabled={isAssessing} className="rounded-xl bg-[#7c5e3c] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#6a4f32] disabled:opacity-50">
                {isAssessing ? "Calculating..." : "Run Assessment"}
              </button>
            </div>
          </form>
        </section>

        {/* --- Section 3: Assessment Results --- */}
        {result && (
          <section id="assessment-result" className="mt-8 w-full max-w-4xl animate-fade-in-up">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
              
              <div className="border-b border-stone-100 bg-stone-50 px-6 py-5 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-stone-900">Assessment Result: {form.claimNumber || "Unknown Claim"}</h3>
                  <p className="mt-1 text-sm text-stone-500">{form.insuranceCategory} Insurance · {form.claimType}</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-4">
                  <div className="text-center rounded-lg bg-white px-4 py-2 border border-stone-200 shadow-sm">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500">Risk Score</span>
                    <span className={`text-2xl font-bold ${result.score > 50 ? 'text-red-600' : result.score > 25 ? 'text-amber-600' : 'text-emerald-600'}`}>{result.score}/100</span>
                  </div>
                  <div className="text-center rounded-lg bg-white px-4 py-2 border border-stone-200 shadow-sm">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500">Completeness</span>
                    <span className="text-2xl font-bold text-stone-800">{result.completeness}%</span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 grid gap-8 sm:grid-cols-2">
                
                {/* Left Column: Risk Indicators & Breakdown */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-stone-800 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Risk Factor Breakdown
                  </h4>
                  <div className="space-y-2 mb-6">
                    {result.breakdown.length > 0 ? result.breakdown.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm p-2 rounded bg-stone-50 border border-stone-100">
                        <span className="text-stone-700">{item.rule}</span>
                        <span className={`font-semibold px-2 py-0.5 rounded text-xs ${item.type === 'Risk' ? 'bg-red-100 text-red-700' : item.type === 'Financial' ? 'bg-amber-100 text-amber-700' : 'bg-stone-200 text-stone-700'}`}>+{item.points}</span>
                      </div>
                    )) : <p className="text-sm text-stone-500 italic">No risk factors triggered.</p>}
                  </div>

                  <h4 className="mb-3 text-sm font-semibold text-stone-800 flex items-center gap-2">
                    <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Missing / Unverified Information
                  </h4>
                  <ul className="space-y-1">
                    {result.missingInfo.length > 0 ? result.missingInfo.map((info, i) => (
                      <li key={i} className="text-sm text-stone-600 flex items-start gap-2"><span className="text-stone-400 mt-0.5">•</span>{info}</li>
                    )) : <li className="text-sm text-stone-500 italic">No critical fields missing.</li>}
                  </ul>
                </div>

                {/* Right Column: Financial Flags & Steps */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-stone-800 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Financial Inconsistencies
                  </h4>
                  <ul className="space-y-2 mb-6">
                    {result.financialFlags.length > 0 ? result.financialFlags.map((flag, i) => (
                      <li key={i} className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-100">{flag}</li>
                    )) : <li className="text-sm text-stone-500 italic">No major financial discrepancies detected.</li>}
                  </ul>

                  <h4 className="mb-3 text-sm font-semibold text-stone-800 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    Recommended Next Steps
                  </h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {result.steps.map((step, i) => (
                      <li key={i} className="text-sm text-stone-700 leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="bg-stone-50 border-t border-stone-200 px-6 py-4 text-center">
                <p className="text-[11px] text-stone-500">
                  <strong>Assessment Limitations:</strong> This is a preliminary rule-based assessment. It is not a probability of fraud or a final claim decision. Pending verification must be completed before settlement.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* --- Section 4: Contact Form --- */}
        <section className="w-full max-w-2xl mt-16 mb-16 animate-fade-in-up">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Message Me</h2>
            <p className="mt-2 text-sm text-stone-600">Have feedback or questions? Send me a direct message.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-medium text-stone-600">Your Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-medium text-stone-600">Your Email <span className="text-stone-400 font-normal">(Optional)</span></label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-stone-600">Message <span className="text-red-500">*</span></label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Write your message here..."
                  className="w-full rounded-lg border border-stone-200 bg-[#faf9f6] px-3 py-2 text-sm outline-none focus:border-[#b08d57]"
                ></textarea>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {contactStatus === "success" && <p className="text-sm font-medium text-emerald-600">Message sent successfully! I'll get back to you soon.</p>}
                {contactStatus === "error" && <p className="text-sm font-medium text-red-600">Failed to send. Please try again later.</p>}
              </div>
              <button
                type="submit"
                disabled={contactStatus === "sending"}
                className="rounded-xl bg-stone-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
              >
                {contactStatus === "sending" ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </section>

      </main>
    </div>
  );
}