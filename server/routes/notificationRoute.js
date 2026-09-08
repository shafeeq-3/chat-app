const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middlewares/auth');

router.route("/")
.get(auth, notificationController.getNotifications);

router.route("/:id/read")
.patch(auth, notificationController.markAsRead);

router.route("/read-all")
.patch(auth, notificationController.markAllAsRead);

module.exports = router;
