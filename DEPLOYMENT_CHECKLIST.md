# Quick Deployment Checklist

## Pre-Deployment

- [ ] Code is tested and working locally
- [ ] All environment variables are documented
- [ ] Database backup is created (if updating existing)
- [ ] `.gitignore` excludes sensitive files

## Server Setup

- [ ] SSH access to server is working
- [ ] Node.js 18+ is installed (`node --version`)
- [ ] npm is installed (`npm --version`)
- [ ] MySQL database is created
- [ ] Database user has proper permissions

## File Upload

- [ ] All source files uploaded to server
- [ ] `.env` file created from `env.example`
- [ ] `.env` file has correct permissions (600)
- [ ] All environment variables filled in correctly

## Installation

- [ ] Run `npm install --production`
- [ ] No errors during installation
- [ ] `uploads/` directory created with proper permissions

## Database

- [ ] Database credentials in `.env` are correct
- [ ] Database connection test successful
- [ ] Run `npm run migrate` successfully
- [ ] All tables created correctly

## Application Start

- [ ] PM2 installed (optional but recommended)
- [ ] Application started successfully
- [ ] No errors in startup logs
- [ ] Health check endpoint works: `/api/health`

## Testing

- [ ] Health endpoint responds: `curl http://localhost:4000/api/health`
- [ ] API accessible from external URL (if configured)
- [ ] Authentication endpoints work
- [ ] Database operations work correctly

## Security

- [ ] `.env` file permissions set to 600
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Strong database password
- [ ] `NODE_ENV=production` set
- [ ] CORS configured correctly
- [ ] SSL/HTTPS enabled (if applicable)

## Monitoring

- [ ] PM2 auto-start configured (`pm2 startup`)
- [ ] Logs are accessible
- [ ] Monitoring set up (optional)

## Post-Deployment

- [ ] Application running stable
- [ ] All endpoints tested
- [ ] Error handling works
- [ ] Backup strategy in place
- [ ] Documentation updated

## Quick Commands Reference

```bash
# Install dependencies
npm install --production

# Run migrations
npm run migrate

# Start with PM2
pm2 start src/server.ts --name milkman-api --interpreter ts-node
pm2 save
pm2 startup

# View logs
pm2 logs milkman-api

# Restart
pm2 restart milkman-api

# Check status
pm2 status

# Test health endpoint
curl http://localhost:4000/api/health
```

## Troubleshooting Quick Fixes

```bash
# Port in use
lsof -i :4000
# Change PORT in .env

# Permission issues
chmod 600 .env
chmod -R 755 .

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --production

# Check logs
pm2 logs milkman-api --lines 100
```
