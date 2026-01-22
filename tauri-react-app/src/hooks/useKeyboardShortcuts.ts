/**
 * useKeyboardShortcuts - Hook for handling keyboard shortcuts
 */

import { useEffect } from 'react';
import { useUIStore } from '../store';

export function useKeyboardShortcuts() {
  const {
    selectedServiceForDetails,
    sliderSearchQuery,
    setSliderSearchQuery,
    setSelectedServiceForDetails,
    setSelectedPropertyIndex,
  } = useUIStore();

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
  }, [selectedServiceForDetails, sliderSearchQuery, setSliderSearchQuery, setSelectedServiceForDetails]);

  // Handle keyboard input to activate search in slider
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!selectedServiceForDetails) return;

      // Check if any input is focused
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement;

      if (isInputFocused) return;

      // Check if it's a printable character (not special keys)
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        setSliderSearchQuery(event.key);
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [selectedServiceForDetails, setSliderSearchQuery]);

  // Handle arrow key navigation in slider
  const handleArrowNavigation = (filteredPropertiesLength: number, propertyRefs: React.RefObject<(HTMLDivElement | null)[]>) => {
    const handleArrowKeys = (event: KeyboardEvent) => {
      if (!selectedServiceForDetails) return;
      if (filteredPropertiesLength === 0) return;

      const { selectedPropertyIndex } = useUIStore.getState();

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const newIndex = Math.min(selectedPropertyIndex + 1, filteredPropertiesLength - 1);
        setSelectedPropertyIndex(newIndex);
        setTimeout(() => {
          propertyRefs.current?.[newIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }, 0);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const newIndex = Math.max(selectedPropertyIndex - 1, 0);
        setSelectedPropertyIndex(newIndex);
        setTimeout(() => {
          propertyRefs.current?.[newIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }, 0);
      }
    };

    return handleArrowKeys;
  };

  return {
    handleArrowNavigation,
  };
}
