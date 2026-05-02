const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payroll = sequelize.define('Payroll', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'employees', key: 'id' },
  },
  pay_period_month: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pay_period_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  basic_salary: { type: DataTypes.REAL, defaultValue: 0 },
  days_worked: { type: DataTypes.REAL, defaultValue: 0 },
  days_in_month: { type: DataTypes.INTEGER, defaultValue: 0 },

  // Allowances breakdown (stored as computed values)
  hra: { type: DataTypes.REAL, defaultValue: 0 },
  standard_allowance: { type: DataTypes.REAL, defaultValue: 0 },
  performance_bonus: { type: DataTypes.REAL, defaultValue: 0 },
  lta: { type: DataTypes.REAL, defaultValue: 0 },
  fixed_allowance: { type: DataTypes.REAL, defaultValue: 0 },
  allowances: { type: DataTypes.REAL, defaultValue: 0 },

  gross_salary: { type: DataTypes.REAL, defaultValue: 0 },
  gross_pay: { type: DataTypes.REAL, defaultValue: 0 },   // alias for gross_salary
  employer_cost: { type: DataTypes.REAL, defaultValue: 0 }, // basic + employer PF

  pf_employee: { type: DataTypes.REAL, defaultValue: 0 },
  pf_employer: { type: DataTypes.REAL, defaultValue: 0 },
  professional_tax: { type: DataTypes.REAL, defaultValue: 0 },
  other_deductions: { type: DataTypes.REAL, defaultValue: 0 },
  total_deductions: { type: DataTypes.REAL, defaultValue: 0 },
  net_pay: { type: DataTypes.REAL, defaultValue: 0 },

  status: {
    type: DataTypes.ENUM('draft', 'processed', 'paid', 'cancelled'),
    defaultValue: 'draft',
  },
  generated_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'payrolls',
});

module.exports = Payroll;
