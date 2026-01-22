/**
 * Canvas Store - Manages React Flow nodes and edges state
 */

import { create } from 'zustand';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';
import { ServiceNodeData } from '../types';

interface CanvasState {
  // React Flow state
  nodes: Node<ServiceNodeData>[];
  edges: Edge[];

  // Actions
  setNodes: (nodes: Node<ServiceNodeData>[] | ((nodes: Node<ServiceNodeData>[]) => Node<ServiceNodeData>[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  // Node operations
  addNode: (node: Node<ServiceNodeData>) => void;
  updateNodeData: (nodeId: string, data: Partial<ServiceNodeData>) => void;
  selectNode: (nodeId: string) => void;
  clearSelection: () => void;
  
  // Edge operations
  generateNetworkEdges: (services: Record<string, any>, networks: Record<string, any>) => void;
  
  // Reset
  resetCanvas: () => void;
  
  // Load services into canvas
  loadServicesAsNodes: (services: Record<string, any>) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  // Initial state
  nodes: [],
  edges: [],

  // Actions
  setNodes: (nodesOrUpdater) => {
    if (typeof nodesOrUpdater === 'function') {
      set((state) => ({ nodes: nodesOrUpdater(state.nodes) }));
    } else {
      set({ nodes: nodesOrUpdater });
    }
  },

  setEdges: (edgesOrUpdater) => {
    if (typeof edgesOrUpdater === 'function') {
      set((state) => ({ edges: edgesOrUpdater(state.edges) }));
    } else {
      set({ edges: edgesOrUpdater });
    }
  },

  onNodesChange: (changes: NodeChange[]) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as Node<ServiceNodeData>[],
    }));
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection: Connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
    }));
  },

  addNode: (node: Node<ServiceNodeData>) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
  },

  updateNodeData: (nodeId: string, data: Partial<ServiceNodeData>) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    }));
  },

  selectNode: (nodeId: string) => {
    set((state) => ({
      nodes: state.nodes.map((node) => ({
        ...node,
        selected: node.id === nodeId,
      })),
    }));
  },

  clearSelection: () => {
    set((state) => ({
      nodes: state.nodes.map((node) => ({
        ...node,
        selected: false,
      })),
    }));
  },

  generateNetworkEdges: (services: Record<string, any>, networks: Record<string, any>) => {
    const edges: Edge[] = [];
    const serviceNames = Object.keys(services);

    // For each pair of services, check if they share any networks
    for (let i = 0; i < serviceNames.length; i++) {
      for (let j = i + 1; j < serviceNames.length; j++) {
        const service1 = serviceNames[i];
        const service2 = serviceNames[j];
        const networks1 = services[service1].networks || [];
        const networks2 = services[service2].networks || [];

        // Check if they share at least one network
        const sharedNetworks = networks1.filter((net: string) => networks2.includes(net));

        if (sharedNetworks.length > 0) {
          // Use the color of the first shared network
          const firstNetworkName = sharedNetworks[0];
          const networkColor = networks[firstNetworkName]?.color || '#3B82F6';

          edges.push({
            id: `${service1}-${service2}`,
            source: service1,
            target: service2,
            animated: true,
            style: { stroke: networkColor, strokeWidth: 2 },
          });
        }
      }
    }

    set({ edges });
  },

  resetCanvas: () => {
    set({ nodes: [], edges: [] });
  },

  loadServicesAsNodes: (services: Record<string, any>) => {
    const serviceNodes: Node<ServiceNodeData>[] = Object.entries(services).map(
      ([serviceName, serviceConfig], index) => ({
        id: serviceName,
        type: 'custom',
        position: { x: 50 + (index % 3) * 250, y: 50 + Math.floor(index / 3) * 150 },
        data: {
          label: serviceName,
          icon: serviceConfig.icon || 'container',
        },
      })
    );
    set({ nodes: serviceNodes });
  },
}));
