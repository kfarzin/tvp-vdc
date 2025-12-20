import { useState, useEffect, useRef, useCallback } from "react";
import { open } from '@tauri-apps/plugin-dialog';
import { exit } from '@tauri-apps/plugin-process';
import { useTheme } from './contexts/ThemeContext';
import { WorkspaceManager } from './application/workspace-manager';
import { WorkspaceItem } from './application/workspace-item';
import { ReactFlow, Node, Edge, Controls, Background, BackgroundVariant, useNodesState, useEdgesState, addEdge, Connection } from '@xyflow/react';
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
  const [isLoading, setIsLoading] = useState(false);
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
  const [selectedComposeVersion, setSelectedComposeVersion] = useState('');

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const toggleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemeMode(themes[nextIndex]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  const handleNew = () => {
    setIsFileMenuOpen(false);
    console.log('New file clicked');
    // Add your new file logic here
  };

  const handleOpen = async () => {
    setIsFileMenuOpen(false);
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    // Initialize React Flow with empty canvas when item is selected
    setNodes([]);
    setEdges([]);
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
        if (!item.serviceContainer) {
          item.serviceContainer = { services: {} };
        }
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
        if (!item.serviceContainer) {
          item.serviceContainer = { services: {} };
        }
        item.serviceContainer.version = version;
        workspaceManager.updateItem(selectedItemId, { serviceContainer: item.serviceContainer });
        setWorkspaceItems([...workspaceManager.getAllItems()]);
        setSelectedComposeVersion(version);
      }
    }
  };

  // Placeholder handlers for add buttons
  const handleAddService = () => {
    console.log('Add service clicked');
    // TODO: Implement add service logic
  };

  const handleAddNetwork = () => {
    console.log('Add network clicked');
    // TODO: Implement add network logic
  };

  const handleAddVolume = () => {
    console.log('Add volume clicked');
    // TODO: Implement add volume logic
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
      <main className="grid grid-cols-[1fr_300px] overflow-hidden bg-white dark:bg-gray-900">
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
              fitView
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

        {/* Right Panel (300px) */}
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
                    <div className="text-sm text-gray-900 dark:text-white">
                      {Object.keys(workspaceManager.getItem(selectedItemId)!.serviceContainer!.services).length} service(s)
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
    </div>
  );
}

export default App;
