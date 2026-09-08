const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.route("/getuser")
.get(auth, userController.getUser)
.patch(auth, upload.single('profilePicture'), userController.updateUser);

router.route("/:id")
.get(auth, userController.getUserById);

router.route("/:id/follow")
.post(auth, userController.toggleFollow);

router.route("/suggested/users")
.get(auth, userController.getSuggestedUsers);

router.route("/:id/followers")
.get(auth, userController.getFollowers);

router.route("/:id/following")
.get(auth, userController.getFollowing);

router.route("/:id/remove-follower")
.post(auth, userController.removeFollower);

router.route("/search/users")
.get(auth, userController.searchUsers);

module.exports = router;
