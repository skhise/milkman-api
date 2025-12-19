# API Deployment Guide for Shared Hosting

## Prerequisites

1. **Shared hosting with Node.js support** (Node.js 18+ recommended)
2. **SSH access** to your server
3. **MySQL database** (usually provided by hosting)
4. **PM2 or similar process manager** (if available)

## Step-by-Step Deployment

### Step 1: Prepare Your Code

1. **Clean up unnecessary files** (optional but recommended):
   ```bash
   # Remove node_modules if you have it locally
   rm -rf node_modules
   rm -rf dist
   ```

2. **Ensure `.gitignore` is set up** (exclude sensitive files):
   - `node_modules/`
   - `.env`
   - `dist/`
   - `uploads/`

### Step 2: Upload Files to Server

**Option A: Using FTP/SFTP (FileZilla, WinSCP, etc.)**
- Upload entire `api` folder to your server (e.g., `/home/username/api` or `/public_html/api`)

**Option B: Using Git (if available)**
```bash
# On server
cd ~/api
git pull origin main
```

**Option C: Using SCP**
```bash
# From your local machine
scp -r api/ username@your-server.com:/home/username/api
```

### Step 3: Connect to Server via SSH

```bash
ssh username@your-server.com
cd ~/api  # or wherever you uploaded the files
```

### Step 4: Install Node.js Dependencies

```bash
# Make sure you're in the api directory
npm install --production
```

**Note:** If `npm install` fails, you might need to:
- Check Node.js version: `node --version` (should be 18+)
- Check npm version: `npm --version`
- Some shared hosts require installing dependencies in a specific way

### Step 5: Set Up Environment Variables

1. **Create `.env` file** on the server:
   ```bash
   cd ~/api
   nano .env  # or use vi/vim
   ```

2. **Copy from `env.example` and fill in your production values**:
   ```env
   # Database Configuration (from your hosting provider)
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

   # Server Configuration
   PORT=4000
   NODE_ENV=production

   # Frontend URL (your actual frontend domain)
   FRONTEND_URL=https://your-frontend-domain.com

   # SMS API Configuration
   SMS_API_KEY=your_sms_api_key_here
   SMS_ROUTE=2
   SMS_SENDER=ALERTS

   # Firebase Configuration (for Push Notifications)
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

   # Timezone for Cron Jobs
   TIMEZONE=Asia/Kolkata
   ```

3. **Save and secure the file**:
   ```bash
   chmod 600 .env  # Make it readable only by owner
   ```

### Step 6: Run Database Migrations

```bash
# Run migrations to set up database tables
npm run migrate
```

**If migration fails**, check:
- Database credentials in `.env`
- Database exists and user has proper permissions
- MySQL is running

### Step 7: Create Uploads Directory

```bash
mkdir -p uploads
chmod 755 uploads
```

### Step 8: Start the Application

**Option A: Using PM2 (Recommended - if available)**

1. **Install PM2 globally** (if not already installed):
   ```bash
   npm install -g pm2
   ```

2. **Start the application**:
   ```bash
   pm2 start src/server.ts --name milkman-api --interpreter ts-node
   ```

3. **Save PM2 configuration**:
   ```bash
   pm2 save
   pm2 startup  # Follow instructions to enable auto-start on reboot
   ```

4. **Useful PM2 commands**:
   ```bash
   pm2 list              # View running processes
   pm2 logs milkman-api   # View logs
   pm2 restart milkman-api  # Restart
   pm2 stop milkman-api     # Stop
   pm2 delete milkman-api   # Remove
   ```

**Option B: Using nohup (if PM2 not available)**

```bash
nohup npm start > api.log 2>&1 &
```

**Option C: Using screen/tmux**

```bash
screen -S milkman-api
npm start
# Press Ctrl+A then D to detach
```

### Step 9: Configure Reverse Proxy (if needed)

If your shared hosting uses Apache/Nginx, you may need to configure a reverse proxy.

**For Apache (.htaccess in public_html or api folder)**:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^api/(.*)$ http://localhost:4000/$1 [P,L]
</IfModule>
```

**For Nginx (if you have access)**:
```nginx
location /api {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Step 10: Set Up Domain/Subdomain (if applicable)

1. Point your domain/subdomain to the server
2. Configure DNS settings if needed
3. Update `FRONTEND_URL` in `.env` if changed

### Step 11: Test the Deployment

1. **Check if server is running**:
   ```bash
   curl http://localhost:4000/api/health
   ```

2. **Test from external**:
   ```bash
   curl https://your-domain.com/api/health
   ```

3. **Check logs**:
   ```bash
   # If using PM2
   pm2 logs milkman-api
   
   # If using nohup
   tail -f api.log
   ```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 4000
lsof -i :4000
# or
netstat -tulpn | grep 4000

# Kill the process or change PORT in .env
```

### Database Connection Issues
- Verify database credentials
- Check if MySQL is running
- Verify database user has proper permissions
- Check firewall settings

### Permission Issues
```bash
# Fix file permissions
chmod -R 755 ~/api
chmod 600 ~/api/.env
```

### Node.js Version Issues
```bash
# Check Node version
node --version

# If too old, you may need to:
# - Use nvm (Node Version Manager)
# - Contact hosting support
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --production
```

## Updating the Application

1. **Pull latest changes** (if using Git):
   ```bash
   cd ~/api
   git pull origin main
   ```

2. **Or upload new files** via FTP/SCP

3. **Install new dependencies** (if any):
   ```bash
   npm install --production
   ```

4. **Run migrations** (if database schema changed):
   ```bash
   npm run migrate
   ```

5. **Restart the application**:
   ```bash
   # PM2
   pm2 restart milkman-api
   
   # Or nohup
   pkill -f "npm start"
   nohup npm start > api.log 2>&1 &
   ```

## Security Checklist

- [ ] `.env` file has correct permissions (600)
- [ ] Strong `JWT_SECRET` (32+ characters)
- [ ] Database password is strong
- [ ] `NODE_ENV=production` is set
- [ ] CORS is configured correctly
- [ ] Firewall rules are set (if applicable)
- [ ] SSL/HTTPS is enabled
- [ ] Regular backups are configured

## Monitoring

### Check Application Status
```bash
pm2 status
```

### View Logs
```bash
pm2 logs milkman-api --lines 100
```

### Monitor Resources
```bash
pm2 monit
```

## Backup Strategy

1. **Database backups** (set up cron job):
   ```bash
   # Add to crontab
   0 2 * * * mysqldump -u user -p password dbname > /backups/db_$(date +\%Y\%m\%d).sql
   ```

2. **Code backups** (if not using Git):
   ```bash
   tar -czf api_backup_$(date +%Y%m%d).tar.gz ~/api
   ```

## Support

If you encounter issues:
1. Check application logs
2. Check server error logs
3. Verify all environment variables
4. Test database connection separately
5. Contact hosting support if needed
