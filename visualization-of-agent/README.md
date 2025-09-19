# Stagehand Agent Visualization

A real-time, futuristic visualization system for tracking Stagehand AI agent workflows. This creates beautiful flowing node diagrams that update live as your agent executes medical EMR workflows.

## What This Does

This visualization system provides:
- **Real-time workflow tracking** - See each action as your Stagehand agent performs it
- **Beautiful node-based UI** - Minimal, futuristic design with curved connections
- **Dynamic status updates** - Nodes change color as they progress (pending → in-progress → completed)
- **Live progress tracking** - Progress bar and step counters update in real-time
- **WebSocket communication** - Seamless integration with your existing Stagehand workflows

## Architecture

The system consists of:
1. **WebSocket Server** (`workflow-server.ts`) - Broadcasts workflow events
2. **Visualization Web App** - Beautiful frontend that displays workflow nodes
3. **Stagehand Agent** - Your AI agent that performs EMR workflows
4. **EMR System** - The medical records system being automated

## Setup Instructions

### Prerequisites
- Node.js installed
- All dependencies installed in both `stagehand-agent` and `emr-website` directories

### Running the System

You need **4 terminals** running simultaneously:

#### Terminal 1: WebSocket Server
```bash
cd stagehand-agent
npx tsx workflow-server.ts
```
*Wait for: "🚀 Workflow WebSocket Server started on port 8081"*

#### Terminal 2: Visualization Server
```bash
cd visualization-of-agent
npm start
```
*Wait for: "🎨 Stagehand Visualization Server running on http://localhost:4001"*

#### Terminal 3: EMR System
```bash
cd emr-website
npm run dev
```
*Wait for: Next.js development server to start on port 4000*

#### Terminal 4: Stagehand Agent
```bash
cd stagehand-agent
npm start
```

### Viewing the Visualization

1. Open your web browser
2. Navigate to `http://localhost:4001`
3. You should see "Stagehand Agent - Connected" status
4. When you run Terminal 4 (Stagehand Agent), the workflow visualization will appear

## Expected Behavior

### Initial State
- Clean white interface with "Stagehand Agent" header
- Green "Connected" status indicator
- Empty canvas waiting for workflow events

### When Agent Starts
1. **Workflow Initialization**: 7 workflow nodes appear instantly in a curved flow layout
2. **Node Structure**: Each node shows:
   - Step name (e.g., "Navigate to Dashboard")
   - Description (e.g., "Load main patient dashboard and find Emily Carter")
   - Status indicator (pending/in-progress/completed)

### During Execution
1. **Step Activation**: Node turns **blue** with glowing border when step becomes active
2. **Connection Animation**: Curved lines between nodes animate with flowing dots
3. **Step Completion**: Node turns **green** when step completes successfully
4. **Progress Updates**: Bottom-right progress bar fills as steps complete

### The 7 Workflow Steps
The Emily Carter medical workflow includes:

1. **Navigate to Dashboard** - Load patient dashboard and locate Emily Carter
2. **Review Encounter Notes** - Analyze post-operative status and respiratory findings
3. **Check Guidelines** - Review orthognathic surgery requirements
4. **Review Labs & Results** - Search for sleep apnea studies
5. **Access Benefits & Claims** - Check prior authorization status
6. **Add Missing Study Comment** - Document missing sleep apnea study requirement
7. **Complete Workflow** - Finalize documentation and notify team

## Technical Details

### WebSocket Events
The system listens for these workflow events:
- `WORKFLOW_INIT` - Creates the initial node structure
- `STEP_START` - Marks a step as in-progress (blue)
- `STEP_COMPLETE` - Marks a step as completed (green)

### Ports Used
- **4000** - EMR System (Next.js)
- **4001** - Visualization Interface
- **8081** - WebSocket Server

### Visual Design
- **Minimal aesthetic** - Clean white background with subtle gradients
- **Glassmorphism effects** - Nodes have backdrop blur and subtle shadows
- **Curved connections** - Smooth SVG paths connect sequential nodes
- **Responsive layout** - Adapts to different screen sizes
- **Smooth animations** - 60fps transitions and hover effects

## Troubleshooting

### No nodes appearing
- Check browser console for JavaScript errors
- Ensure WebSocket server (Terminal 1) is running
- Verify "Connected" status shows green

### Agent fails to connect
- Make sure EMR system (Terminal 3) is running on port 4000
- Check that WebSocket server is accessible on port 8081

### Visualization shows "Disconnected"
- Restart Terminal 1 (WebSocket server)
- Refresh the browser page
- Check for port conflicts

## Customization

To adapt this for different workflows:
1. Modify the workflow steps in `index.ts`
2. Update step names, descriptions, and IDs
3. Adjust node positioning in `calculateNodePosition()`
4. Customize colors and styling in `index.html` CSS

## Development

### File Structure
```
visualization-of-agent/
├── index.html          # Main visualization interface
├── visualization.js    # Core visualization logic
├── start.js           # Node.js server for serving files
├── package.json       # Project configuration
└── README.md          # This file
```

### Adding Features
- Modify `visualization.js` to add new node types or animations
- Update CSS in `index.html` for visual changes
- Extend WebSocket events in `workflow-server.ts` for new data

## Credits

Built for tracking Stagehand AI agent workflows in medical EMR systems. Designed for real-time visualization of complex multi-step automation processes.