/**
 * Modal Store - Manages all modal states
 */

import { create } from 'zustand';
import {
  ImageModalState,
  PortModalState,
  NetworkModalState,
  ModalInputMode,
  NetworkModalMode,
  DockerRepository,
  DockerTag,
} from '../types';

// Initial states
const initialImageModalState: ImageModalState = {
  isOpen: false,
  serviceName: null,
  serviceId: null,
  currentValue: '',
  inputMode: 'manual',
  manualInput: '',
  repoSearch: '',
  repoResults: [],
  repoLoading: false,
  repoSelectedIndex: -1,
  selectedRepo: null,
  selectedTag: null,
  tags: [],
  tagsLoading: false,
  tagsPage: 1,
  tagsCount: 0,
  tagsNext: null,
  tagsPrevious: null,
};

const initialPortModalState: PortModalState = {
  isOpen: false,
  serviceName: null,
  serviceId: null,
  currentValue: '',
  portIndex: null,
  localPort: '',
  containerPort: '',
};

const initialNetworkModalState: NetworkModalState = {
  isOpen: false,
  mode: 'add',
  originalName: '',
  name: '',
  driver: '',
  external: false,
  internal: false,
  attachable: false,
  enableIpv6: false,
  enableIpam: false,
  ipamDriver: '',
  ipamSubnet: '',
  ipamIpRange: '',
  ipamGateway: '',
};

interface ModalState {
  // Image modal
  imageModal: ImageModalState;
  
  // Port modal
  portModal: PortModalState;
  
  // Network modal
  networkModal: NetworkModalState;
  
  // Confirmation modal
  confirmationModalOpen: boolean;

  // Image modal actions
  openImageModal: (serviceName: string, serviceId: string, currentValue?: string) => void;
  closeImageModal: () => void;
  setImageModalInputMode: (mode: ModalInputMode) => void;
  setImageModalManualInput: (input: string) => void;
  setImageModalRepoSearch: (search: string) => void;
  setImageModalRepoResults: (results: DockerRepository[]) => void;
  setImageModalRepoLoading: (loading: boolean) => void;
  setImageModalRepoSelectedIndex: (index: number) => void;
  setImageModalSelectedRepo: (repo: string | null) => void;
  setImageModalSelectedTag: (tag: string | null) => void;
  setImageModalTags: (tags: DockerTag[]) => void;
  setImageModalTagsLoading: (loading: boolean) => void;
  setImageModalTagsPage: (page: number) => void;
  setImageModalTagsCount: (count: number) => void;
  setImageModalTagsNext: (next: string | null) => void;
  setImageModalTagsPrevious: (previous: string | null) => void;
  
  // Port modal actions
  openPortModal: (serviceName: string, serviceId: string, currentValue?: string, portIndex?: number) => void;
  closePortModal: () => void;
  setPortModalLocalPort: (port: string) => void;
  setPortModalContainerPort: (port: string) => void;
  
  // Network modal actions
  openNetworkModal: (mode: NetworkModalMode, networkName?: string, networkData?: any) => void;
  closeNetworkModal: () => void;
  setNetworkModalName: (name: string) => void;
  setNetworkModalDriver: (driver: string) => void;
  setNetworkModalExternal: (external: boolean) => void;
  setNetworkModalInternal: (internal: boolean) => void;
  setNetworkModalAttachable: (attachable: boolean) => void;
  setNetworkModalEnableIpv6: (enable: boolean) => void;
  setNetworkModalEnableIpam: (enable: boolean) => void;
  setNetworkModalIpamDriver: (driver: string) => void;
  setNetworkModalIpamSubnet: (subnet: string) => void;
  setNetworkModalIpamIpRange: (ipRange: string) => void;
  setNetworkModalIpamGateway: (gateway: string) => void;
  
  // Confirmation modal actions
  setConfirmationModalOpen: (open: boolean) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  // Initial states
  imageModal: { ...initialImageModalState },
  portModal: { ...initialPortModalState },
  networkModal: { ...initialNetworkModalState },
  confirmationModalOpen: false,

  // Image modal actions
  openImageModal: (serviceName: string, serviceId: string, currentValue?: string) => {
    set({
      imageModal: {
        ...initialImageModalState,
        isOpen: true,
        serviceName,
        serviceId,
        currentValue: currentValue || '',
      },
    });
  },

  closeImageModal: () => {
    set({ imageModal: { ...initialImageModalState } });
  },

  setImageModalInputMode: (mode: ModalInputMode) => {
    set((state) => ({
      imageModal: { ...state.imageModal, inputMode: mode },
    }));
  },

  setImageModalManualInput: (input: string) => {
    set((state) => ({
      imageModal: { ...state.imageModal, manualInput: input },
    }));
  },

  setImageModalRepoSearch: (search: string) => {
    set((state) => ({
      imageModal: { ...state.imageModal, repoSearch: search, repoSelectedIndex: -1 },
    }));
  },

  setImageModalRepoResults: (results: DockerRepository[]) => {
    set((state) => ({
      imageModal: { ...state.imageModal, repoResults: results },
    }));
  },

  setImageModalRepoLoading: (loading: boolean) => {
    set((state) => ({
      imageModal: { ...state.imageModal, repoLoading: loading },
    }));
  },

  setImageModalRepoSelectedIndex: (index: number) => {
    set((state) => ({
      imageModal: { ...state.imageModal, repoSelectedIndex: index },
    }));
  },

  setImageModalSelectedRepo: (repo: string | null) => {
    set((state) => ({
      imageModal: {
        ...state.imageModal,
        selectedRepo: repo,
        repoResults: [],
        selectedTag: null,
        tags: [],
        tagsPage: 1,
      },
    }));
  },

  setImageModalSelectedTag: (tag: string | null) => {
    set((state) => ({
      imageModal: { ...state.imageModal, selectedTag: tag },
    }));
  },

  setImageModalTags: (tags: DockerTag[]) => {
    set((state) => ({
      imageModal: { ...state.imageModal, tags },
    }));
  },

  setImageModalTagsLoading: (loading: boolean) => {
    set((state) => ({
      imageModal: { ...state.imageModal, tagsLoading: loading },
    }));
  },

  setImageModalTagsPage: (page: number) => {
    set((state) => ({
      imageModal: { ...state.imageModal, tagsPage: page },
    }));
  },

  setImageModalTagsCount: (count: number) => {
    set((state) => ({
      imageModal: { ...state.imageModal, tagsCount: count },
    }));
  },

  setImageModalTagsNext: (next: string | null) => {
    set((state) => ({
      imageModal: { ...state.imageModal, tagsNext: next },
    }));
  },

  setImageModalTagsPrevious: (previous: string | null) => {
    set((state) => ({
      imageModal: { ...state.imageModal, tagsPrevious: previous },
    }));
  },

  // Port modal actions
  openPortModal: (serviceName: string, serviceId: string, currentValue?: string, portIndex?: number) => {
    set({
      portModal: {
        ...initialPortModalState,
        isOpen: true,
        serviceName,
        serviceId,
        currentValue: currentValue || '',
        portIndex: portIndex ?? null,
      },
    });
  },

  closePortModal: () => {
    set({ portModal: { ...initialPortModalState } });
  },

  setPortModalLocalPort: (port: string) => {
    set((state) => ({
      portModal: { ...state.portModal, localPort: port },
    }));
  },

  setPortModalContainerPort: (port: string) => {
    set((state) => ({
      portModal: { ...state.portModal, containerPort: port },
    }));
  },

  // Network modal actions
  openNetworkModal: (mode: NetworkModalMode, networkName?: string, networkData?: any) => {
    if (mode === 'edit' && networkName && networkData) {
      set({
        networkModal: {
          isOpen: true,
          mode: 'edit',
          originalName: networkName,
          name: networkName,
          driver: networkData.driver || '',
          external: typeof networkData.external === 'boolean' ? networkData.external : false,
          internal: networkData.internal || false,
          attachable: networkData.attachable || false,
          enableIpv6: networkData.enable_ipv6 || false,
          enableIpam: !!networkData.ipam,
          ipamDriver: networkData.ipam?.driver || '',
          ipamSubnet: networkData.ipam?.config?.[0]?.subnet || '',
          ipamIpRange: networkData.ipam?.config?.[0]?.ip_range || '',
          ipamGateway: networkData.ipam?.config?.[0]?.gateway || '',
        },
      });
    } else {
      set({
        networkModal: {
          ...initialNetworkModalState,
          isOpen: true,
          mode: 'add',
        },
      });
    }
  },

  closeNetworkModal: () => {
    set({ networkModal: { ...initialNetworkModalState } });
  },

  setNetworkModalName: (name: string) => {
    set((state) => ({
      networkModal: { ...state.networkModal, name },
    }));
  },

  setNetworkModalDriver: (driver: string) => {
    set((state) => ({
      networkModal: { ...state.networkModal, driver },
    }));
  },

  setNetworkModalExternal: (external: boolean) => {
    set((state) => ({
      networkModal: { ...state.networkModal, external },
    }));
  },

  setNetworkModalInternal: (internal: boolean) => {
    set((state) => ({
      networkModal: { ...state.networkModal, internal },
    }));
  },

  setNetworkModalAttachable: (attachable: boolean) => {
    set((state) => ({
      networkModal: { ...state.networkModal, attachable },
    }));
  },

  setNetworkModalEnableIpv6: (enable: boolean) => {
    set((state) => ({
      networkModal: { ...state.networkModal, enableIpv6: enable },
    }));
  },

  setNetworkModalEnableIpam: (enable: boolean) => {
    set((state) => ({
      networkModal: { ...state.networkModal, enableIpam: enable },
    }));
  },

  setNetworkModalIpamDriver: (driver: string) => {
    set((state) => ({
      networkModal: { ...state.networkModal, ipamDriver: driver },
    }));
  },

  setNetworkModalIpamSubnet: (subnet: string) => {
    set((state) => ({
      networkModal: { ...state.networkModal, ipamSubnet: subnet },
    }));
  },

  setNetworkModalIpamIpRange: (ipRange: string) => {
    set((state) => ({
      networkModal: { ...state.networkModal, ipamIpRange: ipRange },
    }));
  },

  setNetworkModalIpamGateway: (gateway: string) => {
    set((state) => ({
      networkModal: { ...state.networkModal, ipamGateway: gateway },
    }));
  },

  // Confirmation modal actions
  setConfirmationModalOpen: (open: boolean) => {
    set({ confirmationModalOpen: open });
  },
}));
