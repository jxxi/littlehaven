/* eslint-disable no-console */
const Sentry = require('@sentry/node');

// Get environment variables early
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Sentry with error handling - make it optional
let sentryInitialized = false;
try {
  if (process.env.SENTRY_DSN) {
    console.log('Initializing Sentry');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: NODE_ENV,
      tracesSampleRate: 1.0,
    });
    sentryInitialized = true;
    console.log('Sentry initialized successfully');
  } else {
    console.log('Sentry DSN not found, skipping Sentry initialization');
  }
} catch (error) {
  console.error('Failed to initialize Sentry:', error);
  sentryInitialized = false;
}

const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const cors = require('cors');

const app = express();

// Use CORS middleware
app.use(cors());

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    sentryInitialized,
  });
});

// Sentry request handler - only if available and initialized
if (
  sentryInitialized &&
  Sentry &&
  Sentry.Handlers &&
  Sentry.Handlers.requestHandler
) {
  app.use(Sentry.Handlers.requestHandler());
}

const server = http.createServer(app);

// Get environment variables
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

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
  console.log('Client connected:', socket.id);

  // socket.on handlers with Sentry error capture
  socket.on('joinChannel', (channelId) => {
    try {
      socket.join(channelId);
      console.log(`Client ${socket.id} joined channel: ${channelId}`);
    } catch (err) {
      console.error('Error in joinChannel:', err);
      if (sentryInitialized && Sentry && Sentry.captureException) {
        Sentry.captureException(err);
      }
    }
  });

  socket.on('leaveChannel', (channelId) => {
    try {
      socket.leave(channelId);
      console.log(`Client ${socket.id} left channel: ${channelId}`);
    } catch (err) {
      console.error('Error in leaveChannel:', err);
      if (sentryInitialized && Sentry && Sentry.captureException) {
        Sentry.captureException(err);
      }
    }
  });

  socket.on('sendMessage', (message) => {
    try {
      io.to(message.channelId).emit('receiveMessage', message);
      console.log(`Message sent to channel: ${message.channelId}`);
    } catch (err) {
      console.error('Error in sendMessage:', err);
      if (sentryInitialized && Sentry && Sentry.captureException) {
        Sentry.captureException(err);
      }
    }
  });

  // --- Reaction events ---
  socket.on('addReaction', (data) => {
    try {
      io.to(data.channelId).emit('reactionAdded', data);
      console.log(`Reaction added in channel: ${data.channelId}`);
    } catch (err) {
      console.error('Error in addReaction:', err);
      if (sentryInitialized && Sentry && Sentry.captureException) {
        Sentry.captureException(err);
      }
    }
  });

  socket.on('removeReaction', (data) => {
    try {
      io.to(data.channelId).emit('reactionRemoved', data);
      console.log(`Reaction removed in channel: ${data.channelId}`);
    } catch (err) {
      console.error('Error in removeReaction:', err);
      if (sentryInitialized && Sentry && Sentry.captureException) {
        Sentry.captureException(err);
      }
    }
  });

  // --- Encryption events ---
  socket.on('shareEncryptionKey', (data) => {
    try {
      // Share key with all users in the channel
      io.to(data.channelId).emit('encryptionKeyShared', {
        channelId: data.channelId,
        keyData: data.keyData,
        sharedBy: data.userId,
        timestamp: new Date().toISOString(),
      });
      console.log(`Encryption key shared in channel: ${data.channelId}`);
    } catch (err) {
      console.error('Error in shareEncryptionKey:', err);
      if (sentryInitialized && Sentry && Sentry.captureException) {
        Sentry.captureException(err);
      }
    }
  });

  socket.on('keyRotationStarted', (data) => {
    try {
      // Notify all users in channel about key rotation
      io.to(data.channelId).emit('keyRotationNotification', {
        channelId: data.channelId,
        rotatedBy: data.userId,
        timestamp: new Date().toISOString(),
        message: 'Encryption key has been rotated',
      });
      console.log(`Key rotation started in channel: ${data.channelId}`);
    } catch (err) {
      console.error('Error in keyRotationStarted:', err);
      if (sentryInitialized && Sentry && Sentry.captureException) {
        Sentry.captureException(err);
      }
    }
  });

  socket.on('keyRotationCompleted', (data) => {
    try {
      // Notify all users that key rotation is complete
      io.to(data.channelId).emit('keyRotationComplete', {
        channelId: data.channelId,
        completedBy: data.userId,
        timestamp: new Date().toISOString(),
        newKeyId: data.newKeyId,
        messagesReEncrypted: data.messagesReEncrypted,
      });
      console.log(`Key rotation completed in channel: ${data.channelId}`);
    } catch (err) {
      console.error('Error in keyRotationCompleted:', err);
      if (sentryInitialized && Sentry && Sentry.captureException) {
        Sentry.captureException(err);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Sentry error handler (after all routes/middleware) - only if available and initialized
if (
  sentryInitialized &&
  Sentry &&
  Sentry.Handlers &&
  Sentry.Handlers.errorHandler
) {
  app.use(Sentry.Handlers.errorHandler());
}

// Start the server
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Client URL: ${CLIENT_URL}`);
  console.log(`Sentry initialized: ${sentryInitialized}`);
});

// Optional: Log uncaught exceptions/rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (sentryInitialized && Sentry && Sentry.captureException) {
    Sentry.captureException(err);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (sentryInitialized && Sentry && Sentry.captureException) {
    Sentry.captureException(reason);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
