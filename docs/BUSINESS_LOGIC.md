# Business Logic and Payroll Calculations

## Table of Contents
- [Overview](#overview)
- [Payroll Processing Flow](#payroll-processing-flow)
- [Salary Components](#salary-components)
- [PAYE Tax Calculation](#paye-tax-calculation)
- [Statutory Deductions](#statutory-deductions)
- [Allowances and Benefits](#allowances-and-benefits)
- [Payroll Cycles](#payroll-cycles)
- [Adjustments and Corrections](#adjustments-and-corrections)
- [Eligibility Rules](#eligibility-rules)
- [Examples and Scenarios](#examples-and-scenarios)

---

## Overview

This document explains the business rules and calculation logic used in the Payroll Management System. All calculations follow **Nigerian Tax Act 2025** and current labor laws.

### Key Principles
1. **Accuracy**: All calculations use precise formulas
2. **Compliance**: Follows Nigerian Tax Act 2025 (PAYE, Pension, NHF, etc.)
3. **Transparency**: Complete audit trail of all calculations
4. **Flexibility**: Supports multiple pay cycles and adjustments

---

## Payroll Processing Flow

### Step-by-Step Process

```
1. SELECT PAYROLL PERIOD
   ├─ Choose month/period (e.g., December 2024)
   ├─ Choose cycle (monthly, bi-weekly, weekly)
   └─ Select employees to include

2. LOAD EMPLOYEE DATA
   ├─ Basic salary and grade
   ├─ Allowances (housing, transport, etc.)
   ├─ Deduction configurations
   └─ Eligibility data (NHF, disability, etc.)

3. CALCULATE GROSS SALARY
   ├─ Base salary
   ├─ Add all allowances
   ├─ Add bonuses/overtime
   └─ = GROSS SALARY

4. CALCULATE DEDUCTIONS
   ├─ Pension (8% of pensionable emoluments)
   ├─ PAYE (progressive tax on taxable income)
   ├─ NHF (2.5% of basic salary)
   ├─ Other deductions (loans, advances, etc.)
   └─ = TOTAL DEDUCTIONS

5. CALCULATE NET SALARY
   └─ Net Salary = Gross Salary - Total Deductions

6. GENERATE PAYSLIPS
   ├─ Individual payslip for each employee
   ├─ Includes breakdown of all components
   └─ Saves to database with audit trail

7. CREATE DISBURSEMENT FILES
   ├─ Bank transfer files
   ├─ JV allocations (if applicable)
   └─ Export for finance system
```

---

## Salary Components

### 1. Basic Salary
The foundational component of an employee's compensation.

**Definition**: Fixed monthly/periodic amount based on grade/position

**Rules**:
- Cannot be less than minimum wage (currently ₦70,000/month - Federal Nigeria 2024/2025)
- Used as base for calculating some deductions (e.g., NHF)
- Typically 40-60% of total compensation

### 2. Allowances

#### Housing Allowance
**Purpose**: Assist with accommodation costs  
**Typical Range**: 20-30% of basic salary  
**Tax Treatment**: Taxable income

#### Transport Allowance
**Purpose**: Cover commuting costs  
**Typical Range**: 10-20% of basic salary  
**Tax Treatment**: Taxable income

#### Utility Allowance
**Purpose**: Electricity, water, internet  
**Typical Range**: 5-10% of basic salary  
**Tax Treatment**: Taxable income

#### Entertainment Allowance
**Purpose**: Business entertainment expenses  
**Tax Treatment**: Taxable income

#### Meal Subsidy
**Purpose**: Daily meal expenses  
**Tax Treatment**: Taxable income

#### Medical Allowance
**Purpose**: Healthcare costs  
**Tax Treatment**: Taxable income

### 3. Bonuses and One-Time Payments

#### Performance Bonus
**When**: Annual or quarterly  
**Amount**: Variable based on performance  
**Tax Treatment**: Fully taxable as regular income

#### 13th Month Salary
**When**: December (common practice)  
**Amount**: Usually equals one month's salary  
**Tax Treatment**: Taxable

---

## PAYE Tax Calculation

### Nigerian Tax Brackets (2025)

The Nigerian Tax Act 2025 uses progressive tax brackets:

| Annual Income Range | Tax Rate | Tax on Band |
|---------------------|----------|-------------|
| ₦0 - ₦800,000 | 0% | ₦0 |
| ₦800,001 - ₦3,000,000 | 15% | Up to ₦330,000 |
| ₦3,000,001 - ₦12,000,000 | 18% | Up to ₦1,620,000 |
| ₦12,000,001 - ₦25,000,000 | 21% | Up to ₦2,730,000 |
| ₦25,000,001 - ₦50,000,000 | 23% | Up to ₦5,750,000 |
| Above ₦50,000,000 | 25% | No limit |

### Calculation Steps (Nigerian Tax Act 2025)

#### Step 1: Calculate Annual Gross Income
```
Annual Gross = Monthly Gross × 12
```

#### Step 2: Calculate Rent Relief (Replaces CRA in 2025 Tax Act)
```
Rent Relief = 20% of Annual Rent Paid
Maximum Rent Relief = ₦500,000 per year

If renting:
  Rent Relief = Min(Annual Rent × 20%, ₦500,000)
If not renting:
  Rent Relief = ₦0
```

**IMPORTANT**: The Nigerian Tax Act 2025 **removed** the Consolidated Relief Allowance (CRA) that was in the old tax law. CRA has been replaced with Rent Relief.

#### Step 3: Calculate Taxable Income
```
Taxable Income = Annual Gross - Rent Relief - Pension - NHF - Life Assurance - NHIS
```

**Key Changes from 2024 to 2025**:
- ❌ **Removed**: CRA (Consolidated Relief Allowance)
- ✅ **Added**: Rent Relief (evidence-based, requires proof of rent payment)
- ✅ **Added**: NHIS deduction (if applicable)

#### Step 4: Apply Progressive Tax Brackets
```javascript
// Example calculation (Nigerian Tax Act 2025)
Annual Gross: ₦6,000,000
Annual Rent Paid: ₦600,000
Rent Relief: Min(₦600,000 × 20%, ₦500,000) = ₦120,000
Pension (8%): ₦480,000
NHF (2.5% of basic): ₦120,000
Taxable Income: ₦6,000,000 - ₦120,000 - ₦480,000 - ₦120,000 = ₦5,280,000

Tax Calculation:
- First ₦800,000: 0% = ₦0
- Next ₦2,200,000: 15% = ₦330,000
- Next ₦2,280,000: 18% = ₦410,400
Total Annual Tax: ₦740,400
Monthly PAYE: ₦740,400 / 12 = ₦61,700
```

### Relief and Exemptions (Nigerian Tax Act 2025)

#### Rent Relief (New in 2025)
**Amount**: 20% of annual rent paid (capped at ₦500,000)  
**Purpose**: Tax relief for employees who rent accommodation  
**Eligibility**: 
- Must be renting (not homeowner)
- Must provide evidence (tenancy agreement, rent receipts)
- Relief calculated as: Min(Annual Rent × 20%, ₦500,000)

**Example**:
- Annual Rent: ₦1,200,000
- Rent Relief: Min(₦1,200,000 × 20%, ₦500,000) = ₦240,000
- Monthly Relief: ₦20,000

**Important**: This replaces the old CRA (Consolidated Relief Allowance) from 2024.

#### Disability Relief
**Amount**: ₦20,000 per month (₦240,000 per year)  
**Eligibility**: Employees with certified disabilities

#### Rent Relief (Evidence-Based)
**Amount**: 20% of annual rent (capped at ₦500,000)  
**Eligibility**: Employees renting accommodation with proof of payment

### Complete PAYE Example (Nigerian Tax Act 2025)

**Employee Details**:
- Basic Salary: ₦400,000/month
- Housing Allowance: ₦120,000/month
- Transport Allowance: ₦40,000/month
- Total Monthly Gross: ₦560,000
- Annual Gross: ₦6,720,000
- Annual Rent Paid: ₦720,000 (renting)

**Step 1: Calculate Rent Relief**
```
Rent Relief = Min(₦720,000 × 20%, ₦500,000)
Rent Relief = Min(₦144,000, ₦500,000) = ₦144,000
```

**Step 2: Calculate Other Deductions**
```
Pension = 8% × ₦6,720,000 = ₦537,600
NHF = 2.5% × (₦400,000 × 12) = ₦120,000
```

**Step 3: Calculate Taxable Income**
```
Taxable Income = ₦6,720,000 - ₦144,000 - ₦537,600 - ₦120,000
Taxable Income = ₦5,918,400
```

**Step 4: Apply Tax Brackets**
```
First ₦800,000: 0% = ₦0
Next ₦2,200,000: 15% = ₦330,000
Next ₦2,918,400: 18% = ₦525,312
Total Annual Tax: ₦855,312
Monthly PAYE: ₦71,276
```

**Note**: This calculation is significantly different from 2024 due to removal of CRA and addition of evidence-based Rent Relief.

---

## Statutory Deductions

### 1. Pension Contribution

**Employee Contribution**: 8% of pensionable emoluments  
**Employer Contribution**: 10% of pensionable emoluments

**Pensionable Emoluments Include**:
- Basic salary
- Housing allowance
- Transport allowance

**Calculation**:
```
Monthly Basic: ₦400,000
Monthly Housing: ₦120,000
Monthly Transport: ₦40,000
Pensionable Emoluments: ₦560,000

Employee Pension = 8% × ₦560,000 = ₦44,800
Employer Pension = 10% × ₦560,000 = ₦56,000
```

**Remittance**: Combined amount remitted to employee's Pension Fund Administrator (PFA)

### 2. National Housing Fund (NHF)

**Rate**: 2.5% of basic salary  
**Purpose**: Contribute to national housing development  
**Deducted From**: Basic salary only

**Calculation**:
```
Monthly Basic: ₦400,000
NHF = 2.5% × ₦400,000 = ₦10,000
```

**Exemptions**:
- Employees earning below ₦70,000/month (new minimum wage threshold)
- Voluntary for employees in certain categories

### 3. Nigeria Social Insurance Trust Fund (NSITF)

**Rate**: 1% of gross emoluments  
**Paid By**: Employer only (not deducted from employee)  
**Purpose**: Employee compensation for work-related injuries

### 4. Industrial Training Fund (ITF)

**Rate**: 1% of gross emoluments  
**Paid By**: Employer only  
**Applicable**: Only if company has 5 or more employees

---

## Allowances and Benefits

### Tax-Free Benefits (Non-Taxable)

Some benefits are NOT included in taxable income:

1. **Pension contributions** (employer's portion)
2. **Life assurance premiums** (employer-paid)
3. **Medical treatment** provided by employer
4. **Gratuities** (under certain conditions)

### Taxable Benefits (Benefits-in-Kind)

These are taxable as part of income:

1. **Company car** (personal use)
2. **Housing** (if provided by employer)
3. **Utilities** paid by employer
4. **Club memberships**
5. **Domestic staff** (paid by employer)

---

## Payroll Cycles

### 1. Monthly Cycle

**Payment Frequency**: Once per month  
**Payment Date**: Last working day or fixed date (e.g., 25th)  
**Most Common**: Yes - 90% of Nigerian companies use monthly

**Calculation**:
```
Monthly Salary = Annual Salary / 12
```

### 2. Bi-Weekly Cycle

**Payment Frequency**: Every 2 weeks (26 pay periods/year)  
**Calculation**:
```
Bi-Weekly Salary = (Annual Salary / 52) × 2
```

### 3. Weekly Cycle

**Payment Frequency**: Every week (52 pay periods/year)  
**Less Common**: Usually for casual/contract workers  
**Calculation**:
```
Weekly Salary = Annual Salary / 52
```

### Prorated Salaries

For partial month employment:

```
Daily Rate = Monthly Salary / Working Days in Month
Prorated Salary = Daily Rate × Days Worked
```

**Example**:
- Monthly Salary: ₦400,000
- Working days in month: 22
- Days worked: 15
- Daily Rate: ₦400,000 / 22 = ₦18,182
- Prorated Salary: ₦18,182 × 15 = ₦272,730

---

## Adjustments and Corrections

### Types of Adjustments

#### 1. Bonuses
**Added to**: Gross salary  
**Taxed**: Yes, as regular income  
**Example**: Performance bonus, festive bonus

#### 2. Overtime
**Calculation**: Hourly rate × overtime hours × multiplier  
**Multiplier**: Usually 1.5× for weekdays, 2× for weekends/holidays  
**Taxed**: Yes

**Example**:
```
Monthly Salary: ₦400,000
Working hours/month: 176 (22 days × 8 hours)
Hourly Rate: ₦400,000 / 176 = ₦2,273

Overtime (10 hours @ 1.5×): ₦2,273 × 10 × 1.5 = ₦34,095
```

#### 3. Loan Deductions
**Deducted From**: Net salary (after tax)  
**Calculation**: Fixed amount per period or percentage  
**Not Tax Deductible**: Does not reduce taxable income

#### 4. Advance Deductions
**Purpose**: Recover salary advances given to employee  
**Deducted From**: Net salary  
**Example**: Advance of ₦100,000 deducted over 5 months = ₦20,000/month

#### 5. Arrears
**Added to**: Current month's salary  
**Taxed**: Yes, in the month paid  
**Example**: Salary increase backdated 3 months

---

## Eligibility Rules

### NHF Exemptions

**Exempt If**:
1. Monthly basic salary < ₦70,000 (updated minimum wage threshold)
2. Already owns a home through NHF scheme
3. Opted out (for certain employee categories)

### Pension Exemptions

**Who Must Contribute**:
- All employees in public sector
- All employees in private organizations with 3+ employees
- Applies to employees earning ₦70,000/month and above

**Exempt**:
- Employees who already have pension from previous employment
- Temporary staff (under 3 months)

### Disability Relief

**Eligibility**:
1. Must have certified disability
2. Certificate from recognized medical authority
3. ₦20,000 monthly tax relief

### Rent Relief

**Eligibility**:
1. Must be renting (not homeowner)
2. Must provide evidence (tenancy agreement)
3. Relief = 20% of annual rent (max ₦500,000)

---

## Examples and Scenarios

### Scenario 1: Standard Employee

**Profile**:
- Name: John Doe
- Position: Software Engineer
- Basic Salary: ₦400,000/month
- Housing: ₦120,000/month
- Transport: ₦40,000/month

**Calculations (Nigerian Tax Act 2025)**:

1. **Gross Salary**:
   ```
   Basic: ₦400,000
   Housing: ₦120,000
   Transport: ₦40,000
   Total Gross: ₦560,000/month = ₦6,720,000/year
   ```

2. **Pension**:
   ```
   8% × ₦560,000 = ₦44,800
   ```

3. **NHF**:
   ```
   2.5% × ₦400,000 = ₦10,000
   ```

4. **Rent Relief** (if renting and paying ₦600,000/year):
   ```
   Annual Rent Relief = Min(₦600,000 × 20%, ₦500,000) = ₦120,000
   Monthly Rent Relief = ₦10,000
   ```

5. **PAYE**:
   ```
   Annual Taxable Income = ₦6,720,000 - ₦120,000 - ₦537,600 - ₦120,000 = ₦5,942,400
   Tax = ₦0 + ₦330,000 + (₦2,942,400 × 18%) = ₦859,632
   Monthly PAYE: ₦71,636
   ```

6. **Net Salary**:
   ```
   Gross: ₦560,000
   Less: Pension: ₦44,800
   Less: NHF: ₦10,000
   Less: PAYE: ₦71,636
   Net Salary: ₦433,564
   ```

**Note**: Under 2025 Tax Act, employees who do not rent receive NO automatic tax relief (CRA removed).

### Scenario 2: Employee with Disability (Nigerian Tax Act 2025)

**Profile**:
- Basic Salary: ₦400,000/month
- Housing: ₦120,000/month
- Has certified disability
- Annual Rent: ₦600,000

**Tax Calculation**:
```
Annual Gross: ₦6,720,000
Rent Relief: Min(₦600,000 × 20%, ₦500,000) = ₦120,000
Pension: ₦537,600
NHF: ₦120,000
Disability Relief: ₦240,000 (₦20,000 × 12)

Taxable Income: ₦6,720,000 - ₦120,000 - ₦537,600 - ₦120,000 - ₦240,000
Taxable Income: ₦5,702,400

Tax calculation:
- First ₦800,000: 0% = ₦0
- Next ₦2,200,000: 15% = ₦330,000
- Next ₦2,702,400: 18% = ₦486,432
Total Tax: ₦816,432
Monthly PAYE: ₦68,036

Tax without disability relief would be: ₦71,636
Savings from disability relief: ₦71,636 - ₦68,036 = ₦3,600/month
```

### Scenario 3: Mid-Year Salary Increase

**Situation**:
- Original salary: ₦400,000/month (Jan-June)
- New salary: ₦500,000/month (July-December)
- Increase backdated to April

**April Salary**:
```
Current month: ₦500,000
Arrears (April-June): (₦500,000 - ₦400,000) × 3 = ₦300,000
Total April Payment: ₦800,000

Tax calculated on ₦800,000 for April
Regular calculations resume from May
```

### Scenario 4: Loan Deduction

**Loan Details**:
- Loan Amount: ₦500,000
- Repayment Period: 10 months
- Monthly Deduction: ₦50,000

**Net Salary Calculation**:
```
Gross: ₦560,000
Less: Pension: ₦44,800
Less: NHF: ₦10,000
Less: PAYE: ₦52,268
Subtotal: ₦452,932
Less: Loan Deduction: ₦50,000
Net Salary: ₦402,932
```

---

## Rounding Rules

All calculations follow these rounding rules:

1. **Intermediate Calculations**: Keep full precision
2. **Final Amounts**: Round to nearest Naira (₦1)
3. **Percentages**: Calculate with 2 decimal places
4. **Totals**: Sum unrounded values, then round final result

**Example**:
```
Pension = 8% × ₦560,000 = ₦44,800.00 (exact)
NHF = 2.5% × ₦400,000 = ₦10,000.00 (exact)
PAYE = ₦52,268.00 (rounded from ₦52,268.00)
```

---

## Important Notes

### 1. Tax Year
**Period**: January 1 - December 31  
**Filing**: Annual tax returns due by March 31

### 2. Minimum Wage
**Current**: ₦70,000/month (Federal - effective 2024/2025)  
**Note**: Individual states may have different minimum wages

### 3. Payment Deadlines
- **Pension**: Within 7 days of month end
- **PAYE**: Within 10 days of month end
- **NHF**: Within 30 days of month end

### 4. Record Keeping
**Required Duration**: 6 years  
**Documents**: Payslips, tax remittances, pension statements

---

**Document Version**: 1.1  
**Last Updated**: December 2024  
**Tax Regulations**: Nigerian Tax Act 2025  
**Maintained By**: HR & Payroll Team

---

## Disclaimer

This documentation is based on the Nigerian Tax Act 2025 and current labor regulations. Tax and labor laws may change. Always consult with a qualified tax professional or the Federal Inland Revenue Service (FIRS) for the most current information and specific cases. The minimum wage referenced reflects federal guidelines and may vary by state.
