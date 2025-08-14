# 🔌 API Reference

Penguin Status provides a comprehensive REST API for programmatic access to all monitoring features.

## 🔐 Authentication

All API endpoints (except login) require JWT authentication.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### Using the Token

Include the JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Monitors API

### List All Monitors

```http
GET /api/monitors
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "monitors": [
    {
      "id": 1,
      "name": "My Website",
      "url": "https://example.com",
      "type": "http",
      "interval": 60,
      "timeout": 30000,
      "status": "up",
      "lastCheck": "2024-12-20T10:30:00Z",
      "responseTime": 245,
      "uptime": 99.5,
      "createdAt": "2024-12-01T00:00:00Z",
      "updatedAt": "2024-12-20T10:30:00Z"
    }
  ]
}
```

### Get Monitor by ID

```http
GET /api/monitors/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "monitor": {
    "id": 1,
    "name": "My Website",
    "url": "https://example.com",
    "type": "http",
    "interval": 60,
    "timeout": 30000,
    "status": "up",
    "lastCheck": "2024-12-20T10:30:00Z",
    "responseTime": 245,
    "uptime": 99.5,
    "settings": {
      "expectedStatus": 200,
      "followRedirects": true,
      "headers": {}
    }
  }
}
```

### Create Monitor

```http
POST /api/monitors
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Website",
  "url": "https://newsite.com",
  "type": "http",
  "interval": 300,
  "timeout": 30000,
  "settings": {
    "expectedStatus": 200,
    "followRedirects": true,
    "headers": {
      "User-Agent": "Penguin-Status/1.0"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "monitor": {
    "id": 2,
    "name": "New Website",
    "url": "https://newsite.com",
    "type": "http",
    "interval": 300,
    "timeout": 30000,
    "status": "pending",
    "createdAt": "2024-12-20T10:35:00Z"
  }
}
```

### Update Monitor

```http
PUT /api/monitors/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Website Name",
  "interval": 120,
  "settings": {
    "expectedStatus": 200,
    "timeout": 25000
  }
}
```

### Delete Monitor

```http
DELETE /api/monitors/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Monitor deleted successfully"
}
```

### Pause/Resume Monitor

```http
POST /api/monitors/{id}/pause
Authorization: Bearer {token}
```

```http
POST /api/monitors/{id}/resume
Authorization: Bearer {token}
```

## 📈 Heartbeats API

### Get Monitor Heartbeats

```http
GET /api/monitors/{id}/heartbeats?limit=100&offset=0
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Number of records (default: 100, max: 1000)
- `offset` (optional): Offset for pagination (default: 0)
- `from` (optional): Start date (ISO 8601)
- `to` (optional): End date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "heartbeats": [
    {
      "id": 1001,
      "monitorId": 1,
      "status": "up",
      "responseTime": 245,
      "statusCode": 200,
      "message": "OK",
      "timestamp": "2024-12-20T10:30:00Z"
    }
  ],
  "total": 5000,
  "limit": 100,
  "offset": 0
}
```

### Get Latest Heartbeat

```http
GET /api/monitors/{id}/heartbeats/latest
Authorization: Bearer {token}
```

## 📊 Statistics API

### Get Monitor Statistics

```http
GET /api/monitors/{id}/stats?period=24h
Authorization: Bearer {token}
```

**Query Parameters:**
- `period`: `1h`, `24h`, `7d`, `30d`, `90d` (default: `24h`)

**Response:**
```json
{
  "success": true,
  "stats": {
    "uptime": 99.5,
    "avgResponseTime": 245,
    "totalChecks": 1440,
    "successfulChecks": 1433,
    "failedChecks": 7,
    "incidents": [
      {
        "start": "2024-12-19T15:30:00Z",
        "end": "2024-12-19T15:35:00Z",
        "duration": 300,
        "reason": "Connection timeout"
      }
    ]
  }
}
```

### Get Overall Statistics

```http
GET /api/stats/overview
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "overview": {
    "totalMonitors": 15,
    "upMonitors": 13,
    "downMonitors": 2,
    "pausedMonitors": 0,
    "overallUptime": 98.7,
    "avgResponseTime": 312,
    "totalIncidents": 3,
    "activeIncidents": 1
  }
}
```

## 👥 Users API

### List Users (Admin Only)

```http
GET /api/users
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "createdAt": "2024-12-01T00:00:00Z",
      "lastLogin": "2024-12-20T10:00:00Z"
    }
  ]
}
```

### Create User (Admin Only)

```http
POST /api/users
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "username": "newuser",
  "password": "securepassword",
  "role": "user"
}
```

### Update User

```http
PUT /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "updatedname",
  "role": "user"
}
```

### Change Password

```http
PUT /api/users/{id}/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### Delete User (Admin Only)

```http
DELETE /api/users/{id}
Authorization: Bearer {admin_token}
```

## 🔔 Notifications API

### Get Notification Settings

```http
GET /api/notifications/settings
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "discord": {
      "enabled": true,
      "webhookUrl": "https://discord.com/api/webhooks/...",
      "mentionRole": "@everyone"
    },
    "email": {
      "enabled": false,
      "smtp": {
        "host": "",
        "port": 587,
        "secure": false
      }
    }
  }
}
```

### Update Notification Settings

```http
PUT /api/notifications/settings
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "discord": {
    "enabled": true,
    "webhookUrl": "https://discord.com/api/webhooks/new-webhook",
    "mentionRole": "<@&123456789>"
  }
}
```

### Test Notification

```http
POST /api/notifications/test
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "type": "discord",
  "message": "Test notification from API"
}
```

## ⚙️ System API

### Get System Status

```http
GET /api/system/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "status": {
    "uptime": 86400,
    "version": "1.0.0",
    "nodeVersion": "18.17.0",
    "platform": "linux",
    "memory": {
      "used": 45.2,
      "total": 512,
      "percentage": 8.8
    },
    "database": {
      "connected": true,
      "size": "2.4 MB",
      "tables": 5
    },
    "monitoring": {
      "active": true,
      "totalMonitors": 15,
      "activeChecks": 13
    }
  }
}
```

### Get System Logs

```http
GET /api/system/logs?level=error&limit=100
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `level`: `error`, `warn`, `info`, `debug` (default: all)
- `limit`: Number of log entries (default: 100, max: 1000)
- `offset`: Offset for pagination

## 🔧 Configuration API

### Get Configuration

```http
GET /api/config
Authorization: Bearer {admin_token}
```

### Update Configuration

```http
PUT /api/config
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "checkInterval": 120,
  "timeout": 25000,
  "retryAttempts": 2
}
```

## 📡 WebSocket API

Connect to real-time updates via WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:3001');

// Send authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-jwt-token'
}));

// Listen for events
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### WebSocket Events

#### Monitor Status Update
```json
{
  "type": "monitor_status",
  "data": {
    "monitorId": 1,
    "status": "down",
    "responseTime": null,
    "timestamp": "2024-12-20T10:30:00Z",
    "message": "Connection timeout"
  }
}
```

#### New Heartbeat
```json
{
  "type": "heartbeat",
  "data": {
    "monitorId": 1,
    "status": "up",
    "responseTime": 245,
    "statusCode": 200,
    "timestamp": "2024-12-20T10:30:00Z"
  }
}
```

#### System Alert
```json
{
  "type": "system_alert",
  "data": {
    "level": "warning",
    "message": "High memory usage detected",
    "timestamp": "2024-12-20T10:30:00Z"
  }
}
```

## 📝 Monitor Types

### HTTP/HTTPS Monitor

```json
{
  "name": "Website Monitor",
  "url": "https://example.com",
  "type": "http",
  "interval": 60,
  "timeout": 30000,
  "settings": {
    "expectedStatus": 200,
    "followRedirects": true,
    "headers": {
      "User-Agent": "Penguin-Status/1.0",
      "Authorization": "Bearer token"
    },
    "body": "",
    "method": "GET",
    "acceptInvalidCerts": false
  }
}
```

### Ping Monitor

```json
{
  "name": "Server Ping",
  "url": "8.8.8.8",
  "type": "ping",
  "interval": 30,
  "timeout": 5000,
  "settings": {
    "packetSize": 32,
    "count": 4
  }
}
```

### TCP Monitor

```json
{
  "name": "Database Connection",
  "url": "database.example.com:5432",
  "type": "tcp",
  "interval": 120,
  "timeout": 10000,
  "settings": {
    "connectionTimeout": 5000
  }
}
```

### DNS Monitor

```json
{
  "name": "DNS Resolution",
  "url": "example.com",
  "type": "dns",
  "interval": 300,
  "timeout": 5000,
  "settings": {
    "recordType": "A",
    "expectedValue": "93.184.216.34",
    "dnsServers": ["8.8.8.8", "1.1.1.1"]
  }
}
```

## 🚨 Error Responses

### Authentication Error
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "code": 401
}
```

### Validation Error
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": {
    "url": "URL is required",
    "interval": "Interval must be at least 30 seconds"
  },
  "code": 400
}
```

### Not Found Error
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Monitor not found",
  "code": 404
}
```

### Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "code": 500
}
```

## 📊 Rate Limiting

API endpoints are rate limited:

- **Default**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Headers**: Rate limit info in response headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## 🔍 Filtering & Pagination

Many endpoints support filtering and pagination:

```http
GET /api/monitors?status=up&type=http&limit=50&offset=0&sort=name&order=asc
```

**Common Parameters:**
- `limit`: Number of results (max: 1000)
- `offset`: Pagination offset
- `sort`: Sort field
- `order`: `asc` or `desc`
- `search`: Search term

## 📚 SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

class PenguinStatusAPI {
  constructor(baseURL, token) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getMonitors() {
    const response = await this.client.get('/api/monitors');
    return response.data;
  }

  async createMonitor(monitor) {
    const response = await this.client.post('/api/monitors', monitor);
    return response.data;
  }
}

// Usage
const api = new PenguinStatusAPI('http://localhost:3001', 'your-token');
const monitors = await api.getMonitors();
```

### Python

```python
import requests

class PenguinStatusAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_monitors(self):
        response = requests.get(f'{self.base_url}/api/monitors', headers=self.headers)
        return response.json()
    
    def create_monitor(self, monitor):
        response = requests.post(f'{self.base_url}/api/monitors', json=monitor, headers=self.headers)
        return response.json()

# Usage
api = PenguinStatusAPI('http://localhost:3001', 'your-token')
monitors = api.get_monitors()
```

---

## 📞 Need Help?

For API support:

1. Check the [examples](https://github.com/your-username/penguin-status/tree/main/examples/api)
2. Review the [Postman collection](https://github.com/your-username/penguin-status/blob/main/docs/postman-collection.json)
3. [Open an issue](https://github.com/your-username/penguin-status/issues) for bugs or feature requests

---

*API Reference last updated: December 2024*