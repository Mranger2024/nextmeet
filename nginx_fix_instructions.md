# Nginx Configuration Fix Instructions

## Issue Identified

The Nginx configuration test is failing with the error:

```
2025/04/28 03:29:13 [crit] 16777#16777: pread() "/etc/nginx/sites-enabled/nextmeet.chat" failed (21: Is a directory)
nginx: configuration file /etc/nginx/nginx.conf test failed
```

This error indicates that Nginx is treating the configuration file as a directory instead of a file. This happens when the symbolic link in the sites-enabled directory is pointing to a directory instead of a configuration file.

## Solution

Follow these steps to fix the issue:

1. **Remove the incorrect symbolic link**:
   ```bash
   sudo rm /etc/nginx/sites-enabled/nextmeet.chat
   ```

2. **Create the proper configuration file** in sites-available:
   ```bash
   sudo nano /etc/nginx/sites-available/nextmeet.chat
   ```

3. **Copy the Nginx configuration** from the `nextmeet.chat` file in this directory to the file you just created.

4. **Create a new symbolic link**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/nextmeet.chat /etc/nginx/sites-enabled/
   ```

5. **Test the Nginx configuration**:
   ```bash
   sudo nginx -t
   ```

6. **If the test passes, reload Nginx**:
   ```bash
   sudo systemctl reload nginx
   ```

## Explanation

The error occurred because the symbolic link in the sites-enabled directory was pointing to a directory instead of a file. By removing the incorrect link and creating a new one that points to the proper configuration file, we ensure that Nginx can read the configuration correctly.

The configuration file contains all the necessary settings for the NextMeet.chat application, including:
- HTTP to HTTPS redirection
- SSL certificate configuration
- Proxy settings for the Next.js frontend and Socket.IO server
- Static file handling
- Security headers
- Gzip compression