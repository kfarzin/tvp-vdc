/**
 * UI Store - Manages UI-related state (menus, selections, collapsed states, etc.)
 */

import { create } from 'zustand';
import { EditingProperty } from '../types';

interface UIState {
  // Menu state
  isFileMenuOpen: boolean;
  
  // Service selection and collapse
  selectedServiceName: string | null;
  collapsedServices: Set<string>;
  selectedServiceForDetails: string | null;
  
  // Service name editing
  editingServiceName: string | null;
  editingServiceNameValue: string;
  
  // Slider search
  sliderSearchQuery: string;
  selectedPropertyIndex: number;
  
  // Property editing
  editingProperty: EditingProperty | null;
  editingValue: string;
  selectedNetworkToAdd: string;

  // Actions
  setFileMenuOpen: (isOpen: boolean) => void;
  toggleFileMenu: () => void;
  
  // Service selection actions
  selectService: (serviceName: string | null) => void;
  toggleServiceCollapse: (serviceName: string) => void;
  collapseAllExcept: (serviceName: string, allServices: string[]) => void;
  setSelectedServiceForDetails: (serviceName: string | null) => void;
  
  // Service name editing actions
  startEditingServiceName: (serviceName: string) => void;
  setEditingServiceNameValue: (value: string) => void;
  cancelServiceNameEdit: () => void;
  finishServiceNameEdit: () => string | null;
  
  // Slider search actions
  setSliderSearchQuery: (query: string) => void;
  setSelectedPropertyIndex: (index: number) => void;
  
  // Property editing actions
  startPropertyEdit: (serviceName: string, property: string, currentValue?: string) => void;
  setEditingValue: (value: string) => void;
  cancelPropertyEdit: () => void;
  setSelectedNetworkToAdd: (network: string) => void;
  
  // Reset actions
  resetUIState: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  isFileMenuOpen: false,
  selectedServiceName: null,
  collapsedServices: new Set<string>(),
  selectedServiceForDetails: null,
  editingServiceName: null,
  editingServiceNameValue: '',
  sliderSearchQuery: '',
  selectedPropertyIndex: 0,
  editingProperty: null,
  editingValue: '',
  selectedNetworkToAdd: '',

  // Actions
  setFileMenuOpen: (isOpen: boolean) => set({ isFileMenuOpen: isOpen }),
  
  toggleFileMenu: () => set((state) => ({ isFileMenuOpen: !state.isFileMenuOpen })),
  
  selectService: (serviceName: string | null) => set({ selectedServiceName: serviceName }),
  
  toggleServiceCollapse: (serviceName: string) => {
    const { collapsedServices } = get();
    const newCollapsed = new Set(collapsedServices);
    if (newCollapsed.has(serviceName)) {
      newCollapsed.delete(serviceName);
    } else {
      newCollapsed.add(serviceName);
    }
    set({ collapsedServices: newCollapsed });
  },
  
  collapseAllExcept: (serviceName: string, allServices: string[]) => {
    const newCollapsed = new Set<string>();
    allServices.forEach((svc) => {
      if (svc !== serviceName) {
        newCollapsed.add(svc);
      }
    });
    set({ collapsedServices: newCollapsed, selectedServiceName: serviceName });
  },
  
  setSelectedServiceForDetails: (serviceName: string | null) => {
    set({
      selectedServiceForDetails: serviceName,
      sliderSearchQuery: serviceName ? get().sliderSearchQuery : '',
      selectedPropertyIndex: serviceName ? get().selectedPropertyIndex : 0,
    });
  },
  
  startEditingServiceName: (serviceName: string) => {
    set({ editingServiceName: serviceName, editingServiceNameValue: serviceName });
  },
  
  setEditingServiceNameValue: (value: string) => set({ editingServiceNameValue: value }),
  
  cancelServiceNameEdit: () => {
    set({ editingServiceName: null, editingServiceNameValue: '' });
  },
  
  finishServiceNameEdit: () => {
    const { editingServiceName, editingServiceNameValue, collapsedServices } = get();
    if (!editingServiceName) return null;

    const newName = editingServiceNameValue.trim();
    
    // Update collapsed state if needed
    if (newName && newName !== editingServiceName && collapsedServices.has(editingServiceName)) {
      const newCollapsed = new Set(collapsedServices);
      newCollapsed.delete(editingServiceName);
      newCollapsed.add(newName);
      set({ collapsedServices: newCollapsed });
    }

    set({ editingServiceName: null, editingServiceNameValue: '' });
    return newName || null;
  },
  
  setSliderSearchQuery: (query: string) => {
    set({ sliderSearchQuery: query, selectedPropertyIndex: 0 });
  },
  
  setSelectedPropertyIndex: (index: number) => set({ selectedPropertyIndex: index }),
  
  startPropertyEdit: (serviceName: string, property: string, currentValue?: string) => {
    set({
      editingProperty: { serviceName, property },
      editingValue: property === 'container_name' ? (currentValue || '') : '',
    });
  },
  
  setEditingValue: (value: string) => set({ editingValue: value }),
  
  cancelPropertyEdit: () => {
    set({ editingProperty: null, editingValue: '', selectedNetworkToAdd: '' });
  },
  
  setSelectedNetworkToAdd: (network: string) => set({ selectedNetworkToAdd: network }),
  
  resetUIState: () => {
    set({
      isFileMenuOpen: false,
      selectedServiceName: null,
      collapsedServices: new Set<string>(),
      selectedServiceForDetails: null,
      editingServiceName: null,
      editingServiceNameValue: '',
      sliderSearchQuery: '',
      selectedPropertyIndex: 0,
      editingProperty: null,
      editingValue: '',
      selectedNetworkToAdd: '',
    });
  },
}));
