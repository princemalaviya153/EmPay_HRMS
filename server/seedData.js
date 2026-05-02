require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Employee, Attendance, Leave, LeaveAllocation, Payroll } = require('./models');

const departments = ['Engineering', 'Marketing', 'Finance', 'HR', 'Design'];
const designations = ['Software Engineer', 'Marketing Manager', 'Finance Analyst', 'HR Executive', 'UI/UX Designer', 'Senior Developer', 'Content Writer', 'Accountant', 'Recruiter', 'Product Designer'];

const users = [
  { name: 'Admin User', email: 'admin@empay.com', password: 'Admin@123', role: 'admin' },
  { name: 'Priya Sharma', email: 'priya@empay.com', password: 'Pass@123', role: 'hr_officer' },
  { name: 'Rahul Patel', email: 'rahul@empay.com', password: 'Pass@123', role: 'payroll_officer' },
  { name: 'Anita Desai', email: 'anita@empay.com', password: 'Pass@123', role: 'employee' },
  { name: 'Vikram Singh', email: 'vikram@empay.com', password: 'Pass@123', role: 'employee' },
  { name: 'Neha Gupta', email: 'neha@empay.com', password: 'Pass@123', role: 'employee' },
  { name: 'Arjun Reddy', email: 'arjun@empay.com', password: 'Pass@123', role: 'employee' },
  { name: 'Kavita Joshi', email: 'kavita@empay.com', password: 'Pass@123', role: 'employee' },
  { name: 'Suresh Kumar', email: 'suresh@empay.com', password: 'Pass@123', role: 'employee' },
  { name: 'Meera Nair', email: 'meera@empay.com', password: 'Pass@123', role: 'employee' },
];

const salaries = [85000, 60000, 55000, 48000, 52000, 45000, 62000, 42000, 38000, 50000];

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    await sequelize.sync({ force: true });

    // Create Users + Employees
    const createdEmployees = [];
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const user = await User.create({ name: u.name, email: u.email, password: u.password, role: u.role });

      const dept = departments[i % departments.length];
      const desg = designations[i % designations.length];
      const salary = salaries[i];

      const nameParts = u.name.split(' ');
      const f2 = nameParts[0].substring(0, 2).toUpperCase();
      const l2 = (nameParts[1] || 'XX').substring(0, 2).toUpperCase();
      const loginId = `OI${f2}${l2}2026${String(i + 1).padStart(4, '0')}`;

      const employee = await Employee.create({
        user_id: user.id,
        employee_code: `EMP${String(i + 1).padStart(3, '0')}`,
        department: dept,
        designation: desg,
        joining_date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        basic_salary: salary,
        phone: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        is_active: true,
        login_id: loginId,
        monthly_wage: salary,
        hra: Math.round(salary * 0.4),
        conveyance: 1600,
        medical_allowance: 1250,
        special_allowance: Math.round(salary * 0.15),
        pf_rate: 12,
        professional_tax: 200,
        working_days_per_month: 26,
        bank_name: ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak'][i % 5],
        bank_account_no: `${String(Math.floor(Math.random() * 10000000000)).padStart(12, '0')}`,
        ifsc_code: `SBIN00${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
        pan_number: `A${String.fromCharCode(65 + i)}CPM${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}Q`,
        gender: i % 3 === 0 ? 'female' : 'male',
        date_of_birth: new Date(1990 + (i % 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        marital_status: i % 2 === 0 ? 'single' : 'married',
        nationality: 'Indian',
        state: 'Maharashtra',
      });

      createdEmployees.push(employee);
      console.log(`  ✅ Created ${u.name} (${u.role}) — Login: ${loginId}`);
    }

    // Set managers (admin manages everyone)
    const adminEmp = createdEmployees[0];
    for (let i = 1; i < createdEmployees.length; i++) {
      await createdEmployees[i].update({ manager_id: adminEmp.id });
    }

    // Create Attendance Records (last 3 months)
    console.log('\n📅 Creating attendance records...');
    const now = new Date();
    let attendanceCount = 0;

    for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        if (date > now) break; // Don't create future dates
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

        const dateStr = date.toISOString().split('T')[0];

        for (const emp of createdEmployees) {
          // 85% chance present, 10% absent, 5% half day
          const rand = Math.random();
          if (rand < 0.85) {
            // Present
            const inH = 8 + Math.floor(Math.random() * 2);
            const inM = Math.floor(Math.random() * 60);
            const outH = 17 + Math.floor(Math.random() * 2);
            const outM = Math.floor(Math.random() * 60);
            const workingHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;

            await Attendance.create({
              employee_id: emp.id,
              date: dateStr,
              check_in: `${String(inH).padStart(2, '0')}:${String(inM).padStart(2, '0')}:00`,
              check_out: `${String(outH).padStart(2, '0')}:${String(outM).padStart(2, '0')}:00`,
              working_hours: parseFloat(workingHours.toFixed(2)),
              status: 'present',
            });
            attendanceCount++;
          } else if (rand < 0.95) {
            // Absent — no record or mark absent
            await Attendance.create({
              employee_id: emp.id,
              date: dateStr,
              status: 'absent',
            });
            attendanceCount++;
          } else {
            // Half day
            const inH = 9;
            const inM = Math.floor(Math.random() * 30);
            const outH = 13;
            const outM = Math.floor(Math.random() * 30);
            const workingHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;

            await Attendance.create({
              employee_id: emp.id,
              date: dateStr,
              check_in: `${String(inH).padStart(2, '0')}:${String(inM).padStart(2, '0')}:00`,
              check_out: `${String(outH).padStart(2, '0')}:${String(outM).padStart(2, '0')}:00`,
              working_hours: parseFloat(workingHours.toFixed(2)),
              status: 'half_day',
            });
            attendanceCount++;
          }
        }
      }
    }
    console.log(`  ✅ Created ${attendanceCount} attendance records`);

    // Create Leave Allocations
    console.log('\n🏖️  Creating leave allocations...');
    for (const emp of createdEmployees) {
      for (const type of ['earned', 'sick', 'casual']) {
        const allotted = type === 'earned' ? 21 : type === 'sick' ? 12 : 7;
        await LeaveAllocation.create({
          employee_id: emp.id,
          leave_type: type,
          year: now.getFullYear(),
          total_days: allotted,
          used_days: Math.floor(Math.random() * (allotted / 2)),
        });
      }
    }
    console.log(`  ✅ Created leave allocations for ${createdEmployees.length} employees`);

    // Create some Leave Requests
    console.log('\n📝 Creating leave requests...');
    const leaveStatuses = ['approved', 'pending', 'rejected'];
    let leaveCount = 0;
    for (let i = 1; i < createdEmployees.length; i++) {
      const numLeaves = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < numLeaves; j++) {
        const startDay = 5 + Math.floor(Math.random() * 20);
        const duration = 1 + Math.floor(Math.random() * 3);
        const monthOff = Math.floor(Math.random() * 3);
        const start = new Date(now.getFullYear(), now.getMonth() - monthOff, startDay);
        const end = new Date(start);
        end.setDate(start.getDate() + duration - 1);

        await Leave.create({
          employee_id: createdEmployees[i].id,
          leave_type: ['earned', 'sick', 'casual'][Math.floor(Math.random() * 3)],
          start_date: start.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0],
          total_days: duration,
          reason: ['Family function', 'Medical appointment', 'Personal work', 'Festival celebration', 'Travel'][Math.floor(Math.random() * 5)],
          status: leaveStatuses[Math.floor(Math.random() * 3)],
          approved_by: j === 0 ? 1 : null,
        });
        leaveCount++;
      }
    }
    console.log(`  ✅ Created ${leaveCount} leave requests`);

    // Create Payroll Records (last 3 months) — uses new salary schema
    console.log('\n💰 Creating payroll records...');
    const { calculatePayroll, getWorkingDaysInMonth } = require('./utils/payrollCalculator');
    let payrollCount = 0;
    for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
      const payMonth = now.getMonth() + 1 - monthOffset;
      const payYear = now.getFullYear();
      const adjustedMonth = payMonth <= 0 ? payMonth + 12 : payMonth;
      const adjustedYear = payMonth <= 0 ? payYear - 1 : payYear;
      const daysInMonth = getWorkingDaysInMonth(adjustedYear, adjustedMonth);

      for (let i = 0; i < createdEmployees.length; i++) {
        const emp = createdEmployees[i];
        const basic = salaries[i];
        const daysWorked = Math.min(daysInMonth, 18 + Math.floor(Math.random() * (daysInMonth - 17)));

        const calc = calculatePayroll({ basicSalary: basic, daysWorked, daysInMonth });

        await Payroll.create({
          employee_id:      emp.id,
          pay_period_month: adjustedMonth,
          pay_period_year:  adjustedYear,
          basic_salary:     basic,
          days_worked:      daysWorked,
          days_in_month:    daysInMonth,
          hra:              calc.hra,
          standard_allowance: calc.standard_allowance,
          performance_bonus:  calc.performance_bonus,
          lta:              calc.lta,
          fixed_allowance:  calc.fixed_allowance,
          allowances:       calc.allowances,
          gross_salary:     calc.grossSalary,
          gross_pay:        calc.gross_pay,
          employer_cost:    calc.employer_cost,
          pf_employee:      calc.pfEmployee,
          pf_employer:      calc.pfEmployer,
          professional_tax: calc.professionalTax,
          other_deductions: 0,
          total_deductions: calc.totalDeductions,
          net_pay:          calc.netPay,
          status: monthOffset > 0 ? 'paid' : 'processed',
          generated_by: 1,
        });
        payrollCount++;
      }
    }
    console.log(`  ✅ Created ${payrollCount} payroll records`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('─'.repeat(50));
    users.forEach(u => {
      console.log(`  ${u.role.padEnd(16)} | ${u.email.padEnd(22)} | ${u.password}`);
    });
    console.log('─'.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
