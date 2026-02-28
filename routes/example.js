const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authentication');
const { 
    authorize, 
    authorizeAdmin, 
    authorizeTeacher, 
    authorizeStudent,
    authorizeOwnerOrAdmin 
} = require('../middleware/authorization');
const User = require('../models/User');

router.get('/public', (req, res) => {
    res.json({ message: 'Public route' });
});

router.use(authMiddleware);

router.get('/admin-only', authorizeAdmin, (req, res) => {
    res.json({ message: 'Admin route', user: req.user });
});

router.get('/teacher-only', authorizeTeacher, (req, res) => {
    res.json({ message: 'Teacher route', user: req.user });
});

router.get('/student-only', authorizeStudent, (req, res) => {
    res.json({ message: 'Student route', user: req.user });
});

router.get('/multiple-roles', authorize('admin', 'teacher'), (req, res) => {
    res.json({ message: 'Admin or Teacher route', user: req.user });
});

router.get('/profile/:userId', 
    authorizeOwnerOrAdmin(async (req) => req.params.userId),
    async (req, res) => {
        const user = await User.findById(req.params.userId).select('-password');
        res.json({ user });
    }
);

module.exports = router;