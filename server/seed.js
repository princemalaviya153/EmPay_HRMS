require('dotenv').config();
const { sequelize, User, Employee, LeaveAllocation, Attendance } = require('./models');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('📦 Database synced (tables recreated)');

    // Create users
    const admin = await User.create({ name: 'Admin User', email: 'admin@empay.com', password: 'Admin@123', role: 'admin' });
    const hr = await User.create({ name: 'Priya Sharma', email: 'hr@empay.com', password: 'Hr@123', role: 'hr_officer' });
    const payroll = await User.create({ name: 'Rahul Verma', email: 'payroll@empay.com', password: 'Pay@123', role: 'payroll_officer' });
    const emp1 = await User.create({ name: 'Ankit Patel', email: 'emp@empay.com', password: 'Emp@123', role: 'employee' });
    const emp2 = await User.create({ name: 'Sneha Reddy', email: 'sneha@empay.com', password: 'Emp@123', role: 'employee' });
    const emp3 = await User.create({ name: 'Vikram Singh', email: 'vikram@empay.com', password: 'Emp@123', role: 'employee' });
    const emp4 = await User.create({ name: 'Meera Nair', email: 'meera@empay.com', password: 'Emp@123', role: 'employee' });
    const emp5 = await User.create({ name: 'Arjun Das', email: 'arjun@empay.com', password: 'Emp@123', role: 'employee' });
    console.log('👤 Users created');

    // Create employee records
    const employees = await Promise.all([
      Employee.create({ user_id: emp1.id, employee_code: 'EMP001', department: 'Engineering', designation: 'Software Engineer', joining_date: '2023-01-15', basic_salary: 55000, phone: '9876543210' }),
      Employee.create({ user_id: emp2.id, employee_code: 'EMP002', department: 'Engineering', designation: 'Senior Developer', joining_date: '2022-06-01', basic_salary: 72000, phone: '9876543211' }),
      Employee.create({ user_id: emp3.id, employee_code: 'EMP003', department: 'Marketing', designation: 'Marketing Manager', joining_date: '2023-03-10', basic_salary: 60000, phone: '9876543212' }),
      Employee.create({ user_id: emp4.id, employee_code: 'EMP004', department: 'HR', designation: 'HR Executive', joining_date: '2023-07-20', basic_salary: 45000, phone: '9876543213' }),
      Employee.create({ user_id: emp5.id, employee_code: 'EMP005', department: 'Finance', designation: 'Accountant', joining_date: '2022-11-05', basic_salary: 50000, phone: '9876543214' }),
      Employee.create({ user_id: hr.id, employee_code: 'EMP006', department: 'HR', designation: 'HR Officer', joining_date: '2022-01-10', basic_salary: 65000, phone: '9876543215' }),
      Employee.create({ user_id: payroll.id, employee_code: 'EMP007', department: 'Finance', designation: 'Payroll Officer', joining_date: '2022-03-15', basic_salary: 62000, phone: '9876543216' }),
    ]);
    console.log('👥 Employees created');

    // Allocate leaves
    const year = new Date().getFullYear();
    for (const emp of employees) {
      await LeaveAllocation.bulkCreate([
        { employee_id: emp.id, leave_type: 'sick', allocated: 12, used: Math.floor(Math.random() * 4), year },
        { employee_id: emp.id, leave_type: 'casual', allocated: 12, used: Math.floor(Math.random() * 5), year },
        { employee_id: emp.id, leave_type: 'earned', allocated: 15, used: Math.floor(Math.random() * 3), year },
      ]);
    }
    console.log('📋 Leave allocations created');

    // Create sample attendance for current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    for (const emp of employees) {
      for (let day = 1; day <= Math.min(now.getDate() - 1, 28); day++) {
        const d = new Date(currentYear, currentMonth, day);
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        const isPresent = Math.random() > 0.1;
        if (isPresent) {
          await Attendance.create({
            employee_id: emp.id,
            date: d.toISOString().split('T')[0],
            check_in: '09:00:00',
            check_out: '18:00:00',
            working_hours: 9,
            status: 'present',
          });
        }
      }
    }
    console.log('📅 Sample attendance created');

    console.log('\n✅ Seed complete!\n');
    console.log('Login Credentials:');
    console.log('  Admin:    admin@empay.com / Admin@123');
    console.log('  HR:       hr@empay.com / Hr@123');
    console.log('  Payroll:  payroll@empay.com / Pay@123');
    console.log('  Employee: emp@empay.com / Emp@123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
