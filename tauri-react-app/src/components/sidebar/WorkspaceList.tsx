/**
 * WorkspaceList - Displays list of workspace items
 * Memoized with useCallback for optimal performance
 */

import React, { memo, useCallback } from 'react';
import { useWorkspaceStore, useCanvasStore } from '../../store';
import { CloseIcon } from '../common';
import { WorkspaceItem } from '../../application/workspace-item';

// Memoized individual workspace item component
interface WorkspaceItemRowProps {
  item: WorkspaceItem;
  isSelected: boolean;
  isEditing: boolean;
  editingName: string;
  onSelect: (id: string) => void;
  onDoubleClick: (item: WorkspaceItem) => void;
  onRemove: (e: React.MouseEvent, id: string) => void;
  onNameChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const WorkspaceItemRow = memo<WorkspaceItemRowProps>(({
  item,
  isSelected,
  isEditing,
  editingName,
  onSelect,
  onDoubleClick,
  onRemove,
  onNameChange,
  onSave,
  onCancel,
}) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  }, [onSave, onCancel]);

  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`py-2 pl-3 border-y border-l transition-colors flex items-start justify-between group cursor-pointer relative ${
        isSelected
          ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-500 rounded-l-lg pr-3'
          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-650 rounded-lg border-r mr-4'
      }`}
    >
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editingName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={onSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-sm font-medium text-gray-900 dark:text-white bg-transparent border border-blue-500 rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : (
          <div
            onDoubleClick={() => onDoubleClick(item)}
            className="text-sm font-medium text-gray-900 dark:text-white"
          >
            {item.name}
          </div>
        )}
        {item.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {item.description}
          </div>
        )}
      </div>
      <button
        onClick={(e) => onRemove(e, item.id)}
        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
        title="Remove item"
      >
        <CloseIcon className="w-3 h-3" />
      </button>
    </div>
  );
});

WorkspaceItemRow.displayName = 'WorkspaceItemRow';

const WorkspaceListComponent: React.FC = () => {
  const {
    workspaceItems,
    selectedItemId,
    editingItemId,
    editingName,
    selectWorkspaceItem,
    startEditingItem,
    saveItemEdit,
    cancelItemEdit,
    setItemToRemove,
  } = useWorkspaceStore();

  const { loadServicesAsNodes, resetCanvas } = useCanvasStore();

  const handleSelectItem = useCallback((itemId: string) => {
    selectWorkspaceItem(itemId);

    // Load existing services from ServiceContainer and create React Flow nodes
    const item = useWorkspaceStore.getState().workspaceManager.getItem(itemId);
    if (item?.serviceContainer?.services) {
      loadServicesAsNodes(item.serviceContainer.services);
    } else {
      resetCanvas();
    }
  }, [selectWorkspaceItem, loadServicesAsNodes, resetCanvas]);

  const handleDoubleClickName = useCallback((item: WorkspaceItem) => {
    startEditingItem(item);
  }, [startEditingItem]);

  const handleRemoveItem = useCallback((e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setItemToRemove(itemId);
  }, [setItemToRemove]);

  const handleNameChange = useCallback((value: string) => {
    useWorkspaceStore.setState({ editingName: value });
  }, []);

  return (
    <div className="flex-1 overflow-y-auto py-4 pl-4">
      <div className="space-y-2">
        {workspaceItems.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-500 italic">
            No workspace items. Click + to add one.
          </div>
        ) : (
          workspaceItems.map((item) => (
            <WorkspaceItemRow
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              isEditing={editingItemId === item.id}
              editingName={editingName}
              onSelect={handleSelectItem}
              onDoubleClick={handleDoubleClickName}
              onRemove={handleRemoveItem}
              onNameChange={handleNameChange}
              onSave={saveItemEdit}
              onCancel={cancelItemEdit}
            />
          ))
        )}
      </div>
    </div>
  );
};

export const WorkspaceList = memo(WorkspaceListComponent);
