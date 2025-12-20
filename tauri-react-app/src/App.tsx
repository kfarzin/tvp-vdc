import { useState, useEffect, useRef, useCallback } from "react";
import { open } from '@tauri-apps/plugin-dialog';
import { exit } from '@tauri-apps/plugin-process';
import { useTheme } from './contexts/ThemeContext';
import { WorkspaceManager } from './application/workspace-manager';
import { WorkspaceItem } from './application/workspace-item';
import { ReactFlow, Controls, Background, BackgroundVariant, useNodesState, useEdgesState, addEdge, Connection, Node, NodeProps } from '@xyflow/react';
import { DockerHubService, DockerRepository, DockerTag, DockerHubTagsResponse } from './services/docker-hub-service';
import '@xyflow/react/dist/style.css';

// Generate random workspace name
const generateRandomName = (): string => {
  const adjectives = ['Happy', 'Swift', 'Bright', 'Cool', 'Smart', 'Quick', 'Bold', 'Fresh', 'Neat', 'Sleek'];
  const nouns = ['Project', 'Workspace', 'Service', 'Container', 'App', 'System', 'Platform', 'Tool', 'Stack', 'Suite'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${randomAdjective} ${randomNoun} ${randomNumber}`;
};

// Generate random service name (two words with underscore)
const generateServiceName = (): string => {
  const adjectives = ['fast', 'brave', 'clever', 'wise', 'proud', 'kind', 'calm', 'bold', 'swift', 'bright', 'cool', 'smart'];
  const nouns = ['server', 'database', 'cache', 'worker', 'api', 'gateway', 'proxy', 'queue', 'store', 'engine', 'service', 'app'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective}_${randomNoun}`;
};

// Available icons/shapes for service nodes
const SERVICE_ICONS = [
  { value: 'container', label: 'Container' },
  { value: 'database', label: 'Database' },
  { value: 'server', label: 'Server' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'cube', label: 'Cube' },
  { value: 'circle', label: 'Circle' },
  { value: 'hexagon', label: 'Hexagon' },
];

// Custom node component
const CustomServiceNode = ({ data }: NodeProps) => {
  const icon = data.icon || 'container';
  
  const renderIcon = () => {
    switch (icon) {
      case 'database':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        );
      case 'server':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        );
      case 'cloud':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      case 'cube':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'circle':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth={2} />
          </svg>
        );
      case 'hexagon':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l9 5v10l-9 5-9-5V7z" />
          </svg>
        );
      case 'container':
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
    }
  };
  
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white dark:bg-gray-700 border-2 border-blue-500 dark:border-blue-400">
      <div className="flex items-center gap-2">
        <div className="text-blue-500 dark:text-blue-400">
          {renderIcon()}
        </div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {data.label}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomServiceNode,
};

const COMPOSE_VERSIONS = [
  // The Modern Era (Version-less / Specification)
  // Note: Modern files should simply omit the version key entirely.
  "latest", 

  // Version 3.x (Designed for Swarm compatibility)
  "3.9", "3.8", "3.7", "3.6", "3.5", "3.4", "3.3", "3.2", "3.1", "3.0",

  // Version 2.x (Introduction of Networks and Volumes)
  "2.4", "2.3", "2.2", "2.1", "2.0",

  // Version 1 (Legacy/Deprecated)
  "1.0"
];

function App() {
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { themeMode, setThemeMode } = useTheme();
  
  // Initialize WorkspaceManager - single instance for the app lifecycle
  const [workspaceManager] = useState(() => new WorkspaceManager('My Workspace', 'Main workspace for services'));
  const [workspaceItems, setWorkspaceItems] = useState<WorkspaceItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  // Docker Compose properties editing state
  const [editingComposeName, setEditingComposeName] = useState(false);
  const [composeNameValue, setComposeNameValue] = useState('');

  // Service collapse state (track which services are collapsed)
  const [collapsedServices, setCollapsedServices] = useState<Set<string>>(new Set());

  // Full properties slider state
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<string | null>(null);
  const [sliderSearchQuery, setSliderSearchQuery] = useState('');
  const [selectedPropertyIndex, setSelectedPropertyIndex] = useState(0);
  const sliderSearchRef = useRef<HTMLInputElement>(null);
  const propertyRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Docker Hub image search state
  const [imageSearchQuery, setImageSearchQuery] = useState<Record<string, string>>({});
  const [imageSearchResults, setImageSearchResults] = useState<Record<string, DockerRepository[]>>({});
  const [imageSearchLoading, setImageSearchLoading] = useState<Record<string, boolean>>({});
  const [showImageSuggestions, setShowImageSuggestions] = useState<Record<string, boolean>>({});
  const imageSearchDebounceRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Image modal state
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [modalRepoSearch, setModalRepoSearch] = useState('');
  const [modalRepoResults, setModalRepoResults] = useState<DockerRepository[]>([]);
  const [modalRepoLoading, setModalRepoLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [modalRepoSelectedIndex, setModalRepoSelectedIndex] = useState(-1);
  const [modalTags, setModalTags] = useState<DockerTag[]>([]);
  const [modalTagsLoading, setModalTagsLoading] = useState(false);
  const [modalTagsPage, setModalTagsPage] = useState(1);
  const [modalTagsCount, setModalTagsCount] = useState(0);
  const [modalTagsNext, setModalTagsNext] = useState<string | null>(null);
  const [modalTagsPrevious, setModalTagsPrevious] = useState<string | null>(null);
  const modalRepoDebounceRef = useRef<NodeJS.Timeout>();

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as HTMLElement)) {
        setIsFileMenuOpen(false);
      }
    };

    if (isFileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFileMenuOpen]);

  // Handle ESC key to close slider
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedServiceForDetails) {
        if (sliderSearchQuery) {
          // First ESC clears search
          setSliderSearchQuery('');
        } else {
          // Second ESC closes slider
          setSelectedServiceForDetails(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [selectedServiceForDetails, sliderSearchQuery]);

  // Handle keyboard input to activate search in slider
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!selectedServiceForDetails) return;
      
      // Check if any input is focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement instanceof HTMLInputElement || 
                            activeElement instanceof HTMLTextAreaElement ||
                            activeElement instanceof HTMLSelectElement;
      
      if (isInputFocused) return;
      
      // Check if it's a printable character (not special keys)
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        setSliderSearchQuery(event.key);
        // Focus the search input after state updates
        setTimeout(() => sliderSearchRef.current?.focus(), 0);
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [selectedServiceForDetails]);

  // Clear search when slider closes
  useEffect(() => {
    if (!selectedServiceForDetails) {
      setSliderSearchQuery('');
      setSelectedPropertyIndex(0);
    }
  }, [selectedServiceForDetails]);

  // Handle arrow key navigation in slider
  useEffect(() => {
    const handleArrowKeys = (event: KeyboardEvent) => {
      if (!selectedServiceForDetails || !selectedItemId) return;
      
      const services = workspaceManager.getItem(selectedItemId)?.serviceContainer?.services;
      if (!services || !services[selectedServiceForDetails]) return;
      
      const allProperties = Object.entries(services[selectedServiceForDetails]);
      const filteredProperties = sliderSearchQuery
        ? allProperties.filter(([key]) => key.toLowerCase().includes(sliderSearchQuery.toLowerCase()))
        : allProperties;
      
      if (filteredProperties.length === 0) return;
      
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedPropertyIndex((prev) => {
          const newIndex = Math.min(prev + 1, filteredProperties.length - 1);
          // Scroll to the selected property
          setTimeout(() => {
            propertyRefs.current[newIndex]?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }, 0);
          return newIndex;
        });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedPropertyIndex((prev) => {
          const newIndex = Math.max(prev - 1, 0);
          // Scroll to the selected property
          setTimeout(() => {
            propertyRefs.current[newIndex]?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }, 0);
          return newIndex;
        });
      }
    };

    document.addEventListener('keydown', handleArrowKeys);
    return () => {
      document.removeEventListener('keydown', handleArrowKeys);
    };
  }, [selectedServiceForDetails, selectedItemId, sliderSearchQuery, workspaceManager]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedPropertyIndex(0);
  }, [sliderSearchQuery]);

  const handleNew = () => {
    setIsFileMenuOpen(false);
    console.log('New file clicked');
    // Add your new file logic here
  };

  const handleOpen = async () => {
    setIsFileMenuOpen(false);
    try {
      const selected = await open({
        multiple: false,
        directory: false,
      });
      if (selected) {
        console.log('Selected file:', selected);
        // Add your file opening logic here
      }
    } catch (error) {
      console.error('Error opening file dialog:', error);
    }
  };

  const handleExit = async () => {
    setIsFileMenuOpen(false);
    await exit(0);
  };

  // Handle adding new workspace item
  const handleAddWorkspaceItem = () => {
    const randomName = generateRandomName();
    const newItem = new WorkspaceItem(
      `item-${Date.now()}`,
      randomName
    );
    // Initialize ServiceContainer with the same name
    newItem.serviceContainer = {
      name: randomName,
      services: {}
    };
    workspaceManager.addItem(newItem);
    setWorkspaceItems([...workspaceManager.getAllItems()]);
  };

  // Handle selecting workspace item
  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
    
    // Load existing services from ServiceContainer and create React Flow nodes
    const item = workspaceManager.getItem(itemId);
    if (item?.serviceContainer?.services) {
      const serviceNodes: Node[] = Object.entries(item.serviceContainer.services).map(([serviceName, serviceConfig], index) => ({
        id: serviceName,
        type: 'custom',
        position: { x: 50 + (index % 3) * 250, y: 50 + Math.floor(index / 3) * 150 },
        data: { 
          label: serviceName,
          icon: serviceConfig.icon || 'container'
        },
      }));
      setNodes(serviceNodes);
      setEdges([]);
    } else {
      // Initialize React Flow with empty canvas when item is selected
      setNodes([]);
      setEdges([]);
    }
  };

  // Handle removing workspace item
  const handleRemoveItem = (itemId: string) => {
    setItemToRemove(itemId);
  };

  const confirmRemoveItem = () => {
    if (itemToRemove) {
      workspaceManager.removeItem(itemToRemove);
      setWorkspaceItems([...workspaceManager.getAllItems()]);
      setItemToRemove(null);
    }
  };

  const cancelRemoveItem = () => {
    setItemToRemove(null);
  };

  // Handle double-click to edit item name
  const handleDoubleClickName = (item: WorkspaceItem) => {
    setEditingItemId(item.id);
    setEditingName(item.name);
  };

  // Handle saving edited name
  const handleSaveEdit = () => {
    if (editingItemId && editingName.trim()) {
      workspaceManager.updateItem(editingItemId, { name: editingName.trim() });
      setWorkspaceItems([...workspaceManager.getAllItems()]);
    }
    setEditingItemId(null);
    setEditingName('');
  };

  // Handle key press in edit mode
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditingName('');
    }
  };

  // Handle compose name editing
  const handleStartEditComposeName = (currentName: string) => {
    setEditingComposeName(true);
    setComposeNameValue(currentName || '');
  };

  const handleSaveComposeName = () => {
    if (selectedItemId && composeNameValue.trim()) {
      const item = workspaceManager.getItem(selectedItemId);
      if (item) {
        item.serviceContainer ??= { services: {} };
        item.serviceContainer.name = composeNameValue.trim();
        workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
        setWorkspaceItems([...workspaceManager.getAllItems()]);
      }
    }
    setEditingComposeName(false);
  };

  const handleComposeNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveComposeName();
    } else if (e.key === 'Escape') {
      setEditingComposeName(false);
    }
  };

  // Handle compose version change
  const handleComposeVersionChange = (version: string) => {
    if (selectedItemId) {
      const item = workspaceManager.getItem(selectedItemId);
      if (item) {
        item.serviceContainer ??= { services: {} };
        item.serviceContainer.version = version;
        workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
        setWorkspaceItems([...workspaceManager.getAllItems()]);
      }
    }
  };

  // Placeholder handlers for add buttons
  const handleAddService = () => {
    if (selectedItemId) {
      const item = workspaceManager.getItem(selectedItemId);
      if (item) {
        // Ensure serviceContainer exists
        item.serviceContainer ??= { services: {} };
        
        // Generate unique service name
        let serviceName = generateServiceName();
        let counter = 1;
        while (item.serviceContainer.services[serviceName]) {
          serviceName = `${generateServiceName()}_${counter}`;
          counter++;
        }
        
        // Create new service node with all properties initialized
        const newService = {
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
          restart: 'no' as const,
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
          logging: {
            driver: '',
            options: {}
          },
          deploy: {
            resources: {
              limits: {
                cpus: '',
                memory: ''
              },
              reservations: {
                cpus: '',
                memory: ''
              }
            },
            replicas: 1,
            restart_policy: {
              condition: '',
              delay: '',
              max_attempts: 0,
              window: ''
            }
          },
          healthcheck: {
            test: '',
            interval: '',
            timeout: '',
            retries: 0,
            start_period: ''
          },
          depends_on: [],
          links: [],
          external_links: []
        };
        
        // Add service to container
        item.serviceContainer.services[serviceName] = newService;
        workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
        setWorkspaceItems([...workspaceManager.getAllItems()]);
        
        // Calculate position for new node to avoid overlap
        // Use grid layout: 250px horizontal spacing, 150px vertical spacing
        const serviceCount = Object.keys(item.serviceContainer.services).length - 1; // -1 because we just added one
        const nodesPerRow = 3;
        const col = serviceCount % nodesPerRow;
        const row = Math.floor(serviceCount / nodesPerRow);
        
        // Add React Flow node
        const newNode: Node = {
          id: serviceName,
          type: 'custom',
          position: { 
            x: 50 + col * 250, 
            y: 50 + row * 150 
          },
          data: { 
            label: serviceName,
            icon: 'container'
          },
        };
        setNodes((nds) => [...nds, newNode]);
      }
    }
  };

  const handleAddNetwork = () => {
    console.log('Add network clicked');
    // TODO: Implement add network logic
  };

  const handleAddVolume = () => {
    console.log('Add volume clicked');
    // TODO: Implement add volume logic
  };

  // Handle icon change for a service
  const handleServiceIconChange = (serviceName: string, newIcon: string) => {
    if (selectedItemId) {
      const item = workspaceManager.getItem(selectedItemId);
      if (item?.serviceContainer?.services[serviceName]) {
        // Update service icon in ServiceContainer
        item.serviceContainer.services[serviceName].icon = newIcon;
        workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
        setWorkspaceItems([...workspaceManager.getAllItems()]);
        
        // Update React Flow node
        setNodes((nds) => 
          nds.map((node) => 
            node.id === serviceName 
              ? { ...node, data: { ...node.data, icon: newIcon } }
              : node
          )
        );
      }
    }
  };

  // Handle image search with debouncing
  const handleImageSearch = useCallback((serviceName: string, query: string) => {
    // Update query state
    setImageSearchQuery(prev => ({ ...prev, [serviceName]: query }));
    
    // Clear previous debounce timer
    if (imageSearchDebounceRef.current[serviceName]) {
      clearTimeout(imageSearchDebounceRef.current[serviceName]);
    }
    
    // If query is less than 3 characters, hide suggestions
    if (query.length < 3) {
      setShowImageSuggestions(prev => ({ ...prev, [serviceName]: false }));
      setImageSearchResults(prev => ({ ...prev, [serviceName]: [] }));
      return;
    }
    
    // Set loading state
    setImageSearchLoading(prev => ({ ...prev, [serviceName]: true }));
    setShowImageSuggestions(prev => ({ ...prev, [serviceName]: true }));
    
    // Debounce the API call
    imageSearchDebounceRef.current[serviceName] = setTimeout(async () => {
      try {
        console.log('Searching Docker Hub for:', query);
        const results = await DockerHubService.searchRepositories(query);
        console.log('Docker Hub API Results:', results);
        console.log('Number of results:', results.results.length);
        setImageSearchResults(prev => ({ ...prev, [serviceName]: results.results }));
      } catch (error) {
        console.error('Error searching Docker Hub:', error);
        setImageSearchResults(prev => ({ ...prev, [serviceName]: [] }));
      } finally {
        setImageSearchLoading(prev => ({ ...prev, [serviceName]: false }));
      }
    }, 300);
  }, []);

  // Handle image selection from suggestions
  const handleImageSelect = (serviceName: string, repoName: string) => {
    if (selectedItemId) {
      const item = workspaceManager.getItem(selectedItemId);
      if (item?.serviceContainer?.services[serviceName]) {
        // Update service image
        item.serviceContainer.services[serviceName].image = repoName;
        workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
        setWorkspaceItems([...workspaceManager.getAllItems()]);
        
        // Update local state
        setImageSearchQuery(prev => ({ ...prev, [serviceName]: repoName }));
        setShowImageSuggestions(prev => ({ ...prev, [serviceName]: false }));
      }
    }
  };

  // Handle modal repo search with debouncing
  const handleModalRepoSearch = useCallback((query: string) => {
    setModalRepoSearch(query);
    setModalRepoSelectedIndex(-1);
    
    if (modalRepoDebounceRef.current) {
      clearTimeout(modalRepoDebounceRef.current);
    }
    
    if (query.length < 3) {
      setModalRepoResults([]);
      return;
    }
    
    setModalRepoLoading(true);
    
    modalRepoDebounceRef.current = setTimeout(async () => {
      try {
        const results = await DockerHubService.searchRepositories(query);
        setModalRepoResults(results.results);
      } catch (error) {
        console.error('Error searching Docker Hub repos:', error);
        setModalRepoResults([]);
      } finally {
        setModalRepoLoading(false);
      }
    }, 300);
  }, []);

  // Handle repo selection - fetch tags
  const handleRepoSelect = async (repoName: string) => {
    setSelectedRepo(repoName);
    setModalRepoResults([]);
    setModalTagsPage(1);
    setModalTagsLoading(true);
    
    try {
      const tagsResponse = await DockerHubService.getRepositoryTags(repoName, 10, 1);
      setModalTags(tagsResponse.results);
      setModalTagsCount(tagsResponse.count);
      setModalTagsNext(tagsResponse.next);
      setModalTagsPrevious(tagsResponse.previous);
    } catch (error) {
      console.error('Error fetching repository tags:', error);
      setModalTags([]);
    } finally {
      setModalTagsLoading(false);
    }
  };

  // Handle tag pagination
  const handleTagsPageChange = async (page: number) => {
    if (!selectedRepo) return;
    
    setModalTagsPage(page);
    setModalTagsLoading(true);
    
    try {
      const tagsResponse = await DockerHubService.getRepositoryTags(selectedRepo, 10, page);
      setModalTags(tagsResponse.results);
      setModalTagsCount(tagsResponse.count);
      setModalTagsNext(tagsResponse.next);
      setModalTagsPrevious(tagsResponse.previous);
    } catch (error) {
      console.error('Error fetching repository tags:', error);
      setModalTags([]);
    } finally {
      setModalTagsLoading(false);
    }
  };

  // Handle tag selection
  const handleTagSelect = (tagName: string) => {
    if (showImageModal && selectedRepo) {
      const serviceName = showImageModal;
      const fullImageName = `${selectedRepo}:${tagName}`;
      
      if (selectedItemId) {
        const item = workspaceManager.getItem(selectedItemId);
        if (item?.serviceContainer?.services[serviceName]) {
          // Update service image
          item.serviceContainer.services[serviceName].image = fullImageName;
          workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
          setWorkspaceItems([...workspaceManager.getAllItems()]);
        }
      }
      // Close modal and reset
      handleModalClose();
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowImageModal(null);
    setModalRepoSearch('');
    setModalRepoResults([]);
    setModalRepoSelectedIndex(-1);
    setSelectedRepo(null);
    setModalTags([]);
    setModalTagsPage(1);
    setModalTagsCount(0);
    setModalTagsNext(null);
    setModalTagsPrevious(null);
  };

  return (
    <div className="h-screen w-screen grid grid-cols-[250px_1fr] grid-rows-[1fr_32px] bg-white dark:bg-gray-900 overflow-hidden">
        {/* Left Sidebar - spans full height */}
        <aside className="row-span-2 bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden relative">
          {/* Menu Header */}
          <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex items-center h-10 relative">
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
                  className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors h-10 flex items-center"
                >
                  File
                </button>
                {isFileMenuOpen && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={handleNew}
                    >
                      New
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={handleOpen}
                    >
                      Open
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={handleExit}
                    >
                      Exit
                    </button>
                  </div>
                )}
              </div>
              <button className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors h-10 flex items-center">
                Edit
              </button>
              <button className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors h-10 flex items-center">
                Selection
              </button>
            </nav>
          </div>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Workspace
          </h2>
          <button 
            onClick={handleAddWorkspaceItem}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            title="Add workspace item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 pl-4">
          <div className="space-y-2">
            {workspaceItems.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-500 italic">
                No workspace items. Click + to add one.
              </div>
            ) : (
              workspaceItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item.id)}
                  className={`py-2 pl-3 border-y border-l transition-colors flex items-start justify-between group cursor-pointer relative ${
                    selectedItemId === item.id
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-500 rounded-l-lg pr-3'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-650 rounded-lg border-r mr-4'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {editingItemId === item.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleEditKeyDown}
                        autoFocus
                        className="text-sm font-medium text-gray-900 dark:text-white bg-transparent border border-blue-500 rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div
                        onDoubleClick={() => handleDoubleClickName(item)}
                        className="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {item.name}
                      </div>
                    )}
                    {item.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                    title="Remove item"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Theme Toggle Button Group */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex h-8">
            <button
              onClick={() => setThemeMode('light')}
              className={`flex-1 text-xs bg-secondary-500 transition-colors flex items-center justify-center ${
                themeMode === 'light'
                  ? 'font-bold text-white'
                  : 'font-normal text-gray-300'
              }`}
              type="button"
            >
              Light
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              className={`flex-1 text-xs bg-secondary-500 transition-colors flex items-center justify-center ${
                themeMode === 'dark'
                  ? 'font-bold text-white'
                  : 'font-normal text-gray-300'
              }`}
              type="button"
            >
              Dark
            </button>
            <button
              onClick={() => setThemeMode('system')}
              className={`flex-1 text-xs bg-secondary-500 transition-colors flex items-center justify-center ${
                themeMode === 'system'
                  ? 'font-bold text-white'
                  : 'font-normal text-gray-300'
              }`}
              type="button"
            >
              System
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - split into two columns */}
      <main className="grid grid-cols-[1fr_340px] overflow-hidden bg-white dark:bg-gray-900">
        {/* Left Main Content */}
        <div className={`overflow-hidden bg-gray-50 dark:bg-gray-800 relative ${
          selectedItemId ? 'border-l-4 border-blue-500 dark:border-blue-500' : ''
        }`}>
          {selectedItemId ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onPaneClick={() => {/* Canvas clicked - properties already shown */}}
              proOptions={{ hideAttribution: true }}
              className="bg-gray-50 dark:bg-gray-800"
              defaultViewport={{ x: 0, y: 0, zoom: 1.0 }}
              minZoom={0.1}
              maxZoom={2}
              nodeTypes={nodeTypes}
            >
              <Controls />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center px-8">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Load Your Docker Compose File
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Select a workspace item or create a new one to get started
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel (340px) */}
        <div className="overflow-hidden p-4 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          {selectedItemId ? (
            <>
              {/* Header */}
              <div className="flex-shrink-0">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Docker Compose Properties
                </h3>
                <div className="border-b border-gray-300 dark:border-gray-600 mb-4"></div>
              </div>

              {/* Top Section: Name & Version */}
              <div className="flex-shrink-0 space-y-4 mb-4">
                {/* Name Section */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                    Name
                  </label>
                  {editingComposeName ? (
                    <input
                      type="text"
                      value={composeNameValue}
                      onChange={(e) => setComposeNameValue(e.target.value)}
                      onBlur={handleSaveComposeName}
                      onKeyDown={handleComposeNameKeyDown}
                      autoFocus
                      className="w-full text-sm text-gray-900 dark:text-white bg-transparent border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <div
                      onClick={() => handleStartEditComposeName(workspaceManager.getItem(selectedItemId)?.serviceContainer?.name || '')}
                      className="text-sm text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded px-2 py-1 transition-colors"
                    >
                      {workspaceManager.getItem(selectedItemId)?.serviceContainer?.name || 'Click to set name'}
                    </div>
                  )}
                </div>

                {/* Version Section */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                    Version
                  </label>
                  <select
                    value={workspaceManager.getItem(selectedItemId)?.serviceContainer?.version || ''}
                    onChange={(e) => handleComposeVersionChange(e.target.value)}
                    className="w-full text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select version</option>
                    {COMPOSE_VERSIONS.map((version) => (
                      <option key={version} value={version}>
                        {version}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Middle Section: Services (Scrollable) */}
              <div className="flex-1 overflow-y-auto mb-4">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Services
                    </label>
                    <button
                      onClick={handleAddService}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
                      title="Add service"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  {workspaceManager.getItem(selectedItemId)?.serviceContainer?.services &&
                   Object.keys(workspaceManager.getItem(selectedItemId)!.serviceContainer!.services).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(workspaceManager.getItem(selectedItemId)!.serviceContainer!.services).map(([serviceName, serviceConfig]) => {
                        const isCollapsed = collapsedServices.has(serviceName);
                        return (
                          <div key={serviceName} className="border-t-4 border-blue-500 bg-gray-50 dark:bg-gray-800 rounded">
                            <button
                              onClick={() => {
                                const newCollapsed = new Set(collapsedServices);
                                if (isCollapsed) {
                                  newCollapsed.delete(serviceName);
                                } else {
                                  newCollapsed.add(serviceName);
                                }
                                setCollapsedServices(newCollapsed);
                              }}
                              className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <span className="font-medium text-sm text-gray-900 dark:text-white">{serviceName}</span>
                              <svg 
                                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {!isCollapsed && (
                              <div className="px-2 pb-2 text-xs space-y-3 text-gray-700 dark:text-gray-300">
                                {/* Icon dropdown - first property */}
                                <div className="flex gap-2 items-center">
                                  <span className="font-semibold min-w-[100px]">icon:</span>
                                  <select
                                    value={serviceConfig.icon || 'container'}
                                    onChange={(e) => handleServiceIconChange(serviceName, e.target.value)}
                                    className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                                  >
                                    {SERVICE_ICONS.map((icon) => (
                                      <option key={icon.value} value={icon.value}>
                                        {icon.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                
                                {/* Main properties subset */}
                                {Object.entries(serviceConfig)
                                  .filter(([key]) => ['container_name', 'image', 'labels', 'networks', 'ports', 'volumes', 'depends_on'].includes(key))
                                  .map(([key, value]) => {
                                    if (key === 'image') {
                                      return (
                                        <div key={key} className="space-y-1">
                                          <div className="flex items-center justify-between">
                                            <span className="font-semibold text-sm">{key}:</span>
                                            <button
                                              onClick={() => setShowImageModal(serviceName)}
                                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                              title="Edit image"
                                            >
                                              <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                              </svg>
                                            </button>
                                          </div>
                                          <div className="text-gray-600 dark:text-gray-400 text-xs break-all pl-2">
                                            {typeof value === 'string' ? value : ''}
                                          </div>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div key={key} className="flex gap-2 items-start">
                                        <span className="font-semibold min-w-[100px] pt-1">{key}:</span>
                                        <span className="text-gray-600 dark:text-gray-400 break-all flex-1">
                                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                
                                {/* Button to show all properties */}
                                <button
                                  onClick={() => setSelectedServiceForDetails(serviceName)}
                                  className="w-full mt-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  Show All Properties
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Click + to add services
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section: Networks & Volumes (Sticky) */}
              <div className="flex-shrink-0 space-y-4">
                {/* Networks Section */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Networks
                    </label>
                    <button
                      onClick={handleAddNetwork}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
                      title="Add network"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  {workspaceManager.getItem(selectedItemId)?.serviceContainer?.networks &&
                   Object.keys(workspaceManager.getItem(selectedItemId)!.serviceContainer!.networks!).length > 0 ? (
                    <div className="text-sm text-gray-900 dark:text-white">
                      {Object.keys(workspaceManager.getItem(selectedItemId)!.serviceContainer!.networks!).length} network(s)
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No networks
                    </div>
                  )}
                </div>

                {/* Volumes Section */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Volumes
                    </label>
                    <button
                      onClick={handleAddVolume}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
                      title="Add volume"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  {workspaceManager.getItem(selectedItemId)?.serviceContainer?.volumes &&
                   Object.keys(workspaceManager.getItem(selectedItemId)!.serviceContainer!.volumes!).length > 0 ? (
                    <div className="text-sm text-gray-900 dark:text-white">
                      {Object.keys(workspaceManager.getItem(selectedItemId)!.serviceContainer!.volumes!).length} volume(s)
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No volumes
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center px-4">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Load your docker compose to see the properties
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Full Properties Slider */}
      {selectedServiceForDetails && selectedItemId && (
        <div 
          className={`fixed right-[340px] top-0 h-full w-[340px] bg-white dark:bg-gray-800 border-l border-gray-300 dark:border-gray-600 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
            selectedServiceForDetails ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-600">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              All Properties: {selectedServiceForDetails}
            </h3>
            <button
              onClick={() => setSelectedServiceForDetails(null)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              title="Close (ESC)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search input overlay */}
          {sliderSearchQuery && (
            <div className="px-4 pt-2">
              <div className="relative">
                <input
                  ref={sliderSearchRef}
                  type="text"
                  value={sliderSearchQuery}
                  onChange={(e) => setSliderSearchQuery(e.target.value)}
                  placeholder="Search properties..."
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-blue-500 dark:border-blue-400 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setSliderSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Properties content */}
          <div className="overflow-y-auto h-[calc(100%-60px)] p-4">
            <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
              {workspaceManager.getItem(selectedItemId)?.serviceContainer?.services[selectedServiceForDetails] &&
                Object.entries(workspaceManager.getItem(selectedItemId)!.serviceContainer!.services[selectedServiceForDetails])
                  .filter(([key]) => !sliderSearchQuery || key.toLowerCase().includes(sliderSearchQuery.toLowerCase()))
                  .map(([key, value], index) => (
                  <div 
                    key={key} 
                    ref={(el) => propertyRefs.current[index] = el}
                    className={`rounded p-2 transition-colors relative group ${
                      index === selectedPropertyIndex 
                        ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500 dark:ring-blue-400' 
                        : 'bg-gray-50 dark:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">{key}</div>
                        <div className="text-gray-600 dark:text-gray-400 break-all font-mono">
                          {typeof value === 'object' ? (
                            <pre className="whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                          ) : (
                            String(value)
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => console.log(`Edit ${key}`)}
                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit property"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              }
              {sliderSearchQuery && Object.entries(workspaceManager.getItem(selectedItemId)!.serviceContainer!.services[selectedServiceForDetails])
                .filter(([key]) => key.toLowerCase().includes(sliderSearchQuery.toLowerCase())).length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No properties match "{sliderSearchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay for slider */}
      {selectedServiceForDetails && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setSelectedServiceForDetails(null)}
        />
      )}

      {/* Bottom Status Bar - small strip like VS Code */}
      <footer className="bg-secondary-500 border-t border-secondary-600 flex items-center px-3">
        <div className="flex items-center gap-4 text-xs text-white">
          <span>Status Bar</span>
          <span>Ready</span>
        </div>
      </footer>

      {/* Confirmation Dialog for Item Removal */}
      {itemToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Confirm Removal
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to remove this workspace item? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelRemoveItem}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                No
              </button>
              <button
                onClick={confirmRemoveItem}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Selection Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Select Docker Image
              </h2>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              {/* Repository Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Repository
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={modalRepoSearch}
                    onChange={(e) => handleModalRepoSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (modalRepoResults.length > 0) {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setModalRepoSelectedIndex(prev => 
                            prev < modalRepoResults.length - 1 ? prev + 1 : prev
                          );
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setModalRepoSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          if (modalRepoSelectedIndex >= 0 && modalRepoSelectedIndex < modalRepoResults.length) {
                            handleRepoSelect(modalRepoResults[modalRepoSelectedIndex].repo_name);
                          }
                        } else if (e.key === 'Escape') {
                          setModalRepoResults([]);
                          setModalRepoSelectedIndex(-1);
                        }
                      } else if (e.key === 'Enter' && modalRepoSearch.length >= 3) {
                        // If no results showing but query is valid, close any existing results
                        setModalRepoResults([]);
                      }
                    }}
                    placeholder="Search Docker Hub repositories (min 3 characters)..."
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {modalRepoLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Repository Results */}
                {modalRepoResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded">
                    {modalRepoResults.map((repo, index) => (
                      <button
                        key={repo.repo_name}
                        onClick={() => handleRepoSelect(repo.repo_name)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                          index === modalRepoSelectedIndex ? 'bg-blue-100 dark:bg-blue-900/30' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{repo.repo_name}</div>
                        {repo.short_description && (
                          <div className="text-gray-500 dark:text-gray-400 text-xs truncate mt-0.5">
                            {repo.short_description}
                          </div>
                        )}
                        <div className="flex gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                          <span>★ {repo.star_count}</span>
                          <span>↓ {repo.pull_count.toLocaleString()}</span>
                          {repo.is_official && <span className="text-blue-500">Official</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Repository Display */}
              {selectedRepo && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Repository: <span className="font-bold">{selectedRepo}</span>
                  </div>
                </div>
              )}

              {/* Tags Table */}
              {selectedRepo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Available Tags ({modalTagsCount} total)
                  </label>
                  
                  {modalTagsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : modalTags.length > 0 ? (
                    <>
                      <div className="border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Name</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Images</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Full Size</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Last Updated</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {modalTags.map((tag) => (
                                <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-3 py-2 text-gray-900 dark:text-white font-medium">{tag.name}</td>
                                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{tag.images.length}</td>
                                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                    {(tag.full_size / 1024 / 1024).toFixed(2)} MB
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                    {new Date(tag.last_updated).toLocaleDateString()}
                                  </td>
                                  <td className="px-3 py-2">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                                      tag.tag_status === 'active' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                    }`}>
                                      {tag.tag_status}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">
                                    <button
                                      onClick={() => handleTagSelect(tag.name)}
                                      className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                                    >
                                      Select
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination Controls */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Page {modalTagsPage} of {Math.ceil(modalTagsCount / 10)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTagsPageChange(modalTagsPage - 1)}
                            disabled={!modalTagsPrevious}
                            className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => handleTagsPageChange(modalTagsPage + 1)}
                            disabled={!modalTagsNext}
                            className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No tags found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end flex-shrink-0">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
