# NextMeet.chat Deployment Fix Guide

## Problem Identified

You're experiencing an issue where your domain `nextmeet.chat` is showing the default Nginx welcome page instead of your NextMeet application, while the direct IP address `http://168.231.106.194:3000` correctly displays your application.

This indicates two potential issues:

1. The Nginx configuration is not properly set up to proxy requests to your Next.js application
2. There might be an issue with the symbolic link in the Nginx sites-enabled directory

## Complete Solution

Follow these steps to fix the issue:

### Part 1: Fix Nginx Configuration

1. **Connect to your server via SSH**

2. **Remove the incorrect symbolic link**:
   ```bash
   sudo rm /etc/nginx/sites-enabled/nextmeet.chat
   ```

3. **Create the proper configuration file** in sites-available:
   ```bash
   sudo nano /etc/nginx/sites-available/nextmeet.chat
   ```

4. **Copy and paste the following Nginx configuration** into the file:
   ```nginx
   # Nginx configuration for nextmeet.chat

   # HTTP server block - redirects all traffic to HTTPS
   server {
       listen 80;
       server_name nextmeet.chat www.nextmeet.chat;
       
       # Redirect all HTTP requests to HTTPS
       return 301 https://$server_name$request_uri;
   }

   # HTTPS server block
   server {
       listen 443 ssl http2;
       server_name nextmeet.chat www.nextmeet.chat;

       # SSL configuration
       ssl_certificate /etc/letsencrypt/live/nextmeet.chat/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/nextmeet.chat/privkey.pem;
       ssl_session_timeout 1d;
       ssl_session_cache shared:SSL:50m;
       ssl_session_tickets off;

       # Modern SSL configuration
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
       ssl_prefer_server_ciphers off;

       # HSTS (uncomment if you're sure)
       # add_header Strict-Transport-Security "max-age=63072000" always;

       # Root directory for static files
       root /var/www/nextmeet.chat/public;

       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header Referrer-Policy "no-referrer-when-downgrade" always;

       # Proxy settings
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;

       # Next.js frontend
       location / {
           proxy_pass http://localhost:3000;
       }

       # Socket.IO server
       location /socket.io/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }

       # API endpoints
       location /api/ {
           proxy_pass http://localhost:3000;
       }

       # Static files
       location /static/ {
           expires 30d;
           access_log off;
           add_header Cache-Control "public, no-transform";
       }

       # Favicon
       location = /favicon.ico {
           access_log off;
           log_not_found off;
       }

       # robots.txt
       location = /robots.txt {
           access_log off;
           log_not_found off;
       }

       # Gzip compression
       gzip on;
       gzip_vary on;
       gzip_proxied any;
       gzip_comp_level 6;
       gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;
   }
   ```

5. **Create a new symbolic link**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/nextmeet.chat /etc/nginx/sites-enabled/
   ```

6. **Test the Nginx configuration**:
   ```bash
   sudo nginx -t
   ```

7. **If the test passes, reload Nginx**:
   ```bash
   sudo systemctl reload nginx
   ```

### Part 2: Verify PM2 Processes

Ensure your NextMeet application processes are running correctly with PM2:

1. **Check the status of your PM2 processes**:
   ```bash
   pm2 status
   ```

   You should see two processes running:
   - `nextmeet-frontend` (your Next.js application on port 3000)
   - `nextmeet-socket` (your Socket.IO server on port 3001)

2. **If the processes are not running**, start them with:
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **If the processes are running but you're still seeing the Nginx welcome page**, restart them to ensure they're using the latest configuration:
   ```bash
   pm2 restart all
   ```

### Part 3: Verify Local Accessibility

After ensuring your PM2 processes are running, verify that they're accessible locally on the server:

1. **Check if the Next.js application is responding locally**:
   ```bash
   curl http://localhost:3000
   ```
   This should return HTML content from your application, not an error.

2. **Check if the Socket.IO server is running**:
   ```bash
   curl http://localhost:3001
   ```
   This should return some response, even if it's just a 404 page (since Socket.IO might not respond to direct HTTP requests).

## Troubleshooting

If you're still experiencing issues after following the steps above, check the following:

1. **Nginx error logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. **PM2 logs for the frontend application**:
   ```bash
   pm2 logs nextmeet-frontend
   ```

3. **PM2 logs for the socket server**:
   ```bash
   pm2 logs nextmeet-socket
   ```

4. **Verify that your server's firewall allows traffic on ports 80 and 443**:
   ```bash
   sudo ufw status
   ```

## Explanation

The issue was that the symbolic link in the Nginx sites-enabled directory was pointing to a directory instead of a configuration file. This is indicated by the error message:

```
pread() "/etc/nginx/sites-enabled/nextmeet.chat" failed (21: Is a directory)
```

By removing the incorrect link and creating a new one that points to the proper configuration file, we ensure that Nginx can read the configuration correctly and proxy requests to your Next.js application running on port 3000 and your Socket.IO server running on port 3001.

The configuration file contains all the necessary settings for the NextMeet.chat application, including:
- HTTP to HTTPS redirection
- SSL certificate configuration
- Proxy settings for the Next.js frontend and Socket.IO server
- Static file handling
- Security headers
- Gzip compression

After applying these changes, your domain `nextmeet.chat` should properly serve your NextMeet application instead of the default Nginx welcome page.

## Note

Remember that DNS changes can take some time to propagate, so if you've recently updated your domain's DNS settings, it might take a few hours for the changes to take effect worldwide.