# 🐧 Penguin Status

> A modern, self-hosted uptime monitoring solution built with Node.js

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Discord](https://img.shields.io/badge/Discord-Notifications-7289da.svg)](https://discord.com/)

Penguin Status is a lightweight, feature-rich uptime monitoring tool inspired by Uptime Kuma. Monitor your websites, APIs, and services with real-time updates, beautiful dashboards, and instant Discord notifications.

## ✨ Features

### 🔍 **Comprehensive Monitoring**
- **HTTP/HTTPS** - Monitor web endpoints and APIs
- **Ping (ICMP)** - Check server reachability
- **TCP Port** - Monitor database and service ports
- **DNS** - Verify domain name resolution

### 📊 **Real-time Dashboard**
- Live status updates via WebSocket
- Responsive, mobile-friendly design
- Modern dark/light theme toggle
- Interactive monitoring cards
- Real-time response time tracking

### 🔔 **Smart Notifications**
- Discord webhook integration
- Instant down/up alerts
- Rich embed notifications
- Test notification functionality

### 🛡️ **Security & Authentication**
- JWT-based authentication
- User management system
- Admin/user role separation
- Secure password hashing

### 📈 **Analytics & Insights**
- Response time tracking
- Uptime percentage calculation
- Historical data storage
- Performance metrics

### ⚙️ **Easy Management**
- Pause/resume monitors
- Configurable check intervals
- Bulk monitor operations
- RESTful API endpoints

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16.0.0 or higher
- **npm** or **yarn** package manager
- **Git** (for cloning)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/penguin-status.git
cd penguin-status
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure environment**
```bash
cp .env.example .env
```

4. **Edit configuration** (see [Configuration](#-configuration) section)
```bash
nano .env  # Linux/macOS
notepad .env  # Windows
```

5. **Start the application**
```bash
npm start
# or
yarn start
```

   The application will automatically:
   - Create the SQLite database file (./database/uptime_monitor.db)
   - Create required tables
   - Start the monitoring service

6. **Access the dashboard**
   - Open your browser to `http://localhost:3001`
   - Default credentials: `admin` / `admin123`

### Development Mode

For development with auto-restart and debugging:

```bash
npm run dev
# or
yarn dev
```

### Docker Installation (Optional)

```bash
# Build the image
docker build -t penguin-status .

# Run the container
docker run -d -p 3001:3001 --name penguin-status penguin-status
```

## 📖 Usage Guide

### First Time Setup

1. **Access the dashboard** at `http://localhost:3001`
2. **Login** with default credentials:
   - Username: `admin`
   - Password: `admin123`
3. **Change default password** (recommended)
4. **Configure Discord notifications** (optional)

### Adding Your First Monitor

1. Click the **"+ Add Monitor"** button
2. Choose your **monitor type**
3. Fill in the **configuration details**
4. Set your **check interval** (recommended: 60 seconds)
5. Click **"Save"** to start monitoring

### Monitor Types & Configuration

#### 🌐 HTTP/HTTPS Monitoring
Perfect for websites, APIs, and web services.

```yaml
Name: My Website
URL: https://example.com
Method: GET
Interval: 60 seconds
Timeout: 30 seconds
Expected Status: 200
Headers: {"User-Agent": "PenguinStatus/1.0"}
```

#### 🏓 Ping (ICMP) Monitoring
Check server reachability and network latency.

```yaml
Name: Server Ping
Host: 8.8.8.8
Interval: 30 seconds
Packets: 3
```

#### 🔌 TCP Port Monitoring
Monitor databases, mail servers, and other TCP services.

```yaml
Name: Database Server
Host: db.example.com
Port: 5432
Interval: 60 seconds
Timeout: 10 seconds
```

#### 🌍 DNS Monitoring
Verify domain name resolution.

```yaml
Name: DNS Check
Hostname: example.com
Resolver: 8.8.8.8
Record Type: A
Interval: 300 seconds
```

### Monitor Management

| Action | Description |
|--------|-----------|
| ⏸️ **Pause** | Temporarily stop monitoring |
| ▶️ **Resume** | Restart paused monitor |
| ✏️ **Edit** | Modify monitor settings |
| 🗑️ **Delete** | Remove monitor permanently |
| 📊 **Details** | View response times and history |
| 🔄 **Test** | Run immediate check |

## API Endpoints

### Monitors
- `GET /api/monitors` - List all monitors
- `POST /api/monitors` - Create a new monitor
- `PUT /api/monitors/:id` - Update a monitor
- `DELETE /api/monitors/:id` - Delete a monitor
- `POST /api/monitors/:id/pause` - Pause a monitor
- `POST /api/monitors/:id/resume` - Resume a monitor
- `POST /api/monitors/:id/test` - Test a monitor
- `GET /api/monitors/:id/heartbeats` - Get monitor heartbeats

### Status
- `GET /api/status` - Overall system status
- `GET /api/status/detailed` - Detailed status for all monitors
- `GET /api/status/uptime/:id` - Uptime statistics for a monitor
- `GET /api/status/health` - System health check

### Authentication
- `POST /api/auth/login` - Login (default: admin/admin123)
- `POST /api/auth/register` - Register new user
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout

## ⚙️ Configuration

Configure Penguin Status by editing the `.env` file:

### Environment Variables

```bash
# ============================================================================
# SERVER SETTINGS
# ============================================================================
PORT=3001                           # Server port
HOST=0.0.0.0                       # Bind address (0.0.0.0 for all interfaces)
DOMAIN=http://localhost:3001        # Your domain URL
CORS_ORIGIN=*                       # CORS origin (* for development)

# ============================================================================
# SECURITY SETTINGS
# ============================================================================
JWT_SECRET=your-super-secret-jwt-key-here  # JWT secret (CHANGE THIS!)

# ============================================================================
# DISCORD NOTIFICATIONS (Optional)
# ============================================================================
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
DISCORD_CHANNEL_ID=YOUR_CHANNEL_ID
```

### 🔐 Security Configuration

#### Default Credentials
- **Username**: `admin`
- **Password**: `admin123`

> ⚠️ **Security Warning**: Change the default password immediately after first login!

#### JWT Secret Generation
Generate a secure JWT secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64

# Using online generator
# Visit: https://generate-secret.vercel.app/64
```

### 🔔 Discord Notifications Setup

Enable Discord notifications for monitor alerts:

#### Step 1: Create Discord Webhook
1. Open your Discord server
2. Right-click the target channel
3. Select **"Edit Channel"** → **"Integrations"** → **"Webhooks"**
4. Click **"New Webhook"**
5. Customize name and avatar (optional)
6. **Copy the webhook URL**

#### Step 2: Get Channel ID (Optional)
1. Enable **Developer Mode** in Discord settings
2. Right-click your channel
3. Select **"Copy Channel ID"**

#### Step 3: Configure Environment
```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/123456789/abcdefghijk
DISCORD_CHANNEL_ID=987654321098765432
```

#### Step 4: Test Notifications
1. Start Penguin Status
2. Go to the dashboard
3. Click **"Test Discord"** button
4. Check your Discord channel for the test message

### 🚀 Production Configuration

```bash
# Production settings
PORT=3001
HOST=0.0.0.0
DOMAIN=https://status.yourdomain.com
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=your-production-jwt-secret

# Discord (recommended for production)
DISCORD_WEBHOOK_URL=your-webhook-url
DISCORD_CHANNEL_ID=your-channel-id
```

## 🚀 Production Deployment

### Environment Setup

1. **Configure production environment**:
```bash
# Production .env
PORT=3001
HOST=0.0.0.0
DOMAIN=https://status.yourdomain.com
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=your-super-secure-production-secret
DISCORD_WEBHOOK_URL=your-webhook-url
DISCORD_CHANNEL_ID=your-channel-id
```

2. **Security checklist**:
- ✅ Change default admin password
- ✅ Generate secure JWT secret (64+ characters)
- ✅ Configure proper CORS origins
- ✅ Enable HTTPS with SSL certificates
- ✅ Use reverse proxy (nginx/Apache)
- ✅ Regular security updates

### Process Management

#### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name "penguin-status"

# Configure auto-restart on boot
pm2 startup
pm2 save

# Monitor application
pm2 status
pm2 logs penguin-status
```

#### Using systemd
```bash
# Create service file
sudo nano /etc/systemd/system/penguin-status.service
```

```ini
[Unit]
Description=Penguin Status Monitor
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/penguin-status
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable penguin-status
sudo systemctl start penguin-status
```

### Reverse Proxy Setup

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name status.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name status.yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## File Structure

```
uptime-monitor-clone/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env                   # Environment configuration (create from .env.example)
├── .env.example           # Environment template
├── database/
│   ├── db.js             # Database operations
│   └── uptime_monitor.db # SQLite database (auto-created)
├── services/
│   ├── monitorService.js # Monitoring logic
│   ├── discordBot.js     # Discord bot service
│   └── discordNotifier.js # Discord notifications
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── monitors.js       # Monitor CRUD routes
│   └── status.js         # Status and statistics
├── public/
│   ├── index.html        # Dashboard UI
│   ├── login.html        # Login page
│   ├── manager.html      # Manager dashboard
│   ├── style.css         # Styles
│   └── script.js         # Frontend JavaScript
├── start.bat             # Windows start script
└── start.ps1             # PowerShell start script
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: SQLite3 (zero-config)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO WebSockets
- **Monitoring**: Custom engines (HTTP, Ping, TCP, DNS)

### Frontend
- **UI Framework**: Bootstrap 5
- **Styling**: CSS3 with CSS Variables
- **JavaScript**: Vanilla ES6+
- **Icons**: Bootstrap Icons
- **Theme**: Dark/Light mode toggle

### Integrations
- **Discord**: Webhook notifications
- **APIs**: RESTful API endpoints
- **WebSockets**: Real-time updates

### Development
- **Package Manager**: npm/yarn
- **Process Manager**: PM2 (production)
- **Reverse Proxy**: Nginx/Apache
- **SSL**: Let's Encrypt support

## Features Comparison with Uptime Kuma

| Feature | This Clone | Uptime Kuma |
|---------|------------|-------------|
| HTTP/HTTPS Monitoring | ✅ | ✅ |
| Ping Monitoring | ✅ | ✅ |
| TCP Monitoring | ✅ | ✅ |
| DNS Monitoring | ✅ | ✅ |
| Real-time Dashboard | ✅ | ✅ |
| SQLite Database | ✅ | ✅ |
| Response Time Tracking | ✅ | ✅ |
| Discord Notifications | ✅ | ✅ |
| Status Pages | ❌ | ✅ |
| Docker Support | ❌ | ✅ |
| Multi-language | ❌ | ✅ |
| 2FA | ❌ | ✅ |

## Development

### Adding New Monitor Types

1. Add the new type to the `checkMonitor` method in `monitorService.js`
2. Implement the checking logic
3. Update the frontend form in `index.html`
4. Add styling for the new type in `style.css`

### Database Schema

**Monitors Table**
```sql
CREATE TABLE monitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT,
  interval INTEGER DEFAULT 60,
  timeout INTEGER DEFAULT 30,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Heartbeats Table**
```sql
CREATE TABLE heartbeats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  monitor_id INTEGER,
  status INTEGER,
  response_time INTEGER,
  message TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (monitor_id) REFERENCES monitors (id)
);
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001  # Linux/macOS
netstat -ano | findstr :3001  # Windows

# Kill the process
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows

# Or use a different port
PORT=3002 npm start
```

#### Database Issues
```bash
# Database locked error
# Stop the application and restart
pm2 restart penguin-status

# Corrupted database (last resort)
# Backup first, then delete to recreate
cp database/uptime_monitor.db database/backup.db
rm database/uptime_monitor.db
```

#### Discord Notifications Not Working
1. **Verify webhook URL**:
   ```bash
   curl -X POST "YOUR_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d '{"content": "Test message"}'
   ```

2. **Check permissions**:
   - Webhook has "Send Messages" permission
   - Channel allows webhook messages
   - Webhook URL is not expired

3. **Validate configuration**:
   ```bash
   # Check .env file
   cat .env | grep DISCORD
   ```

#### Monitor Not Working
- **HTTP/HTTPS**: Check URL format and SSL certificates
- **Ping**: Verify host is reachable and ICMP is allowed
- **TCP**: Confirm port is open and accessible
- **DNS**: Check resolver and record type

### Performance Issues

#### High CPU Usage
```bash
# Check monitor intervals
# Reduce frequency for non-critical monitors
# Recommended: 60+ seconds for most monitors
```

#### Memory Leaks
```bash
# Monitor memory usage
pm2 monit

# Restart if needed
pm2 restart penguin-status
```

### Logs and Debugging

#### Application Logs
```bash
# Console output
npm start

# File logging (production)
node server.js > logs/app.log 2>&1

# PM2 logs
pm2 logs penguin-status
pm2 logs penguin-status --lines 100
```

#### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start

# Specific debug categories
DEBUG=monitor:* npm start
```

#### Health Check
```bash
# Check application status
curl http://localhost:3001/api/health

# Check specific monitor
curl http://localhost:3001/api/monitors/1/test
```

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, or documentation improvements.

### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/penguin-status.git
   cd penguin-status
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Development Guidelines

#### Code Style
- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes for JavaScript
- **Semicolons**: Always use semicolons
- **Naming**: camelCase for variables, PascalCase for classes
- **Comments**: JSDoc for functions, inline for complex logic

#### File Structure
```bash
# Backend changes
services/     # Monitor engines and services
routes/       # API endpoints
database/     # Database operations

# Frontend changes
public/       # HTML, CSS, JavaScript
```

#### Adding New Monitor Types

1. **Create monitor engine** in `services/`
2. **Add API endpoints** in `routes/monitors.js`
3. **Update frontend form** in `public/index.html`
4. **Add styling** in `public/style.css`
5. **Update documentation**

#### Testing

```bash
# Manual testing
npm start
# Test all monitor types
# Verify Discord notifications
# Check responsive design

# API testing
curl -X POST http://localhost:3001/api/monitors \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","type":"http","url":"https://example.com"}'
```

### Submitting Changes

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

2. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

3. **Create Pull Request**
   - Describe your changes
   - Include screenshots for UI changes
   - Reference any related issues

### Commit Message Format

```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance
```

### Issue Reporting

When reporting bugs, please include:
- **Environment**: OS, Node.js version
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Console logs/errors**

## 📄 License

```
MIT License

Copyright (c) 2024 Penguin Status

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **Inspired by**: [Uptime Kuma](https://github.com/louislam/uptime-kuma) - The amazing uptime monitoring tool
- **Built for**: The self-hosting and DevOps community
- **Special thanks to**:
  - All contributors and beta testers
  - The Node.js and open-source community
  - Bootstrap and Socket.IO teams

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

[Report Bug](https://github.com/LaGgIs/penguin-status/issues) • [Request Feature](https://github.com/LaGgIs/penguin-status/issues) • [Documentation](https://github.com/LaGgIs/penguin-status/wiki)

Made with ❤️ for the self-hosting community

</div>