const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authentication');
const { adminMiddleware } = require('../middleware/authorization');
const {
  addTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getTeacherStats
} = require('../controllers/teacherController');

// All routes require authentication and admin access
router.use(authMiddleware);
router.use(adminMiddleware);

// Stats route
router.get('/stats', getTeacherStats);

// Teacher routes
router.route('/')
  .post(addTeacher)
  .get(getAllTeachers);

router.route('/:id')
  .get(getTeacherById)
  .put(updateTeacher)
  .delete(deleteTeacher);

module.exports = router;