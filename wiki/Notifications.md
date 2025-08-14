# 🔔 Notifications Guide

Stay informed about your service status with real-time notifications through Discord, email, and webhooks.

## 📋 Overview

Penguin Status supports multiple notification channels:

- 🎮 **Discord** - Webhooks and bot integration
- 📧 **Email** - SMTP-based email alerts
- 🔗 **Webhooks** - Custom HTTP notifications
- 📱 **Slack** - Slack workspace integration
- 📞 **PagerDuty** - Incident management
- 💬 **Telegram** - Bot-based notifications

## 🎮 Discord Notifications

### Method 1: Discord Webhooks (Recommended)

The easiest way to get Discord notifications.

#### Setup Discord Webhook

1. **Open Discord** and go to your server
2. **Right-click the channel** where you want notifications
3. **Select "Edit Channel"**
4. **Go to "Integrations" → "Webhooks"**
5. **Click "New Webhook"**
6. **Customize the webhook**:
   - Name: `Penguin Status`
   - Avatar: Upload a penguin icon (optional)
7. **Copy the webhook URL**

#### Configure in Penguin Status

```bash
# Add to .env file
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz

# Optional: Customize mentions
DISCORD_MENTION_ROLE=@everyone
# Or mention specific role: <@&987654321098765432>

# Restart application
npm restart
```

#### Test Webhook

```bash
# Test webhook manually
curl -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "🐧 Test notification from Penguin Status!",
    "embeds": [{
      "title": "Test Alert",
      "description": "This is a test notification",
      "color": 3447003,
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"
    }]
  }'
```

### Method 2: Discord Bot Integration

For advanced features like slash commands and interactive messages.

#### Create Discord Bot

1. **Go to [Discord Developer Portal](https://discord.com/developers/applications)**
2. **Click "New Application"**
3. **Name your application** (e.g., "Penguin Status Bot")
4. **Go to "Bot" section**
5. **Click "Add Bot"**
6. **Copy the bot token**
7. **Enable necessary intents**:
   - Send Messages
   - Use Slash Commands
   - Read Message History

#### Invite Bot to Server

1. **Go to "OAuth2" → "URL Generator"**
2. **Select scopes**: `bot`, `applications.commands`
3. **Select permissions**:
   - Send Messages
   - Use Slash Commands
   - Embed Links
   - Attach Files
4. **Copy generated URL** and open in browser
5. **Select your server** and authorize

#### Configure Bot

```bash
# Add to .env file
DISCORD_BOT_TOKEN=your-bot-token-here
DISCORD_CHANNEL_ID=123456789012345678
DISCORD_GUILD_ID=987654321098765432

# Optional: Role mentions
DISCORD_MENTION_ROLE=<@&role-id-here>

# Restart application
npm restart
```

### Discord Notification Examples

#### Service Down Alert
```json
{
  "content": "🚨 **SERVICE DOWN** 🚨",
  "embeds": [{
    "title": "My Website is DOWN",
    "description": "Service has been unreachable for 3 minutes",
    "color": 15158332,
    "fields": [
      {
        "name": "URL",
        "value": "https://example.com",
        "inline": true
      },
      {
        "name": "Error",
        "value": "Connection timeout",
        "inline": true
      },
      {
        "name": "Duration",
        "value": "3 minutes",
        "inline": true
      }
    ],
    "timestamp": "2024-12-20T10:30:00.000Z",
    "footer": {
      "text": "Penguin Status",
      "icon_url": "https://example.com/penguin-icon.png"
    }
  }]
}
```

#### Service Recovery Alert
```json
{
  "content": "✅ **SERVICE RECOVERED** ✅",
  "embeds": [{
    "title": "My Website is UP",
    "description": "Service has recovered and is responding normally",
    "color": 3066993,
    "fields": [
      {
        "name": "URL",
        "value": "https://example.com",
        "inline": true
      },
      {
        "name": "Response Time",
        "value": "245ms",
        "inline": true
      },
      {
        "name": "Downtime",
        "value": "5 minutes",
        "inline": true
      }
    ],
    "timestamp": "2024-12-20T10:35:00.000Z"
  }]
}
```

## 📧 Email Notifications

### SMTP Configuration

```bash
# Add to .env file
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_TO=admin@yourdomain.com,team@yourdomain.com
```

### Popular SMTP Providers

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Generate in Google Account settings
```

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

### Email Templates

Customize email templates by creating files in `templates/email/`:

#### Down Alert Template
```html
<!-- templates/email/down.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Service Down Alert</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .alert { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; }
        .header { color: #721c24; font-weight: bold; }
    </style>
</head>
<body>
    <div class="alert">
        <div class="header">🚨 Service Down Alert</div>
        <p><strong>{{monitorName}}</strong> is currently down.</p>
        <p><strong>URL:</strong> {{monitorUrl}}</p>
        <p><strong>Error:</strong> {{errorMessage}}</p>
        <p><strong>Time:</strong> {{timestamp}}</p>
        <p><strong>Duration:</strong> {{duration}}</p>
    </div>
</body>
</html>
```

#### Recovery Template
```html
<!-- templates/email/up.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Service Recovery Alert</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; }
        .header { color: #155724; font-weight: bold; }
    </style>
</head>
<body>
    <div class="success">
        <div class="header">✅ Service Recovery Alert</div>
        <p><strong>{{monitorName}}</strong> has recovered.</p>
        <p><strong>URL:</strong> {{monitorUrl}}</p>
        <p><strong>Response Time:</strong> {{responseTime}}ms</p>
        <p><strong>Recovery Time:</strong> {{timestamp}}</p>
        <p><strong>Total Downtime:</strong> {{downtime}}</p>
    </div>
</body>
</html>
```

## 🔗 Webhook Notifications

### Custom Webhook Setup

```bash
# Add to .env file
WEBHOOK_ENABLED=true
WEBHOOK_URL=https://your-webhook-endpoint.com/alerts
WEBHOOK_SECRET=your-webhook-secret
WEBHOOK_TIMEOUT=10000
```

### Webhook Payload Format

```json
{
  "event": "monitor.down",
  "timestamp": "2024-12-20T10:30:00.000Z",
  "monitor": {
    "id": 1,
    "name": "My Website",
    "url": "https://example.com",
    "type": "http"
  },
  "status": {
    "current": "down",
    "previous": "up",
    "responseTime": null,
    "statusCode": null,
    "error": "Connection timeout"
  },
  "incident": {
    "id": "inc_123456",
    "startTime": "2024-12-20T10:27:00.000Z",
    "duration": 180,
    "acknowledged": false
  },
  "signature": "sha256=abc123def456..."
}
```

### Webhook Security

Verify webhook authenticity:

```javascript
// Verify webhook signature
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}

// Express.js example
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-penguin-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhook(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Unauthorized');
  }
  
  // Process webhook
  console.log('Received webhook:', req.body);
  res.status(200).send('OK');
});
```

## 📱 Slack Notifications

### Slack Webhook Setup

1. **Go to [Slack API](https://api.slack.com/apps)**
2. **Create new app** → "From scratch"
3. **Enable Incoming Webhooks**
4. **Add webhook to workspace**
5. **Copy webhook URL**

```bash
# Add to .env file
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
SLACK_CHANNEL=#alerts
SLACK_USERNAME=Penguin Status
SLACK_ICON_EMOJI=:penguin:
```

### Slack Message Format

```json
{
  "channel": "#alerts",
  "username": "Penguin Status",
  "icon_emoji": ": penguin:",
  "attachments": [
    {
      "color": "danger",
      "title": "🚨 Service Down: My Website",
      "title_link": "https://status.yourdomain.com",
      "text": "Service has been unreachable for 3 minutes",
      "fields": [
        {
          "title": "URL",
          "value": "https://example.com",
          "short": true
        },
        {
          "title": "Error",
          "value": "Connection timeout",
          "short": true
        }
      ],
      "ts": 1640000000
    }
  ]
}
```

## 📞 PagerDuty Integration

### PagerDuty Setup

1. **Create PagerDuty service**
2. **Get integration key**
3. **Configure in Penguin Status**

```bash
# Add to .env file
PAGERDUTY_ENABLED=true
PAGERDUTY_INTEGRATION_KEY=your-integration-key
PAGERDUTY_SEVERITY=error
```

### PagerDuty Event Format

```json
{
  "routing_key": "your-integration-key",
  "event_action": "trigger",
  "dedup_key": "monitor-1-down",
  "payload": {
    "summary": "My Website is down",
    "source": "penguin-status",
    "severity": "error",
    "component": "website",
    "group": "production",
    "class": "http-monitor",
    "custom_details": {
      "url": "https://example.com",
      "error": "Connection timeout",
      "response_time": null,
      "status_code": null
    }
  }
}
```

## 💬 Telegram Notifications

### Telegram Bot Setup

1. **Message @BotFather** on Telegram
2. **Send `/newbot`** command
3. **Follow instructions** to create bot
4. **Get bot token**
5. **Get chat ID** (message your bot, then visit `https://api.telegram.org/bot<TOKEN>/getUpdates`)

```bash
# Add to .env file
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
```

### Telegram Message Format

```markdown
🚨 *SERVICE DOWN*

*Monitor:* My Website
*URL:* https://example.com
*Error:* Connection timeout
*Duration:* 3 minutes
*Time:* 2024-12-20 10:30:00 UTC

[View Dashboard](https://status.yourdomain.com)
```

## ⚙️ Notification Settings

### Global Notification Configuration

```bash
# Add to .env file

# Notification timing
NOTIFICATION_COOLDOWN=300  # 5 minutes between same alerts
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_RETRY_DELAY=5000  # 5 seconds

# Notification triggers
NOTIFY_ON_DOWN=true
NOTIFY_ON_UP=true
NOTIFY_ON_DEGRADED=false
NOTIFY_ON_MAINTENANCE=false

# Escalation
ESCALATION_ENABLED=true
ESCALATION_DELAY=900  # 15 minutes
ESCALATION_CHANNELS=discord,email,pagerduty
```

### Per-Monitor Notification Settings

```json
{
  "name": "Critical API",
  "url": "https://api.company.com",
  "type": "http",
  "notifications": {
    "enabled": true,
    "channels": ["discord", "email", "pagerduty"],
    "onDown": true,
    "onUp": true,
    "onDegraded": false,
    "cooldown": 180,
    "escalation": {
      "enabled": true,
      "delay": 600,
      "channels": ["pagerduty", "phone"]
    }
  }
}
```

### Notification Rules

```javascript
// Custom notification rules
const notificationRules = {
  // Only notify during business hours
  businessHours: {
    enabled: true,
    timezone: 'America/New_York',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    hours: { start: 9, end: 17 }
  },
  
  // Severity-based routing
  severityRouting: {
    critical: ['discord', 'email', 'pagerduty', 'phone'],
    high: ['discord', 'email', 'pagerduty'],
    medium: ['discord', 'email'],
    low: ['discord']
  },
  
  // Rate limiting
  rateLimiting: {
    maxPerHour: 10,
    maxPerDay: 50,
    cooldownPeriod: 300
  }
};
```

## 🔧 Advanced Configuration

### Notification Templates

Customize notification content:

```javascript
// templates/notifications.js
module.exports = {
  discord: {
    down: {
      title: '🚨 {{monitorName}} is DOWN',
      description: 'Service has been unreachable for {{duration}}',
      color: 0xFF0000,
      fields: [
        { name: 'URL', value: '{{monitorUrl}}', inline: true },
        { name: 'Error', value: '{{errorMessage}}', inline: true },
        { name: 'Duration', value: '{{duration}}', inline: true }
      ]
    },
    up: {
      title: '✅ {{monitorName}} is UP',
      description: 'Service has recovered',
      color: 0x00FF00,
      fields: [
        { name: 'URL', value: '{{monitorUrl}}', inline: true },
        { name: 'Response Time', value: '{{responseTime}}ms', inline: true },
        { name: 'Downtime', value: '{{downtime}}', inline: true }
      ]
    }
  },
  
  email: {
    down: {
      subject: '🚨 {{monitorName}} is DOWN',
      template: 'down.html'
    },
    up: {
      subject: '✅ {{monitorName}} has recovered',
      template: 'up.html'
    }
  }
};
```

### Conditional Notifications

```javascript
// Conditional notification logic
const shouldNotify = (monitor, status, incident) => {
  // Don't notify for maintenance windows
  if (monitor.maintenance && monitor.maintenance.active) {
    return false;
  }
  
  // Only notify for critical services during off-hours
  if (!isBusinessHours() && monitor.priority !== 'critical') {
    return false;
  }
  
  // Don't spam for flapping services
  if (incident.flapping) {
    return false;
  }
  
  // Escalate after prolonged downtime
  if (incident.duration > 900 && !incident.escalated) {
    return 'escalate';
  }
  
  return true;
};
```

## 📊 Notification Analytics

### Track Notification Metrics

```javascript
// Notification metrics
const metrics = {
  sent: 0,
  failed: 0,
  channels: {
    discord: { sent: 0, failed: 0 },
    email: { sent: 0, failed: 0 },
    webhook: { sent: 0, failed: 0 }
  },
  responseTime: [],
  deliveryRate: 0.95
};
```

### Notification Dashboard

View notification statistics in the admin panel:

- **📊 Delivery rates** by channel
- **⏱️ Average response times**
- **📈 Notification volume** over time
- **🚨 Failed notifications** and retry attempts
- **📱 Channel performance** comparison

## 🚨 Troubleshooting Notifications

### Discord Issues

```bash
# Test webhook manually
curl -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}'

# Check webhook URL format
echo $DISCORD_WEBHOOK_URL
# Should be: https://discord.com/api/webhooks/ID/TOKEN

# Check bot permissions
# Ensure bot has "Send Messages" permission in target channel
```

### Email Issues

```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Check authentication
# For Gmail: Use app passwords, not account password
# For 2FA accounts: Generate app-specific password

# Check firewall
# Ensure outbound SMTP ports (587, 465, 25) are open
```

### Webhook Issues

```bash
# Test webhook endpoint
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Penguin-Signature: sha256=test" \
  -d '{"test": true}'

# Check endpoint logs
# Verify webhook endpoint is receiving requests
# Check for SSL/TLS issues
```

## 📚 Best Practices

### Notification Strategy

1. **Start Simple**: Begin with Discord or email
2. **Avoid Spam**: Use appropriate cooldown periods
3. **Prioritize**: Route critical alerts to immediate channels
4. **Test Regularly**: Verify all notification channels work
5. **Monitor Notifications**: Track delivery rates and failures

### Channel Selection

- **Discord**: Great for teams, real-time alerts
- **Email**: Reliable, works everywhere, good for reports
- **Slack**: Team collaboration, integration with workflows
- **PagerDuty**: Critical incidents, on-call management
- **Webhooks**: Custom integrations, automation

### Alert Fatigue Prevention

- **Use cooldowns** to prevent spam
- **Group related alerts** together
- **Implement escalation** for prolonged issues
- **Filter by severity** and business hours
- **Regular review** of notification rules

---

## 📞 Need Help?

For notification setup assistance:

1. Check the [Troubleshooting Guide](Troubleshooting)
2. Review [notification examples](https://github.com/your-username/penguin-status/tree/main/examples/notifications)
3. [Ask for help](https://github.com/your-username/penguin-status/discussions) in GitHub Discussions

---

*Notifications guide last updated: December 2024*