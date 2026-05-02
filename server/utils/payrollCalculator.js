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
function calculatePayroll({ basicSalary, daysWorked, daysInMonth, otherDeductions = 0 }) {
  // Attendance-prorated basic for worked days
  const proratedBasic = parseFloat(((basicSalary / daysInMonth) * daysWorked).toFixed(2));

  // Allowances are based on prorated basic
  const hra                = parseFloat((proratedBasic * 0.5).toFixed(2));
  const standardAllowance  = parseFloat((proratedBasic * (1 / 6)).toFixed(2));
  const performanceBonus   = parseFloat((proratedBasic * (1 / 12)).toFixed(2));
  const lta                = parseFloat((proratedBasic * (1 / 12)).toFixed(2));
  const fixedAllowance     = parseFloat((proratedBasic * (1 / 6)).toFixed(2));

  const allowances = parseFloat((hra + standardAllowance + performanceBonus + lta + fixedAllowance).toFixed(2));
  const grossSalary = parseFloat((proratedBasic + allowances).toFixed(2));

  // PF: 12% of full (non-prorated) basic salary
  const PF_RATE = 0.12;
  const pfEmployee = parseFloat((basicSalary * PF_RATE).toFixed(2));
  const pfEmployer = parseFloat((basicSalary * PF_RATE).toFixed(2));

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
