const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { auth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.route('/friends').get(auth, chatController.getFriends);
router.route('/friend-requests').get(auth, chatController.getFriendRequests);
router.route('/messages/:otherUserId').get(auth, chatController.getMessages);
router.route('/messages').post(auth, chatController.sendMessage);
router.route('/upload-image').post(auth, upload.single('image'), chatController.uploadChatImage);

module.exports = router;


