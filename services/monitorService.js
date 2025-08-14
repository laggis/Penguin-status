const axios = require('axios');
const ping = require('ping');
const dns = require('dns');
const net = require('net');
const { CronJob } = require('cron');
const DiscordNotifier = require('./discordNotifier');


class MonitorService {
  constructor(database, io) {
    this.db = database;
    this.io = io;
    this.monitors = new Map();
    this.jobs = new Map();
    this.isRunning = false;
    this.discordNotifier = new DiscordNotifier();

    this.lastStatus = new Map(); // Track last status for each monitor
  }

  async start() {
    console.log('🔄 Starting monitor service...');
    this.isRunning = true;
    
    // Load existing monitors from database
    try {
      const monitors = await this.db.getMonitors();
      for (const monitor of monitors) {
        if (monitor.active) {
          this.scheduleMonitor(monitor);
          // Initialize last status from latest heartbeat
          try {
            const latestHeartbeat = await this.db.getLatestHeartbeat(monitor.id);
            if (latestHeartbeat) {
              this.lastStatus.set(monitor.id, latestHeartbeat.status);
            }
          } catch (err) {
            console.warn(`Could not load last status for monitor ${monitor.id}:`, err.message);
          }
        }
      }
      console.log(`📊 Loaded ${monitors.length} monitors`);
    } catch (error) {
      console.error('Error loading monitors:', error);
    }
  }

  stop() {
    console.log('⏹️ Stopping monitor service...');
    this.isRunning = false;
    
    // Stop all cron jobs
    for (const [id, job] of this.jobs) {
      job.stop();
    }
    this.jobs.clear();
    this.monitors.clear();
  }

  async addMonitor(monitorData) {
    try {
      const monitorId = await this.db.addMonitor(monitorData);
      const monitor = { ...monitorData, id: monitorId };
      
      if (monitor.active && this.isRunning) {
        this.scheduleMonitor(monitor);
      }
      
      this.io.emit('monitorAdded', monitor);
      console.log(`✅ Monitor added: ${monitor.name}`);
      
      return monitor;
    } catch (error) {
      console.error('Error adding monitor:', error);
      throw error;
    }
  }

  async removeMonitor(monitorId) {
    try {
      await this.db.deleteMonitor(monitorId);
      
      // Stop the job if it exists
      if (this.jobs.has(monitorId)) {
        this.jobs.get(monitorId).stop();
        this.jobs.delete(monitorId);
      }
      
      this.monitors.delete(monitorId);
      this.io.emit('monitorRemoved', monitorId);
      console.log(`🗑️ Monitor removed: ${monitorId}`);
    } catch (error) {
      console.error('Error removing monitor:', error);
      throw error;
    }
  }

  async pauseMonitor(monitorId) {
    try {
      await this.db.updateMonitor(monitorId, { active: 0 });
      
      if (this.jobs.has(monitorId)) {
        this.jobs.get(monitorId).stop();
        this.jobs.delete(monitorId);
      }
      
      this.io.emit('monitorPaused', monitorId);
      console.log(`⏸️ Monitor paused: ${monitorId}`);
    } catch (error) {
      console.error('Error pausing monitor:', error);
      throw error;
    }
  }

  async resumeMonitor(monitorId) {
    try {
      await this.db.updateMonitor(monitorId, { active: 1 });
      
      const monitors = await this.db.getMonitors();
      const monitor = monitors.find(m => m.id === monitorId);
      
      if (monitor && this.isRunning) {
        this.scheduleMonitor(monitor);
      }
      
      this.io.emit('monitorResumed', monitorId);
      console.log(`▶️ Monitor resumed: ${monitorId}`);
    } catch (error) {
      console.error('Error resuming monitor:', error);
      throw error;
    }
  }

  scheduleMonitor(monitor) {
    // Stop existing job if any
    if (this.jobs.has(monitor.id)) {
      this.jobs.get(monitor.id).stop();
    }

    // Create cron pattern for interval (in seconds)
    const cronPattern = `*/${monitor.interval} * * * * *`;
    
    const job = new CronJob(cronPattern, () => {
      this.checkMonitor(monitor);
    }, null, true);

    this.jobs.set(monitor.id, job);
    this.monitors.set(monitor.id, monitor);
    
    console.log(`⏰ Scheduled monitor: ${monitor.name} (every ${monitor.interval}s)`);
  }

  async checkMonitor(monitor) {
    const startTime = Date.now();
    let status = 0; // 0 = down, 1 = up
    let message = '';
    let responseTime = 0;

    try {
      switch (monitor.type) {
        case 'http':
        case 'https':
          const result = await this.checkHttp(monitor);
          status = result.status;
          message = result.message;
          responseTime = result.responseTime;
          break;
          
        case 'ping':
          const pingResult = await this.checkPing(monitor);
          status = pingResult.status;
          message = pingResult.message;
          responseTime = pingResult.responseTime;
          break;
          
        case 'tcp':
          const tcpResult = await this.checkTcp(monitor);
          status = tcpResult.status;
          message = tcpResult.message;
          responseTime = tcpResult.responseTime;
          break;
          
        case 'dns':
          const dnsResult = await this.checkDns(monitor);
          status = dnsResult.status;
          message = dnsResult.message;
          responseTime = dnsResult.responseTime;
          break;
          
        default:
          message = 'Unknown monitor type';
      }
    } catch (error) {
      status = 0;
      message = error.message;
      responseTime = Date.now() - startTime;
    }

    // Save heartbeat to database
    const heartbeat = {
      monitor_id: monitor.id,
      status,
      response_time: responseTime,
      message
    };

    try {
      await this.db.addHeartbeat(heartbeat);
      
      // Check for status changes and send notifications
      const lastStatus = this.lastStatus.get(monitor.id);
      const currentStatus = status;
      
      if (lastStatus !== undefined && lastStatus !== currentStatus) {
        if (currentStatus === 0) {
          // Service went down
          await this.discordNotifier.sendDownAlert(monitor, message);
          // Email notifications removed - using Discord only
        } else if (currentStatus === 1 && lastStatus === 0) {
          // Service recovered
          await this.discordNotifier.sendUpAlert(monitor, responseTime);
          // Email notifications removed - using Discord only
        }
      }
      
      // Update last status
      this.lastStatus.set(monitor.id, currentStatus);
      
      // Emit real-time update
      this.io.emit('heartbeat', {
        ...heartbeat,
        monitor_name: monitor.name,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving heartbeat:', error);
    }
  }

  async checkHttp(monitor) {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(monitor.url, {
        timeout: (monitor.timeout || 30) * 1000,
        validateStatus: (status) => status < 400
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 1,
        message: `HTTP ${response.status}`,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error.response) {
        return {
          status: 0,
          message: `HTTP ${error.response.status}`,
          responseTime
        };
      } else {
        return {
          status: 0,
          message: error.message,
          responseTime
        };
      }
    }
  }

  async checkPing(monitor) {
    const startTime = Date.now();
    
    try {
      const host = monitor.url.replace(/^https?:\/\//, '').split('/')[0];
      const result = await ping.promise.probe(host, {
        timeout: (monitor.timeout || 30)
      });
      
      const responseTime = result.alive ? Math.round(result.time) : Date.now() - startTime;
      
      return {
        status: result.alive ? 1 : 0,
        message: result.alive ? `Ping successful (${responseTime}ms)` : 'Ping failed',
        responseTime
      };
    } catch (error) {
      return {
        status: 0,
        message: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  async checkTcp(monitor) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const [host, port] = monitor.url.split(':');
      const socket = new net.Socket();
      
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve({
          status: 0,
          message: 'Connection timeout',
          responseTime: Date.now() - startTime
        });
      }, (monitor.timeout || 30) * 1000);
      
      socket.connect(parseInt(port), host, () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve({
          status: 1,
          message: 'TCP connection successful',
          responseTime: Date.now() - startTime
        });
      });
      
      socket.on('error', (error) => {
        clearTimeout(timeout);
        resolve({
          status: 0,
          message: error.message,
          responseTime: Date.now() - startTime
        });
      });
    });
  }

  async checkDns(monitor) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const host = monitor.url.replace(/^https?:\/\//, '').split('/')[0];
      
      dns.lookup(host, (error, address) => {
        const responseTime = Date.now() - startTime;
        
        if (error) {
          resolve({
            status: 0,
            message: error.message,
            responseTime
          });
        } else {
          resolve({
            status: 1,
            message: `DNS resolved to ${address}`,
            responseTime
          });
        }
      });
    });
  }

  // Email notifications completely removed - using Discord only

  async sendCurrentStatuses(socket) {
    try {
      const monitors = await this.db.getMonitors();
      const heartbeats = await this.db.getLatestHeartbeats();
      
      socket.emit('currentStatus', {
        monitors,
        heartbeats
      });
    } catch (error) {
      console.error('Error sending current statuses:', error);
    }
  }
}

module.exports = MonitorService;