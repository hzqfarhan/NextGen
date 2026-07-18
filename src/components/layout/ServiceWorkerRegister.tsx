"use client"

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Use the base path from environment variables if deployed to GitHub Pages
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      const swUrl = `${basePath}/sw.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('[Service Worker] registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.error('[Service Worker] registration failed:', error);
        });
    }
  }, []);

  return null;
}
