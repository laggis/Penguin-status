# 🔧 Troubleshooting Guide

This guide helps you diagnose and resolve common issues with Penguin Status.

## 🚨 Quick Diagnostics

### Health Check Commands

```bash
# Check application status
curl http://localhost:3001/api/status

# Check system resources
htop
df -h
free -m

# Check logs
tail -f logs/app.log
pm2 logs penguin-status

# Check database
ls -la database/
sqlite3 database/uptime_monitor.db ".tables"
```

### System Information

```bash
# Node.js version
node --version
npm --version

# System information
uname -a
cat /etc/os-release

# Network connectivity
ping -c 4 8.8.8.8
curl -I https://google.com
```

## 🚀 Installation Issues

### Node.js Version Errors

**Problem**: `Error: Node.js version 14.x.x is not supported`

**Solution**:
```bash
# Check current version
node --version

# Install Node.js 18.x (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Node.js 18.x (CentOS/RHEL)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Using Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### NPM Installation Failures

**Problem**: `npm install` fails with permission errors

**Solution**:
```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Alternative: Use npm prefix
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem**: `EACCES: permission denied` during installation

**Solution**:
```bash
# Use npm ci instead of npm install
npm ci

# Or install with --unsafe-perm
npm install --unsafe-perm

# Fix ownership
sudo chown -R $USER:$USER .
```

### Missing Dependencies

**Problem**: `MODULE_NOT_FOUND` errors

**Solution**:
```bash
# Check package.json exists
ls -la package.json

# Install missing dependencies
npm install

# Install specific missing module
npm install bcryptjs sqlite3 express

# Rebuild native modules
npm rebuild
```

## 🗄️ Database Issues

### Database Connection Errors

**Problem**: `SQLITE_CANTOPEN: unable to open database file`

**Solution**:
```bash
# Check database directory exists
mkdir -p database

# Check permissions
ls -la database/
chmod 755 database/
chmod 644 database/uptime_monitor.db

# Check disk space
df -h

# Check if file is locked
lsof database/uptime_monitor.db
```

**Problem**: `Database is locked`

**Solution**:
```bash
# Find processes using the database
lsof database/uptime_monitor.db

# Kill blocking processes
pkill -f "node.*server.js"

# Remove lock file if exists
rm -f database/uptime_monitor.db-wal
rm -f database/uptime_monitor.db-shm

# Restart application
npm start
```

### Database Corruption

**Problem**: `SQLITE_CORRUPT: database disk image is malformed`

**Solution**:
```bash
# Backup corrupted database
cp database/uptime_monitor.db database/uptime_monitor.db.corrupt

# Try to recover
sqlite3 database/uptime_monitor.db ".recover" > recovered.sql
sqlite3 database/uptime_monitor_new.db < recovered.sql

# Replace with recovered database
mv database/uptime_monitor.db database/uptime_monitor.db.old
mv database/uptime_monitor_new.db database/uptime_monitor.db

# If recovery fails, restore from backup
cp backups/latest_backup.db database/uptime_monitor.db
```

### Database Performance Issues

**Problem**: Slow database queries

**Solution**:
```sql
-- Connect to database
sqlite3 database/uptime_monitor.db

-- Analyze database
ANALYZE;

-- Vacuum database
VACUUM;

-- Check database size
.dbinfo

-- Optimize
PRAGMA optimize;
```

## 🌐 Network & Connectivity Issues

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE :::3001`

**Solution**:
```bash
# Find process using port 3001
lsof -i :3001
netstat -tulpn | grep :3001

# Kill process using the port
sudo kill -9 <PID>

# Or use different port
PORT=3002 npm start

# Update .env file
echo "PORT=3002" >> .env
```

### Firewall Issues

**Problem**: Cannot access application from external network

**Solution**:
```bash
# Check if port is open (Ubuntu/Debian)
sudo ufw status
sudo ufw allow 3001

# Check if port is open (CentOS/RHEL)
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload

# Check if service is listening
netstat -tulpn | grep :3001
ss -tulpn | grep :3001
```

### DNS Resolution Issues

**Problem**: Cannot resolve domain names in monitors

**Solution**:
```bash
# Test DNS resolution
nslookup google.com
dig google.com

# Check DNS configuration
cat /etc/resolv.conf

# Test with different DNS servers
nslookup google.com 8.8.8.8
nslookup google.com 1.1.1.1

# Update DNS servers
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
echo "nameserver 1.1.1.1" | sudo tee -a /etc/resolv.conf
```

## 🔐 Authentication Issues

### Cannot Login

**Problem**: Invalid username or password

**Solution**:
```bash
# Check if admin user exists
sqlite3 database/uptime_monitor.db "SELECT * FROM users;"

# Reset admin password
node -e "
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 12);
console.log('UPDATE users SET password = \'' + hash + '\' WHERE username = \'admin\';');
" | sqlite3 database/uptime_monitor.db

# Or recreate admin user
sqlite3 database/uptime_monitor.db "DELETE FROM users WHERE username = 'admin';"
rm database/uptime_monitor.db
npm start
```

### JWT Token Issues

**Problem**: `Invalid or expired token`

**Solution**:
```bash
# Check JWT secret in .env
grep JWT_SECRET .env

# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env file
echo "JWT_SECRET=your-new-secret-here" >> .env

# Restart application
pm2 restart penguin-status
```

### Session Timeout

**Problem**: Frequent logouts

**Solution**:
```bash
# Increase session timeout in .env
echo "SESSION_TIMEOUT=24h" >> .env

# Or set longer timeout
echo "SESSION_TIMEOUT=7d" >> .env

# Restart application
npm restart
```

## 📊 Monitoring Issues

### Monitors Not Running

**Problem**: Monitors show "pending" status

**Solution**:
```bash
# Check application logs
tail -f logs/app.log

# Check monitor service status
curl http://localhost:3001/api/system/status

# Restart monitoring service
curl -X POST http://localhost:3001/api/monitors/restart \
  -H "Authorization: Bearer $TOKEN"

# Check for errors in console
node server.js
```

### False Positives

**Problem**: Monitors showing down when service is up

**Solution**:
```bash
# Test monitor manually
curl -I https://example.com
ping -c 4 example.com
telnet example.com 80

# Check monitor configuration
curl http://localhost:3001/api/monitors/1 \
  -H "Authorization: Bearer $TOKEN"

# Increase timeout
# Update monitor with longer timeout
curl -X PUT http://localhost:3001/api/monitors/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"timeout": 60000}'
```

### High Response Times

**Problem**: Monitors reporting slow response times

**Solution**:
```bash
# Test network latency
ping -c 10 target-server.com
traceroute target-server.com

# Test from different location
curl -w "@curl-format.txt" -o /dev/null -s https://example.com

# Check server resources
htop
iotop
netstat -i

# Optimize monitor settings
# Reduce check frequency for slow services
# Increase timeout for slow responses
```

## 🔔 Notification Issues

### Discord Notifications Not Working

**Problem**: No Discord notifications received

**Solution**:
```bash
# Test webhook URL
curl -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message from Penguin Status"}'

# Check webhook URL format
echo $DISCORD_WEBHOOK_URL
# Should be: https://discord.com/api/webhooks/ID/TOKEN

# Check application logs
grep -i discord logs/app.log

# Test notification endpoint
curl -X POST http://localhost:3001/api/notifications/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "discord", "message": "Test"}'
```

### Email Notifications Not Working

**Problem**: Email notifications not being sent

**Solution**:
```bash
# Check SMTP configuration
grep -i smtp .env

# Test SMTP connection
telnet smtp.gmail.com 587

# Check authentication
# Verify username/password
# Check if 2FA is enabled (use app password)

# Test with different SMTP provider
# Gmail: smtp.gmail.com:587
# Outlook: smtp-mail.outlook.com:587
# Yahoo: smtp.mail.yahoo.com:587
```

## 🚀 Performance Issues

### High Memory Usage

**Problem**: Application consuming too much memory

**Solution**:
```bash
# Monitor memory usage
htop
pm2 monit

# Check for memory leaks
node --inspect server.js
# Open chrome://inspect in Chrome

# Increase Node.js memory limit
node --max-old-space-size=2048 server.js

# Restart application periodically
pm2 start ecosystem.config.js --max-memory-restart 1G

# Optimize database
sqlite3 database/uptime_monitor.db "VACUUM; ANALYZE;"
```

### High CPU Usage

**Problem**: Application using too much CPU

**Solution**:
```bash
# Monitor CPU usage
top
htop

# Check monitor intervals
# Reduce check frequency for non-critical monitors
# Increase intervals from 30s to 60s or more

# Optimize monitor settings
# Reduce timeout values
# Disable unnecessary features

# Use cluster mode
pm2 start ecosystem.config.js --instances max
```

### Slow Dashboard Loading

**Problem**: Dashboard takes long time to load

**Solution**:
```bash
# Check database size
ls -lh database/uptime_monitor.db

# Clean old heartbeat data
sqlite3 database/uptime_monitor.db "
DELETE FROM heartbeats 
WHERE timestamp < datetime('now', '-30 days');
VACUUM;
"

# Enable compression in reverse proxy
# Add gzip compression to Nginx/Apache

# Optimize frontend
# Clear browser cache
# Check network tab in browser dev tools
```

## 🔒 SSL/TLS Issues

### SSL Certificate Errors

**Problem**: `CERT_HAS_EXPIRED` or `UNABLE_TO_VERIFY_LEAF_SIGNATURE`

**Solution**:
```bash
# Check certificate expiration
openssl x509 -in /etc/ssl/certs/yourdomain.crt -text -noout | grep "Not After"

# Renew Let's Encrypt certificate
sudo certbot renew
sudo systemctl reload nginx

# Test SSL configuration
ssl-checker yourdomain.com
curl -I https://yourdomain.com

# Check certificate chain
openssl s_client -connect yourdomain.com:443 -showcerts
```

### Mixed Content Warnings

**Problem**: Browser shows mixed content warnings

**Solution**:
```bash
# Update all HTTP URLs to HTTPS in configuration
grep -r "http://" .

# Update CORS_ORIGIN in .env
CORS_ORIGIN=https://yourdomain.com

# Update DOMAIN in .env
DOMAIN=https://yourdomain.com

# Check reverse proxy configuration
# Ensure proxy_set_header X-Forwarded-Proto $scheme;
```

## 🐳 Docker Issues

### Container Won't Start

**Problem**: Docker container exits immediately

**Solution**:
```bash
# Check container logs
docker logs penguin-status

# Run container interactively
docker run -it penguin-status /bin/sh

# Check Dockerfile
cat Dockerfile

# Rebuild image
docker build --no-cache -t penguin-status .

# Check environment variables
docker run --env-file .env penguin-status
```

### Volume Mount Issues

**Problem**: Data not persisting between container restarts

**Solution**:
```bash
# Check volume mounts
docker inspect penguin-status

# Verify host directory exists
ls -la ./data
mkdir -p ./data ./logs

# Fix permissions
sudo chown -R 1001:1001 ./data ./logs

# Update docker-compose.yml
volumes:
  - ./data:/app/database
  - ./logs:/app/logs
```

## 📱 Browser Issues

### Dashboard Not Loading

**Problem**: Blank page or loading errors

**Solution**:
```bash
# Check browser console for errors
# Press F12 → Console tab

# Clear browser cache
# Ctrl+Shift+R (hard refresh)
# Clear cookies and local storage

# Check if JavaScript is enabled
# Disable ad blockers temporarily

# Test in incognito/private mode
# Try different browser
```

### WebSocket Connection Issues

**Problem**: Real-time updates not working

**Solution**:
```bash
# Check WebSocket connection in browser
# F12 → Network tab → WS filter

# Check reverse proxy WebSocket support
# Nginx: proxy_set_header Upgrade $http_upgrade;
# Apache: RewriteRule for WebSocket

# Test WebSocket directly
wscat -c ws://localhost:3001

# Check firewall WebSocket support
# Some firewalls block WebSocket connections
```

## 🔍 Log Analysis

### Reading Application Logs

```bash
# View recent logs
tail -f logs/app.log

# Search for errors
grep -i error logs/app.log
grep -i "failed" logs/app.log

# View logs by date
grep "2024-12-20" logs/app.log

# Count error types
grep -i error logs/app.log | sort | uniq -c
```

### PM2 Logs

```bash
# View PM2 logs
pm2 logs penguin-status

# View specific log files
pm2 logs penguin-status --lines 100

# Monitor logs in real-time
pm2 logs penguin-status --follow

# Clear logs
pm2 flush penguin-status
```

### System Logs

```bash
# Check system logs
sudo journalctl -u penguin-status
sudo journalctl -f

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check system messages
sudo tail -f /var/log/syslog
sudo tail -f /var/log/messages
```

## 🆘 Emergency Recovery

### Complete System Recovery

```bash
# Stop all services
pm2 stop all
sudo systemctl stop nginx

# Backup current state
cp -r penguin-status penguin-status.backup
cp database/uptime_monitor.db database/uptime_monitor.db.backup

# Fresh installation
git clone https://github.com/your-username/penguin-status.git penguin-status-new
cd penguin-status-new
npm ci --production

# Restore database
cp ../database/uptime_monitor.db.backup database/uptime_monitor.db

# Restore configuration
cp ../penguin-status/.env .

# Start services
npm start
```

### Database Recovery

```bash
# Create emergency backup
cp database/uptime_monitor.db database/emergency_backup.db

# Try database repair
sqlite3 database/uptime_monitor.db "
.timeout 30000
.recover
" > recovered.sql

# Create new database from recovery
sqlite3 database/uptime_monitor_recovered.db < recovered.sql

# Replace original
mv database/uptime_monitor.db database/uptime_monitor_corrupted.db
mv database/uptime_monitor_recovered.db database/uptime_monitor.db
```

## 📞 Getting Help

### Information to Collect

When asking for help, provide:

```bash
# System information
node --version
npm --version
uname -a

# Application version
cat package.json | grep version

# Error logs
tail -50 logs/app.log
pm2 logs penguin-status --lines 50

# Configuration (remove sensitive data)
cat .env | sed 's/JWT_SECRET=.*/JWT_SECRET=***/' | sed 's/DISCORD_WEBHOOK_URL=.*/DISCORD_WEBHOOK_URL=***/' 

# Database status
ls -la database/
sqlite3 database/uptime_monitor.db ".tables"
```

### Support Channels

1. **GitHub Issues**: [Report bugs](https://github.com/your-username/penguin-status/issues)
2. **GitHub Discussions**: [Ask questions](https://github.com/your-username/penguin-status/discussions)
3. **Documentation**: [Check wiki](https://github.com/your-username/penguin-status/wiki)
4. **Community**: [Join Discord](https://discord.gg/your-invite)

### Before Reporting Issues

- ✅ Check this troubleshooting guide
- ✅ Search existing GitHub issues
- ✅ Try the latest version
- ✅ Test with minimal configuration
- ✅ Collect relevant logs and system info

---

## 🔧 Preventive Maintenance

### Regular Maintenance Tasks

```bash
# Weekly tasks
# Update dependencies
npm update

# Clean old logs
find logs/ -name "*.log" -mtime +30 -delete

# Vacuum database
sqlite3 database/uptime_monitor.db "VACUUM; ANALYZE;"

# Check disk space
df -h

# Monthly tasks
# Update system packages
sudo apt update && sudo apt upgrade

# Backup database
cp database/uptime_monitor.db backups/monthly_backup_$(date +%Y%m).db

# Review monitor performance
# Check for consistently slow monitors
# Review notification settings
```

### Monitoring the Monitor

```bash
# Setup external monitoring for Penguin Status itself
# Use external service to monitor your status page
# Setup alerts for high memory/CPU usage
# Monitor disk space
# Check SSL certificate expiration
```

---

*Troubleshooting guide last updated: December 2024*