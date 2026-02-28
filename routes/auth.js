const express = require('express')
const router = express.Router()
const { register, login, getMe } = require('../controllers/auth')
const authMiddleware = require('../middleware/authentication')
const { 
    authorizeAdmin, 
    authorizeTeacher, 
    authorizeStudent 
} = require('../middleware/authorization')

router.post("/register", register)
router.post("/login", login)
router.get("/me", authMiddleware, getMe)

router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        success: true,
        msg: "Welcome user",
        user: req.user
    });
});

router.get("/admin", authMiddleware, authorizeAdmin, (req, res) => {
    res.json({ 
        success: true,
        msg: "Welcome Admin" 
    });
});

router.get("/teacher", authMiddleware, authorizeTeacher, (req, res) => {
    res.json({ 
        success: true,
        msg: "Welcome teacher" 
    });
});

router.get("/student", authMiddleware, authorizeStudent, (req, res) => {
    res.json({ 
        success: true,
        msg: "Welcome student" 
    });
});

module.exports = router