const router = require('express').Router();
const ctrl = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const { allow } = require('../middleware/roleCheck');

router.post('/checkin', auth, ctrl.checkIn);
router.put('/checkout', auth, ctrl.checkOut);
router.get('/my', auth, ctrl.getMyAttendance);
router.get('/today', auth, allow('admin', 'hr_officer', 'payroll_officer'), ctrl.getTodayStatus);
router.get('/all', auth, allow('admin', 'hr_officer', 'payroll_officer'), ctrl.getAllAttendances);
router.get('/employee/:id', auth, allow('admin', 'hr_officer', 'payroll_officer'), ctrl.getEmployeeAttendance);
router.get('/summary/:id/:month/:year', auth, allow('admin', 'payroll_officer'), ctrl.getAttendanceSummary);
router.get('/weekly', auth, allow('admin', 'hr_officer', 'payroll_officer'), ctrl.getWeeklyAttendance);
router.get('/trend', auth, allow('admin', 'hr_officer', 'payroll_officer'), ctrl.getMonthlyAttendanceTrend);

module.exports = router;
