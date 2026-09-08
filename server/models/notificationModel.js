const mongoose = require('mongoose');

const Notification = mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GenzUser',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GenzUser',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'follow', 'reply'],
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GenzPost',
        default: null
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
Notification.index({ recipient: 1, createdAt: -1 });

const notificationSchema = mongoose.model('GenzNotification', Notification, 'genznotifications');
module.exports = { notificationSchema };
