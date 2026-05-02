const router = require('express').Router();
const ctrl   = require('../controllers/payrollController');
const auth   = require('../middleware/auth');
const { allow } = require('../middleware/roleCheck');

const hr = allow('admin', 'payroll_officer');

router.post('/generate',         auth, hr, ctrl.generatePayrun);
router.post('/run/validate',     auth, hr, ctrl.validatePayrun);   // validate entire payrun

router.get('/',                  auth, hr, ctrl.getAllPayrolls);
router.get('/my',                auth,     ctrl.getMyPayslips);
router.get('/employee/:id',      auth, hr, ctrl.getEmployeePayroll);
router.get('/payslip/:id',       auth,     ctrl.getPayslip);

router.put('/run/validate',      auth, hr, ctrl.validatePayrun);
router.put('/:id/validate',      auth, hr, ctrl.validatePayroll);  // validate single payslip
router.put('/:id/cancel',        auth, hr, ctrl.cancelPayroll);
router.put('/:id',               auth, hr, ctrl.updatePayroll);

module.exports = router;
