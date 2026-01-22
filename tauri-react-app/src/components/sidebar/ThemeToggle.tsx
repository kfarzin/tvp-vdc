/**
 * ThemeToggle - Toggle buttons for light/dark/system theme
 * Memoized for performance
 */

import React, { memo, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggleComponent: React.FC = () => {
  const { themeMode, setThemeMode } = useTheme();

  const handleSetLight = useCallback(() => setThemeMode('light'), [setThemeMode]);
  const handleSetDark = useCallback(() => setThemeMode('dark'), [setThemeMode]);
  const handleSetSystem = useCallback(() => setThemeMode('system'), [setThemeMode]);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      <div className="flex h-8">
        <button
          onClick={handleSetLight}
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
          onClick={handleSetDark}
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
          onClick={handleSetSystem}
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
  );
};

export const ThemeToggle = memo(ThemeToggleComponent);
