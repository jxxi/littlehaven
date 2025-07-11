# Little Haven Socket Server

Socket.IO server for Little Haven real-time messaging.

## Features

- Real-time messaging with Socket.IO
- Sentry error tracking and monitoring
- CORS support for cross-origin requests
- Production-ready configuration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
- `SENTRY_DSN`: Your Sentry DSN for error tracking
- `PORT`: Server port (default: 3001)
- `CLIENT_URL`: Your client application URL
- `NODE_ENV`: Environment (development/production)

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Sentry Integration

The server includes Sentry error tracking with the following features:
- Automatic error capture for socket events
- Request/response monitoring
- Uncaught exception handling
- Graceful fallbacks if Sentry is not available

## Deployment

The server is configured to work with Railway deployment. The Sentry integration has been updated to handle potential initialization issues and provide graceful fallbacks.

## Socket Events

- `joinChannel`: Join a channel
- `leaveChannel`: Leave a channel
- `sendMessage`: Send a message to a channel
- `addReaction`: Add a reaction to a message
- `removeReaction`: Remove a reaction from a message 