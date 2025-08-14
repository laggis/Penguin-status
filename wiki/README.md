# 🐧 Penguin Status Wiki

Welcome to the comprehensive documentation for **Penguin Status** - a powerful, self-hosted uptime monitoring solution.

## 📚 Documentation Overview

This wiki provides complete documentation for installing, configuring, deploying, and maintaining Penguin Status. Whether you're a beginner or an experienced system administrator, you'll find the information you need to get the most out of your monitoring setup.

## 🚀 Quick Navigation

### Getting Started
- **[🏠 Home](Home.md)** - Project overview, features, and key information
- **[⚡ Quick Start](Quick-Start.md)** - Get up and running in 5 minutes
- **[📦 Installation](Installation.md)** - Detailed installation instructions
- **[⚙️ Configuration](Configuration.md)** - Complete configuration reference

### Core Features
- **[📊 Monitor Types](Monitor-Types.md)** - HTTP, Ping, TCP, DNS monitoring
- **[🔔 Notifications](Notifications.md)** - Discord, Email, Slack, Webhooks
- **[📈 API Reference](API-Reference.md)** - REST API and WebSocket documentation

### Deployment & Operations
- **[🚀 Deployment](Deployment.md)** - Production deployment guide
- **[⚡ Performance](Performance.md)** - Optimization and scaling
- **[💾 Backup & Recovery](Backup-and-Recovery.md)** - Data protection strategies
- **[🔒 Security](Security.md)** - Security best practices

### Support & Community
- **[❓ FAQ](FAQ.md)** - Frequently asked questions
- **[🔧 Troubleshooting](Troubleshooting.md)** - Common issues and solutions
- **[🤝 Contributing](Contributing.md)** - How to contribute to the project
- **[📋 Changelog](Changelog.md)** - Version history and updates

## 🎯 What is Penguin Status?

Penguin Status is a modern, feature-rich uptime monitoring solution that helps you:

- **Monitor Services**: HTTP/HTTPS, TCP ports, Ping, DNS resolution
- **Get Notified**: Discord, Email, Slack, Webhooks, and more
- **Track Performance**: Response times, uptime statistics, historical data
- **Manage Teams**: Multi-user support with role-based access
- **Stay Secure**: JWT authentication, 2FA, HTTPS/TLS
- **Scale Easily**: From single server to enterprise deployments

## 🌟 Key Features

### 📊 Monitoring Capabilities
- **HTTP/HTTPS Monitoring** with custom headers, authentication, and content validation
- **TCP Port Monitoring** for databases, mail servers, and custom services
- **Ping Monitoring** for network connectivity and latency tracking
- **DNS Monitoring** for domain resolution and DNS server health
- **SSL Certificate Monitoring** with expiration alerts
- **Keyword Monitoring** for content validation and change detection

### 🔔 Notification Channels
- **Discord** webhooks and bot integration
- **Email** with SMTP support for all major providers
- **Slack** workspace integration
- **Webhooks** for custom integrations
- **PagerDuty** for incident management
- **Telegram** bot notifications

### 📈 Analytics & Reporting
- **Real-time Dashboard** with customizable widgets
- **Historical Data** with configurable retention
- **Performance Metrics** including response times and availability
- **Status Pages** for public and private sharing
- **API Access** for custom integrations and automation

### 🔒 Security Features
- **JWT Authentication** with configurable expiration
- **Two-Factor Authentication** (2FA) support
- **Role-Based Access Control** (RBAC)
- **HTTPS/TLS** encryption
- **API Rate Limiting** and security headers
- **Audit Logging** for security monitoring

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Penguin Status Architecture                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Web UI    │    │     API     │    │  WebSocket  │        │
│  │  (React)    │◄──►│ (Express)   │◄──►│   Server    │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Core Services                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │  Monitor    │  │    Auth     │  │ Notification│    │   │
│  │  │   Engine    │  │   Service   │  │   Service   │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Database Layer                       │   │
│  │         SQLite / PostgreSQL / MySQL                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, Socket.IO
- **Database**: SQLite (default), PostgreSQL, MySQL
- **Authentication**: JWT, bcrypt
- **Monitoring**: Custom engine with concurrent checking
- **Notifications**: Multi-channel support
- **Deployment**: Docker, PM2, Systemd

## 📋 System Requirements

### Minimum Requirements
- **OS**: Ubuntu 20.04+, CentOS 8+, Windows Server 2019+, macOS 10.15+
- **CPU**: 1 core, 1.5GHz
- **RAM**: 512MB
- **Storage**: 1GB SSD
- **Network**: 10Mbps
- **Node.js**: 16.x or higher

### Recommended for Production
- **CPU**: 2+ cores, 2.0GHz+
- **RAM**: 2GB+
- **Storage**: 10GB+ SSD
- **Network**: 100Mbps+
- **Database**: PostgreSQL for high-load environments

## 🚀 Quick Start

Get Penguin Status running in under 5 minutes:

```bash
# Clone the repository
git clone https://github.com/your-org/penguin-status.git
cd penguin-status

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start the application
npm start
```

Open your browser to `http://localhost:3001` and log in with:
- **Username**: `admin`
- **Password**: `admin123`

> 🔒 **Security Note**: Change the default password immediately after first login!

For detailed installation instructions, see the **[Installation Guide](Installation.md)**.

## 📖 Documentation Structure

### 📚 User Guides
Step-by-step instructions for common tasks and workflows.

### 🔧 Technical Reference
Detailed technical documentation for developers and system administrators.

### 🚀 Deployment Guides
Production deployment scenarios and best practices.

### 🛠️ Troubleshooting
Solutions for common issues and debugging techniques.

### 🤝 Community
Contribution guidelines and community resources.

## 🆘 Getting Help

### Documentation
1. **Search this wiki** - Use the search function to find specific topics
2. **Check the FAQ** - Common questions and answers
3. **Review troubleshooting** - Solutions for known issues

### Community Support
- **GitHub Issues** - Bug reports and feature requests
- **Discord Server** - Real-time community chat
- **Stack Overflow** - Tag your questions with `penguin-status`

### Professional Support
- **Enterprise Support** - Available for business customers
- **Consulting Services** - Custom deployment and integration
- **Training** - Team training and workshops

## 🤝 Contributing

We welcome contributions to both the project and documentation!

### Code Contributions
- Fork the repository
- Create a feature branch
- Submit a pull request

See the **[Contributing Guide](Contributing.md)** for detailed instructions.

### Documentation Contributions
- Improve existing documentation
- Add new guides and tutorials
- Fix typos and errors
- Translate documentation

### Community Contributions
- Help other users in discussions
- Share your deployment experiences
- Create tutorials and blog posts
- Report bugs and suggest features

## 📊 Project Statistics

- **⭐ GitHub Stars**: 5,000+
- **🍴 Forks**: 800+
- **📦 Downloads**: 50,000+
- **🐛 Issues Resolved**: 1,200+
- **👥 Contributors**: 150+
- **🌍 Languages**: 20+

## 🗺️ Roadmap

### Current Version (v2.1)
- ✅ Multi-user support
- ✅ Advanced notifications
- ✅ API improvements
- ✅ Performance optimizations

### Upcoming (v2.2)
- 🔄 Enhanced status pages
- 🔄 Mobile app
- 🔄 Advanced analytics
- 🔄 Plugin system

### Future (v3.0)
- 🔮 Distributed monitoring
- 🔮 Machine learning insights
- 🔮 Advanced integrations
- 🔮 Enterprise features

## 📄 License

Penguin Status is released under the **MIT License**. See the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

Special thanks to:
- **Contributors** - Everyone who has contributed code, documentation, or feedback
- **Community** - Users who provide feedback and support
- **Open Source Projects** - The amazing tools and libraries we build upon

---

## 📚 Quick Reference

### Essential Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Database backup
npm run backup

# Check logs
npm run logs
```

### Important Files
- `.env` - Environment configuration
- `config.json` - Application settings
- `database/` - Database files
- `logs/` - Application logs
- `backups/` - Backup files

### Default Ports
- **Web Interface**: 3001
- **API**: 3001/api
- **WebSocket**: 3001 (same port)
- **Database**: 5432 (PostgreSQL) / File (SQLite)

### Support Channels
- 📧 **Email**: support@penguin-status.com
- 💬 **Discord**: [Join our server](https://discord.gg/penguin-status)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-org/penguin-status/issues)
- 📖 **Docs**: [This Wiki](https://github.com/your-org/penguin-status/wiki)

---

*Welcome to Penguin Status! We're excited to help you monitor your services effectively. If you have any questions, don't hesitate to reach out to our community.*

**Happy Monitoring! 🐧📊**