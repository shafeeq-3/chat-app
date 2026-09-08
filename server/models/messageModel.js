const mongoose = require('mongoose');

const Message = mongoose.Schema({
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'GenzConversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'GenzUser', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'GenzUser', required: true },
    content: { type: String, trim: true, default: '' },
    imageUrl: { type: String, default: '' },
    readAt: { type: Date, default: null }
}, { timestamps: true });

Message.index({ conversation: 1, createdAt: 1 });
Message.index({ sender: 1, recipient: 1, createdAt: -1 });

const messageSchema = mongoose.model('GenzMessage', Message, 'genzmessages');
module.exports = { messageSchema };


