# ❓ Frequently Asked Questions (FAQ)

Common questions and answers about Penguin Status.

## 📋 Table of Contents

- [General Questions](#-general-questions)
- [Installation & Setup](#-installation--setup)
- [Monitoring](#-monitoring)
- [Notifications](#-notifications)
- [Performance](#-performance)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [Advanced Usage](#-advanced-usage)

## 🌟 General Questions

### What is Penguin Status?

Penguin Status is a self-hosted uptime monitoring solution that helps you track the availability and performance of your websites, APIs, and services. It provides real-time monitoring, alerting, and beautiful status pages.

### Why choose Penguin Status over other solutions?

- **🆓 Free & Open Source**: No subscription fees or usage limits
- **🏠 Self-Hosted**: Full control over your data and infrastructure
- **🎨 Beautiful UI**: Modern, responsive interface with dark/light themes
- **🔔 Multiple Notifications**: Discord, email, webhooks, Slack, and more
- **📊 Detailed Analytics**: Response times, uptime statistics, and trends
- **🐧 Lightweight**: Minimal resource usage, runs on small VPS instances
- **🔧 Easy Setup**: Quick installation with Docker or npm

### What types of monitoring does it support?

- **HTTP/HTTPS**: Website and API monitoring
- **Ping (ICMP)**: Network connectivity checks
- **TCP Port**: Service port availability
- **DNS**: Domain name resolution
- **SSL Certificate**: Certificate expiration monitoring
- **Custom Scripts**: Advanced monitoring scenarios

### Is it suitable for production use?

**Yes!** Penguin Status is designed for production environments and includes:
- High availability features
- Database backup capabilities
- SSL/TLS support
- Rate limiting and security features
- Comprehensive logging
- Docker deployment support

## 🚀 Installation & Setup

### What are the system requirements?

**Minimum Requirements:**
- **OS**: Linux, Windows, or macOS
- **RAM**: 512MB (1GB recommended)
- **Storage**: 1GB free space
- **Node.js**: Version 16 or higher
- **Database**: SQLite (included) or PostgreSQL/MySQL

**Recommended for Production:**
- **RAM**: 2GB or more
- **CPU**: 2+ cores
- **Storage**: SSD with 10GB+ free space
- **Network**: Stable internet connection

### Can I use a different database?

**Yes!** While SQLite is the default, you can configure:
- **PostgreSQL** (recommended for production)
- **MySQL/MariaDB**
- **MongoDB** (experimental)

Example PostgreSQL configuration:
```env
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://user:password@localhost:5432/penguin_status
```

### How do I migrate from SQLite to PostgreSQL?

1. **Export existing data**:
   ```bash
   npm run export-data
   ```

2. **Configure PostgreSQL**:
   ```env
   DATABASE_TYPE=postgresql
   DATABASE_URL=postgresql://user:password@localhost:5432/penguin_status
   ```

3. **Import data**:
   ```bash
   npm run import-data
   ```

### Can I run multiple instances?

**Yes!** For high availability:

1. **Use external database** (PostgreSQL/MySQL)
2. **Configure load balancer** (Nginx, HAProxy)
3. **Sync configuration** across instances
4. **Use Redis** for session storage

```env
# Instance configuration
INSTANCE_ID=penguin-1
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:password@db-server:5432/penguin_status
```

## 📊 Monitoring

### How many monitors can I create?

**No hard limits!** However, consider:
- **Performance**: More monitors = more resources
- **Check intervals**: Shorter intervals = higher load
- **Notification volume**: More monitors = more alerts

**Recommended limits by server size:**
- **Small VPS (1GB RAM)**: 50-100 monitors
- **Medium VPS (2GB RAM)**: 200-500 monitors
- **Large VPS (4GB+ RAM)**: 1000+ monitors

### What's the minimum check interval?

**Default minimum**: 30 seconds

**Can be configured**:
```env
MIN_CHECK_INTERVAL=10  # 10 seconds (not recommended)
```

**Recommendations**:
- **Critical services**: 30-60 seconds
- **Important services**: 2-5 minutes
- **Regular services**: 5-15 minutes
- **Low priority**: 30+ minutes

### How accurate are the response times?

**Very accurate!** Response times include:
- **DNS resolution time**
- **TCP connection time**
- **TLS handshake time** (for HTTPS)
- **Server response time**
- **Content download time** (if applicable)

**Factors affecting accuracy**:
- Network latency to monitoring server
- Server location and routing
- Monitoring server load

### Can I monitor internal services?

**Absolutely!** Penguin Status can monitor:
- **Internal websites** (192.168.x.x, 10.x.x.x)
- **Local services** (localhost, 127.0.0.1)
- **Docker containers** (container names/IPs)
- **VPN-connected services**
- **Private APIs** and databases

### How do I monitor APIs with authentication?

**HTTP monitors support**:
- **Basic Authentication**
- **Bearer tokens**
- **API keys**
- **Custom headers**
- **POST/PUT requests** with body

Example configuration:
```json
{
  "name": "Authenticated API",
  "url": "https://api.example.com/health",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer your-token-here",
    "X-API-Key": "your-api-key"
  },
  "expectedStatus": 200,
  "expectedContent": "healthy"
}
```

## 🔔 Notifications

### Which notification channels are supported?

- **🎮 Discord**: Webhooks and bot integration
- **📧 Email**: SMTP-based notifications
- **📱 Slack**: Workspace integration
- **🔗 Webhooks**: Custom HTTP notifications
- **📞 PagerDuty**: Incident management
- **💬 Telegram**: Bot notifications
- **📲 SMS**: Via webhook integration
- **☎️ Phone calls**: Via webhook integration

### How do I prevent notification spam?

**Built-in features**:
- **Cooldown periods**: Minimum time between alerts
- **Escalation delays**: Progressive alerting
- **Flapping detection**: Ignore unstable services
- **Business hours**: Only notify during work hours

**Configuration**:
```env
NOTIFICATION_COOLDOWN=300  # 5 minutes
ESCALATION_DELAY=900       # 15 minutes
BUSINESS_HOURS_ONLY=true
```

### Can I customize notification messages?

**Yes!** Create custom templates:

```javascript
// templates/notifications.js
module.exports = {
  discord: {
    down: {
      title: '🚨 {{monitorName}} is DOWN',
      description: 'Service unreachable for {{duration}}',
      color: 0xFF0000
    }
  }
};
```

### How do I set up escalation?

**Escalation configuration**:
```json
{
  "escalation": {
    "enabled": true,
    "levels": [
      {
        "delay": 300,
        "channels": ["discord"]
      },
      {
        "delay": 900,
        "channels": ["email", "pagerduty"]
      },
      {
        "delay": 1800,
        "channels": ["phone"]
      }
    ]
  }
}
```

## ⚡ Performance

### How much resources does it use?

**Typical usage**:
- **RAM**: 100-500MB (depends on monitor count)
- **CPU**: <5% on modern hardware
- **Storage**: 10-100MB database growth per month
- **Network**: Minimal (only for checks and notifications)

**Optimization tips**:
- Use longer check intervals for non-critical services
- Enable database cleanup for old data
- Use external database for better performance
- Monitor resource usage regularly

### Can I run it on a Raspberry Pi?

**Yes!** Penguin Status runs well on:
- **Raspberry Pi 4** (4GB RAM recommended)
- **Raspberry Pi 3B+** (for smaller deployments)
- **Other ARM devices**

**Installation**:
```bash
# Use ARM-compatible Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and install
git clone https://github.com/your-username/penguin-status.git
cd penguin-status
npm install --production
```

### How do I optimize for many monitors?

**Performance optimizations**:

1. **Database tuning**:
   ```env
   DATABASE_POOL_SIZE=20
   DATABASE_TIMEOUT=30000
   ```

2. **Check distribution**:
   ```env
   CONCURRENT_CHECKS=10
   CHECK_BATCH_SIZE=5
   ```

3. **Memory management**:
   ```env
   NODE_OPTIONS="--max-old-space-size=2048"
   ```

4. **Data retention**:
   ```env
   DATA_RETENTION_DAYS=90
   CLEANUP_INTERVAL=24
   ```

## 🔒 Security

### Is Penguin Status secure?

**Security features**:
- **🔐 JWT authentication** with secure tokens
- **🛡️ Rate limiting** to prevent abuse
- **🔒 HTTPS support** with SSL/TLS
- **👤 User management** with role-based access
- **🚫 Input validation** and sanitization
- **📝 Audit logging** for security events

### How do I enable HTTPS?

**Option 1: Reverse Proxy (Recommended)**
```nginx
server {
    listen 443 ssl;
    server_name status.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Option 2: Built-in HTTPS**
```env
HTTPS_ENABLED=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
PORT=443
```

### How do I secure the admin panel?

**Security best practices**:

1. **Strong passwords**:
   ```env
   MIN_PASSWORD_LENGTH=12
   REQUIRE_STRONG_PASSWORDS=true
   ```

2. **IP restrictions**:
   ```env
   ADMIN_IP_WHITELIST=192.168.1.0/24,10.0.0.0/8
   ```

3. **Two-factor authentication**:
   ```env
   ENABLE_2FA=true
   ```

4. **Session security**:
   ```env
   SESSION_TIMEOUT=3600
   SECURE_COOKIES=true
   ```

### Can I hide the status page?

**Yes!** Several options:

1. **Password protection**:
   ```env
   STATUS_PAGE_PASSWORD=your-secret-password
   ```

2. **IP restrictions**:
   ```env
   STATUS_PAGE_IP_WHITELIST=192.168.1.0/24
   ```

3. **Private mode**:
   ```env
   STATUS_PAGE_PRIVATE=true
   ```

4. **Custom domain/path**:
   ```env
   STATUS_PAGE_PATH=/secret-status
   ```

## 🔧 Troubleshooting

### The application won't start

**Common causes and solutions**:

1. **Port already in use**:
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3001
   
   # Change port
   export PORT=3002
   npm start
   ```

2. **Database connection issues**:
   ```bash
   # Check database file permissions
   ls -la database/
   
   # Reset database
   rm database/uptime_monitor.db
   npm start
   ```

3. **Missing dependencies**:
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

### Monitors show as "down" but services are up

**Troubleshooting steps**:

1. **Check from monitoring server**:
   ```bash
   curl -I https://your-website.com
   ping your-website.com
   ```

2. **Verify DNS resolution**:
   ```bash
   nslookup your-website.com
   dig your-website.com
   ```

3. **Check firewall/security groups**:
   - Ensure monitoring server can reach target
   - Check for IP blocking or rate limiting
   - Verify SSL certificate validity

4. **Review monitor configuration**:
   - Check expected status codes
   - Verify timeout settings
   - Review custom headers/authentication

### Notifications aren't working

**Debugging steps**:

1. **Check notification logs**:
   ```bash
   tail -f logs/notifications.log
   ```

2. **Test manually**:
   ```bash
   # Discord webhook
   curl -X POST "$DISCORD_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"content": "Test message"}'
   
   # Email SMTP
   telnet smtp.gmail.com 587
   ```

3. **Verify configuration**:
   ```bash
   # Check environment variables
   env | grep DISCORD
   env | grep SMTP
   ```

### High memory usage

**Memory optimization**:

1. **Enable data cleanup**:
   ```env
   DATA_RETENTION_DAYS=30
   CLEANUP_INTERVAL=6
   ```

2. **Reduce check frequency**:
   ```env
   DEFAULT_CHECK_INTERVAL=300  # 5 minutes
   ```

3. **Limit concurrent checks**:
   ```env
   CONCURRENT_CHECKS=5
   ```

4. **Use external database**:
   ```env
   DATABASE_TYPE=postgresql
   DATABASE_URL=postgresql://user:pass@localhost/penguin
   ```

## 🚀 Advanced Usage

### Can I use custom domains for status pages?

**Yes!** Configure multiple status pages:

```env
# Main status page
STATUS_PAGE_DOMAIN=status.company.com

# Additional status pages
STATUS_PAGES=[
  {
    "domain": "api-status.company.com",
    "monitors": ["api-*"],
    "theme": "dark"
  },
  {
    "domain": "website-status.company.com",
    "monitors": ["website-*"],
    "theme": "light"
  }
]
```

### How do I create custom monitor types?

**Create custom monitor plugins**:

```javascript
// plugins/monitors/custom-api.js
module.exports = {
  name: 'custom-api',
  displayName: 'Custom API Monitor',
  
  async check(monitor) {
    try {
      // Custom monitoring logic
      const response = await fetch(monitor.url, {
        method: 'POST',
        headers: monitor.headers,
        body: JSON.stringify(monitor.payload)
      });
      
      return {
        status: response.ok ? 'up' : 'down',
        responseTime: Date.now() - startTime,
        statusCode: response.status,
        message: response.ok ? 'API responding' : 'API error'
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: null,
        error: error.message
      };
    }
  },
  
  validateConfig(config) {
    // Validate monitor configuration
    if (!config.url) {
      throw new Error('URL is required');
    }
    return true;
  }
};
```

### Can I integrate with external tools?

**Yes!** Integration options:

1. **Grafana Dashboard**:
   ```javascript
   // Export metrics to Prometheus format
   app.get('/metrics', (req, res) => {
     const metrics = generatePrometheusMetrics();
     res.set('Content-Type', 'text/plain');
     res.send(metrics);
   });
   ```

2. **Webhook integrations**:
   ```javascript
   // Send data to external systems
   const webhookData = {
     monitor: monitor.name,
     status: result.status,
     timestamp: new Date().toISOString(),
     responseTime: result.responseTime
   };
   
   await fetch(process.env.EXTERNAL_WEBHOOK_URL, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(webhookData)
   });
   ```

3. **API integrations**:
   ```bash
   # Get monitor data via API
   curl -H "Authorization: Bearer $API_TOKEN" \
        https://status.yourdomain.com/api/monitors
   
   # Create monitor via API
   curl -X POST \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"name":"New Monitor","url":"https://example.com"}' \
        https://status.yourdomain.com/api/monitors
   ```

### How do I backup and restore data?

**Automated backup script**:

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/penguin-status"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
cp database/uptime_monitor.db "$BACKUP_DIR/uptime_monitor_$DATE.db"

# Backup configuration
cp .env "$BACKUP_DIR/env_$DATE.backup"

# Backup custom files
tar -czf "$BACKUP_DIR/custom_$DATE.tar.gz" \
    public/custom/ \
    templates/ \
    plugins/

# Clean old backups (keep 30 days)
find "$BACKUP_DIR" -name "*.db" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.backup" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

**Restore from backup**:

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Stop application
sudo systemctl stop penguin-status

# Restore database
cp "$BACKUP_FILE" database/uptime_monitor.db

# Set permissions
chown penguin:penguin database/uptime_monitor.db
chmod 644 database/uptime_monitor.db

# Start application
sudo systemctl start penguin-status

echo "Restore completed"
```

---

## 🆘 Still Need Help?

If you can't find the answer to your question:

1. **📖 Check the [Documentation](Home)**
2. **🔍 Search [GitHub Issues](https://github.com/your-username/penguin-status/issues)**
3. **💬 Ask in [GitHub Discussions](https://github.com/your-username/penguin-status/discussions)**
4. **🐛 Report bugs** via [GitHub Issues](https://github.com/your-username/penguin-status/issues/new)
5. **📧 Contact support** (for enterprise users)

---

*FAQ last updated: December 2024*