/**
 * PropertiesSlider - Full properties slider panel
 */

import React, { useRef, useEffect } from 'react';
import { useWorkspaceStore, useUIStore } from '../../store';
import { CloseIcon, EditIcon } from '../common';

export const PropertiesSlider: React.FC = () => {
  const { selectedItemId, getSelectedItem } = useWorkspaceStore();
  const {
    selectedServiceForDetails,
    sliderSearchQuery,
    selectedPropertyIndex,
    setSelectedServiceForDetails,
    setSliderSearchQuery,
    setSelectedPropertyIndex,
  } = useUIStore();

  const sliderSearchRef = useRef<HTMLInputElement>(null);
  const propertyRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectedItem = getSelectedItem();
  const serviceConfig = selectedItem?.serviceContainer?.services[selectedServiceForDetails || ''];

  // Focus search input when search query starts
  useEffect(() => {
    if (sliderSearchQuery && sliderSearchRef.current) {
      sliderSearchRef.current.focus();
    }
  }, [sliderSearchQuery]);

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedServiceForDetails) {
        if (sliderSearchQuery) {
          setSliderSearchQuery('');
        } else {
          setSelectedServiceForDetails(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [selectedServiceForDetails, sliderSearchQuery, setSliderSearchQuery, setSelectedServiceForDetails]);

  // Handle arrow key navigation
  useEffect(() => {
    if (!selectedServiceForDetails || !serviceConfig) return;

    const allProperties = Object.entries(serviceConfig);
    const filteredProperties = sliderSearchQuery
      ? allProperties.filter(([key]) => key.toLowerCase().includes(sliderSearchQuery.toLowerCase()))
      : allProperties;

    const handleArrowKeys = (event: KeyboardEvent) => {
      if (filteredProperties.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const newIndex = Math.min(selectedPropertyIndex + 1, filteredProperties.length - 1);
        setSelectedPropertyIndex(newIndex);
        setTimeout(() => {
          propertyRefs.current[newIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }, 0);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const newIndex = Math.max(selectedPropertyIndex - 1, 0);
        setSelectedPropertyIndex(newIndex);
        setTimeout(() => {
          propertyRefs.current[newIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }, 0);
      }
    };

    document.addEventListener('keydown', handleArrowKeys);
    return () => {
      document.removeEventListener('keydown', handleArrowKeys);
    };
  }, [selectedServiceForDetails, serviceConfig, sliderSearchQuery, selectedPropertyIndex, setSelectedPropertyIndex]);

  // Handle keyboard input to activate search
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!selectedServiceForDetails) return;

      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement;

      if (isInputFocused) return;

      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        setSliderSearchQuery(event.key);
        setTimeout(() => sliderSearchRef.current?.focus(), 0);
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [selectedServiceForDetails, setSliderSearchQuery]);

  if (!selectedServiceForDetails || !selectedItemId || !serviceConfig) return null;

  const allProperties = Object.entries(serviceConfig);
  const filteredProperties = sliderSearchQuery
    ? allProperties.filter(([key]) => key.toLowerCase().includes(sliderSearchQuery.toLowerCase()))
    : allProperties;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={() => setSelectedServiceForDetails(null)}
      />

      {/* Slider Panel */}
      <div
        className={`fixed right-[340px] top-0 h-full w-[340px] bg-white dark:bg-gray-800 border-l border-gray-300 dark:border-gray-600 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          selectedServiceForDetails ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-600">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            All Properties: {selectedServiceForDetails}
          </h3>
          <button
            onClick={() => setSelectedServiceForDetails(null)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="Close (ESC)"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search Input */}
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
                <CloseIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Properties Content */}
        <div className="overflow-y-auto h-[calc(100%-60px)] p-4">
          <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
            {filteredProperties.map(([key, value], index) => (
              <div
                key={key}
                ref={(el) => { propertyRefs.current[index] = el; }}
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
                    <EditIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {sliderSearchQuery && filteredProperties.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No properties match "{sliderSearchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
