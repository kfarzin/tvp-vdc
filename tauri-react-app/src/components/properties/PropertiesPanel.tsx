/**
 * PropertiesPanel - Main properties panel component
 */

import React from 'react';
import { useWorkspaceStore } from '../../store';
import { ComposeHeader } from './ComposeHeader';
import { ServicesList } from './ServicesList';
import { NetworksList } from './NetworksList';
import { VolumesList } from './VolumesList';
import { DocumentIcon } from '../common';

export const PropertiesPanel: React.FC = () => {
  const { selectedItemId } = useWorkspaceStore();

  if (!selectedItemId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center px-4">
          <DocumentIcon className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Load your docker compose to see the properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ComposeHeader />
      <ServicesList />
      <div className="flex-shrink-0 space-y-4">
        <NetworksList />
        <VolumesList />
      </div>
    </>
  );
};
