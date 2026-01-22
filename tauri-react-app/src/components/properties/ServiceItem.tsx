/**
 * ServiceItem - Displays a single service with its properties
 * Memoized with useCallback for optimal performance
 */

import React, { memo, useCallback, useMemo } from 'react';
import { useWorkspaceStore, useUIStore, useModalStore, useCanvasStore } from '../../store';
import { CloseIcon, EditIcon, ChevronDownIcon, ChevronRightIcon } from '../common';
import { SERVICE_ICONS, ServiceNode } from '../../types';

interface ServiceItemProps {
  serviceName: string;
  serviceConfig: ServiceNode;
}

const ServiceItemComponent: React.FC<ServiceItemProps> = ({ serviceName, serviceConfig }) => {
  const {
    updateServiceIcon,
    addArrayItem,
    removeArrayItem,
    addNetworkToService,
    renameService,
    updateServiceProperty,
    getSelectedItem,
  } = useWorkspaceStore();

  const {
    selectedServiceName,
    collapsedServices,
    editingServiceName,
    editingServiceNameValue,
    editingProperty,
    editingValue,
    selectedNetworkToAdd,
    selectService,
    toggleServiceCollapse,
    collapseAllExcept,
    startEditingServiceName,
    setEditingServiceNameValue,
    cancelServiceNameEdit,
    finishServiceNameEdit,
    startPropertyEdit,
    setEditingValue,
    cancelPropertyEdit,
    setSelectedNetworkToAdd,
    setSelectedServiceForDetails,
  } = useUIStore();

  const { openImageModal, openPortModal } = useModalStore();
  const { selectNode, updateNodeData } = useCanvasStore();

  const isCollapsed = collapsedServices.has(serviceName);
  const isSelected = selectedServiceName === serviceName;
  const selectedItem = getSelectedItem();

  // Memoized computed values
  const availableNetworks = useMemo(() => {
    return selectedItem?.serviceContainer?.networks
      ? Object.keys(selectedItem.serviceContainer.networks)
      : [];
  }, [selectedItem?.serviceContainer?.networks]);

  const serviceNetworks = useMemo(() => {
    return Array.isArray(serviceConfig.networks) ? serviceConfig.networks : [];
  }, [serviceConfig.networks]);

  const networksToShow = useMemo(() => {
    return availableNetworks.filter((net) => !serviceNetworks.includes(net));
  }, [availableNetworks, serviceNetworks]);

  const propertiesToShow = useMemo(() => {
    return ['container_name', 'image', 'labels', 'networks', 'ports', 'volumes', 'depends_on'];
  }, []);

  // Memoized callbacks
  const handleServiceClick = useCallback(() => {
    selectService(serviceName);
    selectNode(serviceName);

    const allServices = Object.keys(selectedItem?.serviceContainer?.services || {});
    collapseAllExcept(serviceName, allServices);
  }, [serviceName, selectService, selectNode, selectedItem, collapseAllExcept]);

  const handleServiceNameDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    startEditingServiceName(serviceName);
  }, [serviceName, startEditingServiceName]);

  const handleServiceNameSave = useCallback(() => {
    const newName = finishServiceNameEdit();
    if (newName && newName !== serviceName) {
      renameService(serviceName, newName);
    }
  }, [serviceName, finishServiceNameEdit, renameService]);

  const handleServiceNameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleServiceNameSave();
    } else if (e.key === 'Escape') {
      cancelServiceNameEdit();
    }
  }, [handleServiceNameSave, cancelServiceNameEdit]);

  const handleIconChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIcon = e.target.value;
    updateServiceIcon(serviceName, newIcon);
    updateNodeData(serviceName, { icon: newIcon });
  }, [serviceName, updateServiceIcon, updateNodeData]);

  const handleToggleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleServiceCollapse(serviceName);
  }, [serviceName, toggleServiceCollapse]);

  const handlePropertyEdit = useCallback((property: string, currentValue?: any) => {
    if (property === 'ports') {
      openPortModal(serviceName, selectedItem?.id || '', currentValue);
      return;
    }
    startPropertyEdit(serviceName, property, currentValue);
  }, [serviceName, selectedItem?.id, openPortModal, startPropertyEdit]);

  const handlePropertySave = useCallback(() => {
    const property = editingProperty?.property;
    const value = editingValue.trim();

    if (!property || !value) {
      cancelPropertyEdit();
      return;
    }

    if (property === 'container_name') {
      updateServiceProperty(serviceName, property, value);
    } else {
      addArrayItem(serviceName, property, value);
    }

    cancelPropertyEdit();
  }, [editingProperty, editingValue, serviceName, updateServiceProperty, addArrayItem, cancelPropertyEdit]);

  const handlePropertyKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePropertySave();
    } else if (e.key === 'Escape') {
      cancelPropertyEdit();
    }
  }, [handlePropertySave, cancelPropertyEdit]);

  const handleAddNetworkToService = useCallback(() => {
    if (selectedNetworkToAdd) {
      addNetworkToService(serviceName, selectedNetworkToAdd);
      setSelectedNetworkToAdd('');
    }
  }, [selectedNetworkToAdd, serviceName, addNetworkToService, setSelectedNetworkToAdd]);

  const handleRemoveArrayItem = useCallback((property: string, index: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    removeArrayItem(serviceName, property, index);
  }, [serviceName, removeArrayItem]);

  const handleOpenImageModal = useCallback(() => {
    openImageModal(serviceName, selectedItem?.id || '', serviceConfig.image || '');
  }, [serviceName, selectedItem?.id, serviceConfig.image, openImageModal]);

  const handleShowAllProperties = useCallback(() => {
    setSelectedServiceForDetails(serviceName);
  }, [serviceName, setSelectedServiceForDetails]);

  return (
    <div
      className={`border-t-4 border-blue-500 bg-gray-50 dark:bg-gray-800 rounded transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-50'
      }`}
    >
      {/* Service Header */}
      <div
        className="w-full flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        onClick={handleServiceClick}
      >
        {editingServiceName === serviceName ? (
          <input
            type="text"
            value={editingServiceNameValue}
            onChange={(e) => setEditingServiceNameValue(e.target.value)}
            onBlur={handleServiceNameSave}
            onKeyDown={handleServiceNameKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            className="flex-1 font-medium text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 mr-2"
          />
        ) : (
          <span
            onDoubleClick={handleServiceNameDoubleClick}
            className="flex-1 font-semibold text-sm text-orange-600 dark:text-orange-400 cursor-pointer"
          >
            {serviceName}
          </span>
        )}
        <button onClick={handleToggleCollapse} className="flex-shrink-0">
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
              isCollapsed ? '-rotate-90' : ''
            }`}
          />
        </button>
      </div>

      {/* Service Properties */}
      {!isCollapsed && (
        <div className="px-2 pt-4 pb-4 text-xs space-y-4 text-gray-700 dark:text-gray-300">
          {/* Icon dropdown */}
          <div className="flex gap-2 items-center">
            <span className="font-semibold min-w-[100px]">icon:</span>
            <select
              value={serviceConfig.icon || 'container'}
              onChange={handleIconChange}
              className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
            >
              {SERVICE_ICONS.map((icon) => (
                <option key={icon.value} value={icon.value}>
                  {icon.label}
                </option>
              ))}
            </select>
          </div>

          {/* Main properties */}
          {propertiesToShow.map((key) => {
            const value = serviceConfig[key as keyof ServiceNode];

            // Image property
            if (key === 'image') {
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{key}:</span>
                    <button
                      onClick={handleOpenImageModal}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title="Edit image"
                    >
                      <EditIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs break-all pl-2">
                    {typeof value === 'string' ? value : ''}
                  </div>
                </div>
              );
            }

            // Container name property
            if (key === 'container_name') {
              const isEditing = editingProperty?.serviceName === serviceName && editingProperty?.property === key;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{key}:</span>
                    <button
                      onClick={() => handlePropertyEdit(key, value)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title="Edit container name"
                    >
                      <EditIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={handlePropertyKeyDown}
                      onBlur={cancelPropertyEdit}
                      autoFocus
                      placeholder="Enter container name"
                      className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-blue-500 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-gray-600 dark:text-gray-400 text-xs break-all pl-2">
                      {typeof value === 'string' ? value : '(not set)'}
                    </div>
                  )}
                </div>
              );
            }

            // Networks property (special dropdown handling)
            if (key === 'networks') {
              const isEditing = editingProperty?.serviceName === serviceName && editingProperty?.property === key;
              const arrayValue = Array.isArray(value) ? value : [];

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{key}:</span>
                    <button
                      onClick={() => handlePropertyEdit(key, value)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title={`Add ${key}`}
                    >
                      <EditIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <div className="pl-2 space-y-1">
                    {arrayValue.length > 0 ? (
                      arrayValue.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 group py-1.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded"
                        >
                          <span className="text-gray-600 dark:text-gray-400 text-xs break-all flex-1">
                            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                          </span>
                          <button
                            onClick={handleRemoveArrayItem(key, index)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all flex-shrink-0"
                            title="Remove"
                          >
                            <CloseIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-xs italic">(empty)</span>
                    )}
                    {isEditing && networksToShow.length > 0 && (
                      <div className="flex gap-1">
                        <select
                          value={selectedNetworkToAdd}
                          onChange={(e) => setSelectedNetworkToAdd(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-blue-500 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select network...</option>
                          {networksToShow.map((net) => (
                            <option key={net} value={net}>
                              {net}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleAddNetworkToService}
                          disabled={!selectedNetworkToAdd}
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>
                    )}
                    {isEditing && networksToShow.length === 0 && (
                      <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                        {availableNetworks.length === 0
                          ? 'No networks defined in container'
                          : 'All networks already added'}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // Array properties (ports, labels, volumes, depends_on)
            if (['ports', 'labels', 'volumes', 'depends_on'].includes(key)) {
              const isEditing = editingProperty?.serviceName === serviceName && editingProperty?.property === key;
              const arrayValue = Array.isArray(value) ? value : [];

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{key}:</span>
                    <button
                      onClick={() => handlePropertyEdit(key, value)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title={`Add ${key}`}
                    >
                      <EditIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <div className="pl-2 space-y-1">
                    {arrayValue.length > 0 ? (
                      arrayValue.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 group py-1.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded"
                        >
                          <span className="text-gray-600 dark:text-gray-400 text-xs break-all flex-1">
                            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                          </span>
                          <button
                            onClick={handleRemoveArrayItem(key, index)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all flex-shrink-0"
                            title="Remove"
                          >
                            <CloseIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-xs italic">(empty)</span>
                    )}
                    {isEditing && key !== 'ports' && (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={handlePropertyKeyDown}
                        onBlur={cancelPropertyEdit}
                        autoFocus
                        placeholder={`Add new ${key}`}
                        className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-blue-500 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>
              );
            }

            return null;
          })}

          {/* Show All Properties Button */}
          <button
            onClick={handleShowAllProperties}
            className="w-full mt-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
          >
            <ChevronRightIcon className="w-3 h-3" />
            Show All Properties
          </button>
        </div>
      )}
    </div>
  );
};

// Memoized component - only re-renders when serviceName or serviceConfig changes
export const ServiceItem = memo(ServiceItemComponent);
