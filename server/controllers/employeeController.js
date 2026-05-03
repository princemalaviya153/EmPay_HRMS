const { Employee, User, LeaveAllocation } = require('../models');
const { Op } = require('sequelize');

exports.getAllEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    const where = {};

    if (department) where.department = department;
    if (status !== undefined) where.is_active = status === 'active';

    const employees = await Employee.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role'],
        where: search ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        } : undefined,
      }],
      order: [['created_at', 'DESC']],
    });

    res.json({ employees });
  } catch (error) {
    console.error('GetAllEmployees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
        { model: LeaveAllocation, as: 'allocations' },
      ],
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ employee });
  } catch (error) {
    console.error('GetEmployee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password, department, designation, joining_date, basic_salary, phone, address, role, hra_pct, standard_pct, bonus_pct, lta_pct, fixed_pct, pf_rate } = req.body;

    // Create user account first
    const user = await User.create({
      name,
      email,
      password: password || 'Emp@123',
      role: 'employee',
    });

    // Generate employee code
    const count = await Employee.count();
    const employee = await Employee.create({
      user_id: user.id,
      employee_code: `EMP${String(count + 1).padStart(3, '0')}`,
      department,
      designation,
      joining_date,
      basic_salary: basic_salary || 0,
      phone,
      address,
      hra: hra_pct || 50,
      conveyance: standard_pct || 16.67,
      performance_bonus: bonus_pct || 8.33,
      leave_travel_allowance: lta_pct || 8.33,
      special_allowance: fixed_pct || 16.67,
      pf_rate: pf_rate || 12,
    });

    // Auto-allocate leaves for current year
    const currentYear = new Date().getFullYear();
    const leaveTypesInitial = [
      { leave_type: 'Annual Leave', allocated: 15 },
      { leave_type: 'Sick Leave', allocated: 12 },
      { leave_type: 'Casual Leave', allocated: 12 },
    ];

    for (const lt of leaveTypesInitial) {
      await LeaveAllocation.create({
        employee_id: employee.id,
        leave_type: lt.leave_type,
        allocated: lt.allocated,
        year: currentYear,
      });
    }

    const created = await Employee.findByPk(employee.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
    });

    res.status(201).json({ message: 'Employee created', employee: created });
  } catch (error) {
    console.error('CreateEmployee error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const isSelf = employee.user_id === req.user.id;
    const isAdmin = ['admin', 'hr_officer', 'payroll_officer'].includes(req.user.role);

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, email, ...otherFields } = req.body;

    // Update user info if name or email changed
    if (name || email) {
      const user = await User.findByPk(employee.user_id);
      if (name) user.name = name;
      if (email && isAdmin) user.email = email; // only admin can change primary email usually
      await user.save();
    }

    // Allowed fields depending on role
    const profileFields = [
      'phone', 'address', 'date_of_birth', 'gender', 'marital_status', 'nationality',
      'blood_group', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
      'bank_name', 'bank_account_no', 'ifsc_code', 'pan_number', 'aadhar_number',
      'personal_email', 'mailing_address', 'education', 'work_experience', 'skills',
      'bio', 'about_job', 'interests', 'profile_picture'
    ];

    const adminFields = [
      'department', 'designation', 'is_active', 'login_id', 'manager_id', 'state'
    ];

    const salaryFields = [
      'wage_type', 'monthly_wage', 'working_days_per_month', 'basic_salary', 'hra',
      'conveyance', 'medical_allowance', 'special_allowance', 'performance_bonus',
      'leave_travel_allowance', 'pf_rate', 'professional_tax'
    ];

    let fieldsToUpdate = profileFields;
    if (isAdmin) {
      fieldsToUpdate = [...profileFields, ...adminFields, ...salaryFields];
    }

    const updates = {};
    for (const key of Object.keys(otherFields)) {
      if (fieldsToUpdate.includes(key)) {
        updates[key] = otherFields[key];
      }
    }

    // Update employee info
    await employee.update(updates);

    const updated = await Employee.findByPk(employee.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
    });

    res.json({ message: 'Employee updated', employee: updated });
  } catch (error) {
    console.error('UpdateEmployee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Soft delete
    await employee.update({ is_active: false });
    res.json({ message: 'Employee deactivated' });
  } catch (error) {
    console.error('DeleteEmployee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      attributes: ['department'],
      group: ['department'],
      where: { department: { [Op.not]: null } },
    });
    const departments = employees.map(e => e.department).filter(Boolean);
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
