const express = require('express');
const auth = require('../middleware/authentication');
const authorize = require('../middleware/authrize');
const {
  searchUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers
} = require('../controllers/userController');

const router = express.Router();

router.use(auth);

router.route('/search').get(searchUsers);
router.route('/').get(authorize('admin'), getAllUsers);
router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;