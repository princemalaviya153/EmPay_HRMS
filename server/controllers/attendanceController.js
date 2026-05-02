const { Attendance, Employee, User } = require('../models');
const { Op } = require('sequelize');

exports.checkIn = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    const existing = await Attendance.findOne({
      where: { employee_id: employee.id, date: today },
    });

    if (existing) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const now = new Date();
    const checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const attendance = await Attendance.create({
      employee_id: employee.id,
      date: today,
      check_in: checkInTime,
      status: 'present',
    });

    res.status(201).json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    console.error('CheckIn error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    const attendance = await Attendance.findOne({
      where: { employee_id: employee.id, date: today },
    });

    if (!attendance) {
      return res.status(400).json({ message: 'No check-in found for today' });
    }

    if (attendance.check_out) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const now = new Date();
    const checkOutTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Calculate working hours
    const [inH, inM] = attendance.check_in.split(':').map(Number);
    const [outH, outM] = checkOutTime.split(':').map(Number);
    const workingHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;

    // Determine status based on hours worked
    let status = 'present';
    if (workingHours < 4) {
      status = 'half_day';
    }

    await attendance.update({
      check_out: checkOutTime,
      working_hours: parseFloat(workingHours.toFixed(2)),
      status,
    });

    res.json({ message: 'Checked out successfully', attendance });
  } catch (error) {
    console.error('CheckOut error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' });
    }

    const { month, year } = req.query;
    const where = { employee_id: employee.id };

    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      where.date = { [Op.between]: [startDate, endDate] };
    }

    const attendances = await Attendance.findAll({
      where,
      order: [['date', 'DESC']],
    });

    // Calculate summary
    const summary = {
      present: attendances.filter(a => a.status === 'present').length,
      absent: attendances.filter(a => a.status === 'absent').length,
      half_day: attendances.filter(a => a.status === 'half_day').length,
      on_leave: attendances.filter(a => a.status === 'on_leave').length,
      total_hours: attendances.reduce((sum, a) => sum + (a.working_hours || 0), 0),
    };

    res.json({ attendances, summary });
  } catch (error) {
    console.error('GetMyAttendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;
    const where = { employee_id: id };

    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      where.date = { [Op.between]: [startDate, endDate] };
    }

    const attendances = await Attendance.findAll({
      where,
      include: [{ model: Employee, as: 'employee', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] }],
      order: [['date', 'DESC']],
    });

    const summary = {
      present: attendances.filter(a => a.status === 'present').length,
      absent: attendances.filter(a => a.status === 'absent').length,
      half_day: attendances.filter(a => a.status === 'half_day').length,
      on_leave: attendances.filter(a => a.status === 'on_leave').length,
      total_hours: parseFloat(attendances.reduce((sum, a) => sum + (a.working_hours || 0), 0).toFixed(2)),
    };

    res.json({ attendances, summary });
  } catch (error) {
    console.error('GetEmployeeAttendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { id, month, year } = req.params;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const attendances = await Attendance.findAll({
      where: {
        employee_id: id,
        date: { [Op.between]: [startDate, endDate] },
      },
    });

    const daysWorked = attendances.filter(a => a.status === 'present' || a.status === 'on_leave').length
      + attendances.filter(a => a.status === 'half_day').length * 0.5;

    res.json({
      employee_id: parseInt(id),
      month: parseInt(month),
      year: parseInt(year),
      days_worked: daysWorked,
      total_records: attendances.length,
      breakdown: {
        present: attendances.filter(a => a.status === 'present').length,
        absent: attendances.filter(a => a.status === 'absent').length,
        half_day: attendances.filter(a => a.status === 'half_day').length,
        on_leave: attendances.filter(a => a.status === 'on_leave').length,
      },
    });
  } catch (error) {
    console.error('GetAttendanceSummary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTodayStatus = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendances = await Attendance.findAll({
      where: { date: today },
      include: [{ model: Employee, as: 'employee', include: [{ model: User, as: 'user', attributes: ['name'] }] }],
    });

    const totalEmployees = await Employee.count({ where: { is_active: true } });
    const presentCount = attendances.length;

    res.json({
      date: today,
      total_employees: totalEmployees,
      present: presentCount,
      absent: totalEmployees - presentCount,
      records: attendances,
    });
  } catch (error) {
    console.error('GetTodayStatus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllAttendances = async (req, res) => {
  try {
    const { month, year } = req.query;
    const where = {};

    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      where.date = { [Op.between]: [startDate, endDate] };
    }

    const attendances = await Attendance.findAll({
      where,
      include: [{ model: Employee, as: 'employee', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] }],
      order: [['date', 'DESC']],
    });

    // Calculate summary
    const summary = {
      present: attendances.filter(a => a.status === 'present').length,
      absent: attendances.filter(a => a.status === 'absent').length,
      half_day: attendances.filter(a => a.status === 'half_day').length,
      on_leave: attendances.filter(a => a.status === 'on_leave').length,
      total_hours: parseFloat(attendances.reduce((sum, a) => sum + (a.working_hours || 0), 0).toFixed(2)),
    };

    res.json({ attendances, summary });
  } catch (error) {
    console.error('GetAllAttendances error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
