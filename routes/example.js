const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authentication');
const { 
    adminMiddleware, 
    teacherMiddleware, 
    studentMiddleware,
    authorizeOwnerOrAdmin 
} = require('../middleware/authorization');
const User = require('../models/User');

router.use(authMiddleware);

router.get('/dashboard/stats', adminMiddleware, async (req, res) => {
    const stats = {
        totalStudents: await Student.countDocuments(),
        totalTeachers: await Teacher.countDocuments(),
        totalCourses: await Course.countDocuments()
    };
    res.json({ success: true, data: stats });
});

router.get('/courses/my-courses', teacherMiddleware, async (req, res) => {
    const courses = await Course.find({ teacherId: req.user.userId });
    res.json({ success: true, data: courses });
});

router.get('/courses/my-enrollments', studentMiddleware, async (req, res) => {
    const enrollments = await Enrollment.find({ studentId: req.user.userId })
        .populate('courseId');
    res.json({ success: true, data: enrollments });
});

router.get('/profile/:userId', 
    authorizeOwnerOrAdmin(async (req) => req.params.userId),
    async (req, res) => {
        const user = await User.findById(req.params.userId).select('-password');
        res.json({ success: true, data: user });
    }
);

router.get('/grades', authorize('admin', 'teacher', 'student'), async (req, res) => {
    let grades;
    if (req.user.role === 'student') {
        grades = await Grade.find({ studentId: req.user.userId });
    } else if (req.user.role === 'teacher') {
        grades = await Grade.find({ teacherId: req.user.userId });
    } else {
        grades = await Grade.find();
    }
    res.json({ success: true, data: grades });
});

module.exports = router;