const jwt = require('jsonwebtoken');
const { User, Employee } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
    });

    // Auto-create employee record if role is employee
    if (user.role === 'employee') {
      const count = await Employee.count();
      await Employee.create({
        user_id: user.id,
        employee_code: `EMP${String(count + 1).padStart(3, '0')}`,
        basic_salary: 0,
        login_id: req.body.login_id || null,
        phone: req.body.phone || null,
      });
    }

    const token = generateToken(user);
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the input is an email or a login_id
    let user;
    if (email.includes('@')) {
      user = await User.findOne({ where: { email } });
    } else {
      // It might be a login_id. Find Employee first
      const emp = await Employee.findOne({ where: { login_id: email } });
      if (emp) {
        user = await User.findByPk(emp.user_id);
      } else {
        // Fallback: try to find user by email anyway just in case
        user = await User.findOne({ where: { email } });
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    // Fetch employee record if exists
    const employee = await Employee.findOne({ where: { user_id: user.id } });

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
      employee: employee ? employee.toJSON() : null,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Employee, as: 'employee' }],
    });
    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(current_password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = new_password;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      include: [{ model: Employee, as: 'employee', attributes: ['id', 'employee_code', 'department'] }],
      order: [['createdAt', 'ASC']],
    });
    res.json({ users: users.map(u => u.toJSON()) });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'employee', 'hr_officer', 'payroll_officer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot change your own admin role' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // If user needs an employee record, create one
    if (['employee', 'hr_officer', 'payroll_officer'].includes(role)) {
      const existing = await Employee.findOne({ where: { user_id: user.id } });
      if (!existing) {
        const count = await Employee.count();
        await Employee.create({
          user_id: user.id,
          employee_code: `EMP${String(count + 1).padStart(3, '0')}`,
          basic_salary: 0,
        });
      }
    }

    res.json({ message: `Role updated from ${oldRole} to ${role}`, user: user.toJSON() });
  } catch (error) {
    console.error('UpdateUserRole error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('DeleteUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
