/**
 * ServiceCanvas - React Flow canvas for visualizing services
 */

import React, { useCallback, useMemo } from 'react';
import { ReactFlow, Controls, Background, BackgroundVariant, Node, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkspaceStore, useUIStore, useCanvasStore } from '../../store';
import { useNetworkEdges } from '../../hooks';
import { nodeTypes } from './CustomServiceNode';
import { NetworksLegend } from './NetworksLegend';
import { DocumentIcon } from '../common';

export const ServiceCanvas: React.FC = () => {
  const { selectedItemId, getSelectedItem } = useWorkspaceStore();
  const { collapseAllExcept, selectService } = useUIStore();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, selectNode } = useCanvasStore();

  // Memoize node types to avoid React Flow warning
  const memoizedNodeTypes = useMemo(() => nodeTypes as unknown as NodeTypes, []);

  // Generate network edges when services change
  useNetworkEdges();

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const serviceName = node.id;
      selectService(serviceName);
      selectNode(serviceName);

      // Get all services and collapse all except clicked one
      const item = getSelectedItem();
      const allServices = Object.keys(item?.serviceContainer?.services || {});
      collapseAllExcept(serviceName, allServices);
    },
    [selectService, selectNode, getSelectedItem, collapseAllExcept]
  );

  const selectedItem = getSelectedItem();
  const networks = selectedItem?.serviceContainer?.networks || {};

  if (!selectedItemId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center px-8">
          <DocumentIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Load Your Docker Compose File
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Select a workspace item or create a new one to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      proOptions={{ hideAttribution: true }}
      className="bg-gray-50 dark:bg-gray-800"
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      minZoom={0.1}
      maxZoom={2}
      nodeTypes={memoizedNodeTypes}
    >
      <Controls />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      <NetworksLegend networks={networks} />
    </ReactFlow>
  );
};
