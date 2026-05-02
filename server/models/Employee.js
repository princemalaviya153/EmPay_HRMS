const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: 'users', key: 'id' } },
  employee_code: { type: DataTypes.STRING, unique: true },
  department: { type: DataTypes.STRING },
  designation: { type: DataTypes.STRING },
  joining_date: { type: DataTypes.DATEONLY },
  basic_salary: { type: DataTypes.FLOAT, defaultValue: 0 },
  phone: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  // Profile: Private Info
  date_of_birth: { type: DataTypes.DATEONLY },
  gender: { type: DataTypes.ENUM('male', 'female', 'other'), defaultValue: 'male' },
  marital_status: { type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'), defaultValue: 'single' },
  nationality: { type: DataTypes.STRING, defaultValue: 'Indian' },
  blood_group: { type: DataTypes.STRING },
  emergency_contact_name: { type: DataTypes.STRING },
  emergency_contact_phone: { type: DataTypes.STRING },
  emergency_contact_relation: { type: DataTypes.STRING },
  bank_name: { type: DataTypes.STRING },
  bank_account_no: { type: DataTypes.STRING },
  ifsc_code: { type: DataTypes.STRING },
  pan_number: { type: DataTypes.STRING },
  aadhar_number: { type: DataTypes.STRING },
  personal_email: { type: DataTypes.STRING },
  mailing_address: { type: DataTypes.TEXT },
  login_id: { type: DataTypes.STRING },
  manager_id: { type: DataTypes.INTEGER, references: { model: 'employees', key: 'id' } },
  // Profile: Resume
  education: { type: DataTypes.TEXT },
  work_experience: { type: DataTypes.TEXT },
  skills: { type: DataTypes.TEXT },
  bio: { type: DataTypes.TEXT },
  about_job: { type: DataTypes.TEXT },
  interests: { type: DataTypes.TEXT },
  // Salary Info
  wage_type: { type: DataTypes.STRING, defaultValue: 'fixed' },
  monthly_wage: { type: DataTypes.FLOAT, defaultValue: 0 },
  working_days_per_month: { type: DataTypes.INTEGER, defaultValue: 26 },
  hra: { type: DataTypes.FLOAT, defaultValue: 0 },
  conveyance: { type: DataTypes.FLOAT, defaultValue: 0 },
  medical_allowance: { type: DataTypes.FLOAT, defaultValue: 0 },
  special_allowance: { type: DataTypes.FLOAT, defaultValue: 0 },
  performance_bonus: { type: DataTypes.FLOAT, defaultValue: 0 },
  leave_travel_allowance: { type: DataTypes.FLOAT, defaultValue: 0 },
  pf_rate: { type: DataTypes.FLOAT, defaultValue: 12 },
  professional_tax: { type: DataTypes.FLOAT, defaultValue: 200 },
  state: { type: DataTypes.STRING, defaultValue: 'Maharashtra' },
}, {
  tableName: 'employees',
});

module.exports = Employee;
