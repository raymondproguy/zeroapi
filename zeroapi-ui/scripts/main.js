// ZeroAPI Visual Builder - Main Application
class ZeroAPIBuilder {
    constructor() {
        this.currentView = 'api';
        this.endpoints = [];
        this.init();
    }

    init() {
        this.loadEndpoints();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.showView(this.currentView);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.showView(view);
            });
        });

        // Add Endpoint Button
        document.getElementById('add-endpoint-btn').addEventListener('click', () => {
            this.openEndpointModal();
        });

        // Deploy Button
        document.getElementById('deploy-btn').addEventListener('click', () => {
            this.openDeployModal();
        });

        // Live Preview
        document.getElementById('live-preview-btn').addEventListener('click', () => {
            this.toggleLivePreview();
        });
    }

    showView(viewName) {
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Show corresponding view
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `${viewName}-view`);
        });

        this.currentView = viewName;
    }

    loadEndpoints() {
        // Mock data - will be replaced with real data
        this.endpoints = [
            { method: 'GET', path: '/api/users', id: '1' },
            { method: 'POST', path: '/api/users', id: '2' },
            { method: 'GET', path: '/api/users/:id', id: '3' },
            { method: 'PUT', path: '/api/users/:id', id: '4' },
            { method: 'DELETE', path: '/api/users/:id', id: '5' },
            { method: 'POST', path: '/api/tasks', id: '6' },
            { method: 'GET', path: '/api/tasks', id: '7' }
        ];

        this.renderEndpoints();
    }

    renderEndpoints() {
        const grid = document.getElementById('endpoints-grid');
        grid.innerHTML = this.endpoints.map(endpoint => `
            <div class="endpoint-card" data-endpoint-id="${endpoint.id}">
                <div class="endpoint-method method-${endpoint.method.toLowerCase()}">
                    ${endpoint.method}
                </div>
                <div class="endpoint-path">${endpoint.path}</div>
                <div class="endpoint-actions">
                    <button class="action-btn view" onclick="builder.viewEndpoint('${endpoint.id}')">👁️</button>
                    <button class="action-btn edit" onclick="builder.editEndpoint('${endpoint.id}')">✏️</button>
                    <button class="action-btn delete" onclick="builder.deleteEndpoint('${endpoint.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    openEndpointModal() {
        // Will be implemented in endpoints.js
        console.log('Opening endpoint modal...');
    }

    openDeployModal() {
        console.log('Opening deploy modal...');
    }

    toggleLivePreview() {
        console.log('Toggling live preview...');
    }

    viewEndpoint(id) {
        console.log('Viewing endpoint:', id);
    }

    editEndpoint(id) {
        console.log('Editing endpoint:', id);
    }

    deleteEndpoint(id) {
        if (confirm('Are you sure you want to delete this endpoint?')) {
            this.endpoints = this.endpoints.filter(ep => ep.id !== id);
            this.renderEndpoints();
        }
    }
}

// Initialize the application
const builder = new ZeroAPIBuilder();
