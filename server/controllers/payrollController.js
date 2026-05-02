const { Payroll, Employee, User, Attendance } = require('../models');
const { calculatePayroll, getWorkingDaysInMonth } = require('../utils/payrollCalculator');
const { Op } = require('sequelize');

// POST /payroll/generate
exports.generatePayrun = async (req, res) => {
  try {
    const { month, year } = req.body;
    const employees = await Employee.findAll({ where: { is_active: true } });
    const daysInMonth = getWorkingDaysInMonth(year, month);
    const results = [];

    for (const emp of employees) {
      const existing = await Payroll.findOne({
        where: { employee_id: emp.id, pay_period_month: month, pay_period_year: year },
      });
      if (existing) { results.push(existing); continue; }

      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate   = new Date(year, month, 0).toISOString().split('T')[0];

      const attendances = await Attendance.findAll({
        where: { employee_id: emp.id, date: { [Op.between]: [startDate, endDate] } },
      });

      const daysWorked =
        attendances.filter(a => a.status === 'present' || a.status === 'on_leave').length +
        attendances.filter(a => a.status === 'half_day').length * 0.5;

      const calc = calculatePayroll({
        basicSalary: emp.basic_salary,
        daysWorked,
        daysInMonth,
      });

      const payroll = await Payroll.create({
        employee_id:      emp.id,
        pay_period_month: month,
        pay_period_year:  year,
        basic_salary:     emp.basic_salary,
        days_worked:      daysWorked,
        days_in_month:    daysInMonth,

        hra:               calc.hra,
        standard_allowance: calc.standard_allowance,
        performance_bonus: calc.performance_bonus,
        lta:               calc.lta,
        fixed_allowance:   calc.fixed_allowance,
        allowances:        calc.allowances,

        gross_salary:   calc.grossSalary,
        gross_pay:      calc.gross_pay,
        employer_cost:  calc.employer_cost,

        pf_employee:      calc.pfEmployee,
        pf_employer:      calc.pfEmployer,
        professional_tax: calc.professionalTax,
        other_deductions: 0,
        total_deductions: calc.totalDeductions,
        net_pay:          calc.netPay,

        status:       'processed',
        generated_by: req.user.id,
      });
      results.push(payroll);
    }

    res.status(201).json({
      message: `Payrun generated for ${month}/${year}`,
      payrolls: results,
      count: results.length,
    });
  } catch (error) {
    console.error('GeneratePayrun error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /payroll
exports.getAllPayrolls = async (req, res) => {
  try {
    const { month, year, status } = req.query;
    const where = {};
    if (month)  where.pay_period_month = month;
    if (year)   where.pay_period_year  = year;
    if (status) where.status           = status;

    const payrolls = await Payroll.findAll({
      where,
      include: [{
        model: Employee, as: 'employee',
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      }],
      order: [['created_at', 'DESC']],
    });
    res.json({ payrolls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /payroll/employee/:id
exports.getEmployeePayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.findAll({
      where: { employee_id: req.params.id },
      include: [{
        model: Employee, as: 'employee',
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      }],
      order: [['pay_period_year', 'DESC'], ['pay_period_month', 'DESC']],
    });
    res.json({ payrolls });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /payroll/payslip/:id
exports.getPayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id, {
      include: [{
        model: Employee, as: 'employee',
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      }],
    });
    if (!payroll) return res.status(404).json({ message: 'Payslip not found' });

    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!emp || emp.id !== payroll.employee_id)
        return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ payslip: payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /payroll/my
exports.getMyPayslips = async (req, res) => {
  try {
    const emp = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    const payrolls = await Payroll.findAll({
      where: { employee_id: emp.id },
      order: [['pay_period_year', 'DESC'], ['pay_period_month', 'DESC']],
    });
    res.json({ payrolls });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /payroll/:id   (generic update: status, other_deductions)
exports.updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Not found' });

    const { status, other_deductions } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (other_deductions !== undefined) {
      updates.other_deductions = other_deductions;
      updates.total_deductions = payroll.pf_employee + payroll.professional_tax + other_deductions;
      updates.net_pay          = payroll.gross_salary - updates.total_deductions;
    }
    await payroll.update(updates);
    res.json({ message: 'Payroll updated', payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /payroll/:id/validate  — marks status as 'paid' (Done)
exports.validatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Not found' });
    if (payroll.status === 'cancelled')
      return res.status(400).json({ message: 'Cannot validate a cancelled payslip' });

    await payroll.update({ status: 'paid' });
    res.json({ message: 'Payslip validated', payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /payroll/run/validate  — validates ALL payslips for a month/year
exports.validatePayrun = async (req, res) => {
  try {
    const { month, year } = req.body;
    const [count] = await Payroll.update(
      { status: 'paid' },
      { where: { pay_period_month: month, pay_period_year: year, status: ['draft', 'processed'] } },
    );
    res.json({ message: `${count} payslips validated`, count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /payroll/:id/cancel
exports.cancelPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Not found' });
    if (payroll.status === 'paid')
      return res.status(400).json({ message: 'Cannot cancel paid payslip' });
    await payroll.update({ status: 'cancelled' });
    res.json({ message: 'Payslip cancelled', payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
