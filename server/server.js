require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const routes = require('./routes/index');
const { convertToApiError } = require('./middlewares/ApiError');
const { handleError } = require('./middlewares/ApiError');
const cors = require('cors');
const passport = require('./middlewares/passport');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const chatService = require('./services/chatService');
const { setOnline, setOffline, getUserIdBySocket } = require('./services/presenceService');
const { userSchema } = require('./models/userModel');

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
app.use(passport.initialize());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.log('MongoDB connection error:', error)) 
 




app.use('/api', routes);

app.use(convertToApiError);

app.use((err, req, res, next) => {
    handleError(err, res);
})


const io = new Server(server, {
    cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', (socket) => {
    socket.on('join', async (userId) => {
        if (userId) {
            socket.join(userId.toString());
            setOnline(userId, socket.id);
            const now = new Date();
            try {
                await userSchema.findByIdAndUpdate(userId, { 
                    lastActive: now,
                    isOnline: true 
                });
            } catch (err) {
                console.error('Error updating user status:', err);
            }
            io.emit('presence_update', { 
                userId, 
                isOnline: true, 
                lastActive: now.toISOString() 
            });
        }
    });

    socket.on('send_message', async (payload, ack) => {
        try {
            const { senderId, recipientId, content, imageUrl, clientMessageId } = payload || {};
            const msg = await chatService.sendMessage(senderId, recipientId, content, imageUrl);
            const msgDto = {
                _id: msg._id,
                conversation: msg.conversation,
                sender: msg.sender,
                recipient: msg.recipient,
                content: msg.content,
                imageUrl: msg.imageUrl,
                createdAt: msg.createdAt,
                readAt: msg.readAt,
                clientMessageId: clientMessageId || null
            };
            io.to(senderId.toString()).emit('new_message', msgDto);
            io.to(recipientId.toString()).emit('new_message', msgDto);
            if (typeof ack === 'function') ack({ ok: true, message: msgDto });
        } catch (e) {
            if (typeof ack === 'function') ack({ ok: false, error: e.message });
        }
    });

    socket.on('typing', (data) => {
        const { userId, recipientId, isTyping } = data;
        io.to(recipientId.toString()).emit('user_typing', { userId, isTyping });
    });

    socket.on('mark_read', async (data) => {
        try {
            const { userId, otherUserId } = data;
            await chatService.markMessagesAsRead(userId, otherUserId);
            io.to(otherUserId.toString()).emit('messages_read', { userId });
        } catch (e) {
            console.error('Error marking messages as read:', e);
        }
    });

    socket.on('disconnect', async () => {
        const userId = getUserIdBySocket(socket.id);
        if (userId) {
            setOffline(userId);
            const when = new Date();
            try {
                await userSchema.findByIdAndUpdate(userId, { 
                    lastActive: when,
                    isOnline: false 
                });
                io.emit('presence_update', { 
                    userId, 
                    isOnline: false, 
                    lastActive: when.toISOString() 
                });
            } catch (err) {
                console.error('Error updating user status on disconnect:', err);
            }
        }
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

