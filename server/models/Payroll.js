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
  basic_salary: {
    type: DataTypes.REAL,
  },
  days_worked: {
    type: DataTypes.INTEGER,
  },
  days_in_month: {
    type: DataTypes.INTEGER,
  },
  gross_salary: {
    type: DataTypes.REAL,
  },
  pf_employee: {
    type: DataTypes.REAL,
  },
  pf_employer: {
    type: DataTypes.REAL,
  },
  professional_tax: {
    type: DataTypes.REAL,
  },
  other_deductions: {
    type: DataTypes.REAL,
    defaultValue: 0,
  },
  total_deductions: {
    type: DataTypes.REAL,
  },
  net_pay: {
    type: DataTypes.REAL,
  },
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
