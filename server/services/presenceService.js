const onlineUsers = new Map(); // userId -> socketId
const socketToUser = new Map(); // socketId -> userId

const setOnline = (userId, socketId) => {
    const uid = userId.toString();
    onlineUsers.set(uid, socketId);
    socketToUser.set(socketId, uid);
};

const setOffline = (userId) => {
    const uid = userId.toString();
    const sid = onlineUsers.get(uid);
    if (sid) socketToUser.delete(sid);
    onlineUsers.delete(uid);
};

const getUserIdBySocket = (socketId) => socketToUser.get(socketId) || null;

const isOnline = (userId) => onlineUsers.has(userId.toString());

const getOnlineSet = () => new Set([...onlineUsers.keys()]);

module.exports = { setOnline, setOffline, isOnline, getOnlineSet, getUserIdBySocket };


