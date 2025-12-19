import { useState, useEffect, useRef } from "react";
import { open } from '@tauri-apps/plugin-dialog';
import { exit } from '@tauri-apps/plugin-process';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { themeMode, setThemeMode } = useTheme();

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

  return (
    <div className="h-screen w-screen grid grid-cols-[250px_1fr] grid-rows-[1fr_32px] bg-white dark:bg-gray-900 overflow-hidden">
        {/* Left Sidebar - spans full height */}
        <aside className="row-span-2 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
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
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Workspace
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sidebar content
            </div>
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
        <div className="overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800">
          <div className="text-gray-900 dark:text-white">
            <h1 className="text-2xl font-bold mb-4">Main Content</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Main content area
            </p>
          </div>
        </div>

        {/* Right Panel (300px) */}
        <div className="overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Right Panel
          </h3>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            300px panel
          </div>
        </div>
      </main>

      {/* Bottom Status Bar - small strip like VS Code */}
      <footer className="bg-secondary-500 border-t border-secondary-600 flex items-center px-3">
        <div className="flex items-center gap-4 text-xs text-white">
          <span>Status Bar</span>
          <span>Ready</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
