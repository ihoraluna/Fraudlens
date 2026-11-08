# FraudLens --- Feature Documentation

> A practical Excel-based insurance claims analysis and fraud-screening
> application.

FraudLens helps users inspect Excel workbooks, assess data quality,
explore claim patterns, preview data-cleaning operations, generate
summary reports, and prioritise potentially suspicious insurance claims
for human review.

This document describes the **currently documented functionality**. It
distinguishes basic data-analysis indicators from confirmed fraud
findings.

## Feature overview

FraudLens documents **38 tools across six categories**:

  ------------------------------------------------------------------------
  Category                                     Tools Purpose
  --------------------- ---------------------------- ---------------------
  A. Read and Explore                              8 Understand workbook
  Excel                                              structure, records,
                                                     columns and data
                                                     types

  B. Data Quality                                  8 Find missing,
  Checks                                             duplicated,
                                                     inconsistent or
                                                     incorrectly
                                                     structured data

  C. Data Analysis                                 8 Explore
                                                     distributions,
                                                     relationships,
                                                     frequencies and
                                                     unusual records

  D. Data Cleaning                                 5 Preview possible
                                                     corrections and
                                                     identify outliers

  E. Reports                                       2 Generate consolidated
                                                     dataset and
                                                     data-quality
                                                     summaries

  F. Fraud-Specific                                7 Apply screening
  Features                                           rules, calculate risk
                                                     scores and rank
                                                     claims

  **Total**                                   **38** 
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## A. Read and Explore Excel

**8 tools · Objective:** Understand the structure and contents of a
dataset before investigating it.

### 1. Read First 5 Rows

Displays the first five records using Pandas `head()`.

**Useful for:** Checking how records are organised, understanding column
contents, reviewing the initial structure and spotting obvious missing
values.

**Insurance use:** Inspect claim IDs, policy IDs, claim amounts,
incident dates and claim statuses. For example, a large difference
between a claimed amount and an approved amount may deserve review.

### 2. Read Last 5 Rows

Displays the last five records using Pandas `tail()`.

**Useful for:** Checking whether records near the end of the dataset are
consistently structured or contain incomplete or unusual entries.

**Insurance use:** Review the most recently listed claims for missing
information, unexpected values or data-entry issues.

### 3. Display Rows with Pagination

Displays records in smaller batches. Users can specify a page number and
the number of rows per page.

Example:

  Page   Example records
  ------ -----------------
  1      1--20
  2      21--40
  3      41--60

**Useful for:** Navigating large datasets and inspecting records without
displaying the entire workbook at once.

**Insurance use:** Review a large claims population in manageable
batches.

### 4. Show Column Names

Lists all column headings in the uploaded dataset.

Example fields may include:

``` text
claim_id
policy_id
customer_id
claim_amount
approved_amount
incident_date
previous_claims
fraudulent
```

**Useful for:** Discovering which variables are available and
identifying columns relevant to an investigation.

**Insurance use:** Identify claim, policy and customer identifiers;
financial fields; dates; claim history; and any existing fraud
classification.

### 5. Show Number of Rows and Columns

Displays the dataset dimensions using Pandas `shape`.

Example:

``` text
Rows: 100000
Columns: 62
```

**Useful for:** Understanding the size of the dataset. Rows represent
records; columns represent variables or attributes.

**Insurance use:** Establish the size of the investigation population.
The number of rows does not necessarily equal the number of unique
claims.

### 6. Show Data Types

Displays the data type of each column.

Common types:

  Type      Meaning          Example
  --------- ---------------- ------------
  String    Text             `CL001`
  Integer   Whole number     `35`
  Float     Decimal number   `25000.75`

**Useful for:** Understanding how Python interprets values and checking
whether numerical and date fields have suitable types.

**Insurance use:** If `claim_amount` is stored as text, calculations and
comparisons may fail or produce unreliable results.

### 7. Show Random 5 Rows

Selects five randomly chosen records using Pandas `sample()`.

**Useful for:** Inspecting records from different parts of the dataset
rather than relying only on the first few rows.

**Insurance use:** Conduct a quick spot-check for incomplete records,
unexpected values or unusual claim amounts.

**Limitation:** Five random records cannot establish the quality of the
entire dataset.

### 8. Display Excel Sheet Names

Displays worksheet names contained in an uploaded Excel workbook.

Example:

``` text
Claims
Customers
Policies
Fraud_Records
```

**Useful for:** Understanding how information is organised across
worksheets.

**Insurance use:** Locate worksheets that may contain claim, customer,
policy or fraud-record information.

**Current limitation:** The documented backend loads only the first
worksheet for analysis. Other sheet names are displayed, but those
worksheets cannot currently be analysed independently.

------------------------------------------------------------------------

## B. Data Quality Checks

**8 tools · Objective:** Identify incomplete, duplicated, inconsistent
or incorrectly structured information.

### 1. Find Empty Cells

Counts missing cells using Pandas `isna()`.

**Useful for:** Measuring how much information is missing from the
dataset.

**Insurance use:** Find claims with missing incident dates,
police-report information or customer identifiers. A missing field alone
does not prove fraud.

### 2. Count Missing Values per Column

Calculates the number of missing values in each column.

Example:

  Column              Missing values
  ----------------- ----------------
  `claim_amount`                   0
  `customer_name`                120
  `incident_date`                350
  `police_report`              2,500

**Useful for:** Finding which fields have the most incomplete
information.

**Insurance use:** Identify claims that may need document or information
verification.

### 3. Calculate Missing Value Percentage

Calculates the percentage of missing values in each column.

\[ `\text{Missing Percentage}`{=tex} =
`\frac{\text{Missing Values}}{\text{Total Rows}}`{=tex}`\times100`{=tex}
\]

Example:

  Column              Missing percentage
  ----------------- --------------------
  `customer_name`                     2%
  `incident_date`                     5%
  `police_report`                    25%

**Useful for:** Understanding the severity of missing data, not just its
count.

**Insurance use:** If a critical investigation field is missing in a
substantial portion of claims, additional documentation or verification
may be needed.

### 4. Find Duplicate Rows

Identifies completely duplicated records.

**Useful for:** Understanding repeated records and how duplicates can
distort analysis.

**Insurance use:** A repeated claim record may indicate accidental
duplicate entry, repeated processing or a possible duplicate submission.
Verify the circumstances before treating it as suspicious.

### 5. Find Duplicate Values in a Column

Finds repeated values in a selected column, such as `claim_id`.

**Useful for:** Distinguishing repeated identifiers from completely
duplicated rows.

**Insurance use:** Review repeated claim IDs, policy IDs or customer
IDs. A policy ID appearing multiple times may be legitimate because one
policy can have multiple claims.

### 6. Identify Completely Empty Columns

Finds columns in which every record is missing.

Example:

``` text
empty_columns:
- investigator_remarks
- external_reference
```

**Useful for:** Identifying unpopulated fields that cannot contribute
information to the current analysis.

**Insurance use:** Determine whether the dataset lacks a particular type
of investigation evidence and whether another source is required.

### 7. Check Inconsistent Date Formats

Examines date-like columns and attempts to parse their values as dates.
It identifies values that cannot be interpreted as dates.

Example values:

``` text
2026-05-10
10/05/2026
InvalidDate
```

**Useful for:** Understanding how inconsistent or invalid dates affect
chronological analysis.

**Insurance use:** Compare policy start date, incident date, claim
submission date and approval date. An incident before the policy's
effective date requires investigation and context.

### 8. Identify Mixed Data Types

Examines whether values in the same column have different Python types.

Example:

``` text
claim_amount:
50000
65000
Unknown
75000
```

**Useful for:** Finding columns that mix numerical values and text,
which can interfere with calculations.

**Insurance use:** Identify unexpected text in financial fields before
calculating totals, averages or unusual amounts.

------------------------------------------------------------------------

## C. Data Analysis

**8 tools · Objective:** Understand numerical patterns, distributions,
relationships and unusual records.

### 1. Calculate Sum, Average, Minimum and Maximum

Calculates four statistical measures for numerical columns.

  Measure   Meaning
  --------- ----------------
  Sum       Total value
  Average   Mean value
  Minimum   Smallest value
  Maximum   Largest value

**Insurance use:** Understand the financial distribution of claims and
identify unusually large claims for review. A high amount alone is not
evidence of fraud.

### 2. Generate Descriptive Statistics

Uses Pandas `describe()` to summarise numerical columns.

  Measure   Meaning
  --------- ------------------------------------
  Count     Number of non-missing observations
  Mean      Average
  Std       Standard deviation
  Min       Minimum
  25%       First quartile
  50%       Median
  75%       Third quartile
  Max       Maximum

**Insurance use:** Compare claim amounts, repair costs, medical costs
and payouts. Values far from the typical distribution may deserve
review.

### 3. Count Unique Values per Column

Counts distinct non-missing values in every column.

Example:

  Column             Unique values
  ---------------- ---------------
  `claim_id`               100,000
  `policy_id`               80,000
  `claim_status`                 3
  `gender`                       3

**Insurance use:** Understand how many unique claims, policies, statuses
or other values exist. Repeated policy IDs can help identify policies
associated with multiple claims.

### 4. Show Most Frequent Values

Displays the most common values in a selected column.

Example:

  Claim status     Count
  -------------- -------
  Approved         5,000
  Pending          3,000
  Rejected         2,000

**Insurance use:** Examine common claim statuses, incident types,
vehicle types, payment methods or claim categories.

### 5. Sort Data

Arranges records by a selected column in ascending or descending order.

**Insurance use:** Sort by claim amount to review the highest-value
claims first, or sort by dates, previous claims or risk scores.

### 6. Filter Rows

Returns records that satisfy a selected condition.

Supported operators:

  Operator     Meaning
  ------------ --------------------------
  `eq`         Equal to
  `ne`         Not equal to
  `gt`         Greater than
  `gte`        Greater than or equal to
  `lt`         Less than
  `lte`        Less than or equal to
  `contains`   Contains specified text

Example:

``` text
Column: claim_amount
Operator: gt
Value: 50000
```

This returns claims with amounts greater than ₹50,000.

**Insurance use:** Isolate claims based on high amounts, previous claim
counts, incident types or claim statuses.

### 7. Search Claim or Policy ID

Searches all columns for a specified text value and returns matching
records.

**Insurance use:** Quickly locate a record when an investigator receives
a complaint or query containing a particular claim ID or policy ID.

### 8. Compare Two Columns

Compares values in two selected columns row by row.

Example:

    Claimed amount   Approved amount Equal?
  ---------------- ----------------- --------
            50,000            45,000 No
            30,000            30,000 Yes
            80,000            60,000 No

**Insurance use:** Compare claimed amount with approved amount, repair
cost with estimated repair cost, or incident date with reported date. A
mismatch is a reason to review, not automatic proof of fraud.

------------------------------------------------------------------------

## D. Data Cleaning

**5 tools · Objective:** Identify and preview corrections that may
improve data quality.

> The documented cleaning operations are previews. They do not
> permanently modify the uploaded dataset.

### 1. Preview Duplicate Removal

Creates a temporary working copy without completely duplicated rows
using Pandas `drop_duplicates()`.

**Insurance use:** Understand how many duplicate records might be
removed before analysis.

**Important:** Duplicate claims may themselves be evidence worth
investigating. Preserve the original data and review potential
duplicates before excluding them.

### 2. Preview Missing-Value Fill

Creates a preview in which missing values in a selected column are
replaced with a value supplied by the user.

Example:

``` text
Column: claim_amount
Replacement value: 0
```

**Insurance use:** Test how a missing-value strategy affects analysis.

**Caution:** Replacing an unknown claim amount with zero can create
misleading financial statistics. Choose replacements carefully.

### 3. Standardize Text Whitespace

Removes leading and trailing whitespace from text values.

Example: `" Approved "` becomes `"Approved"`.

**Insurance use:** Make values such as claim statuses consistent so that
grouping, filtering and comparison work as expected.

### 4. Preview Column Type Conversion

Previews conversion of a selected column into one of three target types:

-   Numeric
-   String
-   Datetime

Example:

``` text
Column: claim_amount
Target type: numeric
```

**Insurance use:** Convert claim amounts to numerical values before
calculating financial statistics. Invalid values may become missing
during conversion.

### 5. Identify Unusually Large or Small Values

Uses the Interquartile Range (IQR) method to identify statistical
outliers.

\[ IQR = Q3-Q1 \]

Lower boundary:

\[ Q1-1.5(IQR) \]

Upper boundary:

\[ Q3+1.5(IQR) \]

Values outside these boundaries are flagged.

**Insurance use:** Identify unusually high or low claim amounts, medical
expenses, repair costs or vehicle valuations.

**Limitation:** An outlier is a statistical observation, not proof of
fraud.

------------------------------------------------------------------------

## E. Reports

**2 tools · Objective:** Generate consolidated information about the
dataset.

### 1. Generate Data Quality Report

Combines multiple data-quality checks into one report.

The documented report includes:

-   Filename
-   Total rows
-   Total columns
-   Missing cells
-   Duplicate rows
-   Completely empty columns
-   Missing values by column

**Insurance use:** Assess whether the dataset is sufficiently complete
and reliable for further analysis. For example, many missing incident
dates may limit chronological analysis.

### 2. Generate Dataset Statistics Summary

Generates an overall summary containing:

-   Filename
-   Number of rows
-   Number of columns
-   Column names
-   Data types
-   Total missing cells
-   Duplicate rows
-   Descriptive statistics for numerical columns

**Insurance use:** Establish the size, completeness and statistical
characteristics of the available dataset before examining individual
claims.

------------------------------------------------------------------------

## F. Fraud-Specific Features

**7 tools · Objective:** Identify potentially suspicious insurance
claims using predefined rules and statistical indicators.

### 1. Flag Potentially Duplicate Claims

Identifies records duplicated across selected columns.

Default columns:

``` text
claim_id, policy_id, claim_amount
```

Users can provide their own comma-separated column names.

**Insurance use:** Flag claims with matching identifiers and amounts for
verification.

**Current limitation:** Matching is exact. The tool does not
automatically detect similar records with slightly different values
(fuzzy matching).

### 2. Flag Claims Above an Amount

Flags records where a selected numerical column exceeds a configured
threshold.

Example:

``` text
Amount column: claim_amount
Threshold: 50000
```

**Insurance use:** Prioritise high-value claims for additional
verification of repair bills, medical documents or supporting evidence.

**Caution:** A high claim amount alone is not evidence of fraud.

### 3. Identify Repeated Claim or Policy IDs

Finds repeated values in a selected identifier column.

**Insurance use:** Repeated claim IDs may indicate duplicate records or
processing issues. Repeated policy IDs may simply represent multiple
legitimate claims under one policy, so context matters.

### 4. Detect Unusual Claim Amounts

Uses the IQR statistical method to identify unusually high or low values
in a selected numerical column.

**Insurance use:** Find claims that differ substantially from the normal
claim-amount distribution and send them for review.

### 5. Create Rule-Based Risk Scores

Assigns a score from **1 to 100** using three configured indicators:

  Indicator                                      Points
  ------------------------------------------- ---------
  Exact duplicate row                                45
  One or more missing fields                         15
  Claim amount exceeds configured threshold          40
  **Maximum**                                   **100**

If no configured rule is triggered, the score is 1.

Example: a record triggering all three indicators receives
`45 + 15 + 40 = 100`.

**Insurance use:** Combine configured screening indicators to help
prioritise claims for human investigation.

**Important limitation:** This is a basic rule-based score. It is not an
AI/ML prediction and is not a calibrated probability of fraud. It
currently uses only the three indicators listed above.

### 6. Rank Top 5 or 10 Claims

Sorts claims by calculated rule-based risk score and displays the top
five or ten records.

**Insurance use:** Help an investigation team begin with the
highest-scoring records when handling a large claims population.

**Caution:** A high ranking does not establish that a claim is
fraudulent.

### 7. Show Reasons for Flagged Claims

Displays the reasons contributing to a rule-based score.

Possible reasons include:

``` text
Exact duplicate row
One or more missing fields
claim_amount exceeds configured threshold
No configured rule triggered
```

**Insurance use:** Help investigators understand why a claim was flagged
and decide what supporting documents or information should be examined.

------------------------------------------------------------------------

## End-to-end investigation workflow

The six categories work together in this order:

1.  **Read and Explore:** Understand the dataset, columns, records and
    structure.
2.  **Data Quality Checks:** Identify missing information, duplicates
    and inconsistencies.
3.  **Data Analysis:** Examine financial patterns, distributions,
    relationships and unusual values.
4.  **Data Cleaning:** Preview potential corrections to improve data
    reliability.
5.  **Reports:** Generate consolidated dataset and quality summaries.
6.  **Fraud-Specific Features:** Flag potentially suspicious claims,
    calculate rule-based scores and prioritise records for
    investigation.

## Important concepts

  Concept                  Meaning
  ------------------------ ----------------------------------------------
  Data exploration         Understanding available data
  Data quality             Checking accuracy and completeness
  Missing values           Information that is not available
  Duplicate records        Repeated records
  Descriptive statistics   Summarising numerical information
  Outliers                 Values statistically different from the rest
  Data cleaning            Correcting or standardising data
  Filtering                Selecting records using conditions
  Rule-based detection     Applying predefined conditions
  Risk scoring             Assigning scores based on indicators
  Risk prioritisation      Deciding which records to review first

## Current limitations

FraudLens currently:

1.  Does not independently confirm insurance fraud.
2.  Does not train a machine-learning model.
3.  Does not calculate a genuine probability of fraud.
4.  Does not automatically verify documents, police reports or customer
    identities.
5.  Does not analyse every worksheet in an Excel workbook; only the
    first worksheet is loaded for analysis.
6.  Provides cleaning previews; those operations do not permanently
    modify the uploaded dataset.
7.  Uses only exact matching for the documented duplicate-claim
    screening feature, not fuzzy matching.
8.  Uses only three indicators in its current rule-based risk score:
    exact duplicate rows, missing fields and a configured amount
    threshold.

These limitations are important when interpreting results. A flagged
claim is a lead for further investigation, not a finding of fraud.
