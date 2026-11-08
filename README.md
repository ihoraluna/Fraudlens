# FraudLens

**Excel-based Insurance Claims Analysis & Fraud Screening**

FraudLens is a data-analysis application designed to help users explore Excel workbooks, assess data quality, analyse claim patterns, preview data-cleaning operations and identify potentially suspicious insurance claims for further investigation.

The project brings common Pandas-based data-analysis operations into a single workflow. It is intended as an investigative support tool: it helps organise and prioritise review, but it does not independently determine whether a claim is fraudulent.

---

## Table of Contents

- [Overview](#overview)
- [What FraudLens Does](#what-fraudlens-does)
- [Feature Summary](#feature-summary)
- [How the Workflow Works](#how-the-workflow-works)
- [Risk Scoring Methodology](#risk-scoring-methodology)
- [Technology](#technology)
- [Getting Started](#getting-started)
- [Using the Application](#using-the-application)
- [Project Structure](#project-structure)
- [Current Limitations](#current-limitations)
- [Responsible Use](#responsible-use)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Insurance claims datasets can contain thousands of records and many columns. Before an investigator can identify unusual claims, the underlying data needs to be understood and checked.

FraudLens provides a structured workflow for:

- Exploring uploaded Excel data.
- Understanding columns, rows, worksheets and data types.
- Finding missing values and duplicate records.
- Analysing numerical and categorical patterns.
- Filtering, sorting, searching and comparing records.
- Previewing data-cleaning operations.
- Generating dataset and data-quality summaries.
- Applying predefined fraud-screening rules.
- Assigning explainable rule-based risk scores.
- Ranking claims for further review.

The documented application contains **38 tools across six feature categories**.

## What FraudLens Does

### 1. Read and Explore Excel
Inspect the first and last records, browse data with pagination, list column names, view dataset dimensions and data types, sample random records and display worksheet names.

### 2. Data Quality Checks
Find missing cells, count missing values by column, calculate missing-value percentages, identify duplicate rows and repeated column values, locate completely empty columns, check date formats and identify mixed data types.

### 3. Data Analysis
Calculate sum, average, minimum and maximum; generate descriptive statistics; count unique values; inspect frequent values; sort and filter records; search for claim or policy IDs; and compare two columns.

### 4. Data Cleaning
Preview duplicate removal, preview missing-value replacement, standardise text whitespace, preview column type conversion and identify statistical outliers using the IQR method.

### 5. Reports
Generate a data-quality report and a dataset statistics summary.

### 6. Fraud-Specific Screening
Flag potentially duplicate claims, identify claims above a configured amount, find repeated claim or policy IDs, detect unusual claim amounts, create rule-based risk scores, rank the top five or ten claims and display the reasons for flagged records.

For the detailed explanation of every tool, see **[FEATURES.md](./FEATURES.md)**.

---

## Feature Summary

| Category | Number of tools |
|---|---:|
| Read and Explore Excel | 8 |
| Data Quality Checks | 8 |
| Data Analysis | 8 |
| Data Cleaning | 5 |
| Reports | 2 |
| Fraud-Specific Features | 7 |
| **Total** | **38** |

## How the Workflow Works

FraudLens follows a practical sequence:

```text
Upload Excel Workbook
        |
        v
Read and Explore
        |
        v
Data Quality Checks
        |
        v
Data Analysis
        |
        v
Preview Data Cleaning
        |
        v
Generate Reports
        |
        v
Fraud-Specific Screening
        |
        v
Human Investigation and Verification
```

### Step 1 — Explore the workbook
Understand the available records, columns, data types and worksheet names.

### Step 2 — Check data quality
Review missing values, duplicates, empty columns, date inconsistencies and mixed data types.

### Step 3 — Analyse the data
Use statistics, sorting, filtering, searching and column comparisons to understand claim patterns.

### Step 4 — Preview cleaning
Test possible data corrections without treating the preview as a permanent change to the original data.

### Step 5 — Generate reports
Create a consolidated view of dataset dimensions, missing information, duplicates, column names, data types and numerical statistics.

### Step 6 — Screen potentially suspicious claims
Apply the available rules, inspect the resulting scores and reasons, and prioritise records for manual investigation.

---

## Risk Scoring Methodology

FraudLens documents a simple rule-based score ranging from **1 to 100**.

| Screening indicator | Points |
|---|---:|
| Exact duplicate row | 45 |
| One or more missing fields | 15 |
| Claim amount exceeds configured threshold | 40 |
| **Maximum possible score** | **100** |

The score is calculated by adding the points for the configured indicators that are triggered.

**Example**

A claim triggers all three indicators:

- Exact duplicate row: 45 points
- One or more missing fields: 15 points
- Claim amount above the configured threshold: 40 points

**Total score: 100**

If none of the configured rules is triggered, the documented score is 1.

### How to interpret the score

The score is a **rule-based prioritisation indicator**, not a fraud probability.

- A high score means that more of the configured screening conditions were triggered.
- A low score does not guarantee that a claim is genuine.
- A flagged claim requires verification and supporting evidence.
- The current score uses only three indicators.

FraudLens does not currently train a machine-learning model or calculate a calibrated probability of fraud.

---

## Technology

The supplied project information identifies the frontend as a **Next.js application** bootstrapped with `create-next-app`. The feature documentation describes Python Pandas operations in the analysis backend.

| Area | Technology documented |
|---|---|
| Frontend | Next.js |
| Frontend language | TypeScript / TSX project entry point (`app/page.tsx`) |
| Data analysis | Python |
| Data manipulation | Pandas |
| Dataset format | Excel workbooks |

The exact versions, backend framework, API configuration and full dependency list should be taken from the project's actual configuration files. They are not assumed in this README.

---

## Getting Started

### Prerequisites

- Node.js and npm (or another supported package manager).
- The project source code.
- Any backend dependencies and configuration required by the version of the project you have.

### 1. Clone the repository

After uploading the project to GitHub, clone it with:

```bash
git clone https://github.com/YOUR-USERNAME/FraudLens.git
cd FraudLens
```

Replace `YOUR-USERNAME` with your GitHub username and adjust the repository name if necessary.

### 2. Install frontend dependencies

```bash
npm install
```

If the repository uses a different package manager, use the matching lockfile and command instead.

### 3. Start the Next.js development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The supplied Next.js starter documentation identifies `app/page.tsx` as the main page entry point. Changes to the page are reflected by the development server.

### 4. Backend setup

The feature documentation describes Python/Pandas-based analysis functionality, but the supplied project notes do not specify the backend's exact folder structure, startup command, dependency file or API URL.

Use the actual backend files in the repository (for example, its dependency file and application entry point) for installation and startup. Do not assume that starting the Next.js server also starts the Python analysis service.

---

## Using the Application

A typical workflow is:

1. Open FraudLens in your browser.
2. Upload an Excel workbook supported by the application.
3. Explore the dataset structure and available columns.
4. Run data-quality checks to understand missing and duplicated information.
5. Use analysis tools to filter, sort, search and compare records.
6. Preview cleaning operations where appropriate.
7. Generate dataset and data-quality reports.
8. Run the available fraud-screening tools.
9. Review the risk score and the reasons behind each flagged record.
10. Verify the claim using original records and supporting documents before reaching an investigation conclusion.

The available analysis currently uses the first worksheet of an uploaded workbook. Although the application can display worksheet names, independent analysis of other worksheets is not currently documented as supported.

---

## Project Structure

The exact repository structure should be documented from the source code once finalised. The following is a conceptual view, not a claim about the current folder names:

```text
FraudLens/
├── app/                 # Next.js application pages and UI
├── public/              # Static assets, if used
├── backend/             # Python data-analysis service, if organised here
├── FEATURES.md          # Detailed feature documentation
├── README.md            # Project overview and setup
├── package.json         # Frontend scripts and dependencies
└── ...
```

Keep this section aligned with the actual folders before publishing if your repository uses different names.

---

## Current Limitations

The current documented version:

1. Does not independently confirm insurance fraud.
2. Does not currently train a machine-learning model.
3. Does not calculate a genuine or calibrated probability of fraud.
4. Does not automatically verify documents, police reports or customer identities.
5. Analyses only the first worksheet of an Excel workbook; other sheet names can be displayed but other worksheets cannot currently be analysed independently.
6. Provides cleaning previews that do not permanently modify the uploaded dataset.
7. Uses exact matching for the documented duplicate-claim check, not fuzzy matching.
8. Uses only three indicators in its rule-based risk score: exact duplicate rows, missing fields and a configured amount threshold.

These limitations are intentional to make the current scope clear. They should be revisited only when the corresponding functionality is implemented and tested.

---

## Responsible Use

FraudLens is intended to support insurance data analysis and investigation workflows. It is not a substitute for professional judgement, policy review or a formal investigation.

Please keep the following principles in mind:

- **A flag is not a finding.** A claim that triggers a rule must be reviewed in context.
- **Missing information is not proof of fraud.** It may reflect incomplete data entry or unavailable documentation.
- **Outliers are not necessarily suspicious.** A statistically unusual claim may have a valid explanation.
- **Preserve original evidence.** Do not discard potentially relevant duplicate records without retaining and reviewing the source data.
- **Protect personal information.** Use synthetic or properly authorised data for testing. Do not upload real customer or policyholder information to an environment unless you are authorised to do so and appropriate security and privacy controls are in place.
- **Keep a human in the loop.** Investigation decisions should be made by qualified reviewers using supporting evidence.

---

## Documentation

- **[FEATURES.md](./FEATURES.md)** — Detailed explanation of all 38 documented tools, their technical purpose, learning concepts, insurance investigation use cases and current limitations.

---

## Contributing

Contributions, bug reports and suggestions are welcome.

A useful contribution should:

1. Describe the problem or proposed improvement.
2. Explain which part of the workflow it affects.
3. Include steps to reproduce a bug where applicable.
4. Include tests or sample data when practical.
5. Avoid including real personal, policyholder or confidential claims data.

For major changes, open an issue first so the proposed approach can be discussed.

---

## License

No license has been specified for this repository yet. Unless a license is added, standard copyright restrictions apply and others should not assume they have permission to reuse, modify or distribute the code.

---

**FraudLens — Explore the data. Identify the signals. Prioritise the investigation.**
