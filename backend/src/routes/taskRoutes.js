const express = require('express');
const TaskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth); // Tüm Görev endpoint'leri giriş gerektirir

router.post('/', TaskController.createTask);
router.put('/:id', TaskController.updateTask);
router.patch('/:id/status', TaskController.updateTaskStatus);
router.delete('/:id', TaskController.deleteTask);

module.exports = router;
