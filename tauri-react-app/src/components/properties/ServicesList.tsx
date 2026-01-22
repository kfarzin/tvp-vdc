/**
 * ServicesList - List of services in the properties panel
 */

import React from 'react';
import { useWorkspaceStore, useCanvasStore } from '../../store';
import { ServiceItem } from './ServiceItem';
import { PlusIcon } from '../common';
import { Node } from '@xyflow/react';
import { ServiceNodeData } from '../../types';

export const ServicesList: React.FC = () => {
  const { selectedItemId, addService, getSelectedItem } = useWorkspaceStore();
  const { addNode } = useCanvasStore();

  const selectedItem = getSelectedItem();
  const services = selectedItem?.serviceContainer?.services || {};
  const serviceEntries = Object.entries(services);

  const handleAddService = () => {
    const serviceName = addService();
    if (serviceName && selectedItemId) {
      // Calculate position for new node
      const serviceCount = Object.keys(services).length;
      const nodesPerRow = 3;
      const col = serviceCount % nodesPerRow;
      const row = Math.floor(serviceCount / nodesPerRow);

      const newNode: Node<ServiceNodeData> = {
        id: serviceName,
        type: 'custom',
        position: {
          x: 50 + col * 250,
          y: 50 + row * 150,
        },
        data: {
          label: serviceName,
          icon: 'container',
        },
      };
      addNode(newNode);
    }
  };

  if (!selectedItemId) return null;

  return (
    <div className="flex-1 overflow-y-auto mb-4">
      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Services
          </label>
          <button
            onClick={handleAddService}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
            title="Add service"
          >
            <PlusIcon className="w-3 h-3" />
          </button>
        </div>

        {serviceEntries.length > 0 ? (
          <div className="space-y-2">
            {serviceEntries.map(([serviceName, serviceConfig]) => (
              <ServiceItem
                key={serviceName}
                serviceName={serviceName}
                serviceConfig={serviceConfig}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            Click + to add services
          </div>
        )}
      </div>
    </div>
  );
};
