# 💾 Backup and Recovery Guide

Ensure your Penguin Status data is protected with comprehensive backup and recovery strategies.

## 📋 Table of Contents

- [Backup Overview](#-backup-overview)
- [Database Backup](#-database-backup)
- [Configuration Backup](#-configuration-backup)
- [Automated Backup](#-automated-backup)
- [Recovery Procedures](#-recovery-procedures)
- [Disaster Recovery](#-disaster-recovery)
- [Backup Testing](#-backup-testing)
- [Best Practices](#-best-practices)

## 🎯 Backup Overview

### What to Backup

```
┌─────────────────────────────────────────────────────────────────┐
│                    Penguin Status Backup                       │
├─────────────────────────────────────────────────────────────────┤
│ 🗄️  Database                                                   │
│   ├── Monitor configurations                                   │
│   ├── Historical data (heartbeats)                            │
│   ├── User accounts and settings                              │
│   ├── Notification configurations                             │
│   └── System logs                                             │
│                                                                │
│ ⚙️  Configuration Files                                        │
│   ├── Environment variables (.env)                            │
│   ├── Application config (config.json)                       │
│   ├── SSL certificates                                        │
│   └── Custom themes/assets                                    │
│                                                                │
│ 📁 Application Files                                           │
│   ├── Custom modifications                                    │
│   ├── Uploaded assets                                         │
│   └── Log files                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Backup Types

| Type | Frequency | Retention | Purpose |
|------|-----------|-----------|----------|
| **Full Backup** | Weekly | 4 weeks | Complete system restore |
| **Incremental** | Daily | 7 days | Recent changes |
| **Configuration** | On change | 30 days | Settings recovery |
| **Database** | Every 6 hours | 14 days | Data protection |
| **Logs** | Daily | 30 days | Troubleshooting |

### Backup Strategy

**3-2-1 Rule**:
- **3** copies of important data
- **2** different storage media
- **1** offsite backup

## 🗄️ Database Backup

### SQLite Backup

**Manual Backup**:
```bash
#!/bin/bash
# SQLite backup script

DB_PATH="/opt/penguin-status/database/uptime_monitor.db"
BACKUP_DIR="/opt/penguin-status/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/uptime_monitor_$TIMESTAMP.db"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create backup using SQLite backup API
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"

# Verify backup
if [ -f "$BACKUP_FILE" ]; then
    echo "Backup created successfully: $BACKUP_FILE"
    
    # Test backup integrity
    sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check;"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    echo "Backup compressed: $BACKUP_FILE.gz"
else
    echo "Backup failed!"
    exit 1
fi

# Clean old backups (keep last 14 days)
find "$BACKUP_DIR" -name "uptime_monitor_*.db.gz" -mtime +14 -delete
```

**Node.js Backup Script**:
```javascript
const sqlite3 = require('sqlite3');
const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
const gzip = promisify(zlib.gzip);

class SQLiteBackup {
  constructor(dbPath, backupDir) {
    this.dbPath = dbPath;
    this.backupDir = backupDir;
  }
  
  async createBackup() {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `uptime_monitor_${timestamp}.db`);
      
      // Create backup using SQLite backup API
      await this.performBackup(this.dbPath, backupFile);
      
      // Verify backup
      await this.verifyBackup(backupFile);
      
      // Compress backup
      const compressedFile = await this.compressBackup(backupFile);
      
      // Clean old backups
      await this.cleanOldBackups();
      
      console.log(`Backup created successfully: ${compressedFile}`);
      return compressedFile;
      
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }
  
  performBackup(sourcePath, backupPath) {
    return new Promise((resolve, reject) => {
      const sourceDb = new sqlite3.Database(sourcePath, sqlite3.OPEN_READONLY);
      const backupDb = new sqlite3.Database(backupPath);
      
      const backup = sourceDb.backup(backupDb);
      
      backup.step(-1, (err) => {
        if (err) {
          reject(err);
        } else {
          backup.finish((err) => {
            sourceDb.close();
            backupDb.close();
            
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }
  
  async verifyBackup(backupFile) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(backupFile, sqlite3.OPEN_READONLY);
      
      db.get('PRAGMA integrity_check', (err, row) => {
        db.close();
        
        if (err) {
          reject(new Error(`Backup verification failed: ${err.message}`));
        } else if (row && row.integrity_check === 'ok') {
          resolve();
        } else {
          reject(new Error('Backup integrity check failed'));
        }
      });
    });
  }
  
  async compressBackup(backupFile) {
    const data = await fs.readFile(backupFile);
    const compressed = await gzip(data);
    const compressedFile = `${backupFile}.gz`;
    
    await fs.writeFile(compressedFile, compressed);
    await fs.unlink(backupFile); // Remove uncompressed file
    
    return compressedFile;
  }
  
  async cleanOldBackups() {
    const files = await fs.readdir(this.backupDir);
    const backupFiles = files.filter(file => file.startsWith('uptime_monitor_') && file.endsWith('.db.gz'));
    
    const cutoffDate = new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)); // 14 days ago
    
    for (const file of backupFiles) {
      const filePath = path.join(this.backupDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < cutoffDate) {
        await fs.unlink(filePath);
        console.log(`Deleted old backup: ${file}`);
      }
    }
  }
}

// Usage
const backup = new SQLiteBackup(
  '/opt/penguin-status/database/uptime_monitor.db',
  '/opt/penguin-status/backups'
);

// Create backup
backup.createBackup().catch(console.error);

// Schedule regular backups
setInterval(() => {
  backup.createBackup().catch(console.error);
}, 6 * 60 * 60 * 1000); // Every 6 hours
```

### PostgreSQL Backup

**pg_dump Backup**:
```bash
#!/bin/bash
# PostgreSQL backup script

DB_NAME="penguin_status"
DB_USER="penguin_user"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="/opt/penguin-status/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/penguin_status_$TIMESTAMP.sql"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create full backup
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --verbose --clean --if-exists --create \
  --format=custom --compress=9 \
  --file="$BACKUP_FILE.backup"

# Create SQL dump for portability
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --verbose --clean --if-exists --create \
  --format=plain \
  --file="$BACKUP_FILE"

# Compress SQL dump
gzip "$BACKUP_FILE"

# Verify backups
if [ -f "$BACKUP_FILE.backup" ] && [ -f "$BACKUP_FILE.gz" ]; then
    echo "Backups created successfully:"
    echo "  Custom format: $BACKUP_FILE.backup"
    echo "  SQL format: $BACKUP_FILE.gz"
else
    echo "Backup failed!"
    exit 1
fi

# Clean old backups (keep last 14 days)
find "$BACKUP_DIR" -name "penguin_status_*.backup" -mtime +14 -delete
find "$BACKUP_DIR" -name "penguin_status_*.sql.gz" -mtime +14 -delete
```

**Continuous Archiving (WAL)**:
```bash
# PostgreSQL configuration for WAL archiving
# Add to postgresql.conf

wal_level = replica
archive_mode = on
archive_command = 'cp %p /opt/penguin-status/wal-archive/%f'
max_wal_senders = 3
wal_keep_segments = 32

# Create WAL archive directory
sudo mkdir -p /opt/penguin-status/wal-archive
sudo chown postgres:postgres /opt/penguin-status/wal-archive

# Base backup script
#!/bin/bash
BASE_BACKUP_DIR="/opt/penguin-status/base-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$BASE_BACKUP_DIR/base_$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

# Create base backup
pg_basebackup -h localhost -U postgres -D "$BACKUP_DIR" \
  --wal-method=stream --verbose --progress

echo "Base backup created: $BACKUP_DIR"
```

## ⚙️ Configuration Backup

**Configuration Backup Script**:
```bash
#!/bin/bash
# Configuration backup script

APP_DIR="/opt/penguin-status"
BACKUP_DIR="/opt/penguin-status/backups/config"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONFIG_BACKUP="$BACKUP_DIR/config_$TIMESTAMP.tar.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Files to backup
CONFIG_FILES=(
    "$APP_DIR/.env"
    "$APP_DIR/config.json"
    "$APP_DIR/ecosystem.config.js"
    "/etc/nginx/sites-available/penguin-status"
    "/etc/systemd/system/penguin-status.service"
    "$APP_DIR/ssl/"
    "$APP_DIR/uploads/"
)

# Create temporary directory for backup
TEMP_DIR=$(mktemp -d)
BACKUP_ROOT="$TEMP_DIR/penguin-status-config"
mkdir -p "$BACKUP_ROOT"

# Copy configuration files
for file in "${CONFIG_FILES[@]}"; do
    if [ -e "$file" ]; then
        # Preserve directory structure
        rel_path=$(realpath --relative-to="/" "$file")
        target_dir="$BACKUP_ROOT/$(dirname "$rel_path")"
        mkdir -p "$target_dir"
        cp -r "$file" "$target_dir/"
        echo "Backed up: $file"
    else
        echo "Warning: $file not found"
    fi
done

# Create metadata file
cat > "$BACKUP_ROOT/backup_info.txt" << EOF
Backup created: $(date)
Hostname: $(hostname)
Penguin Status version: $(cat $APP_DIR/package.json | grep version | cut -d'"' -f4)
Node.js version: $(node --version)
OS: $(uname -a)
EOF

# Create compressed archive
tar -czf "$CONFIG_BACKUP" -C "$TEMP_DIR" penguin-status-config

# Cleanup
rm -rf "$TEMP_DIR"

echo "Configuration backup created: $CONFIG_BACKUP"

# Clean old config backups (keep last 30 days)
find "$BACKUP_DIR" -name "config_*.tar.gz" -mtime +30 -delete
```

**Environment Variables Backup**:
```javascript
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ConfigBackup {
  constructor(appDir, backupDir) {
    this.appDir = appDir;
    this.backupDir = backupDir;
    this.encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;
  }
  
  async backupEnvironment() {
    try {
      const envPath = path.join(this.appDir, '.env');
      const envContent = await fs.readFile(envPath, 'utf8');
      
      // Parse environment variables
      const envVars = this.parseEnvFile(envContent);
      
      // Sanitize sensitive data
      const sanitizedVars = this.sanitizeEnvVars(envVars);
      
      // Create backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `env_${timestamp}.json`);
      
      const backupData = {
        timestamp: new Date().toISOString(),
        hostname: require('os').hostname(),
        environment: sanitizedVars,
        checksum: this.calculateChecksum(envContent)
      };
      
      // Encrypt if key is provided
      let content = JSON.stringify(backupData, null, 2);
      if (this.encryptionKey) {
        content = this.encrypt(content);
      }
      
      await fs.writeFile(backupFile, content);
      console.log(`Environment backup created: ${backupFile}`);
      
      return backupFile;
    } catch (error) {
      console.error('Environment backup failed:', error);
      throw error;
    }
  }
  
  parseEnvFile(content) {
    const vars = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          vars[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
        }
      }
    }
    
    return vars;
  }
  
  sanitizeEnvVars(vars) {
    const sensitiveKeys = [
      'password', 'secret', 'key', 'token', 'api_key',
      'private_key', 'cert', 'credential'
    ];
    
    const sanitized = { ...vars };
    
    for (const [key, value] of Object.entries(sanitized)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sensitive => 
        lowerKey.includes(sensitive)
      );
      
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
  
  calculateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
  
  encrypt(text) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, this.encryptionKey);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encryptedData) {
    const algorithm = 'aes-256-gcm';
    const decipher = crypto.createDecipher(algorithm, this.encryptionKey);
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## 🤖 Automated Backup

**Comprehensive Backup Script**:
```bash
#!/bin/bash
# Comprehensive automated backup script

set -euo pipefail

# Configuration
APP_DIR="/opt/penguin-status"
BACKUP_ROOT="/opt/penguin-status/backups"
LOG_FILE="$BACKUP_ROOT/backup.log"
RETENTION_DAYS=14
S3_BUCKET="penguin-status-backups"
ENCRYPTION_KEY="$BACKUP_ENCRYPTION_KEY"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Cleanup function
cleanup() {
    if [ -n "${TEMP_DIR:-}" ] && [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}

trap cleanup EXIT

# Main backup function
main() {
    log "Starting backup process"
    
    # Create backup directories
    mkdir -p "$BACKUP_ROOT"/{database,config,logs}
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    
    # Database backup
    log "Creating database backup"
    if [ -f "$APP_DIR/database/uptime_monitor.db" ]; then
        sqlite3 "$APP_DIR/database/uptime_monitor.db" ".backup '$TEMP_DIR/database.db'"
        gzip "$TEMP_DIR/database.db"
        mv "$TEMP_DIR/database.db.gz" "$BACKUP_ROOT/database/database_$TIMESTAMP.db.gz"
        log "Database backup completed"
    else
        log "WARNING: Database file not found"
    fi
    
    # Configuration backup
    log "Creating configuration backup"
    tar -czf "$BACKUP_ROOT/config/config_$TIMESTAMP.tar.gz" \
        -C "$APP_DIR" \
        --exclude='node_modules' \
        --exclude='backups' \
        --exclude='logs' \
        --exclude='database' \
        .
    log "Configuration backup completed"
    
    # Log backup
    log "Creating log backup"
    if [ -d "$APP_DIR/logs" ]; then
        tar -czf "$BACKUP_ROOT/logs/logs_$TIMESTAMP.tar.gz" -C "$APP_DIR" logs/
        log "Log backup completed"
    fi
    
    # Create full backup archive
    log "Creating full backup archive"
    FULL_BACKUP="$BACKUP_ROOT/full_backup_$TIMESTAMP.tar.gz"
    tar -czf "$FULL_BACKUP" -C "$BACKUP_ROOT" database config logs
    
    # Encrypt backup if key is provided
    if [ -n "${ENCRYPTION_KEY:-}" ]; then
        log "Encrypting backup"
        gpg --symmetric --cipher-algo AES256 --compress-algo 1 \
            --s2k-mode 3 --s2k-digest-algo SHA512 --s2k-count 65536 \
            --passphrase "$ENCRYPTION_KEY" --batch --yes \
            "$FULL_BACKUP"
        rm "$FULL_BACKUP"
        FULL_BACKUP="$FULL_BACKUP.gpg"
        log "Backup encrypted"
    fi
    
    # Upload to S3 if configured
    if [ -n "${S3_BUCKET:-}" ] && command -v aws >/dev/null 2>&1; then
        log "Uploading backup to S3"
        aws s3 cp "$FULL_BACKUP" "s3://$S3_BUCKET/$(basename "$FULL_BACKUP")"
        log "Backup uploaded to S3"
    fi
    
    # Cleanup old backups
    log "Cleaning up old backups"
    find "$BACKUP_ROOT" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_ROOT" -name "*.db.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_ROOT" -name "*.gpg" -mtime +$RETENTION_DAYS -delete
    
    # Verify backup
    if [ -f "$FULL_BACKUP" ]; then
        BACKUP_SIZE=$(du -h "$FULL_BACKUP" | cut -f1)
        log "Backup completed successfully: $FULL_BACKUP ($BACKUP_SIZE)"
    else
        error_exit "Backup file not found: $FULL_BACKUP"
    fi
    
    log "Backup process completed"
}

# Run main function
main "$@"
```

**Cron Job Setup**:
```bash
# Add to crontab
crontab -e

# Database backup every 6 hours
0 */6 * * * /opt/penguin-status/scripts/backup-database.sh

# Full backup daily at 2 AM
0 2 * * * /opt/penguin-status/scripts/backup-full.sh

# Configuration backup on changes (using inotify)
# Install inotify-tools first
sudo apt-get install inotify-tools

# Monitor configuration changes
#!/bin/bash
inotifywait -m -e modify,create,delete /opt/penguin-status/.env /opt/penguin-status/config.json |
while read path action file; do
    echo "Configuration changed: $path$file ($action)"
    /opt/penguin-status/scripts/backup-config.sh
done
```

**Systemd Service for Backup**:
```ini
# /etc/systemd/system/penguin-status-backup.service
[Unit]
Description=Penguin Status Backup Service
After=network.target

[Service]
Type=oneshot
User=penguin
Group=penguin
WorkingDirectory=/opt/penguin-status
ExecStart=/opt/penguin-status/scripts/backup-full.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/penguin-status-backup.timer
[Unit]
Description=Run Penguin Status Backup Daily
Requires=penguin-status-backup.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
# Enable and start backup timer
sudo systemctl enable penguin-status-backup.timer
sudo systemctl start penguin-status-backup.timer

# Check timer status
sudo systemctl status penguin-status-backup.timer
sudo systemctl list-timers penguin-status-backup.timer
```

## 🔄 Recovery Procedures

### Database Recovery

**SQLite Recovery**:
```bash
#!/bin/bash
# SQLite recovery script

BACKUP_FILE="$1"
DB_PATH="/opt/penguin-status/database/uptime_monitor.db"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Starting database recovery..."

# Stop Penguin Status service
sudo systemctl stop penguin-status

# Backup current database
if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "$DB_PATH.recovery-backup-$(date +%Y%m%d_%H%M%S)"
    echo "Current database backed up"
fi

# Decompress backup if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    TEMP_FILE=$(mktemp)
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    BACKUP_FILE="$TEMP_FILE"
fi

# Restore database
cp "$BACKUP_FILE" "$DB_PATH"

# Verify restored database
sqlite3 "$DB_PATH" "PRAGMA integrity_check;"
if [ $? -eq 0 ]; then
    echo "Database integrity check passed"
else
    echo "Database integrity check failed!"
    exit 1
fi

# Set proper permissions
chown penguin:penguin "$DB_PATH"
chmod 644 "$DB_PATH"

# Start Penguin Status service
sudo systemctl start penguin-status

# Check service status
if sudo systemctl is-active --quiet penguin-status; then
    echo "Database recovery completed successfully"
else
    echo "Service failed to start after recovery"
    exit 1
fi

# Cleanup
if [ -n "${TEMP_FILE:-}" ]; then
    rm -f "$TEMP_FILE"
fi
```

**PostgreSQL Recovery**:
```bash
#!/bin/bash
# PostgreSQL recovery script

BACKUP_FILE="$1"
DB_NAME="penguin_status"
DB_USER="penguin_user"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Starting PostgreSQL recovery..."

# Stop Penguin Status service
sudo systemctl stop penguin-status

# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Restore from backup
if [[ "$BACKUP_FILE" == *.backup ]]; then
    # Custom format backup
    pg_restore -U "$DB_USER" -d "$DB_NAME" --verbose "$BACKUP_FILE"
elif [[ "$BACKUP_FILE" == *.sql.gz ]]; then
    # SQL dump backup
    gunzip -c "$BACKUP_FILE" | psql -U "$DB_USER" -d "$DB_NAME"
elif [[ "$BACKUP_FILE" == *.sql ]]; then
    # Plain SQL backup
    psql -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_FILE"
else
    echo "Unknown backup format: $BACKUP_FILE"
    exit 1
fi

# Verify recovery
psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM monitors;"

if [ $? -eq 0 ]; then
    echo "Database recovery completed successfully"
    sudo systemctl start penguin-status
else
    echo "Database recovery failed"
    exit 1
fi
```

### Point-in-Time Recovery (PostgreSQL)

**PITR Recovery Script**:
```bash
#!/bin/bash
# Point-in-time recovery script

RECOVERY_TARGET="$1"  # Format: 2024-01-15 14:30:00
BASE_BACKUP_DIR="$2"
WAL_ARCHIVE_DIR="/opt/penguin-status/wal-archive"
RECOVERY_DIR="/tmp/postgres-recovery"

if [ -z "$RECOVERY_TARGET" ] || [ -z "$BASE_BACKUP_DIR" ]; then
    echo "Usage: $0 <recovery_target> <base_backup_dir>"
    echo "Example: $0 '2024-01-15 14:30:00' /opt/penguin-status/base-backups/base_20240115_120000"
    exit 1
fi

echo "Starting point-in-time recovery to: $RECOVERY_TARGET"

# Stop PostgreSQL
sudo systemctl stop postgresql

# Backup current data directory
sudo mv /var/lib/postgresql/13/main /var/lib/postgresql/13/main.backup.$(date +%Y%m%d_%H%M%S)

# Copy base backup
sudo cp -R "$BASE_BACKUP_DIR" /var/lib/postgresql/13/main
sudo chown -R postgres:postgres /var/lib/postgresql/13/main

# Create recovery configuration
sudo -u postgres cat > /var/lib/postgresql/13/main/recovery.conf << EOF
restore_command = 'cp $WAL_ARCHIVE_DIR/%f %p'
recovery_target_time = '$RECOVERY_TARGET'
recovery_target_action = 'promote'
EOF

# Start PostgreSQL in recovery mode
sudo systemctl start postgresql

# Wait for recovery to complete
echo "Waiting for recovery to complete..."
while sudo -u postgres psql -c "SELECT pg_is_in_recovery();" | grep -q "t"; do
    sleep 5
    echo "Still recovering..."
done

echo "Point-in-time recovery completed"

# Verify recovery
sudo -u postgres psql -d penguin_status -c "SELECT COUNT(*) FROM monitors;"

# Start Penguin Status service
sudo systemctl start penguin-status
```

### Configuration Recovery

**Configuration Recovery Script**:
```bash
#!/bin/bash
# Configuration recovery script

CONFIG_BACKUP="$1"
APP_DIR="/opt/penguin-status"

if [ -z "$CONFIG_BACKUP" ]; then
    echo "Usage: $0 <config_backup_file>"
    exit 1
fi

if [ ! -f "$CONFIG_BACKUP" ]; then
    echo "Configuration backup not found: $CONFIG_BACKUP"
    exit 1
fi

echo "Starting configuration recovery..."

# Stop service
sudo systemctl stop penguin-status

# Backup current configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp "$APP_DIR/.env" "$APP_DIR/.env.recovery-backup-$TIMESTAMP" 2>/dev/null || true
cp "$APP_DIR/config.json" "$APP_DIR/config.json.recovery-backup-$TIMESTAMP" 2>/dev/null || true

# Extract configuration backup
TEMP_DIR=$(mktemp -d)
tar -xzf "$CONFIG_BACKUP" -C "$TEMP_DIR"

# Restore configuration files
if [ -d "$TEMP_DIR/penguin-status-config" ]; then
    cp -r "$TEMP_DIR/penguin-status-config/"* /
    echo "Configuration files restored"
else
    echo "Invalid configuration backup format"
    exit 1
fi

# Set proper permissions
chown -R penguin:penguin "$APP_DIR"
chmod 600 "$APP_DIR/.env"
chmod 644 "$APP_DIR/config.json"

# Cleanup
rm -rf "$TEMP_DIR"

# Start service
sudo systemctl start penguin-status

# Verify service
if sudo systemctl is-active --quiet penguin-status; then
    echo "Configuration recovery completed successfully"
else
    echo "Service failed to start after configuration recovery"
    exit 1
fi
```

## 🚨 Disaster Recovery

### Complete System Recovery

**Disaster Recovery Plan**:
```bash
#!/bin/bash
# Complete disaster recovery script

BACKUP_LOCATION="$1"  # S3 bucket, remote server, or local path
RECOVERY_DATE="$2"    # Optional: specific backup date

set -euo pipefail

# Configuration
APP_DIR="/opt/penguin-status"
BACKUP_DIR="/tmp/penguin-recovery"
LOG_FILE="/tmp/disaster-recovery.log"

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

# Main recovery function
main() {
    log "Starting disaster recovery process"
    
    # Create recovery directory
    mkdir -p "$BACKUP_DIR"
    cd "$BACKUP_DIR"
    
    # Download/retrieve backup
    log "Retrieving backup from: $BACKUP_LOCATION"
    if [[ "$BACKUP_LOCATION" == s3://* ]]; then
        # S3 backup
        aws s3 sync "$BACKUP_LOCATION" .
    elif [[ "$BACKUP_LOCATION" == *@*:* ]]; then
        # Remote server backup
        rsync -avz "$BACKUP_LOCATION" .
    else
        # Local backup
        cp -r "$BACKUP_LOCATION"/* .
    fi
    
    # Find latest backup if no specific date provided
    if [ -z "${RECOVERY_DATE:-}" ]; then
        BACKUP_FILE=$(ls -t full_backup_*.tar.gz* | head -1)
    else
        BACKUP_FILE=$(ls full_backup_${RECOVERY_DATE}*.tar.gz* | head -1)
    fi
    
    if [ -z "$BACKUP_FILE" ]; then
        error_exit "No backup file found"
    fi
    
    log "Using backup file: $BACKUP_FILE"
    
    # Decrypt backup if encrypted
    if [[ "$BACKUP_FILE" == *.gpg ]]; then
        log "Decrypting backup"
        gpg --decrypt --batch --passphrase "$BACKUP_ENCRYPTION_KEY" \
            "$BACKUP_FILE" > "${BACKUP_FILE%.gpg}"
        BACKUP_FILE="${BACKUP_FILE%.gpg}"
    fi
    
    # Extract backup
    log "Extracting backup"
    tar -xzf "$BACKUP_FILE"
    
    # Install Penguin Status if not present
    if [ ! -d "$APP_DIR" ]; then
        log "Installing Penguin Status"
        sudo mkdir -p "$APP_DIR"
        sudo chown penguin:penguin "$APP_DIR"
        
        # Clone repository or copy application files
        git clone https://github.com/louislam/uptime-kuma.git "$APP_DIR"
        cd "$APP_DIR"
        npm install --production
    fi
    
    # Stop service if running
    sudo systemctl stop penguin-status 2>/dev/null || true
    
    # Restore database
    log "Restoring database"
    if [ -f "database/database_*.db.gz" ]; then
        DB_BACKUP=$(ls database/database_*.db.gz | head -1)
        gunzip -c "$DB_BACKUP" > "$APP_DIR/database/uptime_monitor.db"
        chown penguin:penguin "$APP_DIR/database/uptime_monitor.db"
    fi
    
    # Restore configuration
    log "Restoring configuration"
    if [ -f "config/config_*.tar.gz" ]; then
        CONFIG_BACKUP=$(ls config/config_*.tar.gz | head -1)
        tar -xzf "$CONFIG_BACKUP" -C "$APP_DIR"
    fi
    
    # Restore logs
    log "Restoring logs"
    if [ -f "logs/logs_*.tar.gz" ]; then
        LOGS_BACKUP=$(ls logs/logs_*.tar.gz | head -1)
        tar -xzf "$LOGS_BACKUP" -C "$APP_DIR"
    fi
    
    # Set proper permissions
    sudo chown -R penguin:penguin "$APP_DIR"
    sudo chmod 600 "$APP_DIR/.env"
    
    # Install/update systemd service
    log "Setting up systemd service"
    sudo cp "$APP_DIR/scripts/penguin-status.service" /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable penguin-status
    
    # Start service
    log "Starting Penguin Status service"
    sudo systemctl start penguin-status
    
    # Wait for service to start
    sleep 10
    
    # Verify recovery
    if sudo systemctl is-active --quiet penguin-status; then
        log "Disaster recovery completed successfully"
        log "Penguin Status is running on http://localhost:3001"
    else
        error_exit "Service failed to start after recovery"
    fi
    
    # Cleanup
    rm -rf "$BACKUP_DIR"
    
    log "Disaster recovery process completed"
}

# Check prerequisites
if [ "$EUID" -ne 0 ]; then
    echo "This script must be run as root"
    exit 1
fi

if [ -z "${BACKUP_LOCATION:-}" ]; then
    echo "Usage: $0 <backup_location> [recovery_date]"
    echo "Examples:"
    echo "  $0 s3://my-bucket/penguin-backups/"
    echo "  $0 user@server:/backups/penguin/"
    echo "  $0 /mnt/backups/penguin/"
    exit 1
fi

# Run main function
main "$@"
```

### Recovery Testing

**Automated Recovery Test**:
```bash
#!/bin/bash
# Automated recovery testing script

TEST_DIR="/tmp/penguin-recovery-test"
BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Starting recovery test..."

# Create test environment
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Extract backup
tar -xzf "$BACKUP_FILE"

# Test database integrity
if [ -f "database/database_*.db.gz" ]; then
    DB_FILE=$(ls database/database_*.db.gz | head -1)
    gunzip -c "$DB_FILE" > test.db
    
    # Check database integrity
    sqlite3 test.db "PRAGMA integrity_check;" | grep -q "ok"
    if [ $? -eq 0 ]; then
        echo "✓ Database integrity check passed"
    else
        echo "✗ Database integrity check failed"
        exit 1
    fi
    
    # Check table structure
    TABLES=$(sqlite3 test.db ".tables")
    EXPECTED_TABLES="monitors heartbeats users notifications settings"
    
    for table in $EXPECTED_TABLES; do
        if echo "$TABLES" | grep -q "$table"; then
            echo "✓ Table $table exists"
        else
            echo "✗ Table $table missing"
            exit 1
        fi
    done
    
    # Check data consistency
    MONITOR_COUNT=$(sqlite3 test.db "SELECT COUNT(*) FROM monitors;")
    echo "✓ Found $MONITOR_COUNT monitors in backup"
    
    rm test.db
fi

# Test configuration files
if [ -f "config/config_*.tar.gz" ]; then
    CONFIG_FILE=$(ls config/config_*.tar.gz | head -1)
    tar -tzf "$CONFIG_FILE" | grep -q ".env"
    if [ $? -eq 0 ]; then
        echo "✓ Configuration files present"
    else
        echo "✗ Configuration files missing"
        exit 1
    fi
fi

# Cleanup
cd /
rm -rf "$TEST_DIR"

echo "Recovery test completed successfully"
```

## 🧪 Backup Testing

### Backup Verification

**Backup Verification Script**:
```javascript
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('sqlite3');
const { promisify } = require('util');
const zlib = require('zlib');
const gunzip = promisify(zlib.gunzip);

class BackupVerifier {
  constructor(backupDir) {
    this.backupDir = backupDir;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }
  
  async verifyAllBackups() {
    console.log('Starting backup verification...');
    
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => 
        file.endsWith('.db.gz') || file.endsWith('.tar.gz')
      );
      
      for (const file of backupFiles) {
        await this.verifyBackup(path.join(this.backupDir, file));
      }
      
      this.printResults();
      
    } catch (error) {
      console.error('Backup verification failed:', error);
    }
  }
  
  async verifyBackup(filePath) {
    const fileName = path.basename(filePath);
    console.log(`Verifying: ${fileName}`);
    
    try {
      // Check file exists and is readable
      await this.testFileAccess(filePath);
      
      // Check file size
      await this.testFileSize(filePath);
      
      // Check file integrity
      await this.testFileIntegrity(filePath);
      
      // Type-specific tests
      if (fileName.includes('database')) {
        await this.testDatabaseBackup(filePath);
      } else if (fileName.includes('config')) {
        await this.testConfigBackup(filePath);
      }
      
      this.addResult(fileName, 'PASS', 'All tests passed');
      
    } catch (error) {
      this.addResult(fileName, 'FAIL', error.message);
    }
  }
  
  async testFileAccess(filePath) {
    try {
      await fs.access(filePath, fs.constants.R_OK);
    } catch (error) {
      throw new Error(`File not accessible: ${error.message}`);
    }
  }
  
  async testFileSize(filePath) {
    const stats = await fs.stat(filePath);
    
    if (stats.size === 0) {
      throw new Error('File is empty');
    }
    
    if (stats.size < 1024) { // Less than 1KB
      throw new Error('File suspiciously small');
    }
  }
  
  async testFileIntegrity(filePath) {
    const data = await fs.readFile(filePath);
    
    // Test if it's a valid gzip file
    if (filePath.endsWith('.gz')) {
      try {
        await gunzip(data);
      } catch (error) {
        throw new Error(`Invalid gzip file: ${error.message}`);
      }
    }
    
    // Calculate checksum
    const checksum = crypto.createHash('sha256').update(data).digest('hex');
    console.log(`  Checksum: ${checksum.substring(0, 16)}...`);
  }
  
  async testDatabaseBackup(filePath) {
    const tempFile = `/tmp/test_${Date.now()}.db`;
    
    try {
      // Extract database
      const compressed = await fs.readFile(filePath);
      const decompressed = await gunzip(compressed);
      await fs.writeFile(tempFile, decompressed);
      
      // Test database integrity
      await this.testSQLiteIntegrity(tempFile);
      
      // Test table structure
      await this.testTableStructure(tempFile);
      
      // Test data consistency
      await this.testDataConsistency(tempFile);
      
    } finally {
      // Cleanup
      try {
        await fs.unlink(tempFile);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }
  
  testSQLiteIntegrity(dbPath) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
      
      db.get('PRAGMA integrity_check', (err, row) => {
        db.close();
        
        if (err) {
          reject(new Error(`Database integrity check failed: ${err.message}`));
        } else if (row && row.integrity_check === 'ok') {
          resolve();
        } else {
          reject(new Error('Database integrity check failed'));
        }
      });
    });
  }
  
  testTableStructure(dbPath) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
      const expectedTables = ['monitors', 'heartbeats', 'users', 'notifications'];
      
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        db.close();
        
        if (err) {
          reject(new Error(`Failed to get table list: ${err.message}`));
          return;
        }
        
        const tables = rows.map(row => row.name);
        
        for (const expectedTable of expectedTables) {
          if (!tables.includes(expectedTable)) {
            reject(new Error(`Missing table: ${expectedTable}`));
            return;
          }
        }
        
        console.log(`  Tables: ${tables.join(', ')}`);
        resolve();
      });
    });
  }
  
  testDataConsistency(dbPath) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
      
      // Test monitor count
      db.get('SELECT COUNT(*) as count FROM monitors', (err, row) => {
        if (err) {
          db.close();
          reject(new Error(`Failed to count monitors: ${err.message}`));
          return;
        }
        
        console.log(`  Monitors: ${row.count}`);
        
        // Test heartbeat count
        db.get('SELECT COUNT(*) as count FROM heartbeats', (err, row) => {
          db.close();
          
          if (err) {
            reject(new Error(`Failed to count heartbeats: ${err.message}`));
          } else {
            console.log(`  Heartbeats: ${row.count}`);
            resolve();
          }
        });
      });
    });
  }
  
  async testConfigBackup(filePath) {
    // Test if tar.gz file is valid
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync(`tar -tzf "${filePath}" > /dev/null`);
      console.log('  Configuration archive is valid');
    } catch (error) {
      throw new Error(`Invalid tar.gz file: ${error.message}`);
    }
  }
  
  addResult(fileName, status, message) {
    this.results.tests.push({ fileName, status, message });
    
    if (status === 'PASS') {
      this.results.passed++;
      console.log(`  ✓ ${fileName}: ${message}`);
    } else {
      this.results.failed++;
      console.log(`  ✗ ${fileName}: ${message}`);
    }
  }
  
  printResults() {
    console.log('\n=== Backup Verification Results ===');
    console.log(`Total tests: ${this.results.tests.length}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    
    if (this.results.failed > 0) {
      console.log('\nFailed tests:');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`  - ${test.fileName}: ${test.message}`);
        });
    }
    
    console.log(`\nOverall status: ${this.results.failed === 0 ? 'PASS' : 'FAIL'}`);
  }
}

// Usage
if (require.main === module) {
  const backupDir = process.argv[2] || '/opt/penguin-status/backups';
  const verifier = new BackupVerifier(backupDir);
  verifier.verifyAllBackups();
}

module.exports = BackupVerifier;
```

## 📋 Best Practices

### Backup Strategy Checklist

**Planning**:
- [ ] Define Recovery Time Objective (RTO)
- [ ] Define Recovery Point Objective (RPO)
- [ ] Identify critical data and configurations
- [ ] Plan backup frequency based on data change rate
- [ ] Choose appropriate backup retention policy
- [ ] Select backup storage locations (local, remote, cloud)

**Implementation**:
- [ ] Automate backup processes
- [ ] Implement backup encryption
- [ ] Set up backup monitoring and alerting
- [ ] Document backup and recovery procedures
- [ ] Test backup integrity regularly
- [ ] Implement backup rotation and cleanup

**Security**:
- [ ] Encrypt sensitive backup data
- [ ] Secure backup storage locations
- [ ] Implement access controls for backups
- [ ] Audit backup access and operations
- [ ] Separate backup credentials from production

**Testing**:
- [ ] Perform regular recovery tests
- [ ] Test different recovery scenarios
- [ ] Verify backup completeness and integrity
- [ ] Document recovery procedures
- [ ] Train team on recovery processes

### Backup Monitoring

**Monitoring Script**:
```bash
#!/bin/bash
# Backup monitoring script

BACKUP_DIR="/opt/penguin-status/backups"
ALERT_EMAIL="admin@yourdomain.com"
WEBHOOK_URL="$BACKUP_ALERT_WEBHOOK"
MAX_AGE_HOURS=24

# Check if recent backup exists
check_recent_backup() {
    local backup_type="$1"
    local pattern="$2"
    
    local latest_backup=$(find "$BACKUP_DIR" -name "$pattern" -mtime -1 | head -1)
    
    if [ -z "$latest_backup" ]; then
        send_alert "CRITICAL" "No recent $backup_type backup found"
        return 1
    fi
    
    local backup_age=$(( ($(date +%s) - $(stat -c %Y "$latest_backup")) / 3600 ))
    
    if [ $backup_age -gt $MAX_AGE_HOURS ]; then
        send_alert "WARNING" "$backup_type backup is $backup_age hours old"
        return 1
    fi
    
    echo "✓ $backup_type backup is current ($backup_age hours old)"
    return 0
}

# Send alert
send_alert() {
    local level="$1"
    local message="$2"
    
    echo "[$level] $message"
    
    # Send email alert
    if [ -n "$ALERT_EMAIL" ] && command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "Penguin Status Backup Alert: $level" "$ALERT_EMAIL"
    fi
    
    # Send webhook alert
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"content\": \"🚨 Backup Alert: $message\",
                \"embeds\": [{
                    \"title\": \"$level Alert\",
                    \"description\": \"$message\",
                    \"color\": $([ "$level" = "CRITICAL" ] && echo 16711680 || echo 16753920),
                    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
                }]
            }"
    fi
}

# Main monitoring function
main() {
    echo "Starting backup monitoring..."
    
    local errors=0
    
    # Check database backups
    check_recent_backup "Database" "database_*.db.gz" || ((errors++))
    
    # Check configuration backups
    check_recent_backup "Configuration" "config_*.tar.gz" || ((errors++))
    
    # Check full backups
    check_recent_backup "Full" "full_backup_*.tar.gz*" || ((errors++))
    
    # Check backup directory size
    local backup_size=$(du -sh "$BACKUP_DIR" | cut -f1)
    echo "✓ Backup directory size: $backup_size"
    
    # Check available disk space
    local available_space=$(df -h "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    local usage_percent=$(df "$BACKUP_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $usage_percent -gt 90 ]; then
        send_alert "WARNING" "Backup disk usage is ${usage_percent}% (${available_space} available)"
        ((errors++))
    else
        echo "✓ Disk usage: ${usage_percent}% (${available_space} available)"
    fi
    
    if [ $errors -eq 0 ]; then
        echo "All backup checks passed"
    else
        echo "$errors backup check(s) failed"
        exit 1
    fi
}

main "$@"
```

---

## 📊 Backup Metrics

### Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|--------------|
| **Backup Success Rate** | 99.9% | Successful backups / Total attempts |
| **Recovery Time** | < 30 minutes | Time to restore from backup |
| **Backup Size Growth** | < 10% monthly | Month-over-month size increase |
| **Backup Age** | < 24 hours | Time since last backup |
| **Recovery Test Success** | 100% | Successful recovery tests |

### Backup Schedule Example

```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│   Sunday    │   Monday    │   Tuesday   │  Wednesday  │   Thursday  │   Friday    │  Saturday   │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ 02:00 Full  │ 02:00 DB    │ 02:00 DB    │ 02:00 DB    │ 02:00 DB    │ 02:00 DB    │ 02:00 DB    │
│ 08:00 DB    │ 08:00 DB    │ 08:00 DB    │ 08:00 DB    │ 08:00 DB    │ 08:00 DB    │ 08:00 DB    │
│ 14:00 DB    │ 14:00 DB    │ 14:00 DB    │ 14:00 DB    │ 14:00 DB    │ 14:00 DB    │ 14:00 DB    │
│ 20:00 DB    │ 20:00 DB    │ 20:00 DB    │ 20:00 DB    │ 20:00 DB    │ 20:00 DB    │ 20:00 DB    │
│             │             │             │ 23:00 Config│             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

**Legend**:
- **Full**: Complete system backup
- **DB**: Database backup only
- **Config**: Configuration backup (triggered by changes)

---

## 🎯 Recovery Time Objectives

### Service Level Targets

| Scenario | RTO (Recovery Time) | RPO (Data Loss) | Priority |
|----------|--------------------|-----------------|-----------|
| **Database Corruption** | 15 minutes | 6 hours | Critical |
| **Configuration Loss** | 5 minutes | 24 hours | High |
| **Complete System Loss** | 2 hours | 6 hours | Critical |
| **Partial Data Loss** | 30 minutes | 6 hours | High |
| **Hardware Failure** | 4 hours | 6 hours | Medium |

### Recovery Procedures Summary

1. **Assess the situation** - Determine scope of data loss
2. **Stop services** - Prevent further data corruption
3. **Identify backup** - Select appropriate backup file
4. **Restore data** - Follow recovery procedures
5. **Verify integrity** - Test restored data
6. **Restart services** - Bring system back online
7. **Monitor** - Ensure system stability
8. **Document** - Record incident and lessons learned

---

*Backup and Recovery guide last updated: December 2024*