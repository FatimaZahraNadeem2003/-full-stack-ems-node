const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authentication');
const { adminMiddleware } = require('../middleware/authorization');
const {
  addCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  assignTeacher,
  getCourseStats
} = require('../controllers/courseController');

// All routes require authentication and admin access
router.use(authMiddleware);
router.use(adminMiddleware);

// Stats route (must be before /:id routes)
router.get('/stats', getCourseStats);

// Assign teacher route
router.post('/:courseId/assign-teacher', assignTeacher);

// Course routes
router.route('/')
  .post(addCourse)
  .get(getAllCourses);

router.route('/:id')
  .get(getCourseById)
  .put(updateCourse)
  .delete(deleteCourse);

module.exports = router;