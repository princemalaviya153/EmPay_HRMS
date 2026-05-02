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

    const user = await User.findOne({ where: { email } });
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
