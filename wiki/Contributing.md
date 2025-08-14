# 🤝 Contributing to Penguin Status

Thank you for your interest in contributing to Penguin Status! This guide will help you get started with contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Setup](#-development-setup)
- [Contributing Guidelines](#-contributing-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Issue Guidelines](#-issue-guidelines)
- [Coding Standards](#-coding-standards)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Community](#-community)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

### Our Pledge

We are committed to making participation in our project a harassment-free experience for everyone, regardless of:
- Age, body size, disability, ethnicity, gender identity and expression
- Level of experience, nationality, personal appearance, race, religion
- Sexual identity and orientation

### Expected Behavior

- **Be respectful** and inclusive
- **Be collaborative** and constructive
- **Be patient** with newcomers
- **Give credit** where it's due
- **Focus on what's best** for the community

## 🚀 Getting Started

### Ways to Contribute

There are many ways to contribute to Penguin Status:

- 🐛 **Report bugs** and issues
- 💡 **Suggest new features** or improvements
- 📝 **Improve documentation**
- 🔧 **Fix bugs** and implement features
- 🧪 **Write tests** and improve test coverage
- 🌍 **Translate** the application
- 💬 **Help others** in discussions and issues
- 📢 **Spread the word** about Penguin Status

### First-Time Contributors

Look for issues labeled with:
- `good first issue` - Perfect for newcomers
- `help wanted` - We need community help
- `documentation` - Documentation improvements
- `beginner-friendly` - Easy to get started

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 16+ and npm
- **Git** for version control
- **Code editor** (VS Code recommended)
- **Docker** (optional, for containerized development)

### Local Development

1. **Fork the repository**:
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/penguin-status.git
   cd penguin-status
   ```

2. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/penguin-status.git
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Open in browser**:
   ```
   http://localhost:3001
   ```

### Development with Docker

1. **Build development image**:
   ```bash
   docker-compose -f docker-compose.dev.yml build
   ```

2. **Start development environment**:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

3. **Access application**:
   ```
   http://localhost:3001
   ```

### Project Structure

```
penguin-status/
├── 📁 public/              # Static files (CSS, JS, images)
│   ├── 📄 index.html       # Main status page
│   ├── 📄 manager.html     # Admin dashboard
│   ├── 📄 style.css        # Styles
│   └── 📄 script.js        # Frontend JavaScript
├── 📁 routes/              # Express.js routes
│   ├── 📄 auth.js          # Authentication routes
│   ├── 📄 monitors.js      # Monitor management
│   ├── 📄 api.js           # API endpoints
│   └── 📄 status.js        # Status page routes
├── 📁 services/            # Business logic
│   ├── 📄 monitorService.js # Monitor checking logic
│   ├── 📄 notificationService.js # Notifications
│   └── 📄 discordNotifier.js # Discord integration
├── 📁 database/            # Database files
│   ├── 📄 db.js            # Database connection
│   └── 📄 uptime_monitor.db # SQLite database
├── 📁 tests/               # Test files
│   ├── 📄 unit/            # Unit tests
│   ├── 📄 integration/     # Integration tests
│   └── 📄 e2e/             # End-to-end tests
├── 📁 docs/                # Documentation
├── 📁 scripts/             # Utility scripts
├── 📄 server.js            # Main server file
├── 📄 package.json         # Dependencies and scripts
├── 📄 .env.example         # Environment template
└── 📄 README.md            # Project README
```

## 📋 Contributing Guidelines

### Before You Start

1. **Check existing issues** to avoid duplicates
2. **Discuss major changes** in GitHub Discussions first
3. **Keep changes focused** - one feature/fix per PR
4. **Follow coding standards** (see below)
5. **Write tests** for new functionality
6. **Update documentation** as needed

### Branching Strategy

We use **Git Flow** with these branches:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes
- `release/*` - Release preparation

### Branch Naming

```bash
# Features
feature/add-telegram-notifications
feature/improve-dashboard-ui

# Bug fixes
bugfix/fix-notification-timing
bugfix/resolve-memory-leak

# Hotfixes
hotfix/security-patch-auth
hotfix/critical-database-fix
```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Examples
feat(notifications): add Telegram bot integration
fix(monitors): resolve timeout handling issue
docs(api): update authentication examples
test(services): add unit tests for monitor service
refactor(database): optimize query performance
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `ci` - CI/CD changes

## 🔄 Pull Request Process

### Creating a Pull Request

1. **Create feature branch**:
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed
   - Follow coding standards

3. **Test your changes**:
   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat(scope): description of changes"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**:
   - Go to GitHub and create a PR
   - Use the PR template
   - Link related issues
   - Request review from maintainers

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
Fixes #123
Closes #456

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] New tests added for new functionality

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. **Automated checks** must pass:
   - Tests
   - Linting
   - Security scans
   - Build verification

2. **Code review** by maintainers:
   - Code quality and style
   - Functionality and logic
   - Test coverage
   - Documentation

3. **Approval and merge**:
   - At least one maintainer approval required
   - All conversations resolved
   - Squash and merge to develop

## 🐛 Issue Guidelines

### Reporting Bugs

Use the **Bug Report** template:

```markdown
## Bug Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., Ubuntu 20.04]
- Node.js version: [e.g., 18.17.0]
- Penguin Status version: [e.g., 2.1.0]
- Browser: [e.g., Chrome 91.0]

## Additional Context
- Error logs
- Screenshots
- Configuration details
```

### Feature Requests

Use the **Feature Request** template:

```markdown
## Feature Description
Clear description of the feature.

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other solutions you've considered.

## Additional Context
- Use cases
- Examples
- Mockups
```

### Issue Labels

- **Type**: `bug`, `feature`, `enhancement`, `documentation`
- **Priority**: `critical`, `high`, `medium`, `low`
- **Status**: `needs-triage`, `in-progress`, `blocked`, `ready`
- **Difficulty**: `good first issue`, `beginner-friendly`, `advanced`
- **Area**: `frontend`, `backend`, `database`, `notifications`, `api`

## 💻 Coding Standards

### JavaScript Style Guide

We follow **ESLint** configuration with these rules:

```javascript
// Use const/let instead of var
const API_URL = 'https://api.example.com';
let currentUser = null;

// Use arrow functions for callbacks
monitors.map(monitor => monitor.name);

// Use template literals
const message = `Monitor ${monitor.name} is ${status}`;

// Use async/await instead of promises
async function checkMonitor(monitor) {
  try {
    const response = await fetch(monitor.url);
    return response.ok;
  } catch (error) {
    console.error('Monitor check failed:', error);
    return false;
  }
}

// Use destructuring
const { name, url, type } = monitor;

// Use proper error handling
try {
  await performOperation();
} catch (error) {
  logger.error('Operation failed:', error);
  throw new Error('Operation failed');
}
```

### CSS/SCSS Guidelines

```css
/* Use BEM methodology */
.monitor-card {
  /* Block */
}

.monitor-card__title {
  /* Element */
}

.monitor-card--down {
  /* Modifier */
}

/* Use CSS custom properties */
:root {
  --primary-color: #007bff;
  --success-color: #28a745;
  --danger-color: #dc3545;
}

/* Mobile-first responsive design */
.container {
  width: 100%;
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }
}
```

### HTML Guidelines

```html
<!-- Use semantic HTML5 elements -->
<main class="dashboard">
  <section class="monitor-list">
    <article class="monitor-card">
      <header class="monitor-card__header">
        <h2 class="monitor-card__title">Website Monitor</h2>
      </header>
      <div class="monitor-card__content">
        <p class="monitor-card__status">Status: Up</p>
      </div>
    </article>
  </section>
</main>

<!-- Use proper accessibility attributes -->
<button 
  type="button" 
  class="btn btn-primary"
  aria-label="Add new monitor"
  onclick="showAddMonitorDialog()"
>
  Add Monitor
</button>

<!-- Use proper form structure -->
<form class="monitor-form" onsubmit="handleSubmit(event)">
  <div class="form-group">
    <label for="monitor-name">Monitor Name</label>
    <input 
      type="text" 
      id="monitor-name" 
      name="name" 
      required 
      aria-describedby="name-help"
    >
    <small id="name-help">Enter a descriptive name for this monitor</small>
  </div>
</form>
```

### Node.js/Express Guidelines

```javascript
// Use proper error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Use proper validation
const { body, validationResult } = require('express-validator');

app.post('/api/monitors',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('url').isURL().withMessage('Valid URL is required'),
    body('type').isIn(['http', 'ping', 'tcp']).withMessage('Invalid monitor type')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Process request
  }
);

// Use proper async error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/api/monitors', asyncHandler(async (req, res) => {
  const monitors = await monitorService.getAllMonitors();
  res.json(monitors);
}));
```

### Database Guidelines

```javascript
// Use parameterized queries
const getMonitorById = async (id) => {
  const query = 'SELECT * FROM monitors WHERE id = ?';
  const result = await db.get(query, [id]);
  return result;
};

// Use transactions for multiple operations
const createMonitorWithSettings = async (monitorData, settingsData) => {
  const db = await getDatabase();
  
  try {
    await db.run('BEGIN TRANSACTION');
    
    const monitor = await createMonitor(monitorData);
    await createMonitorSettings(monitor.id, settingsData);
    
    await db.run('COMMIT');
    return monitor;
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
};

// Use proper connection management
const closeDatabase = async () => {
  if (db) {
    await db.close();
    db = null;
  }
};

process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});
```

## 🧪 Testing

### Test Structure

```
tests/
├── 📁 unit/                # Unit tests
│   ├── 📄 services/        # Service layer tests
│   ├── 📄 routes/          # Route handler tests
│   └── 📄 utils/           # Utility function tests
├── 📁 integration/         # Integration tests
│   ├── 📄 api/             # API endpoint tests
│   ├── 📄 database/        # Database tests
│   └── 📄 notifications/   # Notification tests
├── 📁 e2e/                 # End-to-end tests
│   ├── 📄 dashboard/       # Dashboard functionality
│   ├── 📄 monitors/        # Monitor management
│   └── 📄 status-page/     # Status page tests
└── 📁 fixtures/            # Test data and mocks
```

### Writing Tests

```javascript
// Unit test example
const { expect } = require('chai');
const monitorService = require('../services/monitorService');

describe('MonitorService', () => {
  describe('validateMonitorConfig', () => {
    it('should validate valid HTTP monitor config', () => {
      const config = {
        name: 'Test Monitor',
        url: 'https://example.com',
        type: 'http',
        interval: 60
      };
      
      const result = monitorService.validateMonitorConfig(config);
      expect(result.isValid).to.be.true;
    });
    
    it('should reject invalid URL', () => {
      const config = {
        name: 'Test Monitor',
        url: 'invalid-url',
        type: 'http'
      };
      
      const result = monitorService.validateMonitorConfig(config);
      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Invalid URL format');
    });
  });
});

// Integration test example
const request = require('supertest');
const app = require('../server');

describe('Monitors API', () => {
  let authToken;
  
  before(async () => {
    // Setup test database
    await setupTestDatabase();
    
    // Get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    
    authToken = response.body.token;
  });
  
  after(async () => {
    await cleanupTestDatabase();
  });
  
  describe('POST /api/monitors', () => {
    it('should create a new monitor', async () => {
      const monitorData = {
        name: 'Test Monitor',
        url: 'https://example.com',
        type: 'http'
      };
      
      const response = await request(app)
        .post('/api/monitors')
        .set('Authorization', `Bearer ${authToken}`)
        .send(monitorData)
        .expect(201);
      
      expect(response.body).to.have.property('id');
      expect(response.body.name).to.equal(monitorData.name);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/unit/services/monitorService.test.js
```

### Test Coverage

We aim for **80%+ test coverage**:

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## 📚 Documentation

### Documentation Standards

1. **Code Comments**:
   ```javascript
   /**
    * Checks if a monitor is currently up
    * @param {Object} monitor - The monitor configuration
    * @param {string} monitor.url - The URL to check
    * @param {number} monitor.timeout - Request timeout in ms
    * @returns {Promise<boolean>} True if monitor is up
    * @throws {Error} If monitor configuration is invalid
    */
   async function checkMonitorStatus(monitor) {
     // Implementation
   }
   ```

2. **API Documentation**:
   ```javascript
   /**
    * @api {post} /api/monitors Create Monitor
    * @apiName CreateMonitor
    * @apiGroup Monitors
    * @apiVersion 2.1.0
    * 
    * @apiParam {String} name Monitor name
    * @apiParam {String} url URL to monitor
    * @apiParam {String} type Monitor type (http, ping, tcp)
    * 
    * @apiSuccess {Number} id Monitor ID
    * @apiSuccess {String} name Monitor name
    * @apiSuccess {String} status Monitor status
    * 
    * @apiError {String} error Error message
    */
   ```

3. **README Updates**:
   - Keep installation instructions current
   - Update feature lists
   - Add new configuration options
   - Include troubleshooting steps

### Wiki Contributions

When updating wiki pages:

1. **Use clear headings** and structure
2. **Include code examples** where helpful
3. **Add screenshots** for UI changes
4. **Link to related pages**
5. **Keep content up-to-date**

## 👥 Community

### Communication Channels

- **GitHub Discussions** - General questions and ideas
- **GitHub Issues** - Bug reports and feature requests
- **Discord Server** - Real-time chat (coming soon)
- **Twitter** - Updates and announcements

### Getting Help

1. **Check documentation** first
2. **Search existing issues** and discussions
3. **Ask in GitHub Discussions** for general help
4. **Create an issue** for bugs or feature requests
5. **Join our Discord** for real-time help

### Helping Others

- **Answer questions** in discussions
- **Help triage issues** and provide feedback
- **Review pull requests** from other contributors
- **Share your experience** and use cases
- **Mentor new contributors**

## 🏆 Recognition

### Contributor Recognition

We recognize contributors in several ways:

- **Contributors page** on our website
- **Changelog mentions** for significant contributions
- **Special badges** for different types of contributions
- **Annual contributor awards**

### Types of Contributions

- 🐛 **Bug Hunter** - Reports and fixes bugs
- 💡 **Feature Creator** - Implements new features
- 📝 **Documentation Writer** - Improves documentation
- 🧪 **Test Engineer** - Writes and improves tests
- 🌍 **Translator** - Helps with internationalization
- 💬 **Community Helper** - Helps others in discussions
- 🔍 **Code Reviewer** - Reviews pull requests
- 🎨 **Designer** - Improves UI/UX

## 📞 Questions?

If you have questions about contributing:

1. **Read this guide** thoroughly
2. **Check the [FAQ](FAQ)**
3. **Ask in [GitHub Discussions](https://github.com/your-username/penguin-status/discussions)**
4. **Contact maintainers** directly if needed

---

**Thank you for contributing to Penguin Status! 🐧**

Every contribution, no matter how small, helps make Penguin Status better for everyone. We appreciate your time and effort!

---

*Contributing guide last updated: December 2024*