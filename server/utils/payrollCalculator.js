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

function calculatePayroll({ basicSalary, daysWorked, daysInMonth, otherDeductions = 0 }) {
  // Pro-rate gross salary based on attendance
  const grossSalary = (basicSalary / daysInMonth) * daysWorked;

  // PF: Employee 12% of basic, Employer 12% of basic
  const PF_RATE = 0.12;
  const pfEmployee = basicSalary * PF_RATE;
  const pfEmployer = basicSalary * PF_RATE;

  // Professional Tax (state slab)
  const professionalTax = getProfessionalTax(grossSalary);

  // Total deductions (employee-side only)
  const totalDeductions = pfEmployee + professionalTax + otherDeductions;

  // Net pay
  const netPay = grossSalary - totalDeductions;

  return {
    grossSalary: parseFloat(grossSalary.toFixed(2)),
    pfEmployee: parseFloat(pfEmployee.toFixed(2)),
    pfEmployer: parseFloat(pfEmployer.toFixed(2)),
    professionalTax: parseFloat(professionalTax.toFixed(2)),
    totalDeductions: parseFloat(totalDeductions.toFixed(2)),
    netPay: parseFloat(netPay.toFixed(2)),
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
