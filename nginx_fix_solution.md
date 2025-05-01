# Fixing Nginx Configuration for nextmeet.chat

## Problem Identified

Your domain `nextmeet.chat` is showing the default Nginx welcome page instead of your NextMeet application. This happens because Nginx is not properly configured to proxy requests to your Next.js application running on port 3000.

The error message in your Nginx configuration test indicates that the symbolic link in the sites-enabled directory is pointing to a directory instead of a configuration file:

```
2025/04/28 03:29:13 [crit] 16777#16777: pread() "/etc/nginx/sites-enabled/nextmeet.chat" failed (21: Is a directory)
nginx: configuration file /etc/nginx/nginx.conf test failed
```

## Solution Steps

Follow these steps on your server to fix the issue:

1. **Connect to your server via SSH**

2. **Remove the incorrect symbolic link**:
   ```bash
   sudo rm /etc/nginx/sites-enabled/nextmeet.chat
   ```

3. **Create the proper configuration file** in sites-available:
   ```bash
   sudo nano /cd /nextmeet.chat
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

8. **Verify that your application is running**:
   Make sure your Next.js application and Socket.IO server are running with PM2:
   ```bash
   pm2 status
   ```

   If they're not running, start them with:
   ```bash
   pm2 start ecosystem.config.js
   ```

## Explanation

The issue was that the symbolic link in the sites-enabled directory was pointing to a directory instead of a file. By removing the incorrect link and creating a new one that points to the proper configuration file, we ensure that Nginx can read the configuration correctly.

The configuration file contains all the necessary settings for the NextMeet.chat application, including:
- HTTP to HTTPS redirection
- SSL certificate configuration
- Proxy settings for the Next.js frontend (port 3000) and Socket.IO server (port 3001)
- Static file handling
- Security headers
- Gzip compression

After applying these changes, your domain `nextmeet.chat` should properly serve your NextMeet application instead of the default Nginx welcome page.