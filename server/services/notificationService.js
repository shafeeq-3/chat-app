const { notificationSchema } = require('../models/notificationModel');
const { userSchema } = require('../models/userModel');
const { ApiError } = require('../middlewares/ApiError');

const createNotification = async (recipientId, senderId, type, message, postId = null) => {
    try {
        // Don't create notification if sender and recipient are the same
        if (recipientId.toString() === senderId.toString()) {
            return null;
        }

        const notification = new notificationSchema({
            recipient: recipientId,
            sender: senderId,
            type,
            message,
            post: postId
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

const getNotifications = async (userId, limit = 20) => {
    try {
        const notifications = await notificationSchema
            .find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('sender', '_id name username profilePicture')
            .lean();

        // Format notifications with time
        const formattedNotifications = notifications.map(notif => {
            const timeAgo = getTimeAgo(notif.createdAt);
            return {
                id: notif._id,
                user: notif.sender?.username || notif.sender?.name || 'Unknown User',
                userId: notif.sender?._id,
                profilePicture: notif.sender?.profilePicture,
                action: notif.message,
                time: timeAgo,
                read: notif.read,
                type: notif.type,
                postId: notif.post
            };
        });

        return formattedNotifications;
    } catch (error) {
        throw error;
    }
};

const markAsRead = async (notificationId, userId) => {
    try {
        const notification = await notificationSchema.findOne({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            throw new ApiError(404, 'Notification not found');
        }

        notification.read = true;
        await notification.save();
        return notification;
    } catch (error) {
        throw error;
    }
};

const markAllAsRead = async (userId) => {
    try {
        await notificationSchema.updateMany(
            { recipient: userId, read: false },
            { read: true }
        );
    } catch (error) {
        throw error;
    }
};

// Helper function to calculate time ago
const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' year' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' month' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' day' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hour' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' min ago';
    
    return Math.floor(seconds) + ' sec ago';
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead
};
