# Little Haven Socket Server

Real-time messaging server for the Little Haven application using Socket.IO.

## Deployment Options

### Option 1: Railway (Recommended)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Connect your GitHub repository
   - Select the `socket-server` directory
   - Railway will auto-detect Node.js

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   CLIENT_URL=https://your-app-domain.vercel.app
   PORT=3001
   ```

4. **Get Deployment URL**
   - Railway will provide a URL like: `https://your-app-railway.up.railway.app`
   - Use this as your `NEXT_PUBLIC_SOCKET_URL`

### Option 2: Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Set root directory: `socket-server`

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   CLIENT_URL=https://your-app-domain.vercel.app
   ```

### Option 3: DigitalOcean App Platform

1. **Create DigitalOcean Account**
   - Go to [digitalocean.com](https://digitalocean.com)

2. **Create App**
   - Connect your GitHub repository
   - Select Node.js environment
   - Set source directory to `socket-server`

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   CLIENT_URL=https://your-app-domain.vercel.app
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `CLIENT_URL` | Your Next.js app URL | Yes (production) |
| `NODE_ENV` | Environment | No (default: development) |

## Local Development

```bash
cd socket-server
npm install
npm run dev
```

## Production Checklist

- [ ] Deploy socket server to Railway/Render/DigitalOcean
- [ ] Set environment variables
- [ ] Update `NEXT_PUBLIC_SOCKET_URL` in your Next.js app
- [ ] Test real-time messaging
- [ ] Monitor logs for any issues

## Troubleshooting

### CORS Issues
- Ensure `CLIENT_URL` is set correctly
- Add your domain to the CORS origins in `server.js`

### Connection Issues
- Check if the socket server URL is accessible
- Verify environment variables are set correctly
- Check server logs for errors 