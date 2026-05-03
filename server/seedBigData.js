require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Employee, Attendance, LeaveAllocation, Payroll } = require('./models');
const { calculatePayroll, getWorkingDaysInMonth } = require('./utils/payrollCalculator');

const firstNamesM = ['Arjun', 'Vikram', 'Rahul', 'Suresh', 'Amit', 'Rohan', 'Aditya', 'Manish', 'Yash', 'Karan', 'Sameer', 'Ajay', 'Vivek', 'Nitin', 'Ankit', 'Deepak', 'Sunil', 'Rajesh', 'Pradeep', 'Kunal', 'Gaurav', 'Varun', 'Abhishek', 'Vishal', 'Sandeep'];
const firstNamesF = ['Priya', 'Neha', 'Anita', 'Meera', 'Kavita', 'Shweta', 'Pooja', 'Sneha', 'Riya', 'Anjali', 'Divya', 'Tanvi', 'Preeti', 'Simran', 'Sakshi', 'Nisha', 'Jyoti', 'Aarti', 'Komal', 'Sapna', 'Rekha', 'Sunita', 'Geeta', 'Maya', 'Swati'];
const lastNames = ['Sharma', 'Patel', 'Singh', 'Gupta', 'Desai', 'Joshi', 'Kumar', 'Nair', 'Reddy', 'Malhotra', 'Iyer', 'Kulkarni', 'Mehta', 'Rao', 'Mukherjee', 'Agarwal', 'Bansal', 'Choudhury', 'Khan', 'Varma', 'Shah', 'Yadav', 'Pandey', 'Mishra', 'Gandhi'];

const departments = ['Engineering', 'Marketing', 'Finance', 'HR', 'Design', 'Sales', 'Operations', 'Product', 'Legal', 'Customer Support'];
const designations = ['Software Engineer', 'Senior Developer', 'Tech Lead', 'Project Manager', 'Product Manager', 'Marketing Manager', 'Finance Analyst', 'HR Executive', 'Recruiter', 'Accountant', 'Sales Representative', 'Customer Success', 'Operations Associate', 'UI/UX Designer', 'Data Analyst'];
const banks = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Bank of Baroda', 'PNB', 'Yes Bank', 'IndusInd', 'IDFC'];

async function seed() {
  try {
    console.log('🚀 Starting BIG database seed (2000 employees)...');
    await sequelize.sync({ force: true });

    const totalEmployees = 2000;
    const passwordHash = await bcrypt.hash('Pass@123', 10);

    // 1. Create Core Users (Admin, HR, Payroll)
    const coreUsersData = [
      { name: 'Admin User', email: 'admin@empay.com', password: passwordHash, role: 'admin' },
      { name: 'Priya Sharma', email: 'hr@empay.com', password: passwordHash, role: 'hr_officer' },
      { name: 'Rahul Patel', email: 'payroll@empay.com', password: passwordHash, role: 'payroll_officer' }
    ];
    const coreUsers = await User.bulkCreate(coreUsersData);
    
    // 2. Prepare 2000 Employees data
    console.log('📦 Preparing employee data...');
    const usersToCreate = [];
    const employeesToCreate = [];
    
    for (let i = 0; i < totalEmployees; i++) {
      const isFemale = Math.random() > 0.6;
      const firstName = isFemale 
        ? firstNamesF[Math.floor(Math.random() * firstNamesF.length)]
        : firstNamesM[Math.floor(Math.random() * firstNamesM.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@empay.com`;
      
      usersToCreate.push({
        name,
        email,
        password: passwordHash,
        role: 'employee'
      });
    }

    const createdUsers = await User.bulkCreate(usersToCreate, { returning: true });

    for (let i = 0; i < totalEmployees; i++) {
      const user = createdUsers[i];
      const salary = 30000 + Math.floor(Math.random() * 120000);
      const nameParts = user.name.split(' ');
      const loginId = `EMP${String(i + 4).padStart(4, '0')}`; // Offset for core users

      employeesToCreate.push({
        user_id: user.id,
        employee_code: `CODE${String(i + 1).padStart(4, '0')}`,
        department: departments[Math.floor(Math.random() * departments.length)],
        designation: designations[Math.floor(Math.random() * designations.length)],
        joining_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        basic_salary: salary,
        phone: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        is_active: true,
        login_id: loginId,
        gender: usersToCreate[i].name.split(' ')[0] === 'Priya' ? 'female' : (Math.random() > 0.5 ? 'male' : 'female'),
        bank_name: banks[Math.floor(Math.random() * banks.length)],
        bank_account_no: `${String(Math.floor(Math.random() * 10000000000)).padStart(12, '0')}`,
        ifsc_code: `BKID000${Math.floor(Math.random() * 9000) + 1000}`,
        pan_number: `ABCDE${Math.floor(Math.random() * 9000) + 1000}F`,
        aadhar_number: `${Math.floor(Math.random() * 9000) + 1000}${Math.floor(Math.random() * 9000) + 1000}${Math.floor(Math.random() * 9000) + 1000}`,
        hra: 50,
        conveyance: 16.67,
        performance_bonus: 8.33,
        leave_travel_allowance: 8.33,
        special_allowance: 16.67,
        pf_rate: 12
      });
    }

    const createdEmployees = await Employee.bulkCreate(employeesToCreate, { returning: true });
    console.log(`✅ Created ${totalEmployees} Employees.`);

    // 3. Attendance for the Current Month (Optimization: Only last 10 days for everyone)
    console.log('📅 Creating attendance (last 10 days for all employees)...');
    const attendanceRecords = [];
    const now = new Date();
    const last10Days = [];
    for (let d = 0; d < 10; d++) {
      const date = new Date();
      date.setDate(now.getDate() - d);
      if (date.getDay() !== 0) last10Days.push(date.toISOString().split('T')[0]);
    }

    for (const emp of createdEmployees) {
      for (const date of last10Days) {
        const isAbsent = Math.random() < 0.05;
        if (isAbsent) {
          attendanceRecords.push({ employee_id: emp.id, date, status: 'absent' });
        } else {
          attendanceRecords.push({
            employee_id: emp.id,
            date,
            check_in: '09:00:00',
            check_out: '18:00:00',
            working_hours: 9.0,
            status: 'present'
          });
        }
      }
    }
    await Attendance.bulkCreate(attendanceRecords);
    console.log(`✅ Created ${attendanceRecords.length} Attendance records.`);

    // 4. Payroll for Previous Month
    console.log('💰 Generating Payroll for previous month...');
    const payrollRecords = [];
    const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const workingDays = getWorkingDaysInMonth(prevYear, prevMonth);

    for (const emp of createdEmployees) {
      const daysWorked = workingDays - (Math.random() > 0.9 ? 1 : 0);
      const calc = calculatePayroll({
        basicSalary: emp.basic_salary,
        daysWorked,
        daysInMonth: workingDays,
        percentages: {
          hra: emp.hra,
          standard_allowance: emp.conveyance,
          performance_bonus: emp.performance_bonus,
          lta: emp.leave_travel_allowance,
          fixed_allowance: emp.special_allowance,
          pf_rate: emp.pf_rate
        }
      });

      payrollRecords.push({
        employee_id: emp.id,
        pay_period_month: prevMonth,
        pay_period_year: prevYear,
        basic_salary: emp.basic_salary,
        days_worked: daysWorked,
        days_in_month: workingDays,
        ...calc,
        status: 'paid',
        generated_by: coreUsers[2].id // Payroll officer
      });
    }
    await Payroll.bulkCreate(payrollRecords);
    console.log(`✅ Created ${payrollRecords.length} Payroll records.`);

    // 5. Leave Allocations
    console.log('🏖️ Allocating leaves...');
    const leaveAllocations = [];
    for (const emp of createdEmployees) {
      leaveAllocations.push({ employee_id: emp.id, leave_type: 'earned', year: now.getFullYear(), total_days: 21, used_days: 0 });
      leaveAllocations.push({ employee_id: emp.id, leave_type: 'sick', year: now.getFullYear(), total_days: 12, used_days: 0 });
      leaveAllocations.push({ employee_id: emp.id, leave_type: 'casual', year: now.getFullYear(), total_days: 7, used_days: 0 });
    }
    await LeaveAllocation.bulkCreate(leaveAllocations);

    console.log('\n🎉 ALL DONE! 2000 Employees seeded with Attendance and Payroll.');
    console.log('Login with: admin@empay.com / Pass@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during big seed:', err);
    process.exit(1);
  }
}

seed();
