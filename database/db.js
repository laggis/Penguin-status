const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

class Database {
  constructor() {
    this.connection = null;
  }

  async init() {
    try {
      // SQLite connection configuration
      const dbPath = process.env.DB_PATH || './database/uptime_monitor.db';
      
      this.connection = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });
      
      console.log('🗄️ Connected to SQLite database');
      
      await this.createTables();
    } catch (error) {
      console.error('Error connecting to SQLite database:', error.message);
      throw error;
    }
  }

  async createTables() {
    const createMonitorsTable = `
      CREATE TABLE IF NOT EXISTS monitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        url TEXT,
        interval_seconds INTEGER DEFAULT 60,
        timeout INTEGER DEFAULT 30,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createHeartbeatsTable = `
      CREATE TABLE IF NOT EXISTS heartbeats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monitor_id INTEGER,
        status INTEGER,
        response_time INTEGER,
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (monitor_id) REFERENCES monitors (id) ON DELETE CASCADE
      )
    `;

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT,
        email TEXT,
        role TEXT DEFAULT 'user',
        discord_id TEXT UNIQUE,
        discord_username TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createSubscriptionsTable = `
      CREATE TABLE IF NOT EXISTS monitor_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        monitor_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE,
        UNIQUE(user_id, monitor_id)
      )
    `;

    try {
      await this.connection.run(createMonitorsTable);
      await this.connection.run(createHeartbeatsTable);
      await this.connection.run(createUsersTable);
      await this.connection.run(createSubscriptionsTable);
      
      console.log('📋 Database tables created/verified');
    } catch (error) {
      console.error('Error creating tables:', error.message);
      throw error;
    }
  }

  // Monitor operations
  async addMonitor(monitor) {
    try {
      const sql = `INSERT INTO monitors (name, type, url, interval_seconds, timeout, active) VALUES (?, ?, ?, ?, ?, ?)`;
      const result = await this.connection.run(sql, [
        monitor.name, 
        monitor.type, 
        monitor.url, 
        monitor.interval, 
        monitor.timeout, 
        monitor.active
      ]);
      return result.lastID;
    } catch (error) {
      throw error;
    }
  }

  async getMonitors() {
    try {
      const sql = `SELECT id, name, type, url, interval_seconds as interval, timeout, active, created_at, updated_at FROM monitors ORDER BY created_at DESC`;
      const rows = await this.connection.all(sql);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async updateMonitor(id, updates) {
    try {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(id);
      
      const sql = `UPDATE monitors SET ${fields} WHERE id = ?`;
      const result = await this.connection.run(sql, values);
      return result.changes;
    } catch (error) {
      throw error;
    }
  }

  async deleteMonitor(id) {
    try {
      const sql = `DELETE FROM monitors WHERE id = ?`;
      const result = await this.connection.run(sql, [id]);
      return result.changes;
    } catch (error) {
      throw error;
    }
  }

  // Heartbeat operations
  async addHeartbeat(heartbeat) {
    try {
      const sql = `INSERT INTO heartbeats (monitor_id, status, response_time, message) VALUES (?, ?, ?, ?)`;
      const result = await this.connection.run(sql, [
        heartbeat.monitor_id, 
        heartbeat.status, 
        heartbeat.response_time, 
        heartbeat.message
      ]);
      return result.lastID;
    } catch (error) {
      throw error;
    }
  }

  async getHeartbeats(monitorId, limit = 100) {
    try {
      const sql = `SELECT * FROM heartbeats WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT ?`;
      const rows = await this.connection.all(sql, [monitorId, limit]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async getLatestHeartbeats() {
    try {
      const sql = `
        SELECT h.*, m.name as monitor_name 
        FROM heartbeats h 
        INNER JOIN monitors m ON h.monitor_id = m.id 
        WHERE h.id IN (
          SELECT MAX(id) FROM heartbeats GROUP BY monitor_id
        )
      `;
      const rows = await this.connection.all(sql);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async getLatestHeartbeat(monitorId) {
    try {
      const sql = `SELECT * FROM heartbeats WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1`;
      const row = await this.connection.get(sql, [monitorId]);
      return row || null;
    } catch (error) {
      throw error;
    }
  }

  // User operations
  async addUser(user) {
    try {
      const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
      const result = await this.connection.run(sql, [
        user.username,
        user.password,
        user.role || 'user'
      ]);
      return { id: result.lastID, username: user.username, role: user.role || 'user' };
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsername(username) {
    try {
      const sql = `SELECT * FROM users WHERE username = ?`;
      const row = await this.connection.get(sql, [username]);
      return row || null;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const sql = `SELECT * FROM users WHERE id = ?`;
      const row = await this.connection.get(sql, [id]);
      return row || null;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const sql = `SELECT id, username, role, created_at FROM users ORDER BY created_at DESC`;
      const rows = await this.connection.all(sql);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async updateUserPassword(id, hashedPassword) {
    try {
      const sql = `UPDATE users SET password = ? WHERE id = ?`;
      const result = await this.connection.run(sql, [hashedPassword, id]);
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id, updates) {
    try {
      const fields = [];
      const values = [];
      
      Object.keys(updates).forEach(key => {
        if (key !== 'id') {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });
      
      if (fields.length === 0) return false;
      
      values.push(id);
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      const result = await this.connection.run(sql, values);
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const sql = `DELETE FROM users WHERE id = ?`;
      const result = await this.connection.run(sql, [id]);
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  }

  // Discord user operations
  async getUserByDiscordId(discordId) {
    try {
      const sql = `SELECT * FROM users WHERE discord_id = ?`;
      const row = await this.connection.get(sql, [discordId]);
      return row || null;
    } catch (error) {
      throw error;
    }
  }

  // Email functionality removed - Discord notifications only

  // Monitor subscription operations
  async storeMonitorSubscriptions(userId, monitorIds) {
    try {
      // Clear existing subscriptions for this user
      await this.connection.run('DELETE FROM monitor_subscriptions WHERE user_id = ?', [userId]);
      
      // Add new subscriptions
      if (monitorIds && monitorIds.length > 0) {
        for (const monitorId of monitorIds) {
          const sql = `INSERT INTO monitor_subscriptions (user_id, monitor_id) VALUES (?, ?)`;
          await this.connection.run(sql, [userId, monitorId]);
        }
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getUserSubscriptions(userId) {
    try {
      const sql = `
        SELECT m.* FROM monitors m 
        JOIN monitor_subscriptions ms ON m.id = ms.monitor_id 
        WHERE ms.user_id = ?
      `;
      const rows = await this.connection.all(sql, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Email notification methods removed - Discord notifications only

  async close() {
    if (this.connection) {
      try {
        await this.connection.close();
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing database:', error.message);
      }
    }
  }
}

module.exports = Database;