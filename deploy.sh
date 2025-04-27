#!/bin/bash

# NextMeet.chat Deployment Script
# This script automates the deployment process for the NextMeet.chat application
# on a Hostinger VPS with the domain nextmeet.chat

# Exit on error
set -e

# Variables
APP_DIR="/var/www/nextmeet"
DOMAIN="nextmeet.chat"
GIT_REPO="git@github.com:yourusername/your-repo-name.git"

# Update system packages
echo "Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install required dependencies
echo "Installing dependencies..."
sudo apt install -y curl git nginx
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Create web directory if it doesn't exist
echo "Setting up web directory..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Clone repository if it doesn't exist, otherwise pull latest changes
if [ ! -d "$APP_DIR/.git" ]; then
  echo "Cloning repository..."
  git clone $GIT_REPO $APP_DIR
else
  echo "Updating repository..."
  cd $APP_DIR
  git pull
fi

# Install dependencies and build the application
echo "Installing Node.js dependencies..."
cd $APP_DIR
npm ci

echo "Building the application..."
npm run build

# Create PM2 configuration if it doesn't exist
if [ ! -f "$APP_DIR/ecosystem.config.js" ]; then
  echo "Creating PM2 configuration..."
  cat > $APP_DIR/ecosystem.config.js << 'EOL'
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
EOL
fi

# Start or restart the application with PM2
echo "Starting the application with PM2..."
pm2 start ecosystem.config.js || pm2 restart ecosystem.config.js

# Configure PM2 to start on boot
echo "Configuring PM2 to start on boot..."
pm2 startup
pm2 save

# Create Nginx configuration if it doesn't exist
if [ ! -f "/etc/nginx/sites-available/$DOMAIN" ]; then
  echo "Creating Nginx configuration..."
  sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << EOL
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

  # Enable the site
  echo "Enabling Nginx site..."
  sudo ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl restart nginx

  # Install Certbot and obtain SSL certificate
  echo "Setting up SSL with Let's Encrypt..."
  sudo apt install -y certbot python3-certbot-nginx
  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email your-email@example.com
fi

echo "Deployment completed successfully!"
echo "Your application is now running at https://$DOMAIN"