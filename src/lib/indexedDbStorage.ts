import { StateStorage } from 'zustand/middleware';

const DB_NAME = 'beu-nextgen-db';
const STORE_NAME = 'key-value-store';

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported on this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const indexedDbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(name);
        
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('[IndexedDB Storage] Falling back to localStorage for get:', name, error);
      if (typeof window !== 'undefined') {
        return localStorage.getItem(name);
      }
      return null;
    }
  },
  
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, name);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('[IndexedDB Storage] Falling back to localStorage for set:', name, error);
      if (typeof window !== 'undefined') {
        localStorage.setItem(name, value);
      }
    }
  },
  
  removeItem: async (name: string): Promise<void> => {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(name);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('[IndexedDB Storage] Falling back to localStorage for remove:', name, error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(name);
      }
    }
  }
};
