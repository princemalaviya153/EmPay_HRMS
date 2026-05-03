const PROFESSIONAL_TAX_SLABS = [
  { upTo: 10000, tax: 0 },
  { upTo: 15000, tax: 150 },
  { upTo: 25000, tax: 200 },
  { upTo: Infinity, tax: 200 },
];

function getProfessionalTax(grossSalary) {
  for (const slab of PROFESSIONAL_TAX_SLABS) {
    if (grossSalary <= slab.upTo) return slab.tax;
  }
  return 200;
}

/**
 * Salary Structure: Regular Pay
 * - Basic Salary     = basicSalary (50% of CTC by convention)
 * - HRA              = 50% of basic
 * - Standard Allow.  = ~16.67% of basic
 * - Performance Bonus= ~8.33% of basic
 * - LTA              = ~8.33% of basic
 * - Fixed Allowance  = ~16.67% of basic
 * - Gross            = basic + all allowances
 * 
 * Deductions:
 * - PF Employee = 12% of basic
 * - PF Employer = 12% of basic (employer cost add-on)
 * - Professional Tax (slab-based)
 */
function calculatePayroll({ basicSalary, daysWorked, daysInMonth, otherDeductions = 0, percentages = {} }) {
  // Use provided percentages or fallback to defaults
  const hraPct = (percentages.hra !== undefined ? percentages.hra : 50) / 100;
  const standardAllowancePct = (percentages.standard_allowance !== undefined ? percentages.standard_allowance : 16.67) / 100;
  const performanceBonusPct = (percentages.performance_bonus !== undefined ? percentages.performance_bonus : 8.33) / 100;
  const ltaPct = (percentages.lta !== undefined ? percentages.lta : 8.33) / 100;
  const fixedAllowancePct = (percentages.fixed_allowance !== undefined ? percentages.fixed_allowance : 16.67) / 100;
  const pfRate = (percentages.pf_rate !== undefined ? percentages.pf_rate : 12) / 100;

  // Attendance-prorated basic for worked days
  const proratedBasic = parseFloat(((basicSalary / daysInMonth) * daysWorked).toFixed(2));

  // Allowances are based on prorated basic
  const hra                = parseFloat((proratedBasic * hraPct).toFixed(2));
  const standardAllowance  = parseFloat((proratedBasic * standardAllowancePct).toFixed(2));
  const performanceBonus   = parseFloat((proratedBasic * performanceBonusPct).toFixed(2));
  const lta                = parseFloat((proratedBasic * ltaPct).toFixed(2));
  const fixedAllowance     = parseFloat((proratedBasic * fixedAllowancePct).toFixed(2));

  const allowances = parseFloat((hra + standardAllowance + performanceBonus + lta + fixedAllowance).toFixed(2));
  const grossSalary = parseFloat((proratedBasic + allowances).toFixed(2));

  // PF: based on full (non-prorated) basic salary
  const pfEmployee = parseFloat((basicSalary * pfRate).toFixed(2));
  const pfEmployer = parseFloat((basicSalary * pfRate).toFixed(2));

  // Professional Tax based on gross
  const professionalTax = getProfessionalTax(grossSalary);

  // Total deductions (employee-side only)
  const totalDeductions = parseFloat((pfEmployee + professionalTax + otherDeductions).toFixed(2));

  // Net pay
  const netPay = parseFloat((grossSalary - totalDeductions).toFixed(2));

  // Employer cost = gross + employer PF contribution
  const employerCost = parseFloat((grossSalary + pfEmployer).toFixed(2));

  return {
    hra,
    standard_allowance: standardAllowance,
    performance_bonus: performanceBonus,
    lta,
    fixed_allowance: fixedAllowance,
    allowances,
    grossSalary,
    gross_pay: grossSalary,
    pfEmployee,
    pfEmployer,
    employer_cost: employerCost,
    professionalTax,
    totalDeductions,
    netPay,
  };
}

function getWorkingDaysInMonth(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  return workingDays;
}

module.exports = { calculatePayroll, getWorkingDaysInMonth, getProfessionalTax };
