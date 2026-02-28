const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authentication');
const { 
    authorizeAdmin, 
    authorizeTeacher, 
    authorizeStudent,
    authorize 
} = require('../middleware/authorization');

router.get('/public', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Public route - no auth required',
        timestamp: new Date().toISOString()
    });
});

router.get('/protected', authMiddleware, (req, res) => {
    res.json({ 
        success: true, 
        message: 'Protected route - any authenticated user',
        user: req.user
    });
});

router.get('/admin', authMiddleware, authorizeAdmin, (req, res) => {
    res.json({ 
        success: true, 
        message: 'Admin only route',
        user: req.user
    });
});

router.get('/teacher', authMiddleware, authorizeTeacher, (req, res) => {
    res.json({ 
        success: true, 
        message: 'Teacher route (admins allowed)',
        user: req.user
    });
});

router.get('/student', authMiddleware, authorizeStudent, (req, res) => {
    res.json({ 
        success: true, 
        message: 'Student route (admins allowed)',
        user: req.user
    });
});

router.get('/staff', authMiddleware, authorize('admin', 'teacher'), (req, res) => {
    res.json({ 
        success: true, 
        message: 'Staff route - admin or teacher',
        user: req.user
    });
});

router.get('/my-role', authMiddleware, (req, res) => {
    const roleInfo = {
        admin: req.user.role === 'admin',
        teacher: req.user.role === 'teacher',
        student: req.user.role === 'student',
        permissions: {
            canManageUsers: ['admin'].includes(req.user.role),
            canManageCourses: ['admin', 'teacher'].includes(req.user.role),
            canViewGrades: ['admin', 'teacher', 'student'].includes(req.user.role),
            canEnroll: ['admin', 'student'].includes(req.user.role)
        }
    };
    
    res.json({ 
        success: true, 
        message: 'Your role information',
        user: req.user,
        roleInfo
    });
});

module.exports = router;