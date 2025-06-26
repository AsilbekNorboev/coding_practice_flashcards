// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 2000,
          style: { fontSize: '16px' },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
);
