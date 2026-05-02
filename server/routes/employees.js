const router = require('express').Router();
const ctrl = require('../controllers/employeeController');
const auth = require('../middleware/auth');
const { allow } = require('../middleware/roleCheck');

router.get('/', auth, allow('admin', 'hr_officer', 'payroll_officer'), ctrl.getAllEmployees);
router.get('/departments', auth, ctrl.getDepartments);
router.post('/', auth, allow('admin', 'hr_officer'), ctrl.createEmployee);
router.get('/:id', auth, ctrl.getEmployee);
router.put('/:id', auth, ctrl.updateEmployee);
router.delete('/:id', auth, allow('admin'), ctrl.deleteEmployee);

module.exports = router;
