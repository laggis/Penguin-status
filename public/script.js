// Penguin Status Dashboard JavaScript

class UptimeMonitor {
    constructor() {
        this.socket = null;
        this.monitors = [];
        this.heartbeats = [];
        this.isConnected = false;
        this.authToken = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        
        this.init();
    }

    async init() {
        // Validate existing token before proceeding
        await this.validateToken();
        
        // Update UI based on authentication status
        this.updateAuthUI();
        this.connectSocket();
        this.setupEventListeners();
        this.loadMonitors();
    }

    async validateToken() {
        if (this.authToken) {
            try {
                const response = await fetch('/api/auth/validate', {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                });
                
                if (!response.ok) {
                    // Token is invalid, clear it
                    console.log('Invalid token detected, clearing authentication');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    this.authToken = null;
                    this.user = null;
                }
            } catch (error) {
                console.error('Error validating token:', error);
                // Clear token on error to be safe
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                this.authToken = null;
                this.user = null;
            }
        }
    }

    connectSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.isConnected = true;
            this.showConnectionStatus('Connected', 'success');
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.isConnected = false;
            this.showConnectionStatus('Disconnected', 'danger');
        });
        
        this.socket.on('currentStatus', (data) => {
            this.monitors = data.monitors || [];
            this.heartbeats = data.heartbeats || [];
            this.updateDashboard();
        });
        
        this.socket.on('heartbeat', (heartbeat) => {
            this.handleNewHeartbeat(heartbeat);
        });
        
        this.socket.on('monitorAdded', (monitor) => {
            this.monitors.push(monitor);
            this.updateDashboard();
            this.showNotification(`Monitor "${monitor.name}" added successfully`, 'success');
        });
        
        this.socket.on('monitorRemoved', (monitorId) => {
            this.monitors = this.monitors.filter(m => m.id !== monitorId);
            this.updateDashboard();
            this.showNotification('Monitor removed successfully', 'info');
        });
        
        this.socket.on('monitorPaused', (monitorId) => {
            const monitor = this.monitors.find(m => m.id === monitorId);
            if (monitor) {
                monitor.active = 0;
                this.updateDashboard();
                this.showNotification(`Monitor "${monitor.name}" paused`, 'warning');
            }
        });
        
        this.socket.on('monitorResumed', (monitorId) => {
            const monitor = this.monitors.find(m => m.id === monitorId);
            if (monitor) {
                monitor.active = 1;
                this.updateDashboard();
                this.showNotification(`Monitor "${monitor.name}" resumed`, 'success');
            }
        });
    }

    setupEventListeners() {
        // Add monitor form submission
        document.getElementById('addMonitorForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMonitor();
        });
        
        // Refresh button
        window.refreshMonitors = () => {
            this.loadMonitors();
        };
        
        // Add monitor modal
        window.showAddMonitorModal = () => {
            const modal = new bootstrap.Modal(document.getElementById('addMonitorModal'));
            modal.show();
        };
        
        // Add monitor function
        window.addMonitor = () => {
            this.addMonitor();
        };
        
        // Logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }
    
    isAuthenticated() {
        return this.authToken && this.user;
    }
    
    updateAuthUI() {
        const userNameElement = document.getElementById('userName');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const addMonitorBtn = document.querySelector('[onclick="showAddMonitorModal()"]');
        const adminElements = document.querySelectorAll('.admin-only');
        const managerBtn = document.getElementById('managerBtn');
        
        if (this.isAuthenticated()) {
            // User is logged in - show user features
            if (userNameElement) userNameElement.textContent = this.user.username || 'User';
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            if (addMonitorBtn) addMonitorBtn.style.display = 'inline-block';
            
            // Show/hide admin-only elements based on user role
            const isAdmin = this.user && this.user.role === 'admin';
            adminElements.forEach(el => el.style.display = isAdmin ? 'block' : 'none');
            if (managerBtn) managerBtn.style.display = isAdmin ? 'inline-block' : 'none';
        } else {
            // User is not logged in - hide all user features
            if (userNameElement) userNameElement.textContent = 'Guest';
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (addMonitorBtn) addMonitorBtn.style.display = 'none';
            if (managerBtn) managerBtn.style.display = 'none';
            adminElements.forEach(el => el.style.display = 'none');
        }
    }

    async loadMonitors() {
        try {
            const headers = {};
            if (this.authToken) {
                headers['Authorization'] = `Bearer ${this.authToken}`;
            }
            
            const response = await fetch('/api/monitors', { headers });
            if (response.ok) {
                this.monitors = await response.json();
                await this.loadStatus();
                this.updateDashboard();
            } else if (response.status === 401 && this.authToken) {
                // Only logout if we had a token that was rejected
                this.logout();
            }
        } catch (error) {
            console.error('Error loading monitors:', error);
            this.showNotification('Error loading monitors', 'danger');
        }
    }

    async loadStatus() {
        try {
            const response = await fetch('/api/status');
            if (response.ok) {
                const status = await response.json();
                this.updateStatusCards(status);
            }
        } catch (error) {
            console.error('Error loading status:', error);
        }
    }

    updateStatusCards(status) {
        document.getElementById('up-count').textContent = status.upMonitors || 0;
        document.getElementById('down-count').textContent = status.downMonitors || 0;
        document.getElementById('uptime-percentage').textContent = `${status.uptimePercentage || 100}%`;
        document.getElementById('avg-response').textContent = `${status.avgResponseTime || 0}ms`;
        
        // Update status indicator
        const statusIndicator = document.getElementById('status-indicator');
        const icon = statusIndicator.querySelector('i');
        
        if (status.status === 'operational') {
            icon.className = 'fas fa-circle text-success';
            statusIndicator.innerHTML = '<i class="fas fa-circle text-success"></i> All Systems Operational';
        } else if (status.status === 'partial_outage') {
            icon.className = 'fas fa-circle text-warning';
            statusIndicator.innerHTML = '<i class="fas fa-circle text-warning"></i> Partial Outage';
        } else {
            icon.className = 'fas fa-circle text-danger';
            statusIndicator.innerHTML = '<i class="fas fa-circle text-danger"></i> Major Outage';
        }
    }

    updateDashboard() {
        this.renderMonitors();
        this.updateMonitorCount();
    }

    renderMonitors() {
        const container = document.getElementById('monitors-container');
        
        if (this.monitors.length === 0) {
            container.innerHTML = `
                <div class="text-center p-4 text-muted">
                    <i class="fas fa-plus-circle fa-3x mb-3"></i>
                    <p>No monitors configured yet. Click "Add Monitor" to get started.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.monitors.map(monitor => this.renderMonitor(monitor)).join('');
    }

    renderMonitor(monitor) {
        const heartbeat = this.heartbeats.find(h => h.monitor_id === monitor.id);
        const status = heartbeat ? (heartbeat.status === 1 ? 'up' : 'down') : 'unknown';
        const responseTime = heartbeat ? heartbeat.response_time : null;
        const lastCheck = heartbeat ? new Date(heartbeat.timestamp).toLocaleString() : 'Never';
        const message = heartbeat ? heartbeat.message : 'No data';
        
        const responseTimeClass = responseTime ? 
            (responseTime < 200 ? 'fast' : responseTime < 1000 ? 'medium' : 'slow') : '';
        
        return `
            <div class="monitor-item" data-monitor-id="${monitor.id}">
                <div class="monitor-header">
                    <div class="d-flex align-items-center">
                        <span class="status-indicator status-${status}"></span>
                        <div>
                            <h6 class="monitor-title">${this.escapeHtml(monitor.name)}</h6>
                            <p class="monitor-url">${this.escapeHtml(monitor.url)}</p>
                        </div>
                    </div>
                    <div class="monitor-actions">
                        <span class="badge monitor-type-badge type-${monitor.type}">${monitor.type.toUpperCase()}</span>
                        <div class="admin-only">
                            ${monitor.active ? 
                                `<button class="btn btn-sm btn-outline-warning" onclick="pauseMonitor(${monitor.id})" title="Pause">
                                    <i class="fas fa-pause"></i>
                                </button>` :
                                `<button class="btn btn-sm btn-outline-success" onclick="resumeMonitor(${monitor.id})" title="Resume">
                                    <i class="fas fa-play"></i>
                                </button>`
                            }
                            <button class="btn btn-sm btn-outline-primary" onclick="testMonitor(${monitor.id})" title="Test Now">
                                <i class="fas fa-play-circle"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteMonitor(${monitor.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="monitor-stats">
                    <div class="stat-item">
                        <i class="fas fa-clock"></i>
                        <span class="response-time ${responseTimeClass}">
                            ${responseTime ? `${responseTime}ms` : 'N/A'}
                        </span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-sync-alt"></i>
                        <span>Every ${monitor.interval}s</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-info-circle"></i>
                        <span>${this.escapeHtml(message)}</span>
                    </div>
                    <div class="stat-item last-check">
                        <i class="fas fa-calendar"></i>
                        <span>Last check: ${lastCheck}</span>
                    </div>
                </div>
                
                <div class="uptime-bar">
                    <div class="uptime-fill ${status === 'up' ? '' : 'danger'}" style="width: ${status === 'up' ? '100' : '0'}%"></div>
                </div>
            </div>
        `;
    }

    updateMonitorCount() {
        const count = this.monitors.length;
        document.getElementById('monitor-count').textContent = `${count} monitor${count !== 1 ? 's' : ''}`;
    }

    handleNewHeartbeat(heartbeat) {
        // Update or add heartbeat
        const existingIndex = this.heartbeats.findIndex(h => h.monitor_id === heartbeat.monitor_id);
        if (existingIndex >= 0) {
            this.heartbeats[existingIndex] = heartbeat;
        } else {
            this.heartbeats.push(heartbeat);
        }
        
        // Update the specific monitor display
        this.updateMonitorDisplay(heartbeat.monitor_id);
        
        // Reload status to update overview cards
        this.loadStatus();
    }

    updateMonitorDisplay(monitorId) {
        const monitorElement = document.querySelector(`[data-monitor-id="${monitorId}"]`);
        if (monitorElement) {
            const monitor = this.monitors.find(m => m.id === monitorId);
            if (monitor) {
                monitorElement.outerHTML = this.renderMonitor(monitor);
            }
        }
    }

    async addMonitor() {
        const form = document.getElementById('addMonitorForm');
        const formData = new FormData(form);
        
        const monitorData = {
            name: document.getElementById('monitorName').value,
            type: document.getElementById('monitorType').value,
            url: document.getElementById('monitorUrl').value,
            interval: parseInt(document.getElementById('monitorInterval').value),
            timeout: parseInt(document.getElementById('monitorTimeout').value)
        };
        
        try {
            const response = await fetch('/api/monitors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify(monitorData)
            });
            
            if (response.ok) {
                const monitor = await response.json();
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addMonitorModal'));
                modal.hide();
                
                // Reset form
                form.reset();
                
                // Reload monitors to show the new one
                this.loadMonitors();
            } else if (response.status === 401) {
                this.logout();
            } else {
                const error = await response.json();
                this.showNotification(error.error || 'Error adding monitor', 'danger');
            }
        } catch (error) {
            console.error('Error adding monitor:', error);
            this.showNotification('Error adding monitor', 'danger');
        }
    }

    showConnectionStatus(message, type) {
        const statusElement = document.getElementById('connection-status');
        const textElement = document.getElementById('connection-text');
        
        statusElement.className = `alert alert-${type} alert-dismissible`;
        textElement.textContent = message;
        statusElement.style.display = 'block';
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 3000);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible notification`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for monitor actions
window.testDiscordNotification = async () => {
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch('/api/monitors/discord/test', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            app.showNotification('Discord test notification sent successfully! Check your Discord channel.', 'success');
        } else if (response.status === 401) {
            app.logout();
        } else {
            app.showNotification(result.error || 'Failed to send Discord test notification', 'danger');
        }
    } catch (error) {
        console.error('Error testing Discord notification:', error);
        app.showNotification('Error testing Discord notification', 'danger');
    }
};



window.pauseMonitor = async (monitorId) => {
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`/api/monitors/${monitorId}/pause`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            app.socket.emit('pauseMonitor', monitorId);
        } else if (response.status === 401) {
            app.logout();
        } else {
            const errorData = await response.json();
            app.showNotification(errorData.error || 'Error pausing monitor', 'danger');
        }
    } catch (error) {
        console.error('Error pausing monitor:', error);
        app.showNotification('Error pausing monitor', 'danger');
    }
};

window.resumeMonitor = async (monitorId) => {
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`/api/monitors/${monitorId}/resume`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            app.socket.emit('resumeMonitor', monitorId);
        } else if (response.status === 401) {
            app.logout();
        } else {
            const errorData = await response.json();
            app.showNotification(errorData.error || 'Error resuming monitor', 'danger');
        }
    } catch (error) {
        console.error('Error resuming monitor:', error);
        app.showNotification('Error resuming monitor', 'danger');
    }
};

window.testMonitor = async (monitorId) => {
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`/api/monitors/${monitorId}/test`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            app.showNotification('Monitor test initiated', 'info');
        } else if (response.status === 401) {
            app.logout();
        } else {
            const errorData = await response.json();
            app.showNotification(errorData.error || 'Error testing monitor', 'danger');
        }
    } catch (error) {
        console.error('Error testing monitor:', error);
        app.showNotification('Error testing monitor', 'danger');
    }
};

window.deleteMonitor = async (monitorId) => {
    if (!confirm('Are you sure you want to delete this monitor?')) {
        return;
    }
    
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`/api/monitors/${monitorId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            app.socket.emit('removeMonitor', monitorId);
        } else if (response.status === 401) {
            app.logout();
        } else {
            const errorData = await response.json();
            app.showNotification(errorData.error || 'Error deleting monitor', 'danger');
        }
    } catch (error) {
        console.error('Error deleting monitor:', error);
        app.showNotification('Error deleting monitor', 'danger');
    }
};

// User Management Functions
window.showChangePasswordModal = () => {
    const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    modal.show();
};

window.showUserManagementModal = async () => {
    const modal = new bootstrap.Modal(document.getElementById('userManagementModal'));
    modal.show();
    await loadUsers();
};

window.showAddUserModal = () => {
    const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
    modal.show();
};

window.changePassword = async () => {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        app.showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        app.showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        app.showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${app.authToken}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            app.showNotification('Password changed successfully', 'success');
            document.getElementById('changePasswordForm').reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
            modal.hide();
        } else {
            app.showNotification(data.error || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        app.showNotification('Failed to change password', 'error');
    }
};

window.addUser = async () => {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newUserPassword').value;

    const role = document.getElementById('newUserRole').value;
    
    if (!username || !password) {
        app.showNotification('Username and password are required', 'error');
        return;
    }
    
    if (password.length < 6) {
        app.showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${app.authToken}`
            },
            body: JSON.stringify({
                username,
                password,

                role
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            app.showNotification('User added successfully', 'success');
            document.getElementById('addUserForm').reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
            modal.hide();
            await loadUsers(); // Refresh user list
        } else {
            app.showNotification(data.error || 'Failed to add user', 'error');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        app.showNotification('Failed to add user', 'error');
    }
};

window.deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/auth/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${app.authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            app.showNotification('User deleted successfully', 'success');
            await loadUsers(); // Refresh user list
        } else {
            app.showNotification(data.error || 'Failed to delete user', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        app.showNotification('Failed to delete user', 'error');
    }
};

async function loadUsers() {
    try {
        const response = await fetch('/api/auth/users', {
            headers: {
                'Authorization': `Bearer ${app.authToken}`
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            renderUsers(users);
        } else {
            app.showNotification('Failed to load users', 'error');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        app.showNotification('Failed to load users', 'error');
    }
}

function renderUsers(users) {
    const container = document.getElementById('users-container');
    
    if (users.length === 0) {
        container.innerHTML = `
            <div class="text-center p-4 text-muted">
                <i class="fas fa-users fa-2x mb-3"></i>
                <p>No users found</p>
            </div>
        `;
        return;
    }
    
    const currentUserId = app.user?.id;
    
    container.innerHTML = users.map(user => `
        <div class="card mb-2">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">
                        <i class="fas fa-user me-2"></i>
                        ${app.escapeHtml(user.username)}
                        ${user.role === 'admin' ? '<span class="badge bg-primary ms-2">Admin</span>' : '<span class="badge bg-secondary ms-2">User</span>'}
                    </h6>
                    <small class="text-muted">

                        Created: ${new Date(user.created_at).toLocaleDateString()}
                    </small>
                </div>
                <div>
                    ${user.id !== currentUserId ? `
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : `
                        <span class="badge bg-info">Current User</span>
                    `}
                </div>
            </div>
        </div>
    `).join('');
}

// Theme Toggle Functionality
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (body.getAttribute('data-theme') === 'light') {
        // Switch to dark theme
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        // Switch to light theme
        body.setAttribute('data-theme', 'light');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (savedTheme === 'light') {
        body.setAttribute('data-theme', 'light');
        if (themeIcon) themeIcon.className = 'fas fa-moon';
    } else {
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    app = new UptimeMonitor();
});