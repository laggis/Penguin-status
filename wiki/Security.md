# 🔒 Security Guide

Comprehensive security documentation for Penguin Status deployment and configuration.

## 📋 Table of Contents

- [Security Overview](#-security-overview)
- [Authentication & Authorization](#-authentication--authorization)
- [Network Security](#-network-security)
- [Data Protection](#-data-protection)
- [Secure Configuration](#-secure-configuration)
- [Monitoring & Logging](#-monitoring--logging)
- [Incident Response](#-incident-response)
- [Security Best Practices](#-security-best-practices)
- [Compliance](#-compliance)

## 🛡️ Security Overview

### Security Features

Penguin Status includes multiple layers of security:

- 🔐 **JWT-based Authentication** with secure token management
- 👤 **Role-based Access Control** (RBAC) for user management
- 🛡️ **Rate Limiting** to prevent abuse and DoS attacks
- 🔒 **HTTPS/TLS Support** for encrypted communications
- 🚫 **Input Validation** and sanitization
- 📝 **Audit Logging** for security events
- 🔑 **Secure Password Policies** with bcrypt hashing
- 🌐 **CORS Protection** for cross-origin requests
- 🛡️ **CSRF Protection** for form submissions
- 🔍 **Security Headers** for browser protection

### Security Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │  Reverse Proxy  │    │  Penguin Status │
│   (CloudFlare)  │───▶│     (Nginx)     │───▶│   Application   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DDoS Protection│    │  SSL/TLS Term.  │    │   Database      │
│   WAF Rules     │    │  Security Headers│    │   Encryption    │
│   Bot Protection│    │  Rate Limiting  │    │   Access Control│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔐 Authentication & Authorization

### JWT Authentication

**Configuration**:
```env
# JWT Settings
JWT_SECRET=your-super-secure-secret-key-here-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ALGORITHM=HS256

# Security Settings
SESSION_TIMEOUT=3600
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900
```

**Best Practices**:
```javascript
// Generate secure JWT secret
const crypto = require('crypto');
const jwtSecret = crypto.randomBytes(64).toString('hex');

// JWT token validation
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### User Management

**Password Security**:
```env
# Password Policy
MIN_PASSWORD_LENGTH=12
REQUIRE_UPPERCASE=true
REQUIRE_LOWERCASE=true
REQUIRE_NUMBERS=true
REQUIRE_SPECIAL_CHARS=true
PASSWORD_HISTORY=5
PASSWORD_EXPIRY_DAYS=90
```

**Implementation**:
```javascript
const bcrypt = require('bcryptjs');
const zxcvbn = require('zxcvbn');

// Password hashing
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Password strength validation
const validatePassword = (password) => {
  const result = zxcvbn(password);
  
  if (result.score < 3) {
    throw new Error('Password is too weak');
  }
  
  if (password.length < process.env.MIN_PASSWORD_LENGTH) {
    throw new Error('Password is too short');
  }
  
  return true;
};

// Account lockout protection
const checkAccountLockout = async (username) => {
  const user = await getUserByUsername(username);
  
  if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
    throw new Error('Account is locked due to too many failed attempts');
  }
  
  return user;
};
```

### Two-Factor Authentication (2FA)

**Setup**:
```env
# 2FA Configuration
ENABLE_2FA=true
TOTP_ISSUER=Penguin Status
TOTP_WINDOW=2
BACKUP_CODES_COUNT=10
```

**Implementation**:
```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate 2FA secret
const generate2FASecret = (username) => {
  const secret = speakeasy.generateSecret({
    name: username,
    issuer: process.env.TOTP_ISSUER || 'Penguin Status',
    length: 32
  });
  
  return {
    secret: secret.base32,
    qrCode: secret.otpauth_url
  };
};

// Verify 2FA token
const verify2FAToken = (token, secret) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: process.env.TOTP_WINDOW || 2
  });
};
```

### Role-Based Access Control

**Roles and Permissions**:
```javascript
const roles = {
  admin: {
    permissions: [
      'monitors:create',
      'monitors:read',
      'monitors:update',
      'monitors:delete',
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      'settings:read',
      'settings:update',
      'logs:read'
    ]
  },
  operator: {
    permissions: [
      'monitors:create',
      'monitors:read',
      'monitors:update',
      'settings:read'
    ]
  },
  viewer: {
    permissions: [
      'monitors:read',
      'status:read'
    ]
  }
};

// Permission middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const userPermissions = roles[userRole]?.permissions || [];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};
```

## 🌐 Network Security

### HTTPS/TLS Configuration

**Nginx SSL Configuration**:
```nginx
server {
    listen 443 ssl http2;
    server_name status.yourdomain.com;
    
    # SSL Certificate
    ssl_certificate /etc/ssl/certs/status.yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/status.yourdomain.com.key;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';" always;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Security headers
        proxy_hide_header X-Powered-By;
    }
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3001;
        # ... other proxy settings
    }
    
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:3001;
        # ... other proxy settings
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name status.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Firewall Configuration

**UFW (Ubuntu)**:
```bash
# Enable firewall
sudo ufw enable

# Allow SSH (change port if needed)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow specific application port (if not using reverse proxy)
sudo ufw allow 3001/tcp

# Deny all other incoming traffic
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Rate limiting for SSH
sudo ufw limit ssh

# Check status
sudo ufw status verbose
```

**iptables Rules**:
```bash
#!/bin/bash
# Basic iptables firewall

# Flush existing rules
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X

# Default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow SSH (change port if needed)
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Rate limiting for SSH
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP

# Save rules
iptables-save > /etc/iptables/rules.v4
```

### DDoS Protection

**Application-Level Protection**:
```javascript
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many API requests'
});

// Login rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts'
});

// Speed limiting
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: 500
});

app.use(generalLimiter);
app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);
app.use(speedLimiter);
```

## 🔐 Data Protection

### Database Security

**SQLite Security**:
```javascript
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Secure database connection
const openDatabase = async () => {
  const db = await open({
    filename: process.env.DATABASE_PATH,
    driver: sqlite3.Database
  });
  
  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');
  
  // Enable WAL mode for better concurrency
  await db.exec('PRAGMA journal_mode = WAL');
  
  // Set secure temp store
  await db.exec('PRAGMA temp_store = MEMORY');
  
  return db;
};

// Parameterized queries only
const getUserByUsername = async (username) => {
  const query = 'SELECT * FROM users WHERE username = ?';
  return await db.get(query, [username]);
};
```

**PostgreSQL Security**:
```javascript
const { Pool } = require('pg');

// Secure connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Connection security
pool.on('connect', (client) => {
  // Set session security
  client.query('SET session_replication_role = replica');
});
```

### Data Encryption

**Sensitive Data Encryption**:
```javascript
const crypto = require('crypto');

class DataEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
  }
  
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key, iv);
    
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
    const { encrypted, iv, authTag } = encryptedData;
    const decipher = crypto.createDecipher(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Usage
const encryption = new DataEncryption();
const encryptedPassword = encryption.encrypt(sensitiveData);
```

### Backup Security

**Encrypted Backups**:
```bash
#!/bin/bash
# Secure backup script

BACKUP_DIR="/secure/backups"
DATE=$(date +%Y%m%d_%H%M%S)
ENCRYPTION_KEY="/secure/keys/backup.key"

# Create encrypted database backup
sqlite3 database/uptime_monitor.db ".backup /tmp/backup_$DATE.db"
gpg --cipher-algo AES256 --compress-algo 1 --s2k-mode 3 \
    --s2k-digest-algo SHA512 --s2k-count 65536 \
    --symmetric --output "$BACKUP_DIR/db_$DATE.db.gpg" \
    "/tmp/backup_$DATE.db"

# Secure delete original
shred -vfz -n 3 "/tmp/backup_$DATE.db"

# Set secure permissions
chmod 600 "$BACKUP_DIR/db_$DATE.db.gpg"
chown backup:backup "$BACKUP_DIR/db_$DATE.db.gpg"

# Clean old backups (keep 30 days)
find "$BACKUP_DIR" -name "*.gpg" -mtime +30 -delete
```

## ⚙️ Secure Configuration

### Environment Variables

**Security Configuration**:
```env
# Application Security
NODE_ENV=production
SECURE_COOKIES=true
SAME_SITE_COOKIES=strict
CSRF_PROTECTION=true
CORS_ORIGIN=https://status.yourdomain.com

# Authentication
JWT_SECRET=your-super-secure-secret-key-min-32-chars
SESSION_SECRET=another-super-secure-secret-key
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
LOGIN_RATE_LIMIT=5

# Security Headers
HSTS_MAX_AGE=31536000
CSP_POLICY="default-src 'self'; script-src 'self' 'unsafe-inline'"

# Database Security
DATABASE_ENCRYPTION=true
DATABASE_SSL=true

# Logging
LOG_LEVEL=info
SECURITY_LOG_ENABLED=true
AUDIT_LOG_ENABLED=true
```

### Security Headers

**Express.js Security Middleware**:
```javascript
const helmet = require('helmet');
const cors = require('cors');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://status.yourdomain.com',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Penguin Status');
  res.setHeader('Server', 'Penguin');
  next();
});
```

### Input Validation

**Comprehensive Validation**:
```javascript
const { body, param, query, validationResult } = require('express-validator');
const DOMPurify = require('isomorphic-dompurify');

// Monitor validation
const validateMonitor = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be 1-100 characters')
    .customSanitizer(value => DOMPurify.sanitize(value)),
  
  body('url')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Valid URL required')
    .isLength({ max: 2048 })
    .withMessage('URL too long'),
  
  body('type')
    .isIn(['http', 'https', 'ping', 'tcp', 'dns'])
    .withMessage('Invalid monitor type'),
  
  body('interval')
    .isInt({ min: 30, max: 86400 })
    .withMessage('Interval must be 30-86400 seconds'),
  
  body('timeout')
    .optional()
    .isInt({ min: 1000, max: 30000 })
    .withMessage('Timeout must be 1000-30000ms')
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};
```

## 📊 Monitoring & Logging

### Security Logging

**Comprehensive Audit Logging**:
```javascript
const winston = require('winston');
const path = require('path');

// Security logger
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'security.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10
    }),
    new winston.transports.File({
      filename: path.join('logs', 'security-error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5
    })
  ]
});

// Security event logging
const logSecurityEvent = (event, details, req) => {
  securityLogger.info({
    event,
    details,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    user: req.user?.username,
    timestamp: new Date().toISOString(),
    sessionId: req.sessionID
  });
};

// Authentication middleware with logging
const authenticateWithLogging = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    logSecurityEvent('AUTH_MISSING_TOKEN', { path: req.path }, req);
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    logSecurityEvent('AUTH_SUCCESS', { user: decoded.username }, req);
    next();
  } catch (error) {
    logSecurityEvent('AUTH_INVALID_TOKEN', { error: error.message }, req);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Intrusion Detection

**Suspicious Activity Detection**:
```javascript
const suspiciousActivityDetector = {
  // Track failed login attempts
  failedLogins: new Map(),
  
  // Track API abuse
  apiAbuse: new Map(),
  
  checkSuspiciousLogin(ip, username) {
    const key = `${ip}:${username}`;
    const attempts = this.failedLogins.get(key) || 0;
    
    if (attempts >= 5) {
      this.alertSecurity('SUSPICIOUS_LOGIN_ATTEMPTS', {
        ip,
        username,
        attempts
      });
      return true;
    }
    
    return false;
  },
  
  recordFailedLogin(ip, username) {
    const key = `${ip}:${username}`;
    const attempts = this.failedLogins.get(key) || 0;
    this.failedLogins.set(key, attempts + 1);
    
    // Clean up old entries
    setTimeout(() => {
      this.failedLogins.delete(key);
    }, 15 * 60 * 1000); // 15 minutes
  },
  
  checkAPIAbuse(ip, endpoint) {
    const key = `${ip}:${endpoint}`;
    const requests = this.apiAbuse.get(key) || [];
    const now = Date.now();
    
    // Remove old requests (older than 1 minute)
    const recentRequests = requests.filter(time => now - time < 60000);
    
    if (recentRequests.length > 100) {
      this.alertSecurity('API_ABUSE_DETECTED', {
        ip,
        endpoint,
        requestCount: recentRequests.length
      });
      return true;
    }
    
    recentRequests.push(now);
    this.apiAbuse.set(key, recentRequests);
    
    return false;
  },
  
  alertSecurity(type, details) {
    securityLogger.error({
      alert: type,
      details,
      timestamp: new Date().toISOString()
    });
    
    // Send immediate notification
    this.sendSecurityAlert(type, details);
  },
  
  async sendSecurityAlert(type, details) {
    // Send to Discord/Slack/Email
    const message = `🚨 Security Alert: ${type}\n${JSON.stringify(details, null, 2)}`;
    
    if (process.env.SECURITY_WEBHOOK_URL) {
      try {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: message })
        });
      } catch (error) {
        console.error('Failed to send security alert:', error);
      }
    }
  }
};
```

## 🚨 Incident Response

### Security Incident Playbook

**1. Detection and Analysis**:
```bash
# Check for suspicious activity
tail -f logs/security.log | grep -E "(SUSPICIOUS|ALERT|ERROR)"

# Check system resources
top
df -h
netstat -tulpn

# Check network connections
ss -tulpn | grep :3001
lsof -i :3001

# Check for unauthorized access
last -n 20
who
w
```

**2. Containment**:
```bash
# Block suspicious IP
sudo ufw deny from <suspicious_ip>

# Disable compromised user
sudo usermod -L <username>

# Stop application if needed
sudo systemctl stop penguin-status

# Isolate database
sudo chmod 000 database/uptime_monitor.db
```

**3. Investigation**:
```bash
# Analyze logs
grep -r "<suspicious_ip>" logs/
grep -r "<compromised_user>" logs/

# Check file integrity
sudo find /opt/penguin-status -type f -exec sha256sum {} \; > current_hashes.txt
diff original_hashes.txt current_hashes.txt

# Check for backdoors
sudo find /opt/penguin-status -name "*.php" -o -name "*.js" | xargs grep -l "eval\|exec\|system"
```

**4. Recovery**:
```bash
# Restore from clean backup
sudo systemctl stop penguin-status
cp /secure/backups/clean_backup.db database/uptime_monitor.db

# Update all passwords
# Reset JWT secrets
# Regenerate API keys

# Apply security patches
git pull origin main
npm update

# Restart with monitoring
sudo systemctl start penguin-status
tail -f logs/security.log
```

### Emergency Contacts

**Security Team Contacts**:
```env
# Emergency contacts
SECURITY_TEAM_EMAIL=security@yourdomain.com
SECURITY_TEAM_PHONE=+1234567890
SECURITY_WEBHOOK=https://hooks.slack.com/services/...

# Incident response
INCIDENT_RESPONSE_TEAM=team@yourdomain.com
EMERGENCY_CONTACT=emergency@yourdomain.com
```

## 🛡️ Security Best Practices

### Deployment Security

**1. Server Hardening**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Remove unnecessary packages
sudo apt autoremove -y

# Configure automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades

# Disable root login
sudo passwd -l root

# Configure SSH security
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes
# Port 2222  # Change default port

# Restart SSH
sudo systemctl restart sshd
```

**2. Application Security**:
```javascript
// Security middleware stack
app.use(helmet());
app.use(cors(corsOptions));
app.use(rateLimit(rateLimitOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Input sanitization
app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  next();
});
```

**3. Database Security**:
```javascript
// Database connection security
const dbConfig = {
  filename: process.env.DATABASE_PATH,
  driver: sqlite3.Database,
  // Enable encryption if available
  ...(process.env.DATABASE_ENCRYPTION === 'true' && {
    key: process.env.DATABASE_KEY
  })
};

// Query security
const executeQuery = async (query, params = []) => {
  // Log all queries in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Query:', query, 'Params:', params);
  }
  
  // Validate query
  if (query.toLowerCase().includes('drop') || 
      query.toLowerCase().includes('delete') ||
      query.toLowerCase().includes('truncate')) {
    throw new Error('Dangerous query detected');
  }
  
  return await db.all(query, params);
};
```

### Regular Security Tasks

**Daily Tasks**:
- Review security logs
- Check for failed login attempts
- Monitor system resources
- Verify backup integrity

**Weekly Tasks**:
- Update dependencies
- Review user accounts
- Check SSL certificate expiry
- Analyze security metrics

**Monthly Tasks**:
- Security audit
- Penetration testing
- Update security documentation
- Review access permissions

**Quarterly Tasks**:
- Full security assessment
- Update incident response plan
- Security training
- Compliance review

## 📋 Compliance

### GDPR Compliance

**Data Protection**:
```javascript
// GDPR compliance features
const gdprCompliance = {
  // Data minimization
  collectMinimalData: true,
  
  // Data retention
  dataRetentionDays: 365,
  
  // User rights
  enableDataExport: true,
  enableDataDeletion: true,
  enableDataPortability: true,
  
  // Consent management
  requireExplicitConsent: true,
  trackConsentHistory: true,
  
  // Data processing log
  logDataProcessing: true
};

// Data export functionality
const exportUserData = async (userId) => {
  const userData = {
    profile: await getUserProfile(userId),
    monitors: await getUserMonitors(userId),
    notifications: await getUserNotifications(userId),
    logs: await getUserLogs(userId)
  };
  
  return {
    data: userData,
    exportDate: new Date().toISOString(),
    format: 'JSON'
  };
};

// Data deletion
const deleteUserData = async (userId) => {
  await db.run('BEGIN TRANSACTION');
  
  try {
    await db.run('DELETE FROM user_monitors WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM user_notifications WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM user_logs WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM users WHERE id = ?', [userId]);
    
    await db.run('COMMIT');
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
};
```

### SOC 2 Compliance

**Security Controls**:
- Access controls and authentication
- Data encryption in transit and at rest
- Logging and monitoring
- Incident response procedures
- Vendor management
- Business continuity planning

**Implementation Checklist**:
- [ ] Multi-factor authentication
- [ ] Role-based access control
- [ ] Encryption of sensitive data
- [ ] Comprehensive audit logging
- [ ] Regular security assessments
- [ ] Incident response plan
- [ ] Employee security training
- [ ] Vendor security assessments

---

## 🔍 Security Checklist

### Pre-Deployment
- [ ] Change all default passwords
- [ ] Generate secure JWT secrets
- [ ] Configure HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Enable security headers
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Create backup procedures

### Post-Deployment
- [ ] Monitor security logs
- [ ] Regular security updates
- [ ] Backup verification
- [ ] Access review
- [ ] Vulnerability scanning
- [ ] Incident response testing
- [ ] Security training
- [ ] Compliance audits

---

## 📞 Security Support

For security-related questions or to report vulnerabilities:

- **Security Email**: security@penguinstatus.com
- **Bug Bounty**: [HackerOne Program](https://hackerone.com/penguinstatus)
- **Security Advisories**: [GitHub Security](https://github.com/your-username/penguin-status/security)

---

*Security guide last updated: December 2024*