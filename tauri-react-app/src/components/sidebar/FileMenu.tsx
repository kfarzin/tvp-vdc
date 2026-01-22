/**
 * FileMenu - Dropdown menu for file operations
 */

import React, { useRef } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { exit } from '@tauri-apps/plugin-process';
import { useUIStore, useWorkspaceStore } from '../../store';
import { useClickOutside } from '../../hooks';

export const FileMenu: React.FC = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { isFileMenuOpen, setFileMenuOpen, toggleFileMenu } = useUIStore();
  const { addWorkspaceItem, selectWorkspaceItem } = useWorkspaceStore();

  useClickOutside(menuRef, () => setFileMenuOpen(false), isFileMenuOpen);

  const handleNew = () => {
    const newItem = addWorkspaceItem();
    selectWorkspaceItem(newItem.id);
    setFileMenuOpen(false);
  };

  const handleOpen = async () => {
    setFileMenuOpen(false);
    try {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [{
          name: 'Docker Compose',
          extensions: ['yml', 'yaml']
        }]
      });
      if (selected) {
        console.log('Selected file:', selected);
        // TODO: Parse and load the compose file
      }
    } catch (error) {
      console.error('Error opening file dialog:', error);
    }
  };

  const handleExit = async () => {
    setFileMenuOpen(false);
    await exit(0);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleFileMenu}
        className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors h-10 flex items-center"
      >
        File
      </button>
      {isFileMenuOpen && (
        <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={handleNew}
          >
            New
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={handleOpen}
          >
            Open
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={handleExit}
          >
            Exit
          </button>
        </div>
      )}
    </div>
  );
};
