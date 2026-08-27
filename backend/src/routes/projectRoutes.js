const express = require('express');
const ProjectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth); // Tüm Proje endpoint'leri giriş yapmayı gerektirir

router.get('/', ProjectController.getProjects);
router.post('/', ProjectController.createProject);
router.get('/:id', ProjectController.getProjectById);
router.put('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

// Ekip Üyesi Yönetimi
router.post('/:id/members', ProjectController.addMember);
router.delete('/:id/members/:memberUserId', ProjectController.removeMember);

module.exports = router;
