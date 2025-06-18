// Main entry point for Literature Game React app
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

/**
 * EXPLANATION: React 18 Entry Point
 * 
 * This is the modern React 18 way to start a React app:
 * 1. Create a root using the new createRoot API
 * 2. Render our main App component
 * 3. StrictMode helps catch bugs in development
 */

// Get the root element from our HTML
const rootElement = document.getElementById('root')!

// Create React root and render our app
const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
) 