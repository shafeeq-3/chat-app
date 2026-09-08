const notificationService = require('../services/notificationService');

const notificationController = {
    async getNotifications(req, res, next) {
        try {
            const userId = req.user._id;
            const limit = parseInt(req.query.limit) || 20;
            const notifications = await notificationService.getNotifications(userId, limit);
            res.status(200).json(notifications);
        } catch (error) {
            next(error);
        }
    },
    async markAsRead(req, res, next) {
        try {
            const notificationId = req.params.id;
            const userId = req.user._id;
            await notificationService.markAsRead(notificationId, userId);
            res.status(200).json({ message: 'Notification marked as read' });
        } catch (error) {
            next(error);
        }
    },
    async markAllAsRead(req, res, next) {
        try {
            const userId = req.user._id;
            await notificationService.markAllAsRead(userId);
            res.status(200).json({ message: 'All notifications marked as read' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = notificationController;
