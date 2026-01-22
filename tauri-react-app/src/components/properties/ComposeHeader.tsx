/**
 * ComposeHeader - Header section with compose name and version
 */

import React from 'react';
import { useWorkspaceStore } from '../../store';
import { COMPOSE_VERSIONS } from '../../types';

export const ComposeHeader: React.FC = () => {
  const {
    selectedItemId,
    editingComposeName,
    composeNameValue,
    startEditingComposeName,
    saveComposeName,
    cancelComposeNameEdit,
    setComposeVersion,
    getSelectedItem,
  } = useWorkspaceStore();

  const selectedItem = getSelectedItem();

  const handleComposeNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveComposeName();
    } else if (e.key === 'Escape') {
      cancelComposeNameEdit();
    }
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setComposeVersion(e.target.value);
  };

  if (!selectedItemId) return null;

  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
          Docker Compose Properties
        </h3>
        <div className="border-b border-gray-300 dark:border-gray-600 mb-4"></div>
      </div>

      {/* Top Section: Name & Version */}
      <div className="flex-shrink-0 space-y-4 mb-4">
        {/* Name Section */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
            Name
          </label>
          {editingComposeName ? (
            <input
              type="text"
              value={composeNameValue}
              onChange={(e) => useWorkspaceStore.setState({ composeNameValue: e.target.value })}
              onBlur={saveComposeName}
              onKeyDown={handleComposeNameKeyDown}
              autoFocus
              className="w-full text-sm text-gray-900 dark:text-white bg-transparent border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <div
              onClick={() => startEditingComposeName(selectedItem?.serviceContainer?.name || '')}
              className="text-sm text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded px-2 py-1 transition-colors"
            >
              {selectedItem?.serviceContainer?.name || 'Click to set name'}
            </div>
          )}
        </div>

        {/* Version Section */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
            Version
          </label>
          <select
            value={selectedItem?.serviceContainer?.version || ''}
            onChange={handleVersionChange}
            className="w-full text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select version</option>
            {COMPOSE_VERSIONS.map((version) => (
              <option key={version} value={version}>
                {version}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};
