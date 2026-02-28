const express = require('express')
const router = express.Router()
const { register, login, getMe } = require('../controllers/auth')
const authMiddleware = require('../middleware/authentication')
const { 
    adminMiddleware, 
    teacherMiddleware, 
    studentMiddleware 
} = require('../middleware/authorization')

// Public routes
router.post("/register", register)
router.post("/login", login)

// Protected routes
router.get("/me", authMiddleware, getMe)

// Test routes
router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        success: true,
        msg: "Welcome user",
        user: req.user
    });
});

router.get("/admin", authMiddleware, adminMiddleware, (req, res) => {
    res.json({ 
        success: true,
        msg: "Welcome Admin" 
    });
});

router.get("/teacher", authMiddleware, teacherMiddleware, (req, res) => {
    res.json({ 
        success: true,
        msg: "Welcome teacher" 
    });
});

router.get("/student", authMiddleware, studentMiddleware, (req, res) => {
    res.json({ 
        success: true,
        msg: "Welcome student" 
    });
});

module.exports = router