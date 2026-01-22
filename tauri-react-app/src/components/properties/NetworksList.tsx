/**
 * NetworksList - List of networks in the properties panel
 */

import React from 'react';
import { useWorkspaceStore, useModalStore } from '../../store';
import { PlusIcon, EditIcon, CloseIcon } from '../common';

export const NetworksList: React.FC = () => {
  const { selectedItemId, removeNetwork, getSelectedItem } = useWorkspaceStore();
  const { openNetworkModal } = useModalStore();

  const selectedItem = getSelectedItem();
  const networks = selectedItem?.serviceContainer?.networks || {};
  const networkNames = Object.keys(networks);

  const handleAddNetwork = () => {
    openNetworkModal('add');
  };

  const handleEditNetwork = (networkName: string) => {
    openNetworkModal('edit', networkName, networks[networkName]);
  };

  if (!selectedItemId) return null;

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Networks
        </label>
        <button
          onClick={handleAddNetwork}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
          title="Add network"
        >
          <PlusIcon className="w-3 h-3" />
        </button>
      </div>

      {networkNames.length > 0 ? (
        <div className="space-y-1">
          {networkNames.map((networkName) => {
            const network = networks[networkName];
            const networkColor = network?.color || '#9CA3AF';
            return (
              <div
                key={networkName}
                className="flex items-center group p-1 hover:bg-gray-50 dark:hover:bg-gray-600 rounded"
              >
                <div
                  className="w-1 h-5 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: networkColor }}
                />
                <span className="text-sm text-gray-900 dark:text-white flex-1">{networkName}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditNetwork(networkName)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded transition-colors"
                    title="Edit network"
                  >
                    <EditIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => removeNetwork(networkName)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Remove network"
                  >
                    <CloseIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">No networks</div>
      )}
    </div>
  );
};
