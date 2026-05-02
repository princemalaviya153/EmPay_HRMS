const router = require('express').Router();
const ctrl = require('../controllers/reportsController');
const auth = require('../middleware/auth');
const { allow } = require('../middleware/roleCheck');

router.get('/labor-cost', auth, allow('admin', 'payroll_officer'), ctrl.getLaborCostReport);
router.get('/headcount', auth, allow('admin', 'hr_officer'), ctrl.getHeadcountReport);
router.get('/salary-statement', auth, allow('admin', 'payroll_officer'), ctrl.getSalaryStatement);

module.exports = router;
