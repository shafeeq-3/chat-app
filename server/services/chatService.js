const { conversationSchema } = require('../models/conversationModel');
const { messageSchema } = require('../models/messageModel');
const { userSchema } = require('../models/userModel');
const { ApiError } = require('../middlewares/ApiError');
const { isOnline } = require('./presenceService');
const mongoose = require('mongoose');

const getOrCreateConversation = async (userIdA, userIdB) => {
    const a = new mongoose.Types.ObjectId(userIdA);
    const b = new mongoose.Types.ObjectId(userIdB);
    const ids = [a, b].sort((x, y) => x.toString().localeCompare(y.toString()));
    let convo = await conversationSchema.findOne({ participants: { $all: ids, $size: 2 } });
    if (!convo) {
        convo = await conversationSchema.create({ participants: ids });
    }
    return convo;
};

const getConversations = async (userId) => {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const convos = await conversationSchema
        .find({ participants: userObjId })
        .sort({ lastMessageAt: -1 })
        .lean();
    return convos;
};

const getMessages = async (userId, otherUserId, limit = 50, before) => {
    const convo = await getOrCreateConversation(userId, otherUserId);
    const query = { conversation: convo._id };
    if (before) query.createdAt = { $lt: new Date(before) };
    const msgs = await messageSchema
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    return msgs.reverse();
};

const sendMessage = async (senderId, recipientId, content, imageUrl = '') => {
    if (!content && !imageUrl) {
        throw new ApiError(400, 'Message content or image is required');
    }
    const convo = await getOrCreateConversation(senderId, recipientId);
    const msg = await messageSchema.create({
        conversation: convo._id,
        sender: senderId,
        recipient: recipientId,
        content,
        imageUrl
    });
    await conversationSchema.findByIdAndUpdate(convo._id, { lastMessageAt: msg.createdAt });
    return msg;
};

const getFriends = async (userId) => {
    const user = await userSchema.findById(userId).lean();
    if (!user) throw new ApiError(404, 'User not found');
    const followers = new Set((user.followers || []).filter(Boolean).map(id => id.toString()));
    const following = new Set((user.following || []).filter(Boolean).map(id => id.toString()));

    // mutuals are friends; unilateral follows should also be visible to the follower
    const mutualIds = [...following].filter(id => followers.has(id));

    // anyone with whom there are messages should also be included
    const userObjId = new mongoose.Types.ObjectId(userId);
    const convoParticipants = await conversationSchema.aggregate([
        { $match: { participants: userObjId } },
        { $unwind: '$participants' },
        { $match: { participants: { $ne: userObjId } } },
        { $group: { _id: '$participants' } }
    ]);
    const messagedIds = convoParticipants.map(p => p._id.toString());

    // Include all users the current user follows (unilateral) + mutuals + messaged
    const friendIds = Array.from(new Set([...following, ...mutualIds, ...messagedIds])).filter(id => id && id !== userId.toString());
    const friends = await userSchema.find({ _id: { $in: friendIds } }).select('_id name username profilePicture isOnline lastActive').lean();

    // attach last message preview and unread count
    const friendsWithPreview = await Promise.all(friends.map(async (f) => {
        const convo = await getOrCreateConversation(userId, f._id);
        const lastMsg = await messageSchema.findOne({ conversation: convo._id }).sort({ createdAt: -1 }).lean();
        const unreadCount = await messageSchema.countDocuments({
            conversation: convo._id,
            recipient: userId,
            readAt: null
        });
        // Use database isOnline status first, fallback to memory
        const onlineStatus = f.isOnline !== undefined ? f.isOnline : isOnline(f._id);
        return {
            ...f,
            lastMessagePreview: lastMsg ? lastMsg.content || (lastMsg.imageUrl ? '📷 Image' : '') : '',
            lastMessageAt: lastMsg ? lastMsg.createdAt : null,
            unreadCount,
            isOnline: onlineStatus,
            lastActive: f.lastActive || null
        };
    }));
    return friendsWithPreview;
};

const getFriendRequests = async (userId) => {
    // treat incoming follows from users you don't follow back as friend requests
    const user = await userSchema.findById(userId).lean();
    if (!user) throw new ApiError(404, 'User not found');
    const followers = new Set((user.followers || []).filter(Boolean).map(id => id.toString()));
    const following = new Set((user.following || []).filter(Boolean).map(id => id.toString()));
    const incomingIds = [...followers].filter(id => !following.has(id));
    const incoming = await userSchema.find({ _id: { $in: incomingIds } }).select('_id name username profilePicture');
    return incoming;
};

const markMessagesAsRead = async (userId, otherUserId) => {
    const convo = await getOrCreateConversation(userId, otherUserId);
    await messageSchema.updateMany(
        { 
            conversation: convo._id, 
            recipient: userId, 
            readAt: null 
        },
        { 
            readAt: new Date() 
        }
    );
};

const getUnreadCount = async (userId, otherUserId) => {
    const convo = await getOrCreateConversation(userId, otherUserId);
    const count = await messageSchema.countDocuments({
        conversation: convo._id,
        recipient: userId,
        readAt: null
    });
    return count;
};

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    getFriends,
    getFriendRequests,
    markMessagesAsRead,
    getUnreadCount
};


