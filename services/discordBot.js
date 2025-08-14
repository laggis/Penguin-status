const { Client, GatewayIntentBits } = require('discord.js');
const Database = require('../database/db');

class DiscordBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });
    this.db = new Database();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.client.on('ready', () => {
      console.log(`🤖 Discord bot logged in as ${this.client.user.tag}`);
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      
      // Bot no longer handles commands - notifications are automatic via webhooks
    });
  }

  // All command handling removed - notifications are automatic via webhooks

  async start() {
    if (!process.env.DISCORD_BOT_TOKEN) {
      console.log('⚠️ DISCORD_BOT_TOKEN not found in environment variables. Discord bot will not start.');
      return;
    }

    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
    } catch (error) {
      console.error('Failed to start Discord bot:', error);
    }
  }

  async stop() {
    if (this.client) {
      await this.client.destroy();
    }
  }
}

module.exports = DiscordBot;