# NextMeet.chat Deployment Guide

This guide will walk you through deploying the NextMeet.chat application to a Hostinger VPS using SSH, GitHub, and configuring it with your domain name.

## Prerequisites

- A Hostinger VPS account
- SSH access to your VPS
- A GitHub account with your repository
- Domain name (nextmeet.chat) with DNS access
- Basic knowledge of Linux commands

## 1. Initial VPS Setup

### 1.1 Connect to Your VPS via SSH

```bash
ssh username@your_vps_ip
```

Replace `username` and `your_vps_ip` with the credentials provided by Hostinger.

### 1.2 Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Install Required Dependencies

```bash
# Install Node.js and npm
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v

# Install Git
sudo apt install -y git

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2
```

## 2. Configure GitHub Access

### 2.1 Generate SSH Key for GitHub

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### 2.2 Add SSH Key to SSH Agent

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### 2.3 Add SSH Key to GitHub

Display your public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy the output and add it to your GitHub account under Settings > SSH and GPG keys.

### 2.4 Test GitHub Connection

```bash
ssh -T git@github.com
```

## 3. Clone and Set Up Your Repository

### 3.1 Create Web Directory

```bash
sudo mkdir -p /var/www/nextmeet
sudo chown -R $USER:$USER /var/www/nextmeet
```

### 3.2 Clone Your Repository

```bash
cd /var/www/nextmeet
git clone git@github.com:yourusername/your-repo-name.git .
```

Replace `yourusername/your-repo-name` with your actual GitHub repository details.

### 3.3 Install Dependencies

```bash
npm ci
```

## 4. Environment Configuration

### 4.1 Create Environment Variables

Create a `.env.production` file with your production environment variables:

```bash
cp .env.example .env.production
nano .env.production
```

Update the following variables at minimum:

```
NEXT_PUBLIC_SOCKET_URL=https://nextmeet.chat
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. Build the NextJS Application

```bash
npm run build
```

## 6. Set Up PM2 for Process Management

### 6.1 Create PM2 Configuration

Create a file named `ecosystem.config.js`:

```bash
nano ecosystem.config.js
```

Add the following content:

```javascript
module.exports = {
  apps: [
    {
      name: 'nextmeet',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'socket-server',
      script: 'server/index.js',
      env: {
        PORT: 3001,
        NODE_ENV: 'production',
      },
    },
  ],
};
```

### 6.2 Start the Application with PM2

```bash
pm2 start ecosystem.config.js
```

### 6.3 Configure PM2 to Start on Boot

```bash
pm2 startup
```

Run the command that PM2 outputs to set up the startup script.

```bash
pm2 save
```

## 7. Configure Nginx as a Reverse Proxy

### 7.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/nextmeet
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name nextmeet.chat www.nextmeet.chat;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.2 Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/nextmeet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 8. Set Up SSL with Let's Encrypt

### 8.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 8.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d nextmeet.chat -d www.nextmeet.chat
```

Follow the prompts to complete the certificate setup.

## 9. Configure DNS for Your Domain

In your Hostinger control panel or domain registrar:

1. Create an A record pointing `nextmeet.chat` to your VPS IP address
2. Create an A record pointing `www.nextmeet.chat` to your VPS IP address

## 10. Set Up Continuous Deployment (Optional)

### 10.1 Create a Deployment Script

```bash
nano /var/www/nextmeet/deploy.sh
```

Add the following content:

```bash
#!/bin/bash
cd /var/www/nextmeet
git pull
npm ci
npm run build
pm2 restart all
```

Make the script executable:

```bash
chmod +x /var/www/nextmeet/deploy.sh
```

### 10.2 Set Up a GitHub Webhook

You can configure a GitHub webhook to trigger this script when changes are pushed to your repository.

## 11. Monitoring and Maintenance

### 11.1 Monitor Application Logs

```bash
pm2 logs
```

### 11.2 Monitor Nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 11.3 Update Your Application

To update your application after making changes to your GitHub repository:

```bash
cd /var/www/nextmeet
git pull
npm ci
npm run build
pm2 restart all
```

## Troubleshooting

### Check if Nginx is Running

```bash
sudo systemctl status nginx
```

### Check if Your Node.js Apps are Running

```bash
pm2 status
```

### Check Firewall Settings

Make sure ports 80 and 443 are open:

```bash
sudo ufw status
```

If needed, allow these ports:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### SSL Certificate Renewal

Let's Encrypt certificates expire after 90 days. Certbot typically sets up automatic renewal, but you can test the renewal process with:

```bash
sudo certbot renew --dry-run
```

## Conclusion

Your NextMeet.chat application should now be successfully deployed to your Hostinger VPS and accessible via your domain name with HTTPS enabled. The setup includes both the Next.js frontend and the Socket.IO server required for the video chat functionality.

For any issues or further customization, refer to the official documentation for [Next.js](https://nextjs.org/docs/deployment), [Nginx](https://nginx.org/en/docs/), and [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/).