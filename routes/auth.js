const express = require('express')
const router = express.Router()
const { register, login, getMe } = require('../controllers/auth')
const auth = require('../middleware/authentication')
const authorize = require('../middleware/authrize')

router.post("/register", register)
router.post("/login", login)
router.get("/me", auth, getMe)

router.get("/profile", auth, (req, res) => {
  res.json({
    success: true,
    msg: "Welcome user",
    user: req.user
  });
});

router.get("/admin", auth, authorize("admin"), (req, res) => {
  res.json({ 
    success: true,
    msg: "Welcome Admin" 
  });
});

router.get("/teacher", auth, authorize("teacher"), (req, res) => {
  res.json({ 
    success: true,
    msg: "Welcome teacher" 
  });
});

router.get("/student", auth, authorize("student"), (req, res) => {
  res.json({ 
    success: true,
    msg: "Welcome student" 
  });
});

module.exports = router