const express = require('express');
const authMiddleware = require('../middleware/authentication');
const { adminMiddleware } = require('../middleware/authorization');
const {
  searchUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers
} = require('../controllers/userController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Routes
router.route('/search').get(searchUsers);
router.route('/').get(adminMiddleware, getAllUsers);
router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(adminMiddleware, deleteUser);

module.exports = router;