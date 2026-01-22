/**
 * App.tsx - Main application component
 * Clean architecture using Zustand stores and modular components
 */

import { ReactFlowProvider } from '@xyflow/react';
import { Sidebar } from './components/sidebar/Sidebar';
import { ServiceCanvas } from './components/canvas/ServiceCanvas';
import { PropertiesPanel } from './components/properties/PropertiesPanel';
import { PropertiesSlider } from './components/properties/PropertiesSlider';
import { ConfirmationModal } from './components/modals/ConfirmationModal';
import { ImageModal } from './components/modals/ImageModal';
import { PortModal } from './components/modals/PortModal';
import { NetworkModal } from './components/modals/NetworkModal';
import '@xyflow/react/dist/style.css';

function App() {
  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen grid grid-cols-[280px_1fr_350px] grid-rows-[1fr] overflow-hidden bg-gray-100 dark:bg-gray-900">
        {/* Left Sidebar - File Menu & Workspace */}
        <Sidebar />

        {/* Center - Canvas */}
        <main className="bg-gray-50 dark:bg-gray-800 overflow-hidden">
          <ServiceCanvas />
        </main>

        {/* Right Panel - Properties */}
        <aside className="bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col">
          <PropertiesPanel />
        </aside>

        {/* Full Properties Slider (overlay) */}
        <PropertiesSlider />

        {/* Modals */}
        <ConfirmationModal />
        <ImageModal />
        <PortModal />
        <NetworkModal />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
