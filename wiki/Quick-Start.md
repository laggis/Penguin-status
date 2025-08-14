# 🚀 Quick Start Guide

Get Penguin Status up and running in under 5 minutes!

## ⚡ Prerequisites

Before you begin, ensure you have:
- **Node.js 16.0.0+** ([Download here](https://nodejs.org/))
- **Git** for cloning the repository
- **2GB RAM** minimum
- **Terminal/Command Prompt** access

## 🏃‍♂️ 5-Minute Setup

### Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-username/penguin-status.git
cd penguin-status

# Install dependencies
npm install
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration (optional for quick start)
nano .env  # Linux/macOS
notepad .env  # Windows
```

**Minimal .env configuration:**
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-here-64-characters-minimum-length
CORS_ORIGIN=http://localhost:3001
```

### Step 3: Start the Application

```bash
# Start Penguin Status
npm start
```

You should see:
```
🗄️ Connected to SQLite database
📋 Database tables created/verified
✅ Database initialized successfully
👤 Default admin user created (username: admin, password: admin123)
🚀 Penguin Status is running on http://localhost:3001
```

### Step 4: Access Dashboard

1. Open your browser to **http://localhost:3001**
2. Login with:
   - **Username**: `admin`
   - **Password**: `admin123`
3. **⚠️ Important**: Change the default password immediately!

## 🎯 First Monitor Setup

### Add Your First Monitor

1. **Click "Add Monitor"** in the dashboard
2. **Fill in the details**:
   - **Name**: `My Website`
   - **URL**: `https://google.com`
   - **Type**: `HTTP`
   - **Check Interval**: `60 seconds`
3. **Click "Create Monitor"**
4. **Watch it go live!** 🎉

### Monitor Types Quick Reference

| Type | Use Case | Example URL |
|------|----------|-------------|
| **HTTP/HTTPS** | Websites, APIs | `https://example.com` |
| **Ping** | Server connectivity | `8.8.8.8` |
| **TCP** | Port monitoring | `example.com:80` |
| **DNS** | Domain resolution | `example.com` |

## 🔔 Quick Notifications Setup

### Discord Notifications (Recommended)

1. **Create Discord Webhook**:
   - Go to your Discord server
   - Server Settings → Integrations → Webhooks
   - Click "New Webhook"
   - Copy the webhook URL

2. **Add to Penguin Status**:
   ```bash
   # Add to .env file
   echo "DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url" >> .env
   
   # Restart application
   npm restart
   ```

3. **Test notification**:
   - Go to Settings → Notifications
   - Click "Test Discord"
   - Check your Discord channel! 📢

## 🛡️ Essential Security Setup

### 1. Change Default Password

1. **Login to dashboard**
2. **Click your username** (top right)
3. **Select "Change Password"**
4. **Enter new secure password**
5. **Save changes**

### 2. Generate Secure JWT Secret

```bash
# Generate secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env file
echo "JWT_SECRET=your-generated-secret-here" >> .env

# Restart application
npm restart
```

### 3. Configure CORS (Production)

```bash
# Update .env for production
echo "CORS_ORIGIN=https://yourdomain.com" >> .env
echo "DOMAIN=https://yourdomain.com" >> .env
```

## 📊 Dashboard Overview

### Main Dashboard Features

- **📈 Status Overview**: Overall system health
- **🖥️ Monitor List**: All your monitors at a glance
- **⚡ Real-time Updates**: Live status changes
- **📱 Responsive Design**: Works on mobile
- **🌙 Dark/Light Theme**: Toggle in top right

### Monitor Status Colors

| Color | Status | Meaning |
|-------|--------|----------|
| 🟢 Green | Up | Service is healthy |
| 🔴 Red | Down | Service is not responding |
| 🟡 Yellow | Degraded | Service is slow |
| 🔵 Blue | Pending | First check in progress |
| ⚫ Gray | Paused | Monitor is disabled |

## 🔧 Common Quick Configurations

### Monitor a Website

```json
{
  "name": "Company Website",
  "url": "https://company.com",
  "type": "http",
  "interval": 300,
  "timeout": 30000,
  "settings": {
    "expectedStatus": 200,
    "followRedirects": true
  }
}
```

### Monitor an API Endpoint

```json
{
  "name": "User API",
  "url": "https://api.company.com/users",
  "type": "http",
  "interval": 60,
  "timeout": 15000,
  "settings": {
    "method": "GET",
    "headers": {
      "Authorization": "Bearer your-token"
    },
    "expectedStatus": 200
  }
}
```

### Monitor Server Connectivity

```json
{
  "name": "Production Server",
  "url": "192.168.1.100",
  "type": "ping",
  "interval": 60,
  "timeout": 5000,
  "settings": {
    "count": 4,
    "packetSize": 32
  }
}
```

### Monitor Database Port

```json
{
  "name": "PostgreSQL Database",
  "url": "db.company.com:5432",
  "type": "tcp",
  "interval": 120,
  "timeout": 10000,
  "settings": {
    "connectionTimeout": 5000
  }
}
```

## 🚨 Quick Troubleshooting

### Application Won't Start

```bash
# Check Node.js version
node --version
# Should be 16.0.0 or higher

# Check if port is available
lsof -i :3001  # Linux/macOS
netstat -ano | findstr :3001  # Windows

# Try different port
PORT=3002 npm start
```

### Cannot Login

```bash
# Reset admin password
rm database/uptime_monitor.db
npm start
# This recreates database with default admin/admin123
```

### Monitors Not Working

```bash
# Check logs
tail -f logs/app.log

# Test manually
curl -I https://google.com
ping -c 4 8.8.8.8

# Check firewall/network
```

### Discord Notifications Not Working

```bash
# Test webhook manually
curl -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test from Penguin Status"}'

# Check webhook URL format
echo $DISCORD_WEBHOOK_URL
```

## 📱 Mobile Access

Penguin Status is fully responsive:

- **📱 Mobile Dashboard**: Full functionality on phones
- **📊 Touch-friendly**: Easy monitor management
- **🔔 Push Notifications**: Via Discord mobile app
- **⚡ Fast Loading**: Optimized for mobile networks

## 🎨 Customization Quick Tips

### Change Theme
- Click the **🌙/☀️ icon** in the top right corner

### Organize Monitors
- Use **tags** to group related monitors
- Set **priorities** for important services
- Use **descriptive names** for easy identification

### Optimize Check Intervals
- **Critical services**: 30-60 seconds
- **Important services**: 2-5 minutes  
- **Non-critical services**: 5-15 minutes

## 🚀 Next Steps

Now that you're up and running:

1. **📚 Read the [Configuration Guide](Configuration)** for advanced settings
2. **🔔 Setup [Notifications](Notifications)** for your team
3. **👥 Add [User Accounts](User-Management)** for team members
4. **🚀 Plan [Production Deployment](Deployment)**
5. **📊 Explore [Monitor Types](Monitor-Types)** for comprehensive coverage

## 💡 Pro Tips

### Performance
- **Monitor intervals**: Don't check too frequently
- **Timeout values**: Set realistic timeouts
- **Database cleanup**: Remove old data periodically

### Security
- **Change defaults**: Always change default passwords
- **Use HTTPS**: Enable SSL in production
- **Regular updates**: Keep dependencies updated

### Monitoring Best Practices
- **Start simple**: Begin with basic HTTP monitors
- **Add gradually**: Don't monitor everything at once
- **Test alerts**: Verify notifications work
- **Document**: Keep monitor purposes clear

## 🆘 Need Help?

If you run into issues:

1. **Check the [Troubleshooting Guide](Troubleshooting)**
2. **Search [GitHub Issues](https://github.com/your-username/penguin-status/issues)**
3. **Ask in [GitHub Discussions](https://github.com/your-username/penguin-status/discussions)**
4. **Join our [Discord Community](https://discord.gg/your-invite)**

## 🎉 Success!

Congratulations! You now have:

- ✅ **Penguin Status running** on your system
- ✅ **First monitor configured** and checking
- ✅ **Dashboard accessible** and responsive
- ✅ **Basic security** measures in place
- ✅ **Notifications setup** (if configured)

**Welcome to the Penguin Status community!** 🐧

---

## 📋 Quick Reference Card

### Default Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **URL**: `http://localhost:3001`

### Essential Commands
```bash
# Start application
npm start

# Start in development mode
npm run dev

# Check logs
tail -f logs/app.log

# Reset database
rm database/uptime_monitor.db && npm start
```

### Key Files
- **Configuration**: `.env`
- **Database**: `database/uptime_monitor.db`
- **Logs**: `logs/app.log`
- **Main script**: `server.js`

---

*Quick Start guide last updated: December 2024*