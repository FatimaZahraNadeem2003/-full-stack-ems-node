const express = require('express');
const authMiddleware = require('../middleware/authentication');
const { authorizeAdmin } = require('../middleware/authorization');
const {
  searchUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers
} = require('../controllers/userController');

const router = express.Router();

router.use(authMiddleware);

router.route('/search').get(searchUsers);
router.route('/').get(authorizeAdmin, getAllUsers);
router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(authorizeAdmin, deleteUser);

module.exports = router;