import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRefactored from './AppRefactored'
import { ErrorBoundary } from './components/ErrorBoundary'
import { storage } from './utils/storage'
import './index.css'

// Initialize storage before app starts
storage.initialize();

// Debug information
console.log('🚀 NanoLez-EDUAI App Starting...');
console.log('Environment:', import.meta.env.MODE);
console.log('Build Time:', new Date().toISOString());

// Ensure root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error('Root element not found');
}

// Error handling for React mounting
try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AppRefactored />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('✅ App mounted successfully');
} catch (error) {
  console.error('❌ Failed to mount app:', error);
  // Fallback error display
  rootElement.innerHTML = `
    <div style="
      display: flex; 
      justify-content: center; 
      align-items: center; 
      height: 100vh; 
      font-family: Arial, sans-serif;
      background-color: #f3f4f6;
    ">
      <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h1 style="color: #dc2626; margin-bottom: 1rem;">App Failed to Load</h1>
        <p style="color: #6b7280; margin-bottom: 1rem;">Please check the browser console for details.</p>
        <button onclick="window.location.reload()" style="
          padding: 0.5rem 1rem; 
          background: #dc2626; 
          color: white; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer;
        ">
          Reload Page
        </button>
      </div>
    </div>
  `;
}
