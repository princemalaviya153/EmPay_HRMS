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
    const { month, year, date } = req.query;
    const where = {};

    if (date) {
      where.date = date;
    } else if (month && year) {
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

exports.getWeeklyAttendance = async (req, res) => {
  try {
    const totalEmployees = await Employee.count({ where: { is_active: true } });
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const result = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const presentCount = await Attendance.count({
        where: { date: dateStr, status: { [Op.in]: ['present', 'half_day'] } },
      });

      result.push({
        day: days[i],
        date: dateStr,
        present: presentCount,
        absent: Math.max(0, totalEmployees - presentCount),
      });
    }

    res.json({ weekly: result, totalEmployees });
  } catch (error) {
    console.error('GetWeeklyAttendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMonthlyAttendanceTrend = async (req, res) => {
  try {
    const totalEmployees = await Employee.count({ where: { is_active: true } });
    const months = [];
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr = d.getFullYear();
      const mo = d.getMonth(); // 0-indexed
      const startDate = `${yr}-${String(mo + 1).padStart(2, '0')}-01`;
      const endDate = new Date(yr, mo + 1, 0).toISOString().split('T')[0];

      const workingDays = Math.max(1, (() => {
        let count = 0;
        const temp = new Date(yr, mo, 1);
        while (temp.getMonth() === mo) {
          const day = temp.getDay();
          if (day !== 0 && day !== 6) count++;
          temp.setDate(temp.getDate() + 1);
        }
        return count;
      })());

      const presentCount = await Attendance.count({
        where: {
          date: { [Op.between]: [startDate, endDate] },
          status: { [Op.in]: ['present', 'half_day', 'on_leave'] },
        },
      });

      const maxPossible = totalEmployees * workingDays;
      const rate = maxPossible > 0 ? Math.round((presentCount / maxPossible) * 100) : 0;

      months.push({
        month: monthNames[mo],
        rate: Math.min(100, rate),
        present: presentCount,
        total: maxPossible,
      });
    }

    const avg = months.length > 0 ? (months.reduce((s, m) => s + m.rate, 0) / months.length).toFixed(1) : 0;
    res.json({ trend: months, avgRate: `${avg}%` });
  } catch (error) {
    console.error('GetMonthlyAttendanceTrend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
