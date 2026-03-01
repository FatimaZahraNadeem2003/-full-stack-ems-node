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

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', getCourseStats);

router.post('/:courseId/assign-teacher', assignTeacher);

router.route('/')
  .post(addCourse)
  .get(getAllCourses);

router.route('/:id')
  .get(getCourseById)
  .put(updateCourse)
  .delete(deleteCourse);

module.exports = router;