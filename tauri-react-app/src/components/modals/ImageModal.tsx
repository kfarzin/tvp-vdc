/**
 * ImageModal - Docker Hub image search and selection
 */

import React, { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore, useModalStore } from '../../store';
import { useDockerHubSearch } from '../../hooks';
import { SpinnerIcon, CloseIcon } from '../common/Icons';

export const ImageModal: React.FC = () => {
  const { imageModal, closeImageModal } = useModalStore();
  const { updateServiceProperty } = useWorkspaceStore();
  
  const [localValue, setLocalValue] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    searchTerm,
    setSearchTerm,
    repositories,
    tags,
    isSearching,
    isLoadingTags,
    fetchTags,
    clearTags
  } = useDockerHubSearch();

  // Initialize local value from modal state
  useEffect(() => {
    if (imageModal.isOpen && imageModal.currentValue) {
      setLocalValue(imageModal.currentValue);
    }
  }, [imageModal.isOpen, imageModal.currentValue]);

  // Focus input when modal opens
  useEffect(() => {
    if (imageModal.isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [imageModal.isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && imageModal.isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageModal.isOpen]);

  if (!imageModal.isOpen) return null;

  const handleClose = () => {
    closeImageModal();
    setLocalValue('');
    setSearchTerm('');
    setSelectedRepo(null);
    clearTags();
  };

  const handleSelectRepo = (repoName: string) => {
    setSelectedRepo(repoName);
    fetchTags(repoName);
  };

  const handleSelectTag = (tag: string) => {
    if (!selectedRepo || !imageModal.serviceId) return;
    
    const fullImage = `${selectedRepo}:${tag}`;
    updateServiceProperty(imageModal.serviceId, 'image', fullImage);
    handleClose();
  };

  const handleUseManualValue = () => {
    if (!imageModal.serviceId || !localValue.trim()) return;
    
    updateServiceProperty(imageModal.serviceId, 'image', localValue.trim());
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && localValue.trim()) {
      handleUseManualValue();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[800px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Docker Image
          </h3>
          <button
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Manual Input Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter image manually
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., nginx:latest, mysql:8.0"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleUseManualValue}
              disabled={!localValue.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded transition-colors"
            >
              Use
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Docker Hub
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for images..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <SpinnerIcon className="w-4 h-4 text-blue-500" />
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Repositories List */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-2">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                Repositories
              </h4>
              {repositories.length === 0 && !isSearching && (
                <p className="text-sm text-gray-500 dark:text-gray-400 px-2">
                  Search for Docker images above
                </p>
              )}
              {repositories.map((repo) => (
                <button
                  key={repo.repo_name}
                  onClick={() => handleSelectRepo(repo.repo_name)}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                    selectedRepo === repo.repo_name
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="font-medium truncate">{repo.repo_name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {repo.short_description || 'No description'}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    ⭐ {repo.star_count.toLocaleString()} • 📥 {repo.pull_count.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tags List */}
          <div className="w-1/2 overflow-y-auto">
            <div className="p-2">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                Tags {selectedRepo && `for ${selectedRepo}`}
              </h4>
              {isLoadingTags ? (
                <div className="flex items-center justify-center py-8">
                  <SpinnerIcon className="w-6 h-6 text-blue-500" />
                </div>
              ) : tags.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 px-2">
                  {selectedRepo ? 'No tags found' : 'Select a repository to view tags'}
                </p>
              ) : (
                <div className="space-y-1">
                  {tags.map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => handleSelectTag(tag.name)}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    >
                      <div className="font-medium">{tag.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {tag.full_size ? `${(tag.full_size / 1024 / 1024).toFixed(1)} MB` : 'Size unknown'}
                        {tag.last_updated && ` • Updated ${new Date(tag.last_updated).toLocaleDateString()}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
