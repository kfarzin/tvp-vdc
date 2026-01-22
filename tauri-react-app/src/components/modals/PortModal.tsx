/**
 * PortModal - Port mapping configuration with react-hook-form
 */

import React, { memo, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWorkspaceStore, useModalStore } from '../../store';
import { CloseIcon } from '../common/Icons';
import { portMappingSchema, PortMappingFormData } from '../../schemas';

const PortModalComponent: React.FC = () => {
  const { portModal, closePortModal } = useModalStore();
  const { addArrayItem } = useWorkspaceStore();

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isValid },
  } = useForm<PortMappingFormData>({
    resolver: zodResolver(portMappingSchema),
    mode: 'onChange',
    defaultValues: {
      localPort: '',
      containerPort: '',
    },
  });

  // Initialize from current port value when modal opens
  useEffect(() => {
    if (portModal.isOpen) {
      if (portModal.currentValue) {
        const [local, container] = portModal.currentValue.split(':');
        reset({ localPort: local || '', containerPort: container || '' });
      } else {
        reset({ localPort: '', containerPort: '' });
      }
      // Focus first input after reset
      setTimeout(() => setFocus('localPort'), 50);
    }
  }, [portModal.isOpen, portModal.currentValue, reset, setFocus]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && portModal.isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [portModal.isOpen]);

  const handleClose = useCallback(() => {
    closePortModal();
    reset({ localPort: '', containerPort: '' });
  }, [closePortModal, reset]);

  const onSubmit = useCallback((data: PortMappingFormData) => {
    if (!portModal.serviceId) return;

    const newPortMapping = `${data.localPort}:${data.containerPort}`;
    addArrayItem(portModal.serviceId, 'ports', newPortMapping);
    handleClose();
  }, [portModal.serviceId, addArrayItem, handleClose]);

  if (!portModal.isOpen) return null;

  const isEditing = portModal.portIndex !== null && portModal.portIndex >= 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Port Mapping' : 'Add Port Mapping'}
          </h3>
          <button
            onClick={handleClose}
            type="button"
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Local (Host) Port
              </label>
              <input
                {...register('localPort')}
                type="text"
                placeholder="e.g., 8080"
                className={`w-full px-3 py-2 text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.localPort 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.localPort && (
                <p className="mt-1 text-xs text-red-500">{errors.localPort.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Container Port
              </label>
              <input
                {...register('containerPort')}
                type="text"
                placeholder="e.g., 80"
                className={`w-full px-3 py-2 text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.containerPort 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.containerPort && (
                <p className="mt-1 text-xs text-red-500">{errors.containerPort.message}</p>
              )}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Format: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">host:container</code> (e.g., 8080:80)
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded transition-colors"
            >
              {isEditing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const PortModal = memo(PortModalComponent);
