/**
 * NetworksLegend - Displays network colors legend on the canvas
 * Memoized to prevent unnecessary re-renders
 */

import React, { memo, useMemo } from 'react';
import { NetworkDefinition } from '../../types';

interface NetworksLegendProps {
  networks: Record<string, NetworkDefinition>;
}

const NetworksLegendComponent: React.FC<NetworksLegendProps> = ({ networks }) => {
  // Memoize network names to prevent recalculation on each render
  const networkEntries = useMemo(() => {
    return Object.entries(networks);
  }, [networks]);
  
  if (networkEntries.length === 0) return null;

  return (
    <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-3 min-w-[150px]">
      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
        Networks
      </div>
      <div className="space-y-1.5">
        {networkEntries.map(([networkName, networkConfig]) => {
          const networkColor = networkConfig?.color || '#9CA3AF';
          return (
            <div key={networkName} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: networkColor }}
              />
              <span className="text-xs text-gray-900 dark:text-white truncate">
                {networkName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Memoized - only re-renders when networks object reference changes
export const NetworksLegend = memo(NetworksLegendComponent);
