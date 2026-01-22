/**
 * CustomServiceNode - Custom React Flow node for services
 * Memoized to prevent unnecessary re-renders
 */

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ServiceIcon } from '../common';

interface CustomServiceNodeProps {
  data: {
    label: string;
    icon?: string;
  };
  selected?: boolean;
}

const CustomServiceNodeComponent = ({ data, selected }: CustomServiceNodeProps) => {
  const icon = data.icon || 'container';

  return (
    <div
      className={`px-4 py-2 shadow-md rounded-md bg-white dark:bg-gray-700 transition-all ${
        selected
          ? 'border-4 border-blue-600 dark:border-blue-500 shadow-xl'
          : 'border-2 border-blue-500 dark:border-blue-400'
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2">
        <div className="text-blue-500 dark:text-blue-400">
          <ServiceIcon icon={icon} />
        </div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

// Memoized component - only re-renders when data or selected changes
export const CustomServiceNode = memo(CustomServiceNodeComponent);

// Node types configuration for React Flow
export const nodeTypes = {
  custom: CustomServiceNode,
} as const;
