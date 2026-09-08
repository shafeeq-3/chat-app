const chatService = require('../services/chatService');
const { uploadImage } = require('../utils/imageUpload');

const chatController = {
    async getFriends(req, res, next) {
        try {
            const data = await chatService.getFriends(req.user._id);
            res.status(200).json(data);
        } catch (e) { next(e); }
    },
    async getFriendRequests(req, res, next) {
        try {
            const data = await chatService.getFriendRequests(req.user._id);
            res.status(200).json(data);
        } catch (e) { next(e); }
    },
    async getMessages(req, res, next) {
        try {
            const { otherUserId } = req.params;
            const { limit, before } = req.query;
            const data = await chatService.getMessages(req.user._id, otherUserId, parseInt(limit) || 50, before);
            res.status(200).json(data);
        } catch (e) { next(e); }
    },
    async sendMessage(req, res, next) {
        try {
            const { recipientId, content, imageUrl } = req.body;
            const msg = await chatService.sendMessage(req.user._id, recipientId, content, imageUrl);
            res.status(201).json(msg);
        } catch (e) { next(e); }
    },
    async uploadChatImage(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided' });
            }
            const imageUrl = await uploadImage(req.file.buffer, 'chat-images');
            res.status(200).json({ imageUrl });
        } catch (e) { 
            next(e); 
        }
    }
};

module.exports = chatController;


