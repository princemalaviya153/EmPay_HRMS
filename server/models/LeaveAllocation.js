const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeaveAllocation = sequelize.define('LeaveAllocation', {
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
  leave_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  allocated: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  used: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'leave_allocations',
});

module.exports = LeaveAllocation;
