// Hostinger VPS Deployment Configuration

module.exports = {
  // Application Settings
  app: {
    name: 'nextmeet',
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'production',
  },

  // Nginx Configuration
  nginx: {
    serverName: 'nextmeet.site', // Replace with your domain
    sslCertPath: '/etc/letsencrypt/live/nextmeet.site/fullchain.pem',
    sslKeyPath: '/etc/letsencrypt/live/nextmeet.site/privkey.pem',
    clientMaxBodySize: '50M',
    proxyTimeout: '60s',
    websocketTimeout: '60s',
  },

  // PM2 Process Manager Configuration
  pm2: {
    name: 'nextmeet',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
    },
  },

  // WebSocket Server Configuration
  websocket: {
    path: '/socket.io',
    transports: ['websocket'],
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  },

  // Database Configuration (if using external database)
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  // SSL/TLS Configuration for WebRTC
  webrtc: {
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
        ],
      },
    ],
  },
};