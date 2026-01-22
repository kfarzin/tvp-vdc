/**
 * NetworkModal - Network configuration modal
 * Uses the existing modalStore API with proper form handling
 */

import { memo, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkspaceStore, useModalStore } from '../../store';
import { CloseIcon } from '../common/Icons';

// Simplified schema matching the existing modal state
const networkFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Network name is required')
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, 'Name must start with a letter and contain only letters, numbers, underscores, and hyphens'),
  driver: z.string(),
  external: z.boolean(),
  internal: z.boolean(),
  attachable: z.boolean(),
  enableIpv6: z.boolean(),
  enableIpam: z.boolean(),
  ipamDriver: z.string(),
  ipamSubnet: z.string(),
  ipamIpRange: z.string(),
  ipamGateway: z.string(),
});

type NetworkFormData = z.infer<typeof networkFormSchema>;

const NETWORK_DRIVERS = ['bridge', 'host', 'overlay', 'macvlan', 'none'];
const IPAM_DRIVERS = ['default', 'null'];

const NetworkModalComponent: React.FC = () => {
  const { networkModal, closeNetworkModal } = useModalStore();
  const { addNetwork, updateNetwork } = useWorkspaceStore();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setFocus,
    formState: { errors, isValid },
  } = useForm<NetworkFormData>({
    resolver: zodResolver(networkFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      driver: 'bridge',
      external: false,
      internal: false,
      attachable: false,
      enableIpv6: false,
      enableIpam: false,
      ipamDriver: '',
      ipamSubnet: '',
      ipamIpRange: '',
      ipamGateway: '',
    },
  });

  const enableIpam = watch('enableIpam');

  // Initialize form when modal opens
  useEffect(() => {
    if (networkModal.isOpen) {
      reset({
        name: networkModal.name,
        driver: networkModal.driver || 'bridge',
        external: networkModal.external,
        internal: networkModal.internal,
        attachable: networkModal.attachable,
        enableIpv6: networkModal.enableIpv6,
        enableIpam: networkModal.enableIpam,
        ipamDriver: networkModal.ipamDriver,
        ipamSubnet: networkModal.ipamSubnet,
        ipamIpRange: networkModal.ipamIpRange,
        ipamGateway: networkModal.ipamGateway,
      });
      setTimeout(() => setFocus('name'), 50);
    }
  }, [networkModal.isOpen, networkModal, reset, setFocus]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && networkModal.isOpen) {
        handleClose();
      }
    };
    
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [networkModal.isOpen]);

  const handleClose = useCallback(() => {
    closeNetworkModal();
  }, [closeNetworkModal]);

  const onSubmit = useCallback((data: NetworkFormData) => {
    const networkDef = {
      driver: data.driver,
      external: data.external,
      internal: data.internal,
      attachable: data.attachable,
      enable_ipv6: data.enableIpv6,
      ...(data.enableIpam && {
        ipam: {
          driver: data.ipamDriver || 'default',
          config: (data.ipamSubnet || data.ipamIpRange || data.ipamGateway) ? [{
            ...(data.ipamSubnet && { subnet: data.ipamSubnet }),
            ...(data.ipamIpRange && { ip_range: data.ipamIpRange }),
            ...(data.ipamGateway && { gateway: data.ipamGateway }),
          }] : undefined,
        },
      }),
    };

    if (networkModal.mode === 'edit' && networkModal.originalName) {
      updateNetwork(networkModal.originalName, data.name.trim(), networkDef);
    } else {
      addNetwork(data.name.trim(), networkDef);
    }
    
    handleClose();
  }, [networkModal.mode, networkModal.originalName, updateNetwork, addNetwork, handleClose]);

  if (!networkModal.isOpen) return null;

  const isEditing = networkModal.mode === 'edit';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Network' : 'Add Network'}
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Basic Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="network-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Network Name
                </label>
                <input
                  id="network-name"
                  {...register('name')}
                  type="text"
                  className={`w-full px-3 py-2 text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="network-driver" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Driver
                </label>
                <select
                  id="network-driver"
                  {...register('driver')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {NETWORK_DRIVERS.map(driver => (
                    <option key={driver} value={driver}>{driver}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Controller
                  name="external"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                  )}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">External</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Controller
                  name="internal"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                  )}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Internal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Controller
                  name="attachable"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                  )}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Attachable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Controller
                  name="enableIpv6"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                  )}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable IPv6</span>
              </label>
            </div>

            {/* IPAM Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <Controller
                  name="enableIpam"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                  )}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable IPAM Configuration</span>
              </label>

              {enableIpam && (
                <div className="space-y-3 pl-6">
                  <div>
                    <label htmlFor="ipam-driver" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      IPAM Driver
                    </label>
                    <select
                      id="ipam-driver"
                      {...register('ipamDriver')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {IPAM_DRIVERS.map(driver => (
                        <option key={driver} value={driver}>{driver}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ipam-subnet" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Subnet (e.g., 172.20.0.0/16)
                    </label>
                    <input
                      id="ipam-subnet"
                      {...register('ipamSubnet')}
                      type="text"
                      placeholder="172.20.0.0/16"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="ipam-ip-range" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      IP Range (e.g., 172.20.0.0/24)
                    </label>
                    <input
                      id="ipam-ip-range"
                      {...register('ipamIpRange')}
                      type="text"
                      placeholder="172.20.0.0/24"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="ipam-gateway" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Gateway (e.g., 172.20.0.1)
                    </label>
                    <input
                      id="ipam-gateway"
                      {...register('ipamGateway')}
                      type="text"
                      placeholder="172.20.0.1"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? 'Save Changes' : 'Add Network'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const NetworkModal = memo(NetworkModalComponent);
