import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRefactored from './AppRefactored'
import { storage } from './utils/storage'
import './index.css'

// Initialize storage before app starts
storage.initialize();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRefactored />
  </React.StrictMode>
)
