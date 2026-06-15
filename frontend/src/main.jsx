import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Cấu hình Axios Interceptor để tự động chuyển hướng sang API URL khi deploy
axios.interceptors.request.use((config) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
  if (config.url && config.url.startsWith('http://localhost:5005')) {
    config.url = config.url.replace('http://localhost:5005', apiUrl);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Đăng ký Service Worker cho PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered with scope: ', registration.scope);
      })
      .catch((error) => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
