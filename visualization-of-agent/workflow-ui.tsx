import React, { useState, useEffect } from 'react';

const WorkflowUI = () => {
  const [executedActions, setExecutedActions] = useState(new Set());
  const [isRunning, setIsRunning] = useState(false);

  const workflowNodes = [
    {
      id: 'start',
      label: 'Initialize',
      y: 100,
      actions: [
        { id: 'start-config', label: 'Load Config' },
        { id: 'start-auth', label: 'Authenticate' },
        { id: 'start-db', label: 'Connect Database' }
      ]
    },
    {
      id: 'process',
      label: 'Data Processing',
      y: 340,
      actions: [
        { id: 'process-fetch', label: 'Fetch Data' },
        { id: 'process-clean', label: 'Clean Data' },
        { id: 'process-filter', label: 'Apply Filters' }
      ]
    },
    {
      id: 'validation',
      label: 'Validation',
      y: 560,
      actions: [
        { id: 'validate-schema', label: 'Schema Check' },
        { id: 'validate-business', label: 'Business Rules' }
      ]
    },
    {
      id: 'transform',
      label: 'Transform',
      y: 750,
      actions: [
        { id: 'transform-format', label: 'Format Output' },
        { id: 'transform-enrich', label: 'Enrich Data' }
      ]
    },
    {
      id: 'output',
      label: 'Output',
      y: 920,
      actions: [
        { id: 'output-save', label: 'Save Results' },
        { id: 'output-notify', label: 'Send Notifications' }
      ]
    }
  ];

  const executeWorkflow = async () => {
    setIsRunning(true);
    setExecutedActions(new Set());
    
    // Simple execution plan - some actions per node
    const executionPlan = [
      ['start-config', 'start-auth'], // Skip database
      ['process-fetch', 'process-clean'], // Skip filters
      ['validate-schema'], // Skip business rules
      ['transform-format', 'transform-enrich'], // Execute both
      ['output-save', 'output-notify'] // Execute both
    ];
    
    for (const actionGroup of executionPlan) {
      for (const actionId of actionGroup) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setExecutedActions(prev => new Set([...prev, actionId]));
      }
      // Pause between nodes
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    setTimeout(() => {
      setIsRunning(false);
      setExecutedActions(new Set());
    }, 2000);
  };

  const NodeComponent = ({ node, isLast }) => {
    const executedCount = node.actions.filter(action => executedActions.has(action.id)).length;
    const hasExecutedActions = executedCount > 0;
    
    return (
      <div className="flex flex-col items-center">
        {/* Node Header */}
        <div className={`mb-6 px-6 py-3 rounded-lg border transition-all duration-300 ${
          hasExecutedActions 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className="text-sm font-medium text-gray-700">{node.label}</h3>
          {hasExecutedActions && (
            <span className="text-xs text-yellow-600 mt-1 block">{executedCount}/{node.actions.length} completed</span>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex flex-col space-y-4 mb-12">
          {node.actions.map((action) => {
            const isExecuted = executedActions.has(action.id);
            
            return (
              <div
                key={action.id}
                className={`px-6 py-4 rounded-lg border-2 transition-all duration-500 ease-out transform min-w-56 text-center ${
                  isExecuted 
                    ? 'bg-yellow-100 border-yellow-300 shadow-lg scale-105 text-gray-800' 
                    : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                <span className="text-sm font-medium">{action.label}</span>
              </div>
            );
          })}
        </div>

        {/* Arrow to next node */}
        {!isLast && (
          <div className="flex flex-col items-center mb-12">
            <div className={`w-0.5 h-12 transition-colors duration-300 ${
              hasExecutedActions ? 'bg-yellow-400' : 'bg-gray-300'
            }`}></div>
            <div className={`w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent transition-colors duration-300 ${
              hasExecutedActions ? 'border-t-yellow-400' : 'border-t-gray-300'
            }`}></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-light text-gray-900 mb-2">Workflow Execution</h1>
        <p className="text-gray-600 text-sm">Sequential processing with conditional actions</p>
      </div>

      {/* Workflow Canvas */}
      <div className="flex-1 flex justify-center">
        <div className="flex flex-col items-center py-16 max-w-md">
          {workflowNodes.map((node, index) => (
            <NodeComponent 
              key={node.id} 
              node={node} 
              isLast={index === workflowNodes.length - 1}
            />
          ))}
        </div>

        {/* Control Panel */}
        <div className="fixed bottom-8 left-8">
          <button
            onClick={executeWorkflow}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg border transition-all duration-200 font-medium ${
              isRunning
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100'
            }`}
          >
            {isRunning ? 'Executing...' : 'Run Workflow'}
          </button>
        </div>

        {/* Status Indicator */}
        {isRunning && (
          <div className="fixed top-8 right-8 flex items-center space-x-3 bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Processing</span>
          </div>
        )}

        {/* Legend */}
        <div className="fixed bottom-8 right-8 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Executed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowUI;