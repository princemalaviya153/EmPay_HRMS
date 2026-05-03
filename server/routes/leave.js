const router = require('express').Router();
const ctrl = require('../controllers/leaveController');
const auth = require('../middleware/auth');
const { allow } = require('../middleware/roleCheck');

router.post('/apply', auth, ctrl.applyLeave);
router.get('/my', auth, ctrl.getMyLeaves);
router.get('/all', auth, allow('admin', 'hr_officer', 'payroll_officer'), ctrl.getAllLeaves);
router.put('/:id/approve', auth, allow('admin', 'hr_officer', 'payroll_officer'), ctrl.approveLeave);
router.put('/:id/reject', auth, allow('admin', 'hr_officer', 'payroll_officer'), ctrl.rejectLeave);
router.post('/allocate', auth, allow('admin', 'hr_officer'), ctrl.allocateLeave);

module.exports = router;
