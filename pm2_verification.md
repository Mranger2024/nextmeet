# Verifying PM2 Processes for NextMeet.chat

## Checking PM2 Status

To ensure your NextMeet application is running correctly, you should verify that both the frontend and socket server processes are active in PM2. Follow these steps:

1. **Connect to your server via SSH**

2. **Check the status of your PM2 processes**:
   ```bash
   pm2 status
   ```

   You should see two processes running:
   - `nextmeet-frontend` (your Next.js application on port 3000)
   - `nextmeet-socket` (your Socket.IO server on port 3001)

3. **If the processes are not running**, start them with:
   ```bash
   pm2 start ecosystem.config.js
   ```

4. **If the processes are running but you're still seeing the Nginx welcome page**, restart them to ensure they're using the latest configuration:
   ```bash
   pm2 restart all
   ```

## Verifying Application Accessibility

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

If your PM2 processes are running but you're still seeing the Nginx welcome page after fixing the Nginx configuration, check the following:

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

## Complete Solution

After applying both the Nginx configuration fix from the previous document and ensuring your PM2 processes are running correctly, your NextMeet.chat application should be accessible through your domain name instead of showing the default Nginx welcome page.

Remember that DNS changes can take some time to propagate, so if you've recently updated your domain's DNS settings, it might take a few hours for the changes to take effect worldwide.