
import React from 'react';
import ReactDOM from 'react-dom/client';
import './react-native-shim'; // Import the shim before other imports
import App from './App';
import './index.css';

// Console log to verify initialization
console.log('Application initializing...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
