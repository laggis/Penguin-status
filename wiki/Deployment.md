# 🚀 Deployment Guide

This guide covers deploying Penguin Status in production environments with various deployment methods and best practices.

## 📋 Pre-Deployment Checklist

### System Requirements
- ✅ **Node.js** 16.0.0 or higher
- ✅ **2GB RAM** minimum (4GB recommended)
- ✅ **1GB disk space** for database and logs
- ✅ **SSL certificate** for HTTPS (recommended)
- ✅ **Domain name** or static IP
- ✅ **Firewall configuration**

### Security Checklist
- ✅ Change default admin credentials
- ✅ Generate secure JWT secret (64+ characters)
- ✅ Configure CORS origins
- ✅ Set up SSL/TLS encryption
- ✅ Configure firewall rules
- ✅ Enable rate limiting
- ✅ Set up log rotation
- ✅ Configure backup strategy

## 🖥️ Traditional Server Deployment

### 1. Server Preparation

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash penguin-status
sudo usermod -aG sudo penguin-status
```

#### CentOS/RHEL
```bash
# Update system
sudo yum update -y

# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create application user
sudo useradd -m penguin-status
```

### 2. Application Setup

```bash
# Switch to application user
sudo su - penguin-status

# Clone repository
git clone https://github.com/your-username/penguin-status.git
cd penguin-status

# Install dependencies
npm ci --production

# Create production environment file
cp .env.example .env
nano .env
```

### 3. Production Environment Configuration

```env
# Production .env file
NODE_ENV=production
PORT=3001
DOMAIN=https://status.yourdomain.com

# Security
JWT_SECRET=your-super-secure-64-character-jwt-secret-key-here-generated
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Database
DB_PATH=/home/penguin-status/data/uptime_monitor.db

# Logging
LOG_LEVEL=warn
LOG_FILE=/home/penguin-status/logs/app.log
LOG_MAX_SIZE=50m
LOG_MAX_FILES=10

# Discord notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url

# Performance
CHECK_INTERVAL=60
TIMEOUT=30000
MAX_REDIRECTS=5
```

### 4. Directory Structure

```bash
# Create necessary directories
mkdir -p /home/penguin-status/data
mkdir -p /home/penguin-status/logs
mkdir -p /home/penguin-status/backups

# Set permissions
chmod 755 /home/penguin-status/data
chmod 755 /home/penguin-status/logs
chmod 700 /home/penguin-status/backups
```

## 🔄 PM2 Process Management

### 1. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'penguin-status',
    script: 'server.js',
    cwd: '/home/penguin-status/penguin-status',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/home/penguin-status/logs/pm2-error.log',
    out_file: '/home/penguin-status/logs/pm2-out.log',
    log_file: '/home/penguin-status/logs/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'data'],
    restart_delay: 5000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### 2. Start with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the instructions to run the generated command with sudo

# Check status
pm2 status
pm2 logs penguin-status
```

### 3. PM2 Management Commands

```bash
# Application management
pm2 restart penguin-status
pm2 stop penguin-status
pm2 delete penguin-status

# Monitoring
pm2 monit
pm2 logs penguin-status --lines 100
pm2 show penguin-status

# Updates
pm2 reload penguin-status  # Zero-downtime reload
pm2 restart penguin-status  # Standard restart
```

## 🐳 Docker Deployment

### 1. Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S penguin-status -u 1001

# Set working directory
WORKDIR /app

# Copy application files
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Create necessary directories
RUN mkdir -p /app/database /app/logs
RUN chown -R penguin-status:nodejs /app

# Switch to non-root user
USER penguin-status

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "server.js"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  penguin-status:
    build: .
    container_name: penguin-status
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DOMAIN=https://status.yourdomain.com
    env_file:
      - .env
    volumes:
      - ./data:/app/database
      - ./logs:/app/logs
      - ./backups:/app/backups
    networks:
      - penguin-network
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: penguin-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - penguin-status
    networks:
      - penguin-network

networks:
  penguin-network:
    driver: bridge

volumes:
  penguin-data:
  penguin-logs:
```

### 3. Docker Commands

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f penguin-status

# Update application
docker-compose pull
docker-compose up -d

# Backup data
docker-compose exec penguin-status tar -czf /app/backups/backup-$(date +%Y%m%d).tar.gz /app/database

# Scale (if needed)
docker-compose up -d --scale penguin-status=2
```

## 🌐 Reverse Proxy Setup

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/penguin-status
server {
    listen 80;
    server_name status.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name status.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # API Rate Limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Login Rate Limiting
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://127.0.0.1:3001;
    }
}
```

### Apache Configuration

```apache
# /etc/apache2/sites-available/penguin-status.conf
<VirtualHost *:80>
    ServerName status.yourdomain.com
    Redirect permanent / https://status.yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName status.yourdomain.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/yourdomain.com.crt
    SSLCertificateKeyFile /etc/ssl/private/yourdomain.com.key
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
    
    # Security Headers
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # Proxy Configuration
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3001/
    ProxyPassReverse / http://127.0.0.1:3001/
    
    # WebSocket Support
    RewriteEngine on
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://127.0.0.1:3001/$1" [P,L]
</VirtualHost>
```

## ☁️ Cloud Deployment

### AWS EC2 Deployment

#### 1. Launch EC2 Instance
```bash
# Launch Ubuntu 20.04 LTS instance
# Recommended: t3.small or larger
# Security Group: Allow ports 22, 80, 443
```

#### 2. Setup Script
```bash
#!/bin/bash
# AWS EC2 setup script

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx

# Install PM2
sudo npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash penguin-status

# Clone and setup application
sudo su - penguin-status
git clone https://github.com/your-username/penguin-status.git
cd penguin-status
npm ci --production

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d status.yourdomain.com

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### DigitalOcean Droplet

#### 1. One-Click App
- Use Node.js one-click app
- Choose appropriate droplet size
- Add SSH keys
- Enable monitoring

#### 2. Setup Commands
```bash
# Connect to droplet
ssh root@your-droplet-ip

# Run deployment script
wget https://raw.githubusercontent.com/your-username/penguin-status/main/scripts/deploy-digitalocean.sh
chmod +x deploy-digitalocean.sh
./deploy-digitalocean.sh
```

### Google Cloud Platform

#### 1. Compute Engine
```bash
# Create VM instance
gcloud compute instances create penguin-status \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --machine-type=e2-small \
    --tags=http-server,https-server

# Setup firewall rules
gcloud compute firewall-rules create allow-penguin-status \
    --allow tcp:80,tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --target-tags http-server,https-server
```

#### 2. App Engine (Alternative)
```yaml
# app.yaml
runtime: nodejs18
service: default

env_variables:
  NODE_ENV: production
  PORT: 8080
  DOMAIN: https://your-project.appspot.com

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

resources:
  cpu: 1
  memory_gb: 1
  disk_size_gb: 10
```

## 🔒 SSL/TLS Setup

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d status.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Custom Certificate

```bash
# Copy certificate files
sudo cp yourdomain.com.crt /etc/ssl/certs/
sudo cp yourdomain.com.key /etc/ssl/private/

# Set permissions
sudo chmod 644 /etc/ssl/certs/yourdomain.com.crt
sudo chmod 600 /etc/ssl/private/yourdomain.com.key
```

## 📊 Monitoring & Logging

### System Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Log Management

```bash
# Logrotate configuration
sudo nano /etc/logrotate.d/penguin-status
```

```
/home/penguin-status/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 penguin-status penguin-status
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 🔄 Backup Strategy

### Database Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/home/penguin-status/backups"
DB_PATH="/home/penguin-status/data/uptime_monitor.db"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
cp "$DB_PATH" "$BACKUP_DIR/uptime_monitor_$DATE.db"

# Compress backup
gzip "$BACKUP_DIR/uptime_monitor_$DATE.db"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete

echo "Backup completed: uptime_monitor_$DATE.db.gz"
```

### Automated Backups

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /home/penguin-status/scripts/backup.sh

# Weekly full backup
0 3 * * 0 /home/penguin-status/scripts/full-backup.sh
```

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
pm2 logs penguin-status
tail -f /home/penguin-status/logs/app.log

# Check permissions
ls -la /home/penguin-status/data/
ls -la /home/penguin-status/logs/

# Check environment
cat /home/penguin-status/penguin-status/.env
```

#### High Memory Usage
```bash
# Monitor memory
htop
pm2 monit

# Restart application
pm2 restart penguin-status

# Check for memory leaks
node --inspect server.js
```

#### SSL Certificate Issues
```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run

# Check Nginx configuration
sudo nginx -t
sudo systemctl reload nginx
```

### Performance Optimization

#### Node.js Optimization
```bash
# Increase memory limit
node --max-old-space-size=2048 server.js

# Enable cluster mode
pm2 start ecosystem.config.js --instances max
```

#### Database Optimization
```sql
-- Optimize SQLite database
VACUUM;
ANALYZE;
PRAGMA optimize;
```

## 📈 Scaling

### Horizontal Scaling

```javascript
// ecosystem.config.js - Multiple instances
module.exports = {
  apps: [{
    name: 'penguin-status',
    script: 'server.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### Load Balancer Setup

```nginx
# Nginx load balancer
upstream penguin_backend {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    location / {
        proxy_pass http://penguin_backend;
    }
}
```

---

## 📞 Need Help?

For deployment assistance:

1. Check the [Troubleshooting Guide](Troubleshooting)
2. Review [deployment examples](https://github.com/your-username/penguin-status/tree/main/deployment)
3. [Ask for help](https://github.com/your-username/penguin-status/discussions) in GitHub Discussions

---

*Deployment guide last updated: December 2024*