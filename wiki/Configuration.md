# ⚙️ Configuration Guide

This guide covers all configuration options available in Penguin Status.

## 📁 Configuration Files

### Environment Variables (`.env`)

The primary configuration method uses environment variables defined in a `.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=production
DOMAIN=http://localhost:3001

# Database
DB_PATH=./database/uptime_monitor.db

# Security
JWT_SECRET=your-super-secret-jwt-key-here-64-characters-minimum
CORS_ORIGIN=http://localhost:3001
SESSION_TIMEOUT=24h

# Discord Notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_CHANNEL_ID=your-channel-id
DISCORD_MENTION_ROLE=@everyone

# Monitoring Settings
CHECK_INTERVAL=60
MAX_REDIRECTS=5
TIMEOUT=30000
RETRY_ATTEMPTS=3
RETRY_DELAY=5000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5
```

## 🖥️ Server Configuration

### Basic Server Settings

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port number | `3001` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `DOMAIN` | Base domain/URL | `http://localhost:3001` | No |
| `HOST` | Server bind address | `0.0.0.0` | No |

### Examples

```env
# Development
PORT=3001
NODE_ENV=development
DOMAIN=http://localhost:3001

# Production
PORT=80
NODE_ENV=production
DOMAIN=https://status.yourdomain.com
HOST=0.0.0.0
```

## 🗄️ Database Configuration

### SQLite Settings

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_PATH` | Database file path | `./database/uptime_monitor.db` | No |
| `DB_BACKUP_INTERVAL` | Backup interval (hours) | `24` | No |
| `DB_BACKUP_RETENTION` | Backup retention (days) | `7` | No |

### Examples

```env
# Default SQLite
DB_PATH=./database/uptime_monitor.db

# Custom location
DB_PATH=/var/lib/penguin-status/database.db

# With backups
DB_PATH=./database/uptime_monitor.db
DB_BACKUP_INTERVAL=12
DB_BACKUP_RETENTION=14
```

## 🔐 Security Configuration

### Authentication & Authorization

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | JWT signing secret (64+ chars) | - | **Yes** |
| `SESSION_TIMEOUT` | JWT token expiration | `24h` | No |
| `CORS_ORIGIN` | Allowed CORS origins | `*` | No |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` | No |

### Rate Limiting

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `RATE_LIMIT_WINDOW` | Window in minutes | `15` | No |
| `RATE_LIMIT_MAX` | Max requests per window | `100` | No |
| `RATE_LIMIT_SKIP_SUCCESSFUL` | Skip successful requests | `false` | No |

### Security Examples

```env
# Generate secure JWT secret
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# Strict CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Extended session
SESSION_TIMEOUT=7d

# Aggressive rate limiting
RATE_LIMIT_WINDOW=5
RATE_LIMIT_MAX=50
```

## 📊 Monitoring Configuration

### Default Monitor Settings

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CHECK_INTERVAL` | Default check interval (seconds) | `60` | No |
| `TIMEOUT` | Request timeout (milliseconds) | `30000` | No |
| `MAX_REDIRECTS` | Maximum HTTP redirects | `5` | No |
| `RETRY_ATTEMPTS` | Failed check retry attempts | `3` | No |
| `RETRY_DELAY` | Delay between retries (ms) | `5000` | No |
| `USER_AGENT` | HTTP User-Agent string | `Penguin-Status/1.0` | No |

### Monitor Type Specific

```env
# HTTP/HTTPS Monitoring
HTTP_TIMEOUT=30000
HTTP_MAX_REDIRECTS=5
HTTP_USER_AGENT=Penguin-Status/1.0
HTTP_ACCEPT_INVALID_CERTS=false

# Ping Monitoring
PING_TIMEOUT=5000
PING_PACKET_SIZE=32
PING_COUNT=4

# TCP Monitoring
TCP_TIMEOUT=10000
TCP_CONNECTION_TIMEOUT=5000

# DNS Monitoring
DNS_TIMEOUT=5000
DNS_SERVERS=8.8.8.8,1.1.1.1
```

## 🔔 Notification Configuration

### Discord Integration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DISCORD_WEBHOOK_URL` | Discord webhook URL | - | No |
| `DISCORD_BOT_TOKEN` | Discord bot token | - | No |
| `DISCORD_CHANNEL_ID` | Target channel ID | - | No |
| `DISCORD_MENTION_ROLE` | Role to mention | `@everyone` | No |
| `DISCORD_EMBED_COLOR` | Embed color (hex) | `#ff0000` | No |

### Notification Settings

```env
# Basic Discord webhook
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/123456789/abcdefghijklmnop

# Advanced Discord bot
DISCORD_BOT_TOKEN=your-bot-token-here
DISCORD_CHANNEL_ID=123456789012345678
DISCORD_MENTION_ROLE=<@&987654321098765432>
DISCORD_EMBED_COLOR=#ff4444

# Notification timing
NOTIFICATION_COOLDOWN=300
NOTIFICATION_RETRY_ATTEMPTS=3
```

## 📝 Logging Configuration

### Log Settings

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `LOG_LEVEL` | Logging level | `info` | No |
| `LOG_FILE` | Log file path | `./logs/app.log` | No |
| `LOG_MAX_SIZE` | Max log file size | `10m` | No |
| `LOG_MAX_FILES` | Max log files to keep | `5` | No |
| `LOG_FORMAT` | Log format | `combined` | No |

### Log Levels

- `error` - Only errors
- `warn` - Warnings and errors
- `info` - General information (recommended)
- `debug` - Detailed debugging
- `trace` - Very detailed tracing

### Logging Examples

```env
# Production logging
LOG_LEVEL=warn
LOG_FILE=/var/log/penguin-status/app.log
LOG_MAX_SIZE=50m
LOG_MAX_FILES=10

# Development logging
LOG_LEVEL=debug
LOG_FILE=./logs/debug.log
LOG_FORMAT=dev

# Disable file logging
LOG_FILE=
```

## 🎨 UI Configuration

### Theme & Appearance

```env
# Default theme
DEFAULT_THEME=dark

# Custom branding
APP_NAME=Your Status Page
APP_LOGO=/assets/logo.png
FAVICON=/assets/favicon.ico

# Custom colors (CSS variables)
PRIMARY_COLOR=#007bff
SUCCESS_COLOR=#28a745
DANGER_COLOR=#dc3545
WARNING_COLOR=#ffc107
```

## 🚀 Performance Configuration

### Optimization Settings

```env
# Caching
CACHE_ENABLED=true
CACHE_TTL=300
CACHE_MAX_SIZE=1000

# Compression
COMPRESSION_ENABLED=true
COMPRESSION_LEVEL=6

# WebSocket
WS_HEARTBEAT_INTERVAL=30000
WS_MAX_CONNECTIONS=1000

# Database optimization
DB_POOL_SIZE=10
DB_IDLE_TIMEOUT=30000
DB_ACQUIRE_TIMEOUT=60000
```

## 🔧 Advanced Configuration

### Custom Headers

```env
# Security headers
SECURITY_HEADERS=true
HSTS_MAX_AGE=31536000
CSP_POLICY=default-src 'self'

# Custom HTTP headers for monitors
CUSTOM_HEADERS='{"X-API-Key": "your-api-key", "Authorization": "Bearer token"}'
```

### Proxy Configuration

```env
# HTTP proxy
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=https://proxy.company.com:8080
NO_PROXY=localhost,127.0.0.1,.local

# Proxy authentication
PROXY_AUTH=username:password
```

## 📋 Configuration Validation

Penguin Status validates configuration on startup:

```bash
# Check configuration
npm run config:check

# Validate environment
npm run config:validate

# Show current config
npm run config:show
```

## 🔄 Runtime Configuration

Some settings can be changed without restart:

### Via API

```bash
# Update check interval
curl -X PUT http://localhost:3001/api/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"checkInterval": 120}'
```

### Via Dashboard

1. Login as admin
2. Navigate to **Settings** → **Configuration**
3. Update desired settings
4. Click **Save Changes**

## 📚 Configuration Examples

### Development Environment

```env
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug
CHECK_INTERVAL=30
JWT_SECRET=dev-secret-key-not-for-production
CORS_ORIGIN=*
```

### Production Environment

```env
NODE_ENV=production
PORT=80
DOMAIN=https://status.yourdomain.com
LOG_LEVEL=warn
LOG_FILE=/var/log/penguin-status/app.log
JWT_SECRET=super-secure-64-character-secret-key-for-production-use
CORS_ORIGIN=https://yourdomain.com
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook
CHECK_INTERVAL=60
TIMEOUT=30000
```

### High-Performance Setup

```env
NODE_ENV=production
CACHE_ENABLED=true
COMPRESSION_ENABLED=true
DB_POOL_SIZE=20
RATE_LIMIT_MAX=1000
WS_MAX_CONNECTIONS=5000
CHECK_INTERVAL=30
RETRY_ATTEMPTS=1
```

## 🚨 Common Configuration Issues

### JWT Secret Too Short
```
Error: JWT secret must be at least 64 characters
```
**Solution**: Generate a longer secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Port Already in Use
```
Error: listen EADDRINUSE :::3001
```
**Solution**: Change port or kill existing process:
```env
PORT=3002
```

### Database Permission Error
```
Error: SQLITE_CANTOPEN: unable to open database file
```
**Solution**: Check file permissions:
```bash
chmod 755 database/
chmod 644 database/uptime_monitor.db
```

---

## 📞 Need Help?

For configuration assistance:

1. Check the [Troubleshooting Guide](Troubleshooting)
2. Review [example configurations](https://github.com/your-username/penguin-status/tree/main/examples)
3. [Ask for help](https://github.com/your-username/penguin-status/discussions) in GitHub Discussions

---

*Configuration guide last updated: December 2024*