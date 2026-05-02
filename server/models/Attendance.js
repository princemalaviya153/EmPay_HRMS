const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  check_in: {
    type: DataTypes.TIME,
  },
  check_out: {
    type: DataTypes.TIME,
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'half_day', 'on_leave'),
    defaultValue: 'present',
  },
  working_hours: {
    type: DataTypes.REAL,
    defaultValue: 0,
  },
}, {
  tableName: 'attendance',
  indexes: [
    {
      unique: true,
      fields: ['employee_id', 'date'],
    },
  ],
});

module.exports = Attendance;
