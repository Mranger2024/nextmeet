module.exports = {
  apps: [
    {
      name: 'nextmeet-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
        NEXT_PUBLIC_SOCKET_URL: 'http://localhost:3001',
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      },
      watch: false,
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'nextmeet-socket',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: 3001,
        NODE_ENV: 'production',
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY
      },
      watch: false,
      autorestart: true,
      max_memory_restart: '1G'
    }
  ]
};