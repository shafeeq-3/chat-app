const mongoose = require('mongoose');

const Conversation = mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GenzUser', required: true }],
    lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

Conversation.index({ participants: 1 });
Conversation.index({ lastMessageAt: -1 });

const conversationSchema = mongoose.model('GenzConversation', Conversation, 'genzconversations');
module.exports = { conversationSchema };


