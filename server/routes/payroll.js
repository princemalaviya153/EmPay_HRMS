const router = require('express').Router();
const ctrl = require('../controllers/payrollController');
const auth = require('../middleware/auth');
const { allow } = require('../middleware/roleCheck');

router.post('/generate', auth, allow('admin', 'payroll_officer'), ctrl.generatePayrun);
router.get('/', auth, allow('admin', 'payroll_officer'), ctrl.getAllPayrolls);
router.get('/my', auth, ctrl.getMyPayslips);
router.get('/employee/:id', auth, allow('admin', 'payroll_officer'), ctrl.getEmployeePayroll);
router.get('/payslip/:id', auth, ctrl.getPayslip);
router.put('/:id', auth, allow('admin', 'payroll_officer'), ctrl.updatePayroll);
router.put('/:id/cancel', auth, allow('admin', 'payroll_officer'), ctrl.cancelPayroll);

module.exports = router;
