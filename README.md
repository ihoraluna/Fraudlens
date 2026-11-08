This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.





# FraudLens — Complete Feature Documentation & Learning Notes

README.md documentation · Beginner to intermediate · Insurance fraud investigation

These notes explain all 38 tools across six categories in your FraudLens application. For every tool, you'll learn:

1. What it does: Its technical functionality.
2. What you learn: The data analysis concept behind it.
3. Fraud investigation use: How an insurance investigator can apply the result.

The explanations below describe your current application's functionality, not features that have yet to be implemented.

# A. Read and Explore Excel

8 tools · Objective: Understand the structure and contents of the dataset before investigating it.

## 1. Read First 5 Rows

What it does:

Displays the first five records from the uploaded dataset using Python Pandas `head()`.

What you learn:

- How records are organised.
- What information each column contains.
- Whether the dataset appears properly structured.
- Whether some fields contain missing values.

Fraud investigation use:

You can inspect the first five insurance claims to understand how claim IDs, policy IDs, claim amounts, incident dates and claim statuses are recorded.

Example: If a claim has a claim amount of ₹5,00,000 and an approved amount of ₹1,00,000, you can identify a difference worth examining further.

## 2. Read Last 5 Rows

What it does:

Displays the last five records using Pandas `tail()`.

What you learn:

- Whether records at the end of the dataset are structured correctly.
- Whether the final records contain incomplete information.
- Whether the dataset appears consistently formatted.

Fraud investigation use:

You can inspect the last few claims to identify unusual entries, incomplete records or potential data-entry mistakes.

## 3. Display Rows with Pagination

What it does:

Displays records in smaller batches instead of loading the entire dataset into the results table.

You can specify:

- Page number.
- Number of rows per page.

Example:

| Page | Records displayed |
| ---- | ----------------- |
| 1    | 1–20              |
| 2    | 21–40             |
| 3    | 41–60             |

What you learn:

- How to navigate large datasets.
- How to examine individual records.
- How pagination works in data applications.

Fraud investigation use:

When investigating 100,000 claims, you can examine records in smaller batches rather than displaying everything simultaneously.

## 4. Show Column Names

What it does:

Lists all column headings available in the uploaded dataset.

Example:

```
claim_id
policy_id
customer_id
claim_amount
approved_amount
incident_date
previous_claims
fraudulent
```

What you learn:

- Which variables are available.
- What information you can analyse.
- Which columns might be relevant to an investigation.

Fraud investigation use:

You can identify important investigation fields:

| Column          | Investigation purpose         |
| --------------- | ----------------------------- |
| claim_id        | Identify individual claims    |
| policy_id       | Identify associated policies  |
| customer_id     | Identify customers            |
| claim_amount    | Examine claimed amounts       |
| previous_claims | Examine claim history         |
| incident_date   | Examine incident timing       |
| fraudulent      | Existing fraud classification |

## 5. Show Number of Rows and Columns

What it does:

Displays the dimensions of the dataset using Pandas `shape`.

Example:

```
Rows: 100000
Columns: 62
```

What you learn:

- Rows represent records.
- Columns represent variables or attributes.
- The overall size of your dataset.

Fraud investigation use:

You can establish the size of the investigation population.

For example, you might be analysing 100,000 claim records containing 62 different attributes.

Remember: the number of rows does not necessarily represent the number of unique claims.

## 6. Show Data Types

What it does:

Identifies the data type of every column.

Common types:

| Data type | Meaning        | Example  |
| --------- | -------------- | -------- |
| String    | Text           | CL001    |
| Integer   | Whole number   | 35       |
| Float     | Decimal number | 25000.75 |

What you learn:

- How Python interprets different values.
- Why correct data types matter.
- Why numerical calculations require numeric fields.

Fraud investigation use:

Suppose `claim_amount` is stored as a string rather than a numeric value.

You may encounter problems calculating averages, comparing claim amounts or identifying unusually large claims.

Correct data types are important for reliable investigation results.

## 7. Show Random 5 Rows

What it does:

Selects five randomly chosen records using Pandas `sample()`.

What you learn:

- How records look across different parts of the dataset.
- Whether unusual values appear in randomly selected records.
- Why examining only the first few rows may not be sufficient.

Fraud investigation use:

You can conduct a quick random inspection of claims to look for incomplete records, unusual amounts or unexpected values.

Important: Five randomly selected records cannot establish the quality of the entire dataset.

## 8. Display Excel Sheet Names

What it does:

Displays the names of worksheets available in an uploaded Excel workbook.

Example:

```
Claims
Customers
Policies
Fraud_Records
```

What you learn:

- How Excel workbooks organise information.
- How information can be distributed across multiple worksheets.

Fraud investigation use:

Claims, customer information and policy information may be maintained in separate worksheets.

You can identify where relevant information is stored before further analysis.

Current limitation

Your backend currently loads only the first worksheet for analysis. It displays the other sheet names but does not yet allow you to analyse those sheets independently.

# B. Data Quality Checks

8 tools · Objective: Identify incomplete, duplicated, inconsistent or incorrectly structured information.

## 1. Find Empty Cells

What it does:

Calculates the total number of missing cells in the dataset using Pandas `isna()`.

Example:

```
Total missing cells: 16,527
```

What you learn:

- How much information is missing.
- Whether the dataset is complete.
- Why missing data can affect analysis.

Fraud investigation use:

Suppose an insurance claim does not contain an incident date, police report information or customer identification.

These missing fields may require additional verification.

However, a missing field alone does not prove fraudulent activity.

## 2. Count Missing Values per Column

What it does:

Calculates how many missing values exist in each column.

Example:

| Column        | Missing values |
| ------------- | -------------- |
| claim_amount  | 0              |
| customer_name | 120            |
| incident_date | 350            |
| police_report | 2,500          |

What you learn:

- Which columns contain incomplete information.
- Which variables have the most missing records.
- Where data-quality problems are concentrated.

Fraud investigation use:

If police report information is missing in many claims, you can identify those claims for document verification.

## 3. Calculate Missing Value Percentage

What it does:

Calculates the percentage of missing values in every column.

Formula:

\\[ \text{Missing Percentage} = \frac{\text{Missing Values}}{\text{Total Rows}}\times100 \\]

Example:

| Column        | Missing percentage |
| ------------- | ------------------ |
| customer_name | 2%                 |
| incident_date | 5%                 |
| police_report | 25%                |

What you learn:

You understand the severity of missing data, not just its quantity.

Fraud investigation use:

If a critical investigation field is missing in 25% of claims, you may need additional documentation or a separate verification process.

## 4. Find Duplicate Rows

What it does:

Identifies completely duplicated records.

Example:

| claim_id | policy_id | claim_amount |
| -------- | --------- | ------------ |
| CL001    | PL101     | 50000        |
| CL002    | PL102     | 25000        |
| CL001    | PL101     | 50000        |

The first and third records are identical in the displayed fields.

What you learn:

- What duplicate records are.
- How repeated records can distort analysis.
- Why duplicate checking matters.

Fraud investigation use:

A repeated claim record may indicate accidental duplicate data entry, repeated processing or a possible duplicate submission.

It requires verification before being treated as suspicious.

## 5. Find Duplicate Values in a Column

What it does:

Finds repeated values in a selected column.

For example, selecting `claim_id` identifies repeated claim IDs.

What you learn:

- How to identify repeated identifiers.
- How uniqueness differs from complete-row duplication.
- How repeated values affect data integrity.

Fraud investigation use:

You can identify:

- Repeated claim IDs.
- Repeated policy IDs.
- Repeated customer IDs.

A repeated policy ID may be completely legitimate because one policy can have multiple claims.

The context matters.

## 6. Identify Completely Empty Columns

What it does:

Finds columns in which every record is missing.

Example:

```
empty_columns:
- investigator_remarks
- external_reference
```

What you learn:

- How to identify useless or unpopulated variables.
- Why empty columns should be investigated before analysis.

Fraud investigation use:

If an investigation-related column is completely empty, you know that the dataset does not provide that particular evidence.

You may need another source of information.

## 7. Check Inconsistent Date Formats

What it does:

Examines date-like columns and attempts to parse their values into dates.

It identifies values that cannot be interpreted as dates.

Example:

```
2026-05-10
10/05/2026
InvalidDate
```

What you learn:

- Why date formatting matters.
- How inconsistent dates affect chronological analysis.
- How invalid dates can interfere with calculations.

Fraud investigation use:

Dates are extremely important in insurance investigations.

You may need to compare:

- Policy start date.
- Incident date.
- Claim submission date.
- Claim approval date.

For example, an incident occurring before the policy's effective date requires investigation.

## 8. Identify Mixed Data Types

What it does:

Examines columns to identify different Python value types within the same column.

Example:

```
claim_amount:
50000
65000
Unknown
75000
```

What you learn:

- Why a single column should ideally contain consistent data.
- How unexpected text values can affect numerical calculations.

Fraud investigation use:

If claim amounts contain unexpected text, you may miss records during financial analysis.

Identifying these inconsistencies helps improve the reliability of subsequent fraud checks.

# C. Data Analysis

8 tools · Objective: Understand numerical patterns, distributions, relationships and unusual records.

## 1. Calculate Sum, Average, Minimum and Maximum

What it does:

Calculates four statistical measures for numerical columns.

| Measure | Meaning        |
| ------- | -------------- |
| Sum     | Total value    |
| Average | Mean value     |
| Minimum | Smallest value |
| Maximum | Largest value  |

Example:

```
Claim amount:
Average: ₹70,000
Minimum: ₹5,000
Maximum: ₹7,00,000
```

What you learn:

You understand the overall financial distribution of your claims.

Fraud investigation use:

You can identify claims significantly larger than the typical claim amount and prioritise them for review.

A large amount alone is not evidence of fraud.

## 2. Generate Descriptive Statistics

What it does:

Uses Pandas `describe()` to calculate statistical information for the dataset.

Important measures:

| Measure | Meaning                            |
| ------- | ---------------------------------- |
| Count   | Number of non-missing observations |
| Mean    | Average                            |
| Std     | Standard deviation                 |
| Min     | Minimum                            |
| 25%     | First quartile                     |
| 50%     | Median                             |
| 75%     | Third quartile                     |
| Max     | Maximum                            |

What you learn:

- How values are distributed.
- Whether values vary significantly.
- Where the middle of the dataset lies.
- Whether extreme values exist.

Fraud investigation use:

You can compare claim amounts, repair costs, medical costs and payouts to understand normal financial patterns.

For example, a claim amount far above the median may deserve further review.

## 3. Count Unique Values per Column

What it does:

Counts distinct non-missing values in every column.

Example:

| Column       | Unique values |
| ------------ | ------------- |
| claim_id     | 100,000       |
| policy_id    | 80,000        |
| claim_status | 3             |
| gender       | 3             |

What you learn:

- How many distinct values exist in a field.
- Whether identifier columns contain repeated values.
- How categorical data is distributed.

Fraud investigation use:

If 100,000 claims contain only 80,000 unique policy IDs, you know that some policies appear multiple times.

You can investigate claim frequency per policy.

## 4. Show Most Frequent Values

What it does:

Uses value frequency to identify the most common values in a selected column.

Example:

| Claim status | Count |
| ------------ | ----- |
| Approved     | 5,000 |
| Pending      | 3,000 |
| Rejected     | 2,000 |

What you learn:

- Which values occur most frequently.
- How categorical variables are distributed.
- Whether some values dominate a dataset.

Fraud investigation use:

You can examine frequently occurring:

- Claim statuses.
- Incident types.
- Vehicle types.
- Payment methods.
- Claim categories.

This helps identify patterns that may deserve further examination.

## 5. Sort Data

What it does:

Arranges records according to a selected column in ascending or descending order.

Example:

Sorting `claim_amount` in descending order:

```
₹700,000
₹550,000
₹400,000
₹250,000
₹100,000
```

What you learn:

- How to rank records.
- How to identify the highest and lowest values.
- How ordering makes patterns easier to inspect.

Fraud investigation use:

Sort claims by claim amount to examine the highest-value claims first.

You can also sort by claim dates, previous claims or risk scores.

## 6. Filter Rows

What it does:

Returns records that satisfy a particular condition.

Your application supports:

| Operator | Meaning                  |
| -------- | ------------------------ |
| eq       | Equal to                 |
| ne       | Not equal to             |
| gt       | Greater than             |
| gte      | Greater than or equal to |
| lt       | Less than                |
| lte      | Less than or equal to    |
| contains | Contains specified text  |

Example:

```
Column: claim_amount
Operator: gt
Value: 50000
```

This returns claims with amounts greater than ₹50,000.

What you learn:

- Conditional filtering.
- How to isolate relevant records.
- How to narrow a large dataset.

Fraud investigation use:

You can filter claims based on:

- High claim amounts.
- Multiple previous claims.
- Specific incident types.
- Particular claim statuses.

This is useful when investigating a particular risk pattern.

## 7. Search Claim or Policy ID

What it does:

Searches all columns for a particular text value.

Example:

```
Search term: CL001
```

It returns records containing that value.

What you learn:

- How to locate specific records.
- How text-based searching works.
- How to retrieve relevant information quickly.

Fraud investigation use:

If an investigator receives a complaint involving a particular claim ID, they can search the dataset to locate the corresponding record.

## 8. Compare Two Columns

What it does:

Compares values in two selected columns, row by row.

Example:

| Claimed amount | Approved amount | Equal? |
| -------------- | --------------- | ------ |
| 50,000         | 45,000          | False  |
| 30,000         | 30,000          | True   |
| 80,000         | 60,000          | False  |

What you learn:

- How two variables can be compared.
- How to identify matching and non-matching values.
- How to perform basic reconciliation.

Fraud investigation use:

You can compare:

- Claimed amount vs approved amount.
- Repair cost vs estimated repair cost.
- Incident date vs reported date.

Differences may require investigation, but a difference is not automatically fraudulent.

# D. Data Cleaning

5 tools · Objective: Identify and preview corrections to improve data quality.

## 1. Preview Duplicate Removal

What it does:

Creates a temporary working copy without completely duplicated rows.

It uses Pandas `drop_duplicates()`.

What you learn:

- How duplicate records can be removed.
- How duplicates affect analysis.
- Why cleaning data matters.

Fraud investigation use:

You can understand how many duplicate records might be removed before performing analysis.

Important: Duplicate claims may be evidence worth investigating. Never delete potentially suspicious records without preserving and reviewing the original evidence.

## 2. Preview Missing-Value Fill

What it does:

Creates a preview in which missing values in a selected column are replaced with a value you provide.

Example:

```
Column: claim_amount
Replacement value: 0
```

What you learn:

- How missing values can be handled.
- Why replacement strategies matter.
- How data cleaning changes the dataset.

Fraud investigation use:

You can test how filling missing information affects analysis.

However, replacing an unknown claim amount with zero can create misleading financial statistics. Choose replacements carefully.

## 3. Standardize Text Whitespace

What it does:

Removes leading and trailing whitespace from text values.

Example:

```
" Approved "
"Approved"
```

Both become:

```
"Approved"
```

What you learn:

- How whitespace creates inconsistent text values.
- How standardisation improves data quality.

Fraud investigation use:

Suppose the same policy status appears as `Active`, `Active` and `Active `.

Cleaning whitespace makes these values consistent, improving grouping, filtering and comparison.

## 4. Preview Column Type Conversion

What it does:

Converts a selected column into one of three target types:

- Numeric.
- String.
- Datetime.

Example:

```
Column: claim_amount
Target type: numeric
```

What you learn:

- How data types can be converted.
- Why numeric and date fields need correct formats.
- How invalid values can become missing during conversion.

Fraud investigation use:

You can convert claim amounts into numerical values before calculating financial statistics or identifying unusual amounts.

## 5. Identify Unusually Large or Small Values

What it does:

Uses the Interquartile Range (IQR) method to identify statistical outliers.

Formula:

\\[ IQR=Q3-Q1 \\]

Lower boundary:

\\[ Q1-1.5(IQR) \\]

Upper boundary:

\\[ Q3+1.5(IQR) \\]

Values outside these boundaries are flagged.

What you learn:

- What outliers are.
- How statistical distributions work.
- How to identify unusual numerical observations.

Fraud investigation use:

You can identify unusually high:

- Claim amounts.
- Medical expenses.
- Repair costs.
- Vehicle valuations.

An outlier is a statistical observation, not proof of fraud.

# E. Reports

2 tools · Objective: Generate consolidated information about the dataset.

## 1. Generate Data Quality Report

What it does:

Combines multiple data-quality checks into one report.

Your current backend includes:

- Filename.
- Total rows.
- Total columns.
- Missing cells.
- Duplicate rows.
- Completely empty columns.
- Missing values by column.

What you learn:

You get an overall understanding of the dataset's quality without running every quality check separately.

Fraud investigation use:

Before beginning an investigation, you can assess whether the dataset is sufficiently complete and reliable for analysis.

For example, a dataset with many missing incident dates may require additional verification before chronological analysis.

## 2. Generate Dataset Statistics Summary

What it does:

Generates an overall summary containing:

- Filename.
- Number of rows.
- Number of columns.
- Column names.
- Data types.
- Total missing cells.
- Duplicate rows.
- Descriptive statistics for numerical columns.

What you learn:

You get a broad overview of the dataset's structure and numerical characteristics.

Fraud investigation use:

An investigator can use this report as an initial assessment document before examining individual claims.

It helps establish the size, completeness and statistical characteristics of the available data.

# F. Fraud-Specific Features

7 tools · Objective: Identify potentially suspicious insurance claims using predefined rules and statistical indicators.

This is the most important section of FraudLens from an insurance investigation perspective.

## 1. Flag Potentially Duplicate Claims

What it does:

Identifies records duplicated across selected columns.

Default columns:

```
claim_id, policy_id, claim_amount
```

You can provide your own comma-separated column names.

What you learn:

- How duplicate detection can be used in fraud screening.
- How matching records can identify repeated submissions.
- Why multiple matching fields can be useful.

Fraud investigation use:

Suppose two claims have the same policy ID, claim amount and claim ID.

You can flag them for verification to determine whether the same claim was submitted more than once.

Important: The current tool uses exact matching, not fuzzy matching. It will not automatically detect similar but slightly different records.

## 2. Flag Claims Above an Amount

What it does:

Flags records where the selected numerical column exceeds your configured threshold.

Example:

```
Amount column: claim_amount
Threshold: 50000
```

Every claim above ₹50,000 is returned.

What you learn:

- How threshold-based screening works.
- How numerical conditions identify records for review.

Fraud investigation use:

You can prioritise high-value claims for additional verification.

For example, a claim of ₹5,00,000 may require more detailed examination of repair bills, medical documents and supporting evidence than a routine claim.

A high claim amount alone is not evidence of fraud.

## 3. Identify Repeated Claim or Policy IDs

What it does:

Finds repeated values in a selected identifier column.

Example:

```
Column: claim_id
```

What you learn:

- How identifier repetition works.
- How duplicate identifiers differ from duplicate complete records.

Fraud investigation use:

Repeated claim IDs may indicate duplicate claim records or processing issues.

Repeated policy IDs can reveal policies associated with multiple claims.

You must distinguish legitimate multiple claims under one policy from suspicious duplication.

## 4. Detect Unusual Claim Amounts

What it does:

Uses the IQR statistical method to identify unusually high or low values in a selected numerical column.

What you learn:

- How statistical outlier detection works.
- How unusual financial values can be identified.
- How statistical anomalies differ from confirmed fraud.

Fraud investigation use:

You can identify claims whose amounts are substantially different from the normal claim distribution.

For example, a claim of ₹7,00,000 may be unusual when most claims fall between ₹20,000 and ₹80,000.

This claim should be reviewed, not automatically rejected.

## 5. Create Rule-Based Risk Scores

What it does:

Assigns a score from 1 to 100 using three configured indicators:

| Indicator                                 | Points |
| ----------------------------------------- | ------ |
| Exact duplicate row                       | 45     |
| One or more missing fields                | 15     |
| Claim amount exceeds configured threshold | 40     |

The maximum score is 100.

If no configured rule is triggered, the score is 1.

What you learn:

- What rule-based scoring means.
- How multiple indicators can be combined.
- How risk prioritisation works.

Fraud investigation use:

Suppose a claim has:

- An exact duplicate record: 45 points.
- Missing information: 15 points.
- An amount above the threshold: 40 points.

Total:

\\[ 45+15+40=100 \\]

This claim receives a score of 100 and can be prioritised for investigation.

Important limitation

This is a basic rule-based score, not an AI/ML prediction or calibrated probability of fraud. It currently uses only three indicators, not every suspicious variable in the dataset.

## 6. Rank Top 5 or 10 Claims

What it does:

Sorts claims by the calculated rule-based risk score and displays the top five or ten records.

What you learn:

- How ranking works.
- How records can be prioritised by risk indicators.
- How scoring supports investigation workflows.

Fraud investigation use:

An investigation team handling thousands of claims can start by reviewing the highest-scoring records.

This helps organise investigative workload.

The ranking does not establish that the top-ranked claims are fraudulent.

## 7. Show Reasons for Flagged Claims

What it does:

Displays the reasons behind each rule-based score.

Possible reasons include:

```
Exact duplicate row
One or more missing fields
claim_amount exceeds configured threshold
No configured rule triggered
```

What you learn:

- How explainable rule-based systems work.
- Why a score should have supporting reasons.
- How investigation decisions can be documented.

Fraud investigation use:

Instead of seeing only a score of 85, an investigator can understand which configured rules contributed to that score.

This is useful for preparing case reviews and deciding what supporting documents should be examined.

# How all six categories work together

Your FraudLens workflow follows a logical insurance investigation process:

1. A. Read and Explore

   Understand the dataset, columns, records and structure.
2. B. Data Quality Checks

   Identify missing information, duplicates and inconsistencies.
3. C. Data Analysis

   Examine financial patterns, distributions, relationships and unusual values.
4. D. Data Cleaning

   Preview potential corrections to improve data reliability.
5. E. Reports

   Generate consolidated dataset and quality summaries.
6. F. Fraud-Specific Features

   Flag potentially suspicious claims, calculate rule-based scores and prioritise records for investigation.

# Important concepts you should remember

| Concept                | Meaning                                      |
| ---------------------- | -------------------------------------------- |
| Data exploration       | Understanding available data                 |
| Data quality           | Checking accuracy and completeness           |
| Missing values         | Information that is not available            |
| Duplicate records      | Repeated records                             |
| Descriptive statistics | Summarising numerical information            |
| Outliers               | Values statistically different from the rest |
| Data cleaning          | Correcting or standardising data             |
| Filtering              | Selecting records using conditions           |
| Rule-based detection   | Applying predefined conditions               |
| Risk scoring           | Assigning scores based on indicators         |
| Risk prioritisation    | Deciding which records to review first       |

# What FraudLens currently does NOT do

It is equally important to understand the limitations of your project.

1. It does not independently confirm insurance fraud.
2. It does not currently train a machine-learning model.
3. It does not calculate a genuine probability of fraud.
4. It does not automatically verify documents, police reports or customer identities.
5. It does not currently analyse every worksheet in an Excel workbook.
6. Its cleaning operations are previews; they do not permanently modify the uploaded dataset.
7. Its current risk score uses only duplicate rows, missing fields and a configured amount threshold.

These are possible future development areas.

