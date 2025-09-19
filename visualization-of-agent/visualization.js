console.log('🎨 Loading visualization.js');

class WorkflowVisualization {
    constructor() {
        this.ws = null;
        this.nodes = new Map();
        this.connections = [];
        this.workflow = null;
        this.canvas = document.getElementById('workflow-canvas');
        this.container = document.querySelector('.canvas-container');

        this.layout = {
            startX: 100,
            startY: 120,
            nodeSpacing: 160,
            verticalOffset: 80
        };

        this.init();
    }

    init() {
        this.connectWebSocket();
        this.setupEventListeners();
        this.updateConnectionStatus('connecting');
    }

    connectWebSocket() {
        try {
            this.ws = new WebSocket('ws://localhost:8081');

            this.ws.onopen = () => {
                console.log('🔗 Connected to workflow server');
                this.updateConnectionStatus('connected');
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWorkflowEvent(data);
            };

            this.ws.onclose = () => {
                console.log('📡 Disconnected from workflow server');
                this.updateConnectionStatus('disconnected');
                setTimeout(() => this.connectWebSocket(), 3000);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus('error');
            };
        } catch (error) {
            console.error('Failed to connect to workflow server:', error);
            this.updateConnectionStatus('error');
        }
    }

    updateConnectionStatus(status) {
        const statusDot = document.getElementById('connection-status');
        const statusText = document.getElementById('connection-text');

        switch (status) {
            case 'connecting':
                statusDot.className = 'status-dot';
                statusText.textContent = 'Connecting...';
                break;
            case 'connected':
                statusDot.className = 'status-dot connected';
                statusText.textContent = 'Connected';
                break;
            case 'disconnected':
                statusDot.className = 'status-dot';
                statusText.textContent = 'Disconnected';
                break;
            case 'error':
                statusDot.className = 'status-dot';
                statusText.textContent = 'Connection Error';
                break;
        }
    }

    handleWorkflowEvent(event) {
        console.log('📨 Workflow event received:', event.type, event);

        switch (event.type) {
            case 'WORKFLOW_INIT':
                console.log('🚀 Initializing workflow with steps:', event.steps);
                this.initializeWorkflow(event.steps);
                break;
            case 'STEP_START':
                console.log('▶️ Starting step:', event.stepId);
                this.updateStepStatus(event.stepId, 'in-progress');
                break;
            case 'STEP_COMPLETE':
                console.log('✅ Completing step:', event.stepId);
                this.updateStepStatus(event.stepId, 'completed', event.data);
                break;
            default:
                console.log('❓ Unknown event type:', event.type);
        }
    }

    initializeWorkflow(steps) {
        console.log('🚀 Initializing workflow with', steps.length, 'steps');
        this.workflow = { steps };
        this.clearVisualization();
        this.createNodes(steps);
        this.createConnections();
        this.updateProgressInfo();
        this.showWorkflowInfo();
    }

    clearVisualization() {
        this.nodes.clear();
        this.connections = [];

        // Clear DOM nodes
        document.querySelectorAll('.node').forEach(node => node.remove());

        // Clear SVG connections
        const svg = document.getElementById('workflow-canvas');
        while (svg.children.length > 1) { // Keep the defs element
            svg.removeChild(svg.lastChild);
        }
    }

    createNodes(steps) {
        const containerRect = this.container.getBoundingClientRect();
        const totalWidth = containerRect.width;
        const totalHeight = containerRect.height;

        steps.forEach((step, index) => {
            const position = this.calculateNodePosition(index, steps.length, totalWidth, totalHeight);
            const node = this.createNode(step, position, index);
            this.nodes.set(step.id, { element: node, step, position });
        });
    }

    calculateNodePosition(index, totalSteps, containerWidth, containerHeight) {
        // Calculate positions in a flowing curved layout
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;

        if (totalSteps === 1) {
            return { x: centerX - 140, y: centerY - 50 };
        }

        // Create a gentle S-curve flow
        const progress = index / (totalSteps - 1);
        const angle = (progress - 0.5) * Math.PI * 0.8; // -0.4π to 0.4π

        const baseRadius = Math.min(containerWidth * 0.3, containerHeight * 0.25);
        const x = centerX + Math.sin(angle) * baseRadius - 140;
        const y = centerY + Math.cos(angle) * baseRadius * 0.6 - 50 + (progress * containerHeight * 0.2);

        return {
            x: Math.max(50, Math.min(x, containerWidth - 330)),
            y: Math.max(50, Math.min(y, containerHeight - 150))
        };
    }

    createNode(step, position, index = 0) {
        const node = document.createElement('div');
        node.className = `node ${step.status}`;
        node.style.left = `${position.x}px`;
        node.style.top = `${position.y}px`;
        node.setAttribute('data-step-id', step.id);

        node.innerHTML = `
            <div class="node-title">${step.name}</div>
            <div class="node-description">${step.description}</div>
            <div class="node-status">
                <div class="status-indicator"></div>
                ${step.status}
            </div>
        `;

        this.container.appendChild(node);

        // Add subtle entrance animation
        requestAnimationFrame(() => {
            node.style.opacity = '0';
            node.style.transform = 'translateY(20px)';
            setTimeout(() => {
                node.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                node.style.opacity = '1';
                node.style.transform = 'translateY(0)';
            }, index * 100);
        });

        return node;
    }

    createConnections() {
        if (this.workflow.steps.length < 2) return;

        const svg = document.getElementById('workflow-canvas');

        for (let i = 0; i < this.workflow.steps.length - 1; i++) {
            const currentStep = this.workflow.steps[i];
            const nextStep = this.workflow.steps[i + 1];

            const currentNode = this.nodes.get(currentStep.id);
            const nextNode = this.nodes.get(nextStep.id);

            if (currentNode && nextNode) {
                const connection = this.createConnection(currentNode, nextNode);
                svg.appendChild(connection);
                this.connections.push({
                    element: connection,
                    from: currentStep.id,
                    to: nextStep.id
                });
            }
        }
    }

    createConnection(fromNode, toNode) {
        const fromPos = this.getNodeConnectionPoint(fromNode.position);
        const toPos = this.getNodeConnectionPoint(toNode.position);

        // Create smooth curved path
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;

        // Control points for smooth curve
        const controlOffset = 50;
        const cp1x = fromPos.x + controlOffset;
        const cp1y = fromPos.y;
        const cp2x = toPos.x - controlOffset;
        const cp2y = toPos.y;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = `M ${fromPos.x} ${fromPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toPos.x} ${toPos.y}`;

        path.setAttribute('d', pathData);
        path.setAttribute('class', 'connection-path');

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'connection');
        group.appendChild(path);

        return group;
    }

    getNodeConnectionPoint(nodePosition) {
        // Return connection point at center-right of node
        return {
            x: nodePosition.x + 280, // node width
            y: nodePosition.y + 50   // node height / 2
        };
    }

    updateStepStatus(stepId, status, data = null) {
        const nodeData = this.nodes.get(stepId);
        if (!nodeData) return;

        const { element, step } = nodeData;

        // Update step data
        step.status = status;
        if (data) step.data = data;

        // Update DOM
        element.className = `node ${status}`;
        const statusElement = element.querySelector('.node-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="status-indicator"></div>
                ${status}
            `;
        }

        // Update connections
        this.updateConnections(stepId, status);
        this.updateProgressInfo();

        // Log status change
        console.log(`🔄 Step ${stepId}: ${step.name} → ${status}`);
        if (data) console.log('📊 Step data:', data);
    }

    updateConnections(stepId, status) {
        this.connections.forEach(connection => {
            if (connection.from === stepId && status === 'completed') {
                connection.element.setAttribute('class', 'connection completed');
            } else if (connection.to === stepId && status === 'in-progress') {
                connection.element.setAttribute('class', 'connection active');
            }
        });
    }

    updateProgressInfo() {
        if (!this.workflow) return;

        const completedSteps = this.workflow.steps.filter(step => step.status === 'completed').length;
        const totalSteps = this.workflow.steps.length;
        const progressPercentage = (completedSteps / totalSteps) * 100;

        document.getElementById('progress-text').textContent =
            `${completedSteps} of ${totalSteps} steps completed`;
        document.getElementById('progress-fill').style.width = `${progressPercentage}%`;
    }

    showWorkflowInfo() {
        const workflowInfo = document.getElementById('workflow-info');
        workflowInfo.style.display = 'block';
        workflowInfo.style.opacity = '0';

        setTimeout(() => {
            workflowInfo.style.transition = 'opacity 0.4s ease';
            workflowInfo.style.opacity = '1';
        }, 500);
    }

    setupEventListeners() {
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.workflow) {
                    this.repositionNodes();
                    this.updateConnections();
                }
            }, 250);
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                this.reconnectWebSocket();
            }
        });
    }

    repositionNodes() {
        if (!this.workflow) return;

        const containerRect = this.container.getBoundingClientRect();
        const totalWidth = containerRect.width;
        const totalHeight = containerRect.height;

        this.workflow.steps.forEach((step, index) => {
            const position = this.calculateNodePosition(index, this.workflow.steps.length, totalWidth, totalHeight);
            const nodeData = this.nodes.get(step.id);

            if (nodeData) {
                nodeData.position = position;
                nodeData.element.style.left = `${position.x}px`;
                nodeData.element.style.top = `${position.y}px`;
            }
        });

        // Recreate connections with new positions
        const svg = document.getElementById('workflow-canvas');
        this.connections.forEach(connection => {
            svg.removeChild(connection.element);
        });
        this.connections = [];
        this.createConnections();
    }

    reconnectWebSocket() {
        if (this.ws) {
            this.ws.close();
        }
        this.updateConnectionStatus('connecting');
        setTimeout(() => this.connectWebSocket(), 500);
    }
}

// Initialize the visualization when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Initializing Stagehand Agent Visualization');
    new WorkflowVisualization();
});