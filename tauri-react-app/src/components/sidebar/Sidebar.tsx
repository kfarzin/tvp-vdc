/**
 * Sidebar - Main sidebar component combining all sidebar elements
 */

import React from 'react';
import { FileMenu } from './FileMenu';
import { WorkspaceList } from './WorkspaceList';
import { ThemeToggle } from './ThemeToggle';
import { useWorkspaceStore } from '../../store';
import { PlusIcon } from '../common';

export const Sidebar: React.FC = () => {
  const { addWorkspaceItem } = useWorkspaceStore();

  return (
    <aside className="row-span-2 bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden relative">
      {/* Menu Header */}
      <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex items-center h-10 relative">
          <FileMenu />
          <button className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors h-10 flex items-center">
            Edit
          </button>
          <button className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors h-10 flex items-center">
            Selection
          </button>
        </nav>
      </div>

      {/* Workspace Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Workspace
        </h2>
        <button
          onClick={() => addWorkspaceItem()}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          title="Add workspace item"
        >
          <PlusIcon />
        </button>
      </div>

      {/* Workspace List */}
      <WorkspaceList />

      {/* Theme Toggle */}
      <ThemeToggle />
    </aside>
  );
};
