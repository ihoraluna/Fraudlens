from __future__ import annotations

import io
import math
import os
import time
import uuid
import json
from typing import Any

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

SESSION_TTL_SECONDS = max(60, int(os.getenv("SESSION_TTL_SECONDS", "1800")))
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}

app = FastAPI(title="FraudLens Temporary Analysis API", version="1.1.0")

origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)

# Prototype only: uploaded bytes are parsed in memory and not intentionally written to disk.
# The DataFrame remains in process memory until inactivity expiry, explicit deletion, or restart.
# A process restart clears all sessions. Multiple workers do not share this dictionary.
SESSIONS: dict[str, dict[str, Any]] = {}


def cleanup_expired_sessions() -> None:
    now = time.time()
    expired = [
        sid for sid, item in SESSIONS.items()
        if now - item["last_seen"] > SESSION_TTL_SECONDS
    ]
    for sid in expired:
        SESSIONS.pop(sid, None)


def get_session(session_id: str) -> dict[str, Any]:
    cleanup_expired_sessions()
    item = SESSIONS.get(session_id)
    if not item:
        raise HTTPException(
            status_code=404,
            detail="This session expired or does not exist. Upload the file again.",
        )
    item["last_seen"] = time.time()
    return item


def json_value(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, np.integer):
        return int(value)
    if isinstance(value, np.floating):
        return None if not np.isfinite(value) else float(value)
    if isinstance(value, np.bool_):
        return bool(value)
    if isinstance(value, pd.Timestamp):
        return None if pd.isna(value) else value.isoformat()
    if isinstance(value, float) and (math.isnan(value) or not math.isfinite(value)):
        return None
    if isinstance(value, (list, dict, tuple, set)):
        return str(value)
    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass
    if isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


def records(df: pd.DataFrame, limit: int = 500) -> list[dict[str, Any]]:
    safe = df.head(limit).astype(object).where(pd.notna(df.head(limit)), None)
    return [
        {str(key): json_value(value) for key, value in row.items()}
        for row in safe.to_dict(orient="records")
    ]


def table_result(df: pd.DataFrame, note: str | None = None, limit: int = 500) -> dict[str, Any]:
    return {
        "kind": "table",
        "columns": [str(c) for c in df.columns],
        "rows": records(df, limit=limit),
        "row_count_returned": min(len(df), limit),
        "total_rows": int(len(df)),
        "note": note or (f"Showing up to {limit} rows." if len(df) > limit else None),
    }


def numeric_series(df: pd.DataFrame, column: str) -> pd.Series:
    if column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column not found: {column}")
    return pd.to_numeric(df[column], errors="coerce")


def require_column(df: pd.DataFrame, params: dict[str, Any], key: str = "column") -> str:
    column = str(params.get(key, "")).strip()
    if not column:
        raise HTTPException(
            status_code=400,
            detail=f"Enter a value for '{key}'. Use an exact column name.",
        )
    if column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Column not found: {column}. Check the exact column name.",
        )
    return column


def missing_summary(df: pd.DataFrame) -> pd.DataFrame:
    counts = df.isna().sum()
    return pd.DataFrame({
        "column": counts.index.astype(str),
        "missing_count": counts.values,
        "missing_percentage": (counts.values / max(len(df), 1) * 100).round(2),
    })


def outlier_rows(df: pd.DataFrame, column: str) -> pd.DataFrame:
    nums = numeric_series(df, column)
    valid = nums.dropna()
    if valid.empty:
        return df.iloc[0:0].copy()
    q1, q3 = valid.quantile(0.25), valid.quantile(0.75)
    iqr = q3 - q1
    low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    return df.loc[(nums < low) | (nums > high)].copy()


def risk_results(df: pd.DataFrame, params: dict[str, Any]) -> pd.DataFrame:
    scored = df.copy()
    scores: list[int] = []
    reasons_list: list[str] = []
    duplicate_mask = df.duplicated(keep=False)
    missing_mask = df.isna().any(axis=1)
    amount_column = str(params.get("amount_column", "")).strip()
    threshold_raw = str(params.get("threshold", "")).strip()
    amount_mask = pd.Series(False, index=df.index)

    if amount_column:
        if amount_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column not found: {amount_column}")
        if threshold_raw:
            try:
                threshold = float(threshold_raw)
                amount_mask = pd.to_numeric(df[amount_column], errors="coerce") > threshold
            except ValueError as exc:
                raise HTTPException(status_code=400, detail="Threshold must be numeric.") from exc

    for idx in df.index:
        reasons = []
        if bool(duplicate_mask.loc[idx]):
            reasons.append("Exact duplicate row")
        if bool(missing_mask.loc[idx]):
            reasons.append("One or more missing fields")
        if bool(amount_mask.loc[idx]):
            reasons.append(f"{amount_column} exceeds configured threshold")
        score = min(
            100,
            (45 if bool(duplicate_mask.loc[idx]) else 0)
            + (15 if bool(missing_mask.loc[idx]) else 0)
            + (40 if bool(amount_mask.loc[idx]) else 0),
        )
        scores.append(score if score > 0 else 1)
        reasons_list.append("; ".join(reasons) if reasons else "No configured rule triggered")

    scored["risk_score"] = scores
    scored["flag_reasons"] = reasons_list
    return scored.sort_values("risk_score", ascending=False, kind="stable")


class ActionRequest(BaseModel):
    action: str
    params: dict[str, Any] = {}


@app.get("/")
def root():
    return {"name": "FraudLens API", "status": "ok", "storage": "in-memory only"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/sessions/upload")
async def upload_file(file: UploadFile = File(...)):
    cleanup_expired_sessions()
    filename = file.filename or "upload"
    ext = os.path.splitext(filename.lower())[1]
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Upload a CSV, XLSX, or XLS file.")

    # No application-level byte limit: read the uploaded file and parse it from memory.
    # Very large files can exhaust available RAM; host/proxy limits may still apply.
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    try:
        if ext == ".csv":
            df = pd.read_csv(io.BytesIO(content))
            sheet_names = ["CSV"]
        else:
            workbook = pd.ExcelFile(io.BytesIO(content))
            sheet_names = workbook.sheet_names
            if not sheet_names:
                raise HTTPException(status_code=400, detail="No worksheets were found.")
            df = pd.read_excel(workbook, sheet_name=sheet_names[0])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Could not read this file. Check that it is a valid CSV or Excel workbook.",
        ) from exc
    finally:
        # Best effort only; Python cannot guarantee secure memory erasure.
        content = b""

    if len(df.columns) == 0:
        raise HTTPException(status_code=400, detail="No columns were found in this file.")

    df.columns = [str(c) for c in df.columns]
    session_id = str(uuid.uuid4())
    now = time.time()
    SESSIONS[session_id] = {
        "df": df,
        "filename": filename,
        "sheet_names": sheet_names,
        "created": now,
        "last_seen": now,
    }
    return {
        "session_id": session_id,
        "filename": filename,
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": [str(c) for c in df.columns],
        "sheets": sheet_names,
        "expires_after_inactivity_seconds": SESSION_TTL_SECONDS,
    }


@app.delete("/api/sessions/{session_id}")
def delete_session(session_id: str):
    SESSIONS.pop(session_id, None)
    return {"deleted": True, "message": "Temporary session cleared if it existed."}


@app.post("/api/sessions/{session_id}/action")
def run_action(session_id: str, request: ActionRequest):
    session = get_session(session_id)
    df: pd.DataFrame = session["df"]
    p = {str(k): v for k, v in request.params.items()}
    action = request.action

    if action == "head":
        return table_result(df.head(5))
    if action == "tail":
        return table_result(df.tail(5))
    if action == "paginate":
        page = max(1, int(p.get("page") or 1))
        size = min(200, max(1, int(p.get("page_size") or 20)))
        return table_result(df.iloc[(page - 1) * size:page * size], note=f"Page {page}; rows per page {size}.")
    if action == "columns":
        return {"kind": "json", "columns": [str(c) for c in df.columns], "count": len(df.columns)}
    if action == "shape":
        return {"kind": "json", "rows": int(df.shape[0]), "columns": int(df.shape[1])}
    if action == "dtypes":
        return table_result(pd.DataFrame({"column": df.columns.astype(str), "data_type": [str(t) for t in df.dtypes]}))
    if action == "random":
        return table_result(df.sample(min(5, len(df)), random_state=None))
    if action == "sheets":
        return {"kind": "json", "sheet_names": session["sheet_names"], "note": "The first workbook sheet is currently loaded for analysis."}
    if action == "missing":
        return {"kind": "json", "total_missing_cells": int(df.isna().sum().sum()), "total_cells": int(df.shape[0] * df.shape[1])}
    if action in {"missing_per_column", "missing_percentage"}:
        summary = missing_summary(df)
        return table_result(summary[["column", "missing_count" if action == "missing_per_column" else "missing_percentage"]])
    if action == "duplicates":
        dup = df[df.duplicated(keep=False)]
        return {"kind": "json", "duplicate_rows_count": int(df.duplicated().sum()), "matching_rows": records(dup)}
    if action == "duplicate_columns":
        col = require_column(df, p)
        mask = df[col].notna() & df[col].duplicated(keep=False)
        return table_result(df.loc[mask].sort_values(col, kind="stable"))
    if action == "empty_columns":
        empty = [str(c) for c in df.columns if df[c].isna().all()]
        return {"kind": "json", "empty_columns": empty, "count": len(empty)}
    if action == "date_formats":
        findings = []
        for col in df.columns:
            if "date" in str(col).lower() or "time" in str(col).lower():
                original = df[col].dropna()
                parsed = pd.to_datetime(original, errors="coerce", format="mixed")
                invalid = original[parsed.isna()]
                findings.append({"column": str(col), "non_empty_values": int(len(original)), "unparseable_values": int(len(invalid)), "examples": [str(v) for v in invalid.head(5).tolist()]})
        return table_result(pd.DataFrame(findings, columns=["column", "non_empty_values", "unparseable_values", "examples"]))
    if action == "mixed_types":
        rows = []
        for col in df.columns:
            types = sorted({type(v).__name__ for v in df[col].dropna().head(5000)})
            if len(types) > 1:
                rows.append({"column": str(col), "inferred_value_types": ", ".join(types)})
        return table_result(pd.DataFrame(rows, columns=["column", "inferred_value_types"]))
    if action == "stats":
        numeric = df.select_dtypes(include="number")
        if numeric.empty:
            return {"kind": "json", "message": "No numeric columns were detected."}
        out = pd.DataFrame({"column": numeric.columns.astype(str), "sum": numeric.sum().values, "average": numeric.mean().values, "minimum": numeric.min().values, "maximum": numeric.max().values})
        return table_result(out)
    if action == "describe":
        return table_result(df.describe(include="all").transpose().reset_index(names="column"))
    if action == "unique":
        return table_result(pd.DataFrame({"column": df.columns.astype(str), "unique_count": [int(df[c].nunique(dropna=True)) for c in df.columns]}))
    if action == "frequent":
        col = require_column(df, p)
        limit = min(100, max(1, int(p.get("limit") or 10)))
        counts = df[col].value_counts(dropna=False).head(limit)
        return table_result(pd.DataFrame({"value": [str(k) for k in counts.index], "count": counts.values}))
    if action == "sort":
        col = require_column(df, p)
        ascending = str(p.get("ascending", "true")).lower() not in {"false", "0", "no"}
        return table_result(df.sort_values(col, ascending=ascending, na_position="last").head(500))
    if action == "filter":
        col = require_column(df, p)
        op = str(p.get("operator", "eq")).lower()
        value = str(p.get("value", ""))
        if op in {"gt", "gte", "lt", "lte"}:
            series = pd.to_numeric(df[col], errors="coerce")
            try:
                target = float(value)
            except ValueError as exc:
                raise HTTPException(status_code=400, detail="Numeric filter operators require a numeric value.") from exc
            mask = {"gt": series > target, "gte": series >= target, "lt": series < target, "lte": series <= target}[op]
        elif op == "contains":
            mask = df[col].astype(str).str.contains(value, case=False, na=False, regex=False)
        elif op == "ne":
            mask = df[col].astype(str) != value
        elif op == "eq":
            mask = df[col].astype(str) == value
        else:
            raise HTTPException(status_code=400, detail="Operator must be eq, ne, gt, gte, lt, lte, or contains.")
        filtered = df.loc[mask]
        return table_result(filtered.head(500), note=f"{len(filtered)} matching rows; showing up to 500.")
    if action == "search":
        query = str(p.get("query", "")).strip()
        if not query:
            raise HTTPException(status_code=400, detail="Enter a search term.")
        mask = df.astype(str).apply(lambda col: col.str.contains(query, case=False, na=False, regex=False)).any(axis=1)
        return table_result(df.loc[mask].head(500), note=f"{int(mask.sum())} matching rows; showing up to 500.")
    if action == "compare":
        col1 = require_column(df, p, "column")
        col2 = require_column(df, p, "column2")
        out = df[[col1, col2]].copy()
        out["values_equal"] = out[col1].astype(str).eq(out[col2].astype(str))
        return table_result(out.head(500))
    if action == "clean_duplicates_preview":
        cleaned = df.drop_duplicates()
        return table_result(cleaned.head(500), note=f"Preview only: {len(df) - len(cleaned)} duplicate rows would be removed. Original data is unchanged.")
    if action == "fill_missing_preview":
        col = require_column(df, p)
        if "value" not in p:
            raise HTTPException(status_code=400, detail="Enter a replacement value.")
        cleaned = df.copy()
        replacement = p["value"]
        if pd.api.types.is_numeric_dtype(cleaned[col]):
            try:
                replacement = float(replacement)
            except (ValueError, TypeError):
                pass
        cleaned[col] = cleaned[col].fillna(replacement)
        return table_result(cleaned.head(500), note=f"Preview only: {int(df[col].isna().sum())} missing values in {col} would be filled. Original data is unchanged.")
    if action == "trim_preview":
        cleaned = df.copy()
        for col in cleaned.select_dtypes(include=["object", "string"]).columns:
            cleaned[col] = cleaned[col].map(lambda x: x.strip() if isinstance(x, str) else x)
        return table_result(cleaned.head(500), note="Preview only: leading/trailing whitespace would be removed from text cells.")
    if action == "convert_preview":
        col = require_column(df, p)
        target = str(p.get("target_type", "numeric")).lower()
        cleaned = df.copy()
        if target == "numeric":
            cleaned[col] = pd.to_numeric(cleaned[col], errors="coerce")
        elif target == "string":
            cleaned[col] = cleaned[col].astype("string")
        elif target == "datetime":
            cleaned[col] = pd.to_datetime(cleaned[col], errors="coerce", format="mixed")
        else:
            raise HTTPException(status_code=400, detail="Target type must be numeric, string, or datetime.")
        return table_result(cleaned.head(500), note=f"Preview only: column {col} would be converted to {target}. Original data is unchanged.")
    if action == "outliers":
        return table_result(outlier_rows(df, require_column(df, p)), note="Outliers are statistical anomalies, not proof of fraud.")
    if action == "quality_report":
        missing = missing_summary(df)
        return {"kind": "json", "filename": session["filename"], "rows": int(len(df)), "columns": int(len(df.columns)), "missing_cells": int(df.isna().sum().sum()), "duplicate_rows": int(df.duplicated().sum()), "completely_empty_columns": [str(c) for c in df.columns if df[c].isna().all()], "missing_by_column": records(missing)}
    if action == "summary_report":
        numeric = df.select_dtypes(include="number")
        return {"kind": "json", "filename": session["filename"], "rows": int(df.shape[0]), "columns": int(df.shape[1]), "column_names": [str(c) for c in df.columns], "data_types": {str(c): str(df[c].dtype) for c in df.columns}, "missing_cells": int(df.isna().sum().sum()), "duplicate_rows": int(df.duplicated().sum()), "numeric_summary": json.loads(numeric.describe().to_json()) if not numeric.empty else {}}
    if action == "fraud_duplicate_claims":
        cols_raw = str(p.get("columns", "")).strip()
        cols = [c.strip() for c in cols_raw.split(",") if c.strip()] if cols_raw else []
        if not cols:
            cols = [c for c in df.columns if any(token in str(c).lower() for token in ["claim", "policy", "amount"])] or list(df.columns)
        missing_cols = [c for c in cols if c not in df.columns]
        if missing_cols:
            raise HTTPException(status_code=400, detail=f"Column(s) not found: {', '.join(missing_cols)}")
        return table_result(df.loc[df.duplicated(subset=cols, keep=False)], note=f"Flagged using duplicate matching on: {', '.join(cols)}. This is a review indicator, not proof of fraud.")
    if action == "fraud_amount_threshold":
        col = require_column(df, p)
        try:
            threshold = float(p.get("threshold", ""))
        except (ValueError, TypeError) as exc:
            raise HTTPException(status_code=400, detail="Enter a numeric threshold.") from exc
        nums = pd.to_numeric(df[col], errors="coerce")
        flagged = df.loc[nums > threshold].copy()
        flagged["flag_reason"] = f"{col} exceeds {threshold}"
        return table_result(flagged, note="A high amount alone does not prove fraud.")
    if action == "fraud_repeated_ids":
        col = require_column(df, p)
        mask = df[col].notna() & df[col].duplicated(keep=False)
        return table_result(df.loc[mask].sort_values(col, kind="stable"), note="Repeated IDs may be legitimate; investigate before concluding.")
    if action == "fraud_unusual_amounts":
        return table_result(outlier_rows(df, require_column(df, p)), note="Uses the 1.5×IQR rule. Unusual values are not proof of fraud.")
    if action in {"fraud_scores", "fraud_top", "fraud_reasons"}:
        scored = risk_results(df, p)
        if action == "fraud_top":
            limit = int(p.get("limit") or 5)
            if limit not in (5, 10):
                limit = 5
            return table_result(scored.head(limit), note="Rule-based prioritization only; scores are not calibrated fraud probabilities.")
        flagged = scored[scored["risk_score"] > 1]
        if action == "fraud_reasons":
            return table_result(flagged if not flagged.empty else scored.head(20), note="Reasons reflect only the rules configured in this prototype.")
        return table_result(scored, note="Rule-based score from 1–100; not a probability of fraud.")

    raise HTTPException(status_code=400, detail=f"Unknown action: {action}")
