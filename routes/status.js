const express = require('express');
const router = express.Router();

// Get database instance (will be injected by server)
let db;

// Middleware to inject dependencies
router.use((req, res, next) => {
  if (!db) {
    db = req.app.locals.db;
  }
  next();
});

// Get overall status summary
router.get('/', async (req, res) => {
  try {
    const monitors = await db.getMonitors();
    const latestHeartbeats = await db.getLatestHeartbeats();
    
    const totalMonitors = monitors.length;
    const activeMonitors = monitors.filter(m => m.active).length;
    const upMonitors = latestHeartbeats.filter(h => h.status === 1).length;
    const downMonitors = latestHeartbeats.filter(h => h.status === 0).length;
    
    // Calculate uptime percentage
    const uptimePercentage = totalMonitors > 0 ? 
      Math.round((upMonitors / totalMonitors) * 100) : 100;
    
    // Get average response time
    const avgResponseTime = latestHeartbeats.length > 0 ?
      Math.round(latestHeartbeats.reduce((sum, h) => sum + (h.response_time || 0), 0) / latestHeartbeats.length) : 0;
    
    res.json({
      totalMonitors,
      activeMonitors,
      upMonitors,
      downMonitors,
      uptimePercentage,
      avgResponseTime,
      status: upMonitors === totalMonitors ? 'operational' : 
              downMonitors === totalMonitors ? 'major_outage' : 'partial_outage',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// Get detailed status for all monitors
router.get('/detailed', async (req, res) => {
  try {
    const monitors = await db.getMonitors();
    const latestHeartbeats = await db.getLatestHeartbeats();
    
    const detailedStatus = monitors.map(monitor => {
      const heartbeat = latestHeartbeats.find(h => h.monitor_id === monitor.id);
      
      return {
        id: monitor.id,
        name: monitor.name,
        type: monitor.type,
        url: monitor.url,
        active: monitor.active,
        status: heartbeat ? heartbeat.status : null,
        responseTime: heartbeat ? heartbeat.response_time : null,
        message: heartbeat ? heartbeat.message : 'No data',
        lastCheck: heartbeat ? heartbeat.timestamp : null,
        uptime: null // Will be calculated separately if needed
      };
    });
    
    res.json(detailedStatus);
  } catch (error) {
    console.error('Error fetching detailed status:', error);
    res.status(500).json({ error: 'Failed to fetch detailed status' });
  }
});

// Get uptime statistics for a specific monitor
router.get('/uptime/:id', async (req, res) => {
  try {
    const monitorId = parseInt(req.params.id);
    const days = parseInt(req.query.days) || 30;
    
    // Get heartbeats for the specified period
    const heartbeats = await db.getHeartbeats(monitorId, days * 24 * 60); // Assuming 1 check per minute
    
    if (heartbeats.length === 0) {
      return res.json({
        monitorId,
        period: days,
        uptime: 100,
        totalChecks: 0,
        successfulChecks: 0,
        failedChecks: 0,
        avgResponseTime: 0
      });
    }
    
    const totalChecks = heartbeats.length;
    const successfulChecks = heartbeats.filter(h => h.status === 1).length;
    const failedChecks = totalChecks - successfulChecks;
    const uptime = Math.round((successfulChecks / totalChecks) * 100 * 100) / 100;
    
    const avgResponseTime = Math.round(
      heartbeats.reduce((sum, h) => sum + (h.response_time || 0), 0) / totalChecks
    );
    
    // Group by day for daily uptime
    const dailyStats = {};
    heartbeats.forEach(heartbeat => {
      const date = new Date(heartbeat.timestamp).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, successful: 0 };
      }
      dailyStats[date].total++;
      if (heartbeat.status === 1) {
        dailyStats[date].successful++;
      }
    });
    
    const dailyUptime = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      uptime: Math.round((stats.successful / stats.total) * 100 * 100) / 100,
      checks: stats.total
    }));
    
    res.json({
      monitorId,
      period: days,
      uptime,
      totalChecks,
      successfulChecks,
      failedChecks,
      avgResponseTime,
      dailyUptime
    });
  } catch (error) {
    console.error('Error fetching uptime stats:', error);
    res.status(500).json({ error: 'Failed to fetch uptime statistics' });
  }
});

// Get response time statistics
router.get('/response-time/:id', async (req, res) => {
  try {
    const monitorId = parseInt(req.params.id);
    const hours = parseInt(req.query.hours) || 24;
    
    const heartbeats = await db.getHeartbeats(monitorId, hours * 60); // Assuming 1 check per minute
    
    if (heartbeats.length === 0) {
      return res.json({
        monitorId,
        period: hours,
        data: []
      });
    }
    
    // Group by hour
    const hourlyStats = {};
    heartbeats.forEach(heartbeat => {
      const hour = new Date(heartbeat.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
      if (!hourlyStats[hour]) {
        hourlyStats[hour] = [];
      }
      if (heartbeat.response_time !== null) {
        hourlyStats[hour].push(heartbeat.response_time);
      }
    });
    
    const responseTimeData = Object.entries(hourlyStats).map(([hour, times]) => {
      const avg = times.length > 0 ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length) : 0;
      const min = times.length > 0 ? Math.min(...times) : 0;
      const max = times.length > 0 ? Math.max(...times) : 0;
      
      return {
        timestamp: hour,
        avg,
        min,
        max,
        count: times.length
      };
    }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({
      monitorId,
      period: hours,
      data: responseTimeData
    });
  } catch (error) {
    console.error('Error fetching response time stats:', error);
    res.status(500).json({ error: 'Failed to fetch response time statistics' });
  }
});

// Get system health
router.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    uptime: Math.floor(uptime),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;