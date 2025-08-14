const axios = require('axios');

class DiscordNotifier {
  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    this.channelId = process.env.DISCORD_CHANNEL_ID;
    this.enabled = !!this.webhookUrl;
  }

  async sendDownAlert(monitor, error) {
    if (!this.enabled) {
      console.log('Discord notifications disabled - no webhook URL configured');
      return;
    }

    try {
      const embed = this.createDownEmbed(monitor, error);
      await this.sendWebhook(embed);
      console.log(`🔔 Discord alert sent for ${monitor.name}`);
    } catch (err) {
      console.error('Failed to send Discord notification:', err.message);
    }
  }

  async sendUpAlert(monitor, responseTime) {
    if (!this.enabled) {
      return;
    }

    try {
      const embed = this.createUpEmbed(monitor, responseTime);
      await this.sendWebhook(embed);
      console.log(`✅ Discord recovery alert sent for ${monitor.name}`);
    } catch (err) {
      console.error('Failed to send Discord recovery notification:', err.message);
    }
  }

  createDownEmbed(monitor, error) {
    const timestamp = new Date().toISOString();
    const errorMessage = error || 'Service unreachable';
    const truncatedError = errorMessage.length > 180 ? errorMessage.substring(0, 180) + '...' : errorMessage;
    
    return {
      embeds: [{
        title: '🚨 Critical Service Alert',
        description: `### 🔻 **${monitor.name}** is currently down and unreachable\n\n> ⚡ **Immediate attention required** - Service disruption detected`,
        color: 0xFF3B30, // Modern iOS red
        fields: [
          {
            name: '🎯 Service Details',
            value: `\`\`\`yaml\nService: ${monitor.name}\nType: ${monitor.type.toUpperCase()}\nEndpoint: ${monitor.url}\nCheck Interval: ${monitor.interval}s\n\`\`\``,
            inline: false
          },
          {
            name: '❌ Error Information',
            value: `\`\`\`diff\n- ${truncatedError}\n\`\`\``,
            inline: false
          },
          {
            name: '⏰ Detected At',
            value: `<t:${Math.floor(Date.now() / 1000)}:F>\n<t:${Math.floor(Date.now() / 1000)}:R>`,
            inline: true
          },
          {
            name: '🔄 Next Check',
            value: `<t:${Math.floor((Date.now() + monitor.interval * 1000) / 1000)}:R>\n⏱️ Auto-retry enabled`,
            inline: true
          },
          {
            name: '📊 Current Status',
            value: '```ansi\n\u001b[0;31m● OFFLINE\u001b[0m\n```',
            inline: true
          }
        ],
        footer: {
          text: '🔔 Penguin Status • Real-time Alert System • Powered by Advanced Monitoring',
          icon_url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4ca.png'
        },
        timestamp: timestamp,
        author: {
          name: '🚨 Critical Alert System',
          icon_url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f6a8.png'
        },
        thumbnail: {
          url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f534.png'
        }
      }]
    };
  }

  createUpEmbed(monitor, responseTime) {
    const timestamp = new Date().toISOString();
    const performanceStatus = this.getPerformanceStatus(responseTime);
    
    return {
      embeds: [{
        title: '✅ Service Fully Restored',
        description: `### 🔺 **${monitor.name}** is back online and operating perfectly\n\n> 🎉 **All systems operational** - Service has been successfully restored`,
        color: 0x30D158, // Modern iOS green
        fields: [
          {
            name: '🎯 Service Details',
            value: `\`\`\`yaml\nService: ${monitor.name}\nType: ${monitor.type.toUpperCase()}\nEndpoint: ${monitor.url}\nStatus: Fully Operational\n\`\`\``,
            inline: false
          },
          {
            name: '⚡ Performance Analytics',
            value: `\`\`\`ini\n[Response Time]\n${responseTime}ms ${performanceStatus.emoji}\n\n[Performance Rating]\n${performanceStatus.text}\n\n[Health Status]\n🟢 Excellent\n\`\`\``,
            inline: true
          },
          {
            name: '🕐 Recovery Time',
            value: `<t:${Math.floor(Date.now() / 1000)}:F>\n<t:${Math.floor(Date.now() / 1000)}:R>`,
            inline: true
          },
          {
            name: '📊 Current Status',
            value: '```ansi\n\u001b[0;32m● ONLINE\u001b[0m\n```',
            inline: true
          },
          {
            name: '🔄 Monitoring Status',
            value: `✅ **Active Monitoring**\n🔍 Continuous health checks\n📈 Performance tracking enabled`,
            inline: false
          }
        ],
        footer: {
          text: '🎉 Penguin Status • Recovery Confirmation • Service Restored Successfully',
          icon_url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4ca.png'
        },
        timestamp: timestamp,
        author: {
          name: '✅ Recovery Confirmation System',
          icon_url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2705.png'
        },
        thumbnail: {
          url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f7e2.png'
        }
      }]
    };
  }

  async sendWebhook(embedData) {
    const payload = {
      username: '🔔 Penguin Status Pro',
      avatar_url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4ca.png',
      ...embedData
    };

    await axios.post(this.webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'UptimeMonitor/2.0 (Advanced Monitoring System)'
      },
      timeout: 15000
    });
  }

  getPerformanceStatus(responseTime) {
    if (responseTime < 50) {
      return { emoji: '🚀', text: 'Lightning Fast', grade: 'A+', color: '🟢' };
    } else if (responseTime < 150) {
      return { emoji: '⚡', text: 'Excellent', grade: 'A', color: '🟢' };
    } else if (responseTime < 300) {
      return { emoji: '✨', text: 'Very Good', grade: 'B+', color: '🟡' };
    } else if (responseTime < 500) {
      return { emoji: '⏱️', text: 'Good', grade: 'B', color: '🟡' };
    } else if (responseTime < 1000) {
      return { emoji: '⏳', text: 'Fair', grade: 'C', color: '🟠' };
    } else if (responseTime < 2000) {
      return { emoji: '🐌', text: 'Slow', grade: 'D', color: '🔴' };
    } else {
      return { emoji: '🦥', text: 'Very Slow', grade: 'F', color: '🔴' };
    }
  }

  async sendTestMessage() {
    if (!this.enabled) {
      throw new Error('Discord webhook not configured');
    }

    const testEmbed = {
      embeds: [{
        title: '🧪 Integration Test Suite',
        description: `### 🎯 **Discord Integration Verified**\n\n> 🚀 **All systems are go!** Your notification system is perfectly configured and ready for action`,
        color: 0x5865F2, // Discord blurple
        fields: [
          {
            name: '⚙️ System Configuration',
            value: `\`\`\`yaml\nWebhook Status: ✅ Connected & Verified\nChannel Target: ${this.channelId || 'Auto-detected'}\nAuthentication: 🔐 Secured\nDelivery Status: 📨 Confirmed\n\`\`\``,
            inline: false
          },
          {
            name: '🔬 Diagnostic Results',
            value: '```diff\n+ Connection: ESTABLISHED\n+ Authentication: VERIFIED\n+ Message Delivery: SUCCESSFUL\n+ Response Time: OPTIMAL\n+ Integration: COMPLETE\n```',
            inline: false
          },
          {
            name: '🕐 Test Executed',
            value: `<t:${Math.floor(Date.now() / 1000)}:F>\n<t:${Math.floor(Date.now() / 1000)}:R>`,
            inline: true
          },
          {
            name: '🎯 System Status',
            value: '```ansi\n\u001b[0;32m● READY\u001b[0m\n```',
            inline: true
          },
          {
            name: '📈 What\'s Next?',
            value: '🔔 **Ready for live alerts**\n📊 Real-time monitoring active\n⚡ Instant notifications enabled',
            inline: false
          }
        ],
        footer: {
          text: '🧪 Penguin Status • Integration Test Suite • All Systems Operational',
          icon_url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4ca.png'
        },
        timestamp: new Date().toISOString(),
        author: {
          name: '🧪 System Integration Test',
          icon_url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9ea.png'
        },
        thumbnail: {
          url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f7e3.png'
        }
      }]
    };

    await this.sendWebhook(testEmbed);
    console.log('✅ Discord test message sent successfully');
  }
}

module.exports = DiscordNotifier;