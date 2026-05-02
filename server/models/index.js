const sequelize = require('../config/database');
const User = require('./User');
const Employee = require('./Employee');
const Attendance = require('./Attendance');
const Leave = require('./Leave');
const LeaveAllocation = require('./LeaveAllocation');
const Payroll = require('./Payroll');

// Associations
User.hasOne(Employee, { foreignKey: 'user_id', as: 'employee' });
Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Employee.hasMany(Attendance, { foreignKey: 'employee_id', as: 'attendances' });
Attendance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

Employee.hasMany(Leave, { foreignKey: 'employee_id', as: 'leaves' });
Leave.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

User.hasMany(Leave, { foreignKey: 'approved_by', as: 'approved_leaves' });
Leave.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

Employee.hasMany(LeaveAllocation, { foreignKey: 'employee_id', as: 'allocations' });
LeaveAllocation.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

Employee.hasMany(Payroll, { foreignKey: 'employee_id', as: 'payrolls' });
Payroll.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

User.hasMany(Payroll, { foreignKey: 'generated_by', as: 'generated_payrolls' });
Payroll.belongsTo(User, { foreignKey: 'generated_by', as: 'generator' });

module.exports = {
  sequelize,
  User,
  Employee,
  Attendance,
  Leave,
  LeaveAllocation,
  Payroll,
};
