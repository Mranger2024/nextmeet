# Deploying NextMeet to Hostinger VPS

This guide outlines the steps to deploy the NextMeet video chat application on a Hostinger VPS.

## Prerequisites

- A Hostinger VPS with root access
- A registered domain name pointing to your VPS
- Node.js 18+ installed
- PM2 process manager (`npm install -g pm2`)
- Nginx installed
- SSL certificate (Let's Encrypt recommended)

## Deployment Steps

1. **Clone and Setup Application**
   ```bash
   git clone <your-repository-url>
   cd nextmeet
   npm install
   npm run build
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update environment variables:
     ```env
     NODE_ENV=production
     PORT=3000
     # Add your database credentials
     DB_HOST=your-db-host
     DB_PORT=your-db-port
     DB_NAME=your-db-name
     DB_USER=your-db-user
     DB_PASSWORD=your-db-password
     ```

3. **SSL Certificate Setup**
   ```bash
   sudo certbot certonly --nginx -d your-domain.com
   ```

4. **Nginx Configuration**
   - Copy `deployment/nginx.conf` to `/etc/nginx/nginx.conf`
   - Update domain name and SSL certificate paths
   - Test and reload Nginx:
     ```bash
     sudo nginx -t
     sudo systemctl reload nginx
     ```

5. **PM2 Setup**
   ```bash
   # Start the application
   pm2 start npm --name "nextmeet" -- start
   
   # Enable startup script
   pm2 startup
   pm2 save
   ```

6. **WebSocket Server**
   ```bash
   # Start WebSocket server
   pm2 start npm --name "nextmeet-ws" -- run server
   pm2 save
   ```

## Post-Deployment Checks

1. Visit https://your-domain.com to verify the application loads
2. Test WebSocket connectivity
3. Verify video chat functionality
4. Check SSL certificate status

## Troubleshooting

- Check Nginx error logs: `/var/log/nginx/error.log`
- Check application logs: `pm2 logs`
- Verify SSL certificate renewal: `certbot certificates`

## Security Considerations

- Keep Node.js and npm packages updated
- Regularly update SSL certificates
- Monitor server resources
- Set up firewall rules
- Configure regular backups

## Maintenance

- Monitor server performance
- Set up log rotation
- Configure automated backups
- Set up monitoring alerts