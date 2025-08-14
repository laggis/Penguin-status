# 📦 Installation Guide

This guide will walk you through installing Penguin Status on your system.

## 🔧 Prerequisites

Before installing Penguin Status, ensure you have:

- **Node.js** 16.0.0 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager (comes with Node.js)
- **Git** for cloning the repository
- **2GB RAM** minimum
- **1GB disk space** for database and logs

### Verify Prerequisites

```bash
# Check Node.js version
node --version
# Should output v16.0.0 or higher

# Check npm version
npm --version

# Check Git
git --version
```

## 🚀 Installation Methods

### Method 1: Git Clone (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/penguin-status.git
   cd penguin-status
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # On Windows
   copy .env.example .env
   ```

4. **Configure environment variables**
   ```bash
   # Edit the .env file with your preferred editor
   nano .env  # Linux/macOS
   notepad .env  # Windows
   ```

5. **Start the application**
   ```bash
   npm start
   ```

### Method 2: Download ZIP

1. **Download** the latest release from [GitHub Releases](https://github.com/your-username/penguin-status/releases)
2. **Extract** the ZIP file to your desired location
3. **Open terminal** in the extracted folder
4. **Follow steps 2-5** from Method 1

## ⚙️ Environment Configuration

Edit your `.env` file with the following settings:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database
DB_PATH=./database/uptime_monitor.db

# Security
JWT_SECRET=your-super-secret-jwt-key-here-64-characters-minimum
CORS_ORIGIN=http://localhost:3001

# Discord Notifications (Optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_CHANNEL_ID=your-channel-id

# Application Settings
DOMAIN=http://localhost:3001
CHECK_INTERVAL=60
MAX_REDIRECTS=5
TIMEOUT=30000
```

### Required Settings

| Variable | Description | Example |
|----------|-------------|----------|
| `PORT` | Server port | `3001` |
| `JWT_SECRET` | JWT signing key (64+ chars) | `your-secret-key` |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:3001` |

### Optional Settings

| Variable | Description | Default |
|----------|-------------|----------|
| `DB_PATH` | Database file path | `./database/uptime_monitor.db` |
| `CHECK_INTERVAL` | Default check interval (seconds) | `60` |
| `TIMEOUT` | Request timeout (milliseconds) | `30000` |
| `MAX_REDIRECTS` | Maximum HTTP redirects | `5` |

## 🔐 Security Setup

### 1. Generate JWT Secret

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Change Default Credentials

Default login credentials:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Important**: Change these credentials immediately after first login!

## 🗄️ Database Setup

Penguin Status uses SQLite3 for data storage. The database will be automatically created on first startup.

### Database Location
- Default: `./database/uptime_monitor.db`
- Configurable via `DB_PATH` environment variable

### Automatic Setup
On first startup, the application will:
1. Create the database file
2. Create required tables
3. Create default admin user
4. Initialize monitoring service

## 🚦 First Startup

1. **Start the application**
   ```bash
   npm start
   ```

2. **Check the console output**
   ```
   🗄️ Connected to SQLite database
   📋 Database tables created/verified
   ✅ Database initialized successfully
   👤 Default admin user created (username: admin, password: admin123)
   🚀 Penguin Status is running on http://localhost:3001
   ```

3. **Access the dashboard**
   - Open your browser to `http://localhost:3001`
   - Login with `admin` / `admin123`
   - Change the default password

## 🔧 Development Mode

For development with auto-restart:

```bash
# Install nodemon globally (optional)
npm install -g nodemon

# Start in development mode
npm run dev
```

## 🐳 Docker Installation (Alternative)

```bash
# Build the image
docker build -t penguin-status .

# Run the container
docker run -d \
  -p 3001:3001 \
  -v $(pwd)/database:/app/database \
  -v $(pwd)/.env:/app/.env \
  --name penguin-status \
  penguin-status
```

## ✅ Verification

After installation, verify everything works:

1. **Check server status**
   ```bash
   curl http://localhost:3001/api/status
   ```

2. **Access dashboard**
   - Navigate to `http://localhost:3001`
   - Login successfully
   - Dashboard loads without errors

3. **Create test monitor**
   - Add a simple HTTP monitor
   - Verify it appears in the dashboard
   - Check that monitoring starts

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001  # Linux/macOS
netstat -ano | findstr :3001  # Windows

# Kill the process or use different port
PORT=3002 npm start
```

### Permission Errors
```bash
# Fix file permissions (Linux/macOS)
chmod -R 755 .
chown -R $USER:$USER .
```

### Database Issues
```bash
# Check database file permissions
ls -la database/

# Recreate database (will lose data)
rm database/uptime_monitor.db
npm start
```

## 📚 Next Steps

After successful installation:

1. [Configure your first monitors](Monitor-Types)
2. [Set up Discord notifications](Notifications)
3. [Configure user accounts](User-Management)
4. [Deploy to production](Deployment)

---

## 📞 Need Help?

If you encounter issues:

1. Check the [Troubleshooting Guide](Troubleshooting)
2. Review the [FAQ](FAQ)
3. [Open an issue](https://github.com/your-username/penguin-status/issues) on GitHub

---

*Installation guide last updated: December 2024*