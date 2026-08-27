const express = require('express');
const AdminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// Sadece ADMIN rolü erişebilir
router.use(auth);
router.use(role(['ADMIN']));

router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.getAllUsers);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.delete('/users/:id', AdminController.deleteUser);

module.exports = router;
