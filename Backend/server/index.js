import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store users and messages in memory (would use a database in production)
const users = {};
const messages = [];

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle user login
  socket.on('login', ({ username, avatar }) => {
    // Create a new user object
    const userId = uuidv4();
    const user = {
      id: userId,
      username,
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
      socketId: socket.id,
      online: true
    };
    
    // Store user
    users[socket.id] = user;
    
    // Send the user their own info
    socket.emit('login_success', user);
    
    // Send the updated users list to all clients
    io.emit('users_update', Object.values(users));
    
    // Send message history to the new user
    socket.emit('message_history', messages);
    
    // Broadcast a system message that a new user has joined
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
  
  // Handle new messages
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
    
    // Store the message
    messages.push(message);
    
    // Broadcast the message to all clients
    io.emit('new_message', message);
  });
  
  // Handle typing indicator
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
  
  // Handle private messages
  socket.on('private_message', ({ recipientId, text }) => {
    const sender = users[socket.id];
    
    if (!sender) return;
    
    // Find the recipient's socket ID
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
    
    // Send the private message to the sender and recipient only
    socket.emit('new_private_message', privateMessage);
    io.to(recipientSocketId).emit('new_private_message', privateMessage);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users[socket.id];
    
    if (user) {
      // Remove the user
      delete users[socket.id];
      
      // Send the updated users list to all clients
      io.emit('users_update', Object.values(users));
      
      // Broadcast a system message that the user has left
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
    
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});