/**
 * Workspace Store - Manages workspace items and selected workspace state
 */

import { create } from 'zustand';
import { WorkspaceManager } from '../application/workspace-manager';
import { WorkspaceItem } from '../application/workspace-item';
import { NetworkDefinition } from '../models/ServiceContainer';
import { ServiceNode } from '../models/ServiceNode';
import { getUniqueNetworkColor, getUsedNetworkColors } from '../constants/colors';

// Helper functions for generating names
const generateRandomName = (): string => {
  const adjectives = ['Happy', 'Swift', 'Bright', 'Cool', 'Smart', 'Quick', 'Bold', 'Fresh', 'Neat', 'Sleek'];
  const nouns = ['Project', 'Workspace', 'Service', 'Container', 'App', 'System', 'Platform', 'Tool', 'Stack', 'Suite'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${randomAdjective} ${randomNoun} ${randomNumber}`;
};

const generateServiceName = (): string => {
  const adjectives = ['fast', 'brave', 'clever', 'wise', 'proud', 'kind', 'calm', 'bold', 'swift', 'bright', 'cool', 'smart'];
  const nouns = ['server', 'database', 'cache', 'worker', 'api', 'gateway', 'proxy', 'queue', 'store', 'engine', 'service', 'app'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective}_${randomNoun}`;
};

// Default service configuration
const createDefaultService = (): ServiceNode => ({
  icon: 'container',
  container_name: '',
  image: '',
  build: '',
  labels: {},
  networks: [],
  ports: [],
  expose: [],
  extra_hosts: [],
  dns: [],
  volumes: [],
  tmpfs: [],
  configs: [],
  secrets: [],
  command: '',
  entrypoint: '',
  environment: {},
  env_file: [],
  restart: 'no',
  stop_grace_period: '',
  stop_signal: '',
  user: '',
  working_dir: '',
  tty: false,
  stdin_open: false,
  privileged: false,
  cap_add: [],
  cap_drop: [],
  init: false,
  sysctls: {},
  ulimits: {},
  profiles: [],
  logging: { driver: '', options: {} },
  deploy: {
    resources: {
      limits: { cpus: '', memory: '' },
      reservations: { cpus: '', memory: '' }
    },
    replicas: 1,
    restart_policy: { condition: '', delay: '', max_attempts: 0, window: '' }
  },
  healthcheck: { test: '', interval: '', timeout: '', retries: 0, start_period: '' },
  depends_on: [],
  links: [],
  external_links: []
});

interface WorkspaceState {
  // Core state
  workspaceManager: WorkspaceManager;
  workspaceItems: WorkspaceItem[];
  selectedItemId: string | null;
  
  // Editing state
  editingItemId: string | null;
  editingName: string;
  itemToRemove: string | null;
  
  // Compose editing
  editingComposeName: boolean;
  composeNameValue: string;
  
  // Force refresh counter
  refreshCounter: number;

  // Actions
  addWorkspaceItem: () => WorkspaceItem;
  removeWorkspaceItem: (id: string) => void;
  selectWorkspaceItem: (id: string | null) => void;
  updateWorkspaceItem: (id: string, updates: Partial<WorkspaceItem>) => void;
  
  // Item editing actions
  startEditingItem: (item: WorkspaceItem) => void;
  saveItemEdit: () => void;
  cancelItemEdit: () => void;
  setItemToRemove: (id: string | null) => void;
  
  // Compose name editing actions
  startEditingComposeName: (currentName: string) => void;
  saveComposeName: () => void;
  cancelComposeNameEdit: () => void;
  
  // Compose version actions
  setComposeVersion: (version: string) => void;
  
  // Service actions
  addService: () => string | null;
  removeService: (serviceName: string) => void;
  updateServiceIcon: (serviceName: string, icon: string) => void;
  updateServiceImage: (serviceName: string, image: string) => void;
  updateServiceProperty: (serviceName: string, property: string, value: any) => void;
  renameService: (oldName: string, newName: string) => boolean;
  addArrayItem: (serviceName: string, property: string, value: string) => void;
  removeArrayItem: (serviceName: string, property: string, index: number) => void;
  addNetworkToService: (serviceName: string, networkName: string) => void;
  addPortToService: (serviceName: string, localPort: number, containerPort: number) => void;
  
  // Network actions
  addNetwork: (name: string, definition: Partial<NetworkDefinition>) => void;
  updateNetwork: (originalName: string, name: string, definition: Partial<NetworkDefinition>) => void;
  removeNetwork: (name: string) => void;
  
  // Utility
  forceRefresh: () => void;
  getSelectedItem: () => WorkspaceItem | undefined;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  // Initial state
  workspaceManager: new WorkspaceManager('My Workspace', 'Main workspace for services'),
  workspaceItems: [],
  selectedItemId: null,
  editingItemId: null,
  editingName: '',
  itemToRemove: null,
  editingComposeName: false,
  composeNameValue: '',
  refreshCounter: 0,

  // Actions
  addWorkspaceItem: () => {
    const { workspaceManager } = get();
    const randomName = generateRandomName();
    const newItem = new WorkspaceItem(`item-${Date.now()}`, randomName);
    newItem.serviceContainer = { name: randomName, services: {} };
    workspaceManager.addItem(newItem);
    set({ workspaceItems: [...workspaceManager.getAllItems()] });
    return newItem;
  },

  removeWorkspaceItem: (id: string) => {
    const { workspaceManager, selectedItemId } = get();
    workspaceManager.removeItem(id);
    const updates: Partial<WorkspaceState> = {
      workspaceItems: [...workspaceManager.getAllItems()],
      itemToRemove: null,
    };
    if (selectedItemId === id) {
      updates.selectedItemId = null;
    }
    set(updates);
  },

  selectWorkspaceItem: (id: string | null) => {
    set({ selectedItemId: id });
  },

  updateWorkspaceItem: (id: string, updates: Partial<WorkspaceItem>) => {
    const { workspaceManager } = get();
    workspaceManager.updateItem(id, updates);
    set({ workspaceItems: [...workspaceManager.getAllItems()] });
  },

  startEditingItem: (item: WorkspaceItem) => {
    set({ editingItemId: item.id, editingName: item.name });
  },

  saveItemEdit: () => {
    const { editingItemId, editingName, workspaceManager } = get();
    if (editingItemId && editingName.trim()) {
      workspaceManager.updateItem(editingItemId, { name: editingName.trim() });
      set({
        workspaceItems: [...workspaceManager.getAllItems()],
        editingItemId: null,
        editingName: '',
      });
    } else {
      set({ editingItemId: null, editingName: '' });
    }
  },

  cancelItemEdit: () => {
    set({ editingItemId: null, editingName: '' });
  },

  setItemToRemove: (id: string | null) => {
    set({ itemToRemove: id });
  },

  startEditingComposeName: (currentName: string) => {
    set({ editingComposeName: true, composeNameValue: currentName || '' });
  },

  saveComposeName: () => {
    const { selectedItemId, composeNameValue, workspaceManager } = get();
    if (selectedItemId && composeNameValue.trim()) {
      const item = workspaceManager.getItem(selectedItemId);
      if (item) {
        item.serviceContainer ??= { services: {} };
        item.serviceContainer.name = composeNameValue.trim();
        workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
        set({
          workspaceItems: [...workspaceManager.getAllItems()],
          editingComposeName: false,
        });
      }
    }
    set({ editingComposeName: false });
  },

  cancelComposeNameEdit: () => {
    set({ editingComposeName: false });
  },

  setComposeVersion: (version: string) => {
    const { selectedItemId, workspaceManager } = get();
    if (selectedItemId) {
      const item = workspaceManager.getItem(selectedItemId);
      if (item) {
        item.serviceContainer ??= { services: {} };
        item.serviceContainer.version = version;
        workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
        set({ workspaceItems: [...workspaceManager.getAllItems()] });
      }
    }
  },

  addService: () => {
    const { selectedItemId, workspaceManager } = get();
    if (!selectedItemId) return null;

    const item = workspaceManager.getItem(selectedItemId);
    if (!item) return null;

    item.serviceContainer ??= { services: {} };

    let serviceName = generateServiceName();
    let counter = 1;
    while (item.serviceContainer.services[serviceName]) {
      serviceName = `${generateServiceName()}_${counter}`;
      counter++;
    }

    item.serviceContainer.services[serviceName] = createDefaultService();
    workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
    set({ workspaceItems: [...workspaceManager.getAllItems()] });

    return serviceName;
  },

  removeService: (serviceName: string) => {
    const { selectedItemId, workspaceManager } = get();
    if (!selectedItemId) return;

    const item = workspaceManager.getItem(selectedItemId);
    if (!item?.serviceContainer?.services[serviceName]) return;

    delete item.serviceContainer.services[serviceName];
    workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
    set({
      workspaceItems: [...workspaceManager.getAllItems()],
      refreshCounter: get().refreshCounter + 1,
    });
  },

  updateServiceIcon: (serviceName: string, icon: string) => {
    const { selectedItemId, workspaceManager } = get();
    if (!selectedItemId) return;

    const item = workspaceManager.getItem(selectedItemId);
    if (!item?.serviceContainer?.services[serviceName]) return;

    item.serviceContainer.services[serviceName].icon = icon;
    workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
    set({ workspaceItems: [...workspaceManager.getAllItems()] });
  },

  updateServiceImage: (serviceName: string, image: string) => {
    const { selectedItemId, workspaceManager } = get();
    if (!selectedItemId) return;

    const item = workspaceManager.getItem(selectedItemId);
    if (!item?.serviceContainer?.services[serviceName]) return;

    item.serviceContainer.services[serviceName].image = image;
    workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
    set({ workspaceItems: [...workspaceManager.getAllItems()] });
  },

  updateServiceProperty: (serviceName: string, property: string, value: any) => {
    const { selectedItemId, workspaceManager } = get();
    if (!selectedItemId) return;

    const item = workspaceManager.getItem(selectedItemId);
    if (!item?.serviceContainer?.services[serviceName]) return;

    (item.serviceContainer.services[serviceName] as any)[property] = value;
    workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
    set({
      workspaceItems: [...workspaceManager.getAllItems()],
      refreshCounter: get().refreshCounter + 1,
    });
  },

  renameService: (oldName: string, newName: string) => {
    const { selectedItemId, workspaceManager } = get();
    if (!selectedItemId || !newName.trim()) return false;

    const item = workspaceManager.getItem(selectedItemId);
    if (!item?.serviceContainer?.services) return false;

    if (newName !== oldName && item.serviceContainer.services[newName]) {
      return false; // Name already exists
    }

    if (newName !== oldName) {
      const serviceConfig = item.serviceContainer.services[oldName];
      delete item.serviceContainer.services[oldName];
      item.serviceContainer.services[newName] = serviceConfig;
      workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
      set({
        workspaceItems: [...workspaceManager.getAllItems()],
        refreshCounter: get().refreshCounter + 1,
      });
    }

    return true;
  },

  addArrayItem: (serviceName: string, property: string, value: string) => {
    const { selectedItemId, workspaceManager } = get();
    if (!selectedItemId || !value.trim()) return;

    const item = workspaceManager.getItem(selectedItemId);
    if (!item?.serviceContainer?.services[serviceName]) return;

    const service = item.serviceContainer.services[serviceName];
    const prop = service[property as keyof ServiceNode];

    if (Array.isArray(prop)) {
      (prop as string[]).push(value.trim());
    } else {
      (service as any)[property] = [value.trim()];
    }

    workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
    set({ refreshCounter: get().refreshCounter + 1 });
  },

  removeArrayItem: (serviceName: string, property: string, index: number) => {
    const { selectedItemId, workspaceManager } = get();
    if (!selectedItemId) return;

    const item = workspaceManager.getItem(selectedItemId);
    if (!item?.serviceContainer?.services[serviceName]) return;

    const service = item.serviceContainer.services[serviceName];
    const prop = service[property as keyof ServiceNode];

    if (Array.isArray(prop)) {
      prop.splice(index, 1);
      workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
      set({ refreshCounter: get().refreshCounter + 1 });
    }
  },

  addNetworkToService: (serviceName: string, networkName: string) => {
    const { selectedItemId, workspaceManager } = get();
    if (!selectedItemId || !networkName) return;

    const item = workspaceManager.getItem(selectedItemId);
    if (!item?.serviceContainer?.services[serviceName]) return;

    const service = item.serviceContainer.services[serviceName];

    if (!service.networks || typeof service.networks === 'object' && !Array.isArray(service.networks)) {
      service.networks = [];
    }

    if (!service.networks.includes(networkName)) {
      service.networks.push(networkName);
      workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
      set({ refreshCounter: get().refreshCounter + 1 });
    }
  },

  addPortToService: (serviceName: string, localPort: number, containerPort: number) => {
    const { selectedItemId, workspaceManager } = get();
    if (!selectedItemId) return;

    const item = workspaceManager.getItem(selectedItemId);
    if (!item?.serviceContainer?.services[serviceName]) return;

    const service = item.serviceContainer.services[serviceName];
    service.ports ??= [];

    service.ports.push(`${localPort}:${containerPort}`);
    workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
    set({ refreshCounter: get().refreshCounter + 1 });
  },

  addNetwork: (name: string, definition: Partial<NetworkDefinition>) => {
    const { selectedItemId, workspaceManager } = get();
    if (!selectedItemId || !name.trim()) return;

    const item = workspaceManager.getItem(selectedItemId);
    if (!item?.serviceContainer) return;

    item.serviceContainer.networks ??= {};

    if (item.serviceContainer.networks[name.trim()]) return; // Already exists

    const usedColors = getUsedNetworkColors(item.serviceContainer.networks);
    const networkDef: NetworkDefinition = {
      ...definition,
      color: getUniqueNetworkColor(usedColors),
    };

    item.serviceContainer.networks[name.trim()] = networkDef;
    workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
    set({
      workspaceItems: [...workspaceManager.getAllItems()],
      refreshCounter: get().refreshCounter + 1,
    });
  },

  updateNetwork: (originalName: string, name: string, definition: Partial<NetworkDefinition>) => {
    const { selectedItemId, workspaceManager } = get();
    if (!selectedItemId || !name.trim()) return;

    const item = workspaceManager.getItem(selectedItemId);
    if (!item?.serviceContainer?.networks) return;

    // Get existing color
    const existingColor = item.serviceContainer.networks[originalName]?.color;

    // Remove old name if renamed
    if (originalName !== name.trim()) {
      if (item.serviceContainer.networks[name.trim()]) return; // New name already exists
      delete item.serviceContainer.networks[originalName];
    }

    item.serviceContainer.networks[name.trim()] = {
      ...definition,
      color: existingColor,
    } as NetworkDefinition;

    workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
    set({
      workspaceItems: [...workspaceManager.getAllItems()],
      refreshCounter: get().refreshCounter + 1,
    });
  },

  removeNetwork: (name: string) => {
    const { selectedItemId, workspaceManager } = get();
    if (!selectedItemId) return;

    const item = workspaceManager.getItem(selectedItemId);
    if (!item?.serviceContainer?.networks) return;

    delete item.serviceContainer.networks[name];
    workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
    set({ refreshCounter: get().refreshCounter + 1 });
  },

  forceRefresh: () => {
    set({ refreshCounter: get().refreshCounter + 1 });
  },

  getSelectedItem: () => {
    const { selectedItemId, workspaceManager } = get();
    if (!selectedItemId) return undefined;
    return workspaceManager.getItem(selectedItemId);
  },
}));
