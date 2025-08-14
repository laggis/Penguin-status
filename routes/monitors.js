const express = require('express');
const { authenticateToken, requireUser } = require('./auth');
const router = express.Router();

// Get database instance (will be injected by server)
let db;
let monitorService;

// Middleware to inject dependencies
router.use((req, res, next) => {
  if (!db) {
    db = req.app.locals.db;
  }
  if (!monitorService) {
    monitorService = req.app.locals.monitorService;
  }
  next();
});

// Get all monitors
router.get('/', authenticateToken, requireUser, async (req, res) => {
  try {
    const monitors = await db.getMonitors();
    res.json(monitors);
  } catch (error) {
    console.error('Error fetching monitors:', error);
    res.status(500).json({ error: 'Failed to fetch monitors' });
  }
});

// Get monitor by ID
router.get('/:id', authenticateToken, requireUser, async (req, res) => {
  try {
    const monitors = await db.getMonitors();
    const monitor = monitors.find(m => m.id === parseInt(req.params.id));
    
    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }
    
    res.json(monitor);
  } catch (error) {
    console.error('Error fetching monitor:', error);
    res.status(500).json({ error: 'Failed to fetch monitor' });
  }
});

// Create new monitor
router.post('/', authenticateToken, requireUser, async (req, res) => {
  try {
    const { name, type, url, interval, timeout } = req.body;
    
    // Validation
    if (!name || !type || !url) {
      return res.status(400).json({ error: 'Name, type, and URL are required' });
    }
    
    const validTypes = ['http', 'https', 'ping', 'tcp', 'dns'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid monitor type' });
    }
    
    const monitorData = {
      name,
      type,
      url,
      interval: interval || 60,
      timeout: timeout || 30,
      active: 1
    };
    
    // Use MonitorService to add monitor properly
    if (monitorService) {
      const monitor = await monitorService.addMonitor(monitorData);
      res.status(201).json(monitor);
    } else {
      // Fallback if service not available
      const monitorId = await db.addMonitor(monitorData);
      const monitor = { ...monitorData, id: monitorId };
      res.status(201).json(monitor);
    }
  } catch (error) {
    console.error('Error creating monitor:', error);
    res.status(500).json({ error: 'Failed to create monitor' });
  }
});

// Update monitor
router.put('/:id', authenticateToken, requireUser, async (req, res) => {
  try {
    const monitorId = parseInt(req.params.id);
    const updates = req.body;
    
    // Remove id from updates if present
    delete updates.id;
    delete updates.created_at;
    
    const changes = await db.updateMonitor(monitorId, updates);
    
    if (changes === 0) {
      return res.status(404).json({ error: 'Monitor not found' });
    }
    
    // Get updated monitor
    const monitors = await db.getMonitors();
    const monitor = monitors.find(m => m.id === monitorId);
    
    // Reschedule monitor if service is available
    if (monitorService && monitor) {
      if (monitor.active) {
        monitorService.scheduleMonitor(monitor);
      } else {
        monitorService.pauseMonitor(monitorId);
      }
    }
    
    res.json(monitor);
  } catch (error) {
    console.error('Error updating monitor:', error);
    res.status(500).json({ error: 'Failed to update monitor' });
  }
});

// Delete monitor
router.delete('/:id', authenticateToken, requireUser, async (req, res) => {
  try {
    const monitorId = parseInt(req.params.id);
    
    const changes = await db.deleteMonitor(monitorId);
    
    if (changes === 0) {
      return res.status(404).json({ error: 'Monitor not found' });
    }
    
    // Stop monitoring if service is available
    if (monitorService) {
      monitorService.removeMonitor(monitorId);
    }
    
    res.json({ message: 'Monitor deleted successfully' });
  } catch (error) {
    console.error('Error deleting monitor:', error);
    res.status(500).json({ error: 'Failed to delete monitor' });
  }
});

// Get monitor heartbeats
router.get('/:id/heartbeats', authenticateToken, requireUser, async (req, res) => {
  try {
    const monitorId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 100;
    
    const heartbeats = await db.getHeartbeats(monitorId, limit);
    res.json(heartbeats);
  } catch (error) {
    console.error('Error fetching heartbeats:', error);
    res.status(500).json({ error: 'Failed to fetch heartbeats' });
  }
});

// Pause monitor
router.post('/:id/pause', authenticateToken, requireUser, async (req, res) => {
  try {
    const monitorId = parseInt(req.params.id);
    
    await db.updateMonitor(monitorId, { active: 0 });
    
    if (monitorService) {
      monitorService.pauseMonitor(monitorId);
    }
    
    res.json({ message: 'Monitor paused successfully' });
  } catch (error) {
    console.error('Error pausing monitor:', error);
    res.status(500).json({ error: 'Failed to pause monitor' });
  }
});

// Resume monitor
router.post('/:id/resume', authenticateToken, requireUser, async (req, res) => {
  try {
    const monitorId = parseInt(req.params.id);
    
    await db.updateMonitor(monitorId, { active: 1 });
    
    if (monitorService) {
      const monitors = await db.getMonitors();
      const monitor = monitors.find(m => m.id === monitorId);
      if (monitor) {
        monitorService.scheduleMonitor(monitor);
      }
    }
    
    res.json({ message: 'Monitor resumed successfully' });
  } catch (error) {
    console.error('Error resuming monitor:', error);
    res.status(500).json({ error: 'Failed to resume monitor' });
  }
});

// Test monitor (one-time check)
router.post('/:id/test', authenticateToken, requireUser, async (req, res) => {
  try {
    const monitorId = parseInt(req.params.id);
    
    const monitors = await db.getMonitors();
    const monitor = monitors.find(m => m.id === monitorId);
    
    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }
    
    if (monitorService) {
      // Perform immediate check
      await monitorService.checkMonitor(monitor);
      res.json({ message: 'Monitor test completed' });
    } else {
      res.status(503).json({ error: 'Monitor service not available' });
    }
  } catch (error) {
    console.error('Error testing monitor:', error);
    res.status(500).json({ error: 'Failed to test monitor' });
  }
});

// Test Discord notification
router.post('/discord/test', authenticateToken, requireUser, async (req, res) => {
  try {
    if (monitorService && monitorService.discordNotifier) {
      await monitorService.discordNotifier.sendTestMessage();
      res.json({ message: 'Discord test notification sent successfully' });
    } else {
      res.status(503).json({ error: 'Discord notifier not available' });
    }
  } catch (error) {
    console.error('Error sending Discord test:', error);
    res.status(500).json({ error: error.message || 'Failed to send Discord test notification' });
  }
});



module.exports = router;