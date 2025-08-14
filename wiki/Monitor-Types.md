# 📊 Monitor Types

Penguin Status supports multiple types of monitoring to ensure comprehensive coverage of your services and infrastructure.

## 🌐 HTTP/HTTPS Monitoring

Monitor web services, APIs, and websites by checking HTTP responses.

### Features
- ✅ HTTP and HTTPS support
- ✅ Custom headers and authentication
- ✅ Expected status code validation
- ✅ Response time measurement
- ✅ SSL certificate validation
- ✅ Redirect following
- ✅ Custom request methods (GET, POST, PUT, etc.)
- ✅ Request body support
- ✅ Response content validation

### Configuration

```json
{
  "name": "My Website",
  "url": "https://example.com",
  "type": "http",
  "interval": 60,
  "timeout": 30000,
  "settings": {
    "method": "GET",
    "expectedStatus": 200,
    "followRedirects": true,
    "maxRedirects": 5,
    "acceptInvalidCerts": false,
    "headers": {
      "User-Agent": "Penguin-Status/1.0",
      "Authorization": "Bearer your-token",
      "X-API-Key": "your-api-key"
    },
    "body": "",
    "contentType": "application/json",
    "expectedContent": "Welcome",
    "ignoreTLS": false
  }
}
```

### Settings Explained

| Setting | Description | Default | Example |
|---------|-------------|---------|----------|
| `method` | HTTP method | `GET` | `POST`, `PUT`, `DELETE` |
| `expectedStatus` | Expected HTTP status code | `200` | `201`, `204`, `301` |
| `followRedirects` | Follow HTTP redirects | `true` | `false` |
| `maxRedirects` | Maximum redirects to follow | `5` | `10` |
| `acceptInvalidCerts` | Accept invalid SSL certificates | `false` | `true` |
| `headers` | Custom HTTP headers | `{}` | See example above |
| `body` | Request body content | `""` | `{"key": "value"}` |
| `contentType` | Content-Type header | `application/json` | `text/plain` |
| `expectedContent` | Expected response content | `""` | `"success"` |
| `ignoreTLS` | Ignore TLS/SSL errors | `false` | `true` |

### Use Cases

#### Website Monitoring
```json
{
  "name": "Company Website",
  "url": "https://company.com",
  "type": "http",
  "interval": 300,
  "settings": {
    "expectedStatus": 200,
    "expectedContent": "Welcome to Company"
  }
}
```

#### API Endpoint Monitoring
```json
{
  "name": "User API",
  "url": "https://api.company.com/users",
  "type": "http",
  "interval": 60,
  "settings": {
    "method": "GET",
    "headers": {
      "Authorization": "Bearer api-token",
      "Accept": "application/json"
    },
    "expectedStatus": 200,
    "expectedContent": "users"
  }
}
```

#### Health Check Endpoint
```json
{
  "name": "Service Health",
  "url": "https://service.company.com/health",
  "type": "http",
  "interval": 30,
  "settings": {
    "expectedStatus": 200,
    "expectedContent": "healthy"
  }
}
```

## 🏓 Ping Monitoring

Monitor network connectivity and latency using ICMP ping.

### Features
- ✅ ICMP ping support
- ✅ Packet loss detection
- ✅ Round-trip time measurement
- ✅ Configurable packet size
- ✅ Multiple ping attempts
- ✅ IPv4 and IPv6 support

### Configuration

```json
{
  "name": "Server Ping",
  "url": "8.8.8.8",
  "type": "ping",
  "interval": 30,
  "timeout": 5000,
  "settings": {
    "packetSize": 32,
    "count": 4,
    "interval": 1000,
    "deadline": 10000,
    "ipVersion": 4
  }
}
```

### Settings Explained

| Setting | Description | Default | Range |
|---------|-------------|---------|-------|
| `packetSize` | Ping packet size in bytes | `32` | `8-65507` |
| `count` | Number of ping attempts | `4` | `1-10` |
| `interval` | Interval between pings (ms) | `1000` | `200-5000` |
| `deadline` | Total ping deadline (ms) | `10000` | `1000-30000` |
| `ipVersion` | IP version to use | `4` | `4`, `6` |

### Use Cases

#### Server Connectivity
```json
{
  "name": "Production Server",
  "url": "192.168.1.100",
  "type": "ping",
  "interval": 60,
  "settings": {
    "count": 3,
    "packetSize": 64
  }
}
```

#### Internet Connectivity
```json
{
  "name": "Google DNS",
  "url": "8.8.8.8",
  "type": "ping",
  "interval": 30,
  "settings": {
    "count": 4,
    "deadline": 5000
  }
}
```

#### IPv6 Connectivity
```json
{
  "name": "IPv6 Server",
  "url": "2001:4860:4860::8888",
  "type": "ping",
  "interval": 120,
  "settings": {
    "ipVersion": 6,
    "count": 3
  }
}
```

## 🔌 TCP Port Monitoring

Monitor TCP services by checking port connectivity.

### Features
- ✅ TCP connection testing
- ✅ Connection time measurement
- ✅ Port availability checking
- ✅ Custom connection timeout
- ✅ IPv4 and IPv6 support

### Configuration

```json
{
  "name": "Database Connection",
  "url": "database.company.com:5432",
  "type": "tcp",
  "interval": 120,
  "timeout": 10000,
  "settings": {
    "connectionTimeout": 5000,
    "ipVersion": 4
  }
}
```

### Settings Explained

| Setting | Description | Default | Range |
|---------|-------------|---------|-------|
| `connectionTimeout` | TCP connection timeout (ms) | `5000` | `1000-30000` |
| `ipVersion` | IP version preference | `4` | `4`, `6` |

### Use Cases

#### Database Monitoring
```json
{
  "name": "PostgreSQL Database",
  "url": "db.company.com:5432",
  "type": "tcp",
  "interval": 60,
  "settings": {
    "connectionTimeout": 3000
  }
}
```

#### SSH Service
```json
{
  "name": "SSH Server",
  "url": "server.company.com:22",
  "type": "tcp",
  "interval": 300,
  "settings": {
    "connectionTimeout": 5000
  }
}
```

#### Mail Server
```json
{
  "name": "SMTP Server",
  "url": "mail.company.com:587",
  "type": "tcp",
  "interval": 180,
  "settings": {
    "connectionTimeout": 10000
  }
}
```

## 🌍 DNS Monitoring

Monitor DNS resolution and validate DNS records.

### Features
- ✅ DNS resolution testing
- ✅ Multiple record types (A, AAAA, CNAME, MX, TXT)
- ✅ Expected value validation
- ✅ Custom DNS servers
- ✅ Resolution time measurement
- ✅ DNS propagation checking

### Configuration

```json
{
  "name": "Domain Resolution",
  "url": "example.com",
  "type": "dns",
  "interval": 300,
  "timeout": 5000,
  "settings": {
    "recordType": "A",
    "expectedValue": "93.184.216.34",
    "dnsServers": ["8.8.8.8", "1.1.1.1"],
    "validateAll": false
  }
}
```

### Settings Explained

| Setting | Description | Default | Options |
|---------|-------------|---------|----------|
| `recordType` | DNS record type to query | `A` | `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `NS` |
| `expectedValue` | Expected DNS response | `""` | IP address, domain, etc. |
| `dnsServers` | DNS servers to use | `["8.8.8.8"]` | Array of IP addresses |
| `validateAll` | Validate all returned records | `false` | `true`, `false` |

### Record Types

#### A Record (IPv4)
```json
{
  "name": "Website A Record",
  "url": "example.com",
  "type": "dns",
  "settings": {
    "recordType": "A",
    "expectedValue": "93.184.216.34"
  }
}
```

#### AAAA Record (IPv6)
```json
{
  "name": "Website IPv6",
  "url": "example.com",
  "type": "dns",
  "settings": {
    "recordType": "AAAA",
    "expectedValue": "2606:2800:220:1:248:1893:25c8:1946"
  }
}
```

#### CNAME Record
```json
{
  "name": "CDN CNAME",
  "url": "cdn.example.com",
  "type": "dns",
  "settings": {
    "recordType": "CNAME",
    "expectedValue": "cdn-provider.com"
  }
}
```

#### MX Record
```json
{
  "name": "Mail Server MX",
  "url": "example.com",
  "type": "dns",
  "settings": {
    "recordType": "MX",
    "expectedValue": "mail.example.com"
  }
}
```

#### TXT Record
```json
{
  "name": "SPF Record",
  "url": "example.com",
  "type": "dns",
  "settings": {
    "recordType": "TXT",
    "expectedValue": "v=spf1 include:_spf.google.com ~all"
  }
}
```

## ⚙️ Common Settings

All monitor types share these common settings:

### Basic Settings

| Setting | Description | Default | Required |
|---------|-------------|---------|----------|
| `name` | Monitor display name | - | ✅ |
| `url` | Target URL/IP/hostname | - | ✅ |
| `type` | Monitor type | - | ✅ |
| `interval` | Check interval (seconds) | `60` | No |
| `timeout` | Request timeout (milliseconds) | `30000` | No |
| `enabled` | Enable/disable monitoring | `true` | No |
| `retryAttempts` | Retry attempts on failure | `3` | No |
| `retryDelay` | Delay between retries (ms) | `5000` | No |

### Notification Settings

```json
{
  "notifications": {
    "enabled": true,
    "onDown": true,
    "onUp": true,
    "onDegraded": false,
    "cooldown": 300
  }
}
```

### Tags and Grouping

```json
{
  "tags": ["production", "critical", "web"],
  "group": "Frontend Services",
  "priority": "high"
}
```

## 📊 Monitor Status

Monitors can have the following statuses:

| Status | Description | Color |
|--------|-------------|-------|
| `up` | Service is responding correctly | 🟢 Green |
| `down` | Service is not responding or failing | 🔴 Red |
| `degraded` | Service is responding but slowly | 🟡 Yellow |
| `pending` | Monitor is newly created, waiting for first check | 🔵 Blue |
| `paused` | Monitor is temporarily disabled | ⚫ Gray |
| `unknown` | Unable to determine status | 🟠 Orange |

## 🔄 Check Intervals

Recommended check intervals by monitor type:

| Monitor Type | Minimum | Recommended | Maximum |
|--------------|---------|-------------|----------|
| HTTP/HTTPS | 30s | 60s - 300s | 3600s |
| Ping | 10s | 30s - 60s | 600s |
| TCP | 30s | 60s - 120s | 1800s |
| DNS | 60s | 300s - 600s | 3600s |

## 🚨 Failure Detection

### Consecutive Failures
A monitor is marked as "down" after consecutive failures:
- **Default**: 3 consecutive failures
- **Configurable**: 1-10 failures
- **Smart detection**: Adjusts based on historical data

### Recovery Detection
A monitor is marked as "up" after:
- **Default**: 1 successful check
- **Configurable**: 1-5 successful checks
- **Immediate**: For critical services

## 📈 Performance Metrics

All monitors track:
- **Response Time**: Time to complete the check
- **Uptime Percentage**: Availability over time periods
- **Success Rate**: Percentage of successful checks
- **Incident Count**: Number of downtime incidents
- **MTTR**: Mean Time To Recovery
- **MTBF**: Mean Time Between Failures

## 🔧 Advanced Configuration

### Custom User Agent
```json
{
  "settings": {
    "headers": {
      "User-Agent": "MyCompany-Monitor/1.0 (contact@company.com)"
    }
  }
}
```

### Authentication
```json
{
  "settings": {
    "headers": {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs...",
      "X-API-Key": "your-api-key-here"
    }
  }
}
```

### Proxy Support
```json
{
  "settings": {
    "proxy": {
      "host": "proxy.company.com",
      "port": 8080,
      "auth": {
        "username": "proxyuser",
        "password": "proxypass"
      }
    }
  }
}
```

## 📚 Best Practices

### 1. Choose Appropriate Intervals
- **Critical services**: 30-60 seconds
- **Important services**: 2-5 minutes
- **Non-critical services**: 5-15 minutes

### 2. Set Realistic Timeouts
- **Fast APIs**: 5-10 seconds
- **Web pages**: 15-30 seconds
- **Heavy operations**: 30-60 seconds

### 3. Use Meaningful Names
- Include service purpose
- Specify environment (prod, staging)
- Add location if relevant

### 4. Group Related Monitors
- Use tags for categorization
- Group by service or team
- Separate by criticality

### 5. Configure Appropriate Notifications
- Enable for critical services
- Set cooldown periods
- Use escalation rules

## 🚨 Troubleshooting

### Common Issues

#### HTTP Monitor Always Failing
- Check URL accessibility
- Verify SSL certificates
- Review expected status codes
- Check for authentication requirements

#### Ping Monitor Inconsistent
- Verify ICMP is allowed
- Check firewall rules
- Consider network latency
- Review packet loss

#### TCP Monitor Connection Refused
- Verify port is open
- Check service is running
- Review firewall rules
- Confirm correct hostname/IP

#### DNS Monitor Resolution Fails
- Verify domain exists
- Check DNS server accessibility
- Review record type
- Confirm expected values

---

## 📞 Need Help?

For monitor configuration assistance:

1. Check the [Configuration Guide](Configuration)
2. Review [example configurations](https://github.com/your-username/penguin-status/tree/main/examples/monitors)
3. [Ask for help](https://github.com/your-username/penguin-status/discussions) in GitHub Discussions

---

*Monitor Types guide last updated: December 2024*