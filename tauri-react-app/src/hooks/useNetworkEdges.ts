/**
 * useNetworkEdges - Hook for managing network edges in React Flow
 */

import { useEffect } from 'react';
import { useWorkspaceStore, useCanvasStore } from '../store';

export function useNetworkEdges() {
  const { selectedItemId, refreshCounter, getSelectedItem } = useWorkspaceStore();
  const { generateNetworkEdges } = useCanvasStore();

  useEffect(() => {
    if (selectedItemId) {
      const item = getSelectedItem();
      if (item?.serviceContainer?.services && item?.serviceContainer?.networks) {
        generateNetworkEdges(
          item.serviceContainer.services,
          item.serviceContainer.networks
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItemId, refreshCounter]);
}
