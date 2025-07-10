const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const cors = require('cors');

const app = express();

// Use CORS middleware
app.use(cors());

const server = http.createServer(app);

// Get environment variables
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configure CORS for production
const io = new Server(server, {
  cors: {
    origin:
      NODE_ENV === 'production'
        ? [CLIENT_URL, 'https://littlehaven.io'] // Add your production domains
        : CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Enable both transports
});

io.on('connection', (socket) => {
  // console.log(`User connected: ${socket.id}`);

  socket.on('joinChannel', (channelId) => {
    socket.join(channelId);
    // console.log(`User ${socket.id} joined channel ${channelId}`);
  });

  socket.on('leaveChannel', (channelId) => {
    socket.leave(channelId);
    // console.log(`User ${socket.id} left channel ${channelId}`);
  });

  socket.on('sendMessage', (message) => {
    // console.log('Message received:', message);
    // Broadcast only to users in the same channel
    io.to(message.channelId).emit('receiveMessage', message);
  });

  // --- Reaction events ---
  socket.on('addReaction', (data) => {
    // data: { messageId, emoji, userId, channelId }
    // console.log('Reaction added:', data);
    io.to(data.channelId).emit('reactionAdded', data);
  });

  socket.on('removeReaction', (data) => {
    // data: { messageId, emoji, userId, channelId }
    // console.log('Reaction removed:', data);
    io.to(data.channelId).emit('reactionRemoved', data);
  });

  socket.on('disconnect', () => {
    // console.log('User disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  // console.log(`Socket.IO server running on port ${PORT}`);
  // console.log(`Environment: ${NODE_ENV}`);
  // console.log(`Client URL: ${CLIENT_URL}`);
});
