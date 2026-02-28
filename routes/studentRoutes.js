const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authentication');
const { adminMiddleware } = require('../middleware/authorization');
const {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

// All routes require authentication and admin access
router.use(authMiddleware);
router.use(adminMiddleware);

// Student routes
router.route('/')
  .post(addStudent)
  .get(getAllStudents);

router.route('/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;