const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const cors = require('cors');

const app = express();

// Use CORS middleware
app.use(cors());

// Sentry request handler
app.use(Sentry.Handlers.requestHandler());

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
  // socket.on handlers with Sentry error capture
  socket.on('joinChannel', (channelId) => {
    try {
      socket.join(channelId);
    } catch (err) {
      Sentry.captureException(err);
    }
  });

  socket.on('leaveChannel', (channelId) => {
    try {
      socket.leave(channelId);
    } catch (err) {
      Sentry.captureException(err);
    }
  });

  socket.on('sendMessage', (message) => {
    try {
      io.to(message.channelId).emit('receiveMessage', message);
    } catch (err) {
      Sentry.captureException(err);
    }
  });

  // --- Reaction events ---
  socket.on('addReaction', (data) => {
    try {
      io.to(data.channelId).emit('reactionAdded', data);
    } catch (err) {
      Sentry.captureException(err);
    }
  });

  socket.on('removeReaction', (data) => {
    try {
      io.to(data.channelId).emit('reactionRemoved', data);
    } catch (err) {
      Sentry.captureException(err);
    }
  });

  socket.on('disconnect', () => {
    // No error expected here
  });
});

// Sentry error handler (after all routes/middleware)
app.use(Sentry.Handlers.errorHandler());

// Start the server
server.listen(PORT, () => {
  // console.log(`Socket.IO server running on port ${PORT}`);
  // console.log(`Environment: ${NODE_ENV}`);
  // console.log(`Client URL: ${CLIENT_URL}`);
});

// Optional: Log uncaught exceptions/rejections
process.on('uncaughtException', (err) => {
  Sentry.captureException(err);
});
process.on('unhandledRejection', (err) => {
  Sentry.captureException(err);
});
