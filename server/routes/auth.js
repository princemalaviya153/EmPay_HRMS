const router = require('express').Router();
const { register, login, getMe, changePassword, getAllUsers, updateUserRole, deleteUser } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { allow } = require('../middleware/roleCheck');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/change-password', auth, changePassword);
router.get('/users', auth, allow('admin'), getAllUsers);
router.put('/users/:id/role', auth, allow('admin'), updateUserRole);
router.delete('/users/:id', auth, allow('admin'), deleteUser);

module.exports = router;
