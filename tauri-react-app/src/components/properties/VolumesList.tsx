/**
 * VolumesList - List of volumes in the properties panel
 */

import React from 'react';
import { useWorkspaceStore } from '../../store';
import { PlusIcon } from '../common';

export const VolumesList: React.FC = () => {
  const { selectedItemId, getSelectedItem } = useWorkspaceStore();

  const selectedItem = getSelectedItem();
  const volumes = selectedItem?.serviceContainer?.volumes || {};
  const volumeCount = Object.keys(volumes).length;

  const handleAddVolume = () => {
    console.log('Add volume clicked');
    // TODO: Implement add volume logic
  };

  if (!selectedItemId) return null;

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Volumes
        </label>
        <button
          onClick={handleAddVolume}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
          title="Add volume"
        >
          <PlusIcon className="w-3 h-3" />
        </button>
      </div>

      {volumeCount > 0 ? (
        <div className="text-sm text-gray-900 dark:text-white">{volumeCount} volume(s)</div>
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">No volumes</div>
      )}
    </div>
  );
};
