const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const cors = require('cors');

const app = express();

// Use CORS middleware
app.use(cors());

const server = http.createServer(app);

// Configure CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
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
    io.to(data.channelId).emit('reactionAdded', data);
  });

  socket.on('removeReaction', (data) => {
    // data: { messageId, emoji, userId, channelId }
    io.to(data.channelId).emit('reactionRemoved', data);
  });

  socket.on('disconnect', () => {
    // console.log('User disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  // console.log(`Socket.IO server running on port ${PORT}`);
});
