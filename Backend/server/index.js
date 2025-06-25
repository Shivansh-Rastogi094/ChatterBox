import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST'],
  credentials: true
};

// Apply CORS to Express
app.use(cors(corsOptions));
app.use(express.json());

// Apply CORS to Socket.IO
const io = new Server(server, {
  cors: corsOptions
});

// In-memory store (you can replace with DB later)
const users = {};
const messages = [];

io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);

  socket.on('login', ({ username, avatar }) => {
    const userId = uuidv4();
    const user = {
      id: userId,
      username,
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
      socketId: socket.id,
      online: true
    };

    users[socket.id] = user;
    socket.emit('login_success', user);
    io.emit('users_update', Object.values(users));
    socket.emit('message_history', messages);

    const systemMessage = {
      id: uuidv4(),
      senderId: 'system',
      sender: 'System',
      text: `${username} has joined the chat`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };

    messages.push(systemMessage);
    io.emit('new_message', systemMessage);
  });

  socket.on('send_message', (messageData) => {
    const user = users[socket.id];
    if (!user) return;

    const message = {
      id: uuidv4(),
      senderId: user.id,
      sender: user.username,
      senderAvatar: user.avatar,
      text: messageData.text,
      timestamp: new Date().toISOString(),
      type: 'user'
    };

    messages.push(message);
    io.emit('new_message', message);
  });

  socket.on('typing', (isTyping) => {
    const user = users[socket.id];
    if (user) {
      socket.broadcast.emit('user_typing', {
        userId: user.id,
        username: user.username,
        isTyping
      });
    }
  });

  socket.on('private_message', ({ recipientId, text }) => {
    const sender = users[socket.id];
    if (!sender) return;

    const recipientSocketId = Object.keys(users).find(
      socketId => users[socketId].id === recipientId
    );

    if (!recipientSocketId) return;

    const privateMessage = {
      id: uuidv4(),
      senderId: sender.id,
      sender: sender.username,
      senderAvatar: sender.avatar,
      recipientId,
      text,
      timestamp: new Date().toISOString(),
      type: 'private'
    };

    socket.emit('new_private_message', privateMessage);
    io.to(recipientSocketId).emit('new_private_message', privateMessage);
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      delete users[socket.id];
      io.emit('users_update', Object.values(users));

      const systemMessage = {
        id: uuidv4(),
        senderId: 'system',
        sender: 'System',
        text: `${user.username} has left the chat`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };

      messages.push(systemMessage);
      io.emit('new_message', systemMessage);
    }

    console.log('❌ Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
