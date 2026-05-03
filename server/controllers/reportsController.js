const { Payroll, Employee, User, Attendance } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

exports.getLaborCostReport = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();
    
    const allPayrolls = await Payroll.findAll({
      where: { pay_period_year: targetYear },
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const payrolls = allPayrolls.filter(p => p.pay_period_month === m);
      return {
        month: m,
        monthName: new Date(2024, i).toLocaleString('default', { month: 'short' }),
        totalGross: payrolls.reduce((s, p) => s + (p.gross_salary || 0), 0),
        totalNet: payrolls.reduce((s, p) => s + (p.net_pay || 0), 0),
        totalPF: payrolls.reduce((s, p) => s + (p.pf_employee || 0) + (p.pf_employer || 0), 0),
        totalPT: payrolls.reduce((s, p) => s + (p.professional_tax || 0), 0),
        employeeCount: payrolls.length,
      };
    });

    const totals = monthlyData.reduce((acc, m) => ({
      totalGross: acc.totalGross + m.totalGross,
      totalNet: acc.totalNet + m.totalNet,
      totalPF: acc.totalPF + m.totalPF,
      totalPT: acc.totalPT + m.totalPT,
    }), { totalGross: 0, totalNet: 0, totalPF: 0, totalPT: 0 });

    res.json({ year: targetYear, monthly: monthlyData, totals });
  } catch (error) {
    console.error('LaborCostReport error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHeadcountReport = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'role'] }],
    });

    const deptCount = {};
    const statusCount = { active: 0, inactive: 0 };
    employees.forEach(e => {
      const dept = e.department || 'Unassigned';
      deptCount[dept] = (deptCount[dept] || 0) + 1;
      e.is_active ? statusCount.active++ : statusCount.inactive++;
    });

    const departments = Object.entries(deptCount).map(([name, count]) => ({ name, count }));

    // Monthly joining trend for current year
    const currentYear = new Date().getFullYear();
    const joiningTrend = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
      count: employees.filter(e => {
        if (!e.joining_date) return false;
        const d = new Date(e.joining_date);
        return d.getFullYear() === currentYear && d.getMonth() === i;
      }).length,
    }));

    res.json({
      total: employees.length,
      ...statusCount,
      departments,
      joiningTrend,
    });
  } catch (error) {
    console.error('HeadcountReport error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSalaryStatement = async (req, res) => {
  try {
    const { employee_id, year } = req.query;
    const targetYear = year || new Date().getFullYear();
    const where = { pay_period_year: targetYear };
    if (employee_id) where.employee_id = employee_id;

    const payrolls = await Payroll.findAll({
      where,
      include: [{ model: Employee, as: 'employee', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] }],
      order: [['pay_period_month', 'ASC']],
    });

    // Group by employee
    const grouped = {};
    payrolls.forEach(p => {
      const id = p.employee_id;
      if (!grouped[id]) {
        grouped[id] = {
          employee: p.employee,
          months: [],
          totals: { gross: 0, net: 0, pf: 0, pt: 0, deductions: 0 },
        };
      }
      grouped[id].months.push(p);
      grouped[id].totals.gross += p.gross_salary || 0;
      grouped[id].totals.net += p.net_pay || 0;
      grouped[id].totals.pf += (p.pf_employee || 0);
      grouped[id].totals.pt += p.professional_tax || 0;
      grouped[id].totals.deductions += p.total_deductions || 0;
    });

    res.json({ year: targetYear, statements: Object.values(grouped) });
  } catch (error) {
    console.error('SalaryStatement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
