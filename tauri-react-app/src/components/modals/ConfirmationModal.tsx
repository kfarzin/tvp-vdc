/**
 * ConfirmationModal - Generic confirmation dialog
 * Memoized for performance
 */

import React, { memo, useCallback } from 'react';
import { useWorkspaceStore, useUIStore, useCanvasStore } from '../../store';

const ConfirmationModalComponent: React.FC = () => {
  const { itemToRemove, removeWorkspaceItem, setItemToRemove, selectedItemId } = useWorkspaceStore();
  const { resetUIState } = useUIStore();
  const { resetCanvas } = useCanvasStore();

  const handleConfirm = useCallback(() => {
    if (!itemToRemove) return;
    removeWorkspaceItem(itemToRemove);
    if (selectedItemId === itemToRemove) {
      resetUIState();
      resetCanvas();
    }
  }, [itemToRemove, removeWorkspaceItem, selectedItemId, resetUIState, resetCanvas]);

  const handleCancel = useCallback(() => {
    setItemToRemove(null);
  }, [setItemToRemove]);

  if (!itemToRemove) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Confirm Removal
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to remove this workspace item? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            No
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmationModal = memo(ConfirmationModalComponent);
