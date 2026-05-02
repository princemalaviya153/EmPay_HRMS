const { Leave, LeaveAllocation, Employee, User, Attendance } = require('../models');
const { Op } = require('sequelize');

exports.applyLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) return res.status(404).json({ message: 'Employee record not found' });

    const { leave_type, start_date, end_date, reason } = req.body;
    let totalDays = 0;
    const start = new Date(start_date);
    const end = new Date(end_date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) totalDays++;
    }

    if (leave_type !== 'unpaid') {
      const allocation = await LeaveAllocation.findOne({
        where: { employee_id: employee.id, leave_type, year: new Date().getFullYear() },
      });
      if (!allocation) return res.status(400).json({ message: 'No leave allocation found' });
      const remaining = allocation.allocated - allocation.used;
      if (totalDays > remaining) return res.status(400).json({ message: `Insufficient balance. Available: ${remaining}` });
    }

    const leave = await Leave.create({ employee_id: employee.id, leave_type, start_date, end_date, total_days: totalDays, reason });
    res.status(201).json({ message: 'Leave applied', leave });
  } catch (error) {
    console.error('ApplyLeave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    const leaves = await Leave.findAll({ where: { employee_id: employee.id }, order: [['created_at', 'DESC']] });
    const allocations = await LeaveAllocation.findAll({ where: { employee_id: employee.id, year: new Date().getFullYear() } });
    res.json({ leaves, allocations });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    const leaves = await Leave.findAll({
      where,
      include: [
        { model: Employee, as: 'employee', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
        { model: User, as: 'approver', attributes: ['name'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ leaves });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Already processed' });

    await leave.update({ status: 'approved', approved_by: req.user.id });

    if (leave.leave_type !== 'unpaid') {
      const alloc = await LeaveAllocation.findOne({ where: { employee_id: leave.employee_id, leave_type: leave.leave_type, year: new Date().getFullYear() } });
      if (alloc) await alloc.update({ used: alloc.used + leave.total_days });
    }

    const start = new Date(leave.start_date), end = new Date(leave.end_date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        await Attendance.findOrCreate({ where: { employee_id: leave.employee_id, date: d.toISOString().split('T')[0] }, defaults: { employee_id: leave.employee_id, date: d.toISOString().split('T')[0], status: 'on_leave' } });
      }
    }
    res.json({ message: 'Leave approved', leave });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Already processed' });
    await leave.update({ status: 'rejected', approved_by: req.user.id });
    res.json({ message: 'Leave rejected', leave });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.allocateLeave = async (req, res) => {
  try {
    const { employee_id, leave_type, allocated, year } = req.body;
    const [alloc, created] = await LeaveAllocation.findOrCreate({ where: { employee_id, leave_type, year }, defaults: { employee_id, leave_type, allocated, year } });
    if (!created) await alloc.update({ allocated });
    res.json({ message: created ? 'Allocated' : 'Updated', allocation: alloc });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};
