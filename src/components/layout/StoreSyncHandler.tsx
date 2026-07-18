"use client"

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter, usePathname } from 'next/navigation';

export function StoreSyncHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const syncFromDB = async () => {
      const state = useStore.getState();
      const isSetup = !!state.user?.setupDate;

      // Force unauthenticated users back to Landing page to prevent viewing mock Aiman profile
      if (!isSetup && pathname !== '/' && pathname !== '/setup') {
        router.push('/');
        return;
      }

      if (typeof window !== 'undefined' && !navigator.onLine) {
        state.setSyncStatus('offline');
        return;
      }

      state.setSyncStatus('syncing');

      try {
        const username = (state.user.name || 'Aiman').trim().toLowerCase();
        const passcode = state.user.passcode || '';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`/api/sync?username=${username}&passcode=${passcode}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('beu-nextgen-store');
            localStorage.removeItem('beu_nextgen_sync_pending');
            localStorage.removeItem('coach_messages');
            if ('indexedDB' in window) {
              try {
                indexedDB.deleteDatabase('beu-nextgen-db');
              } catch {}
            }
            window.location.href = process.env.NEXT_PUBLIC_BASE_PATH || '/';
          }
          return;
        }

        if (res.status === 404) {
          useStore.setState({ syncStatus: 'disabled' });
          return;
        }

        const data = await res.json();
        if (data.success && data.data) {
          const dbState = data.data;
          const localState = useStore.getState();

          // Helper to merge arrays by unique 'id'
          const mergeById = (localArr: any[] = [], dbArr: any[] = []) => {
            const map = new Map();
            dbArr.forEach(item => {
              if (item && item.id) map.set(item.id, item);
            });
            localArr.forEach(item => {
              if (item && item.id) {
                if (!map.has(item.id)) {
                  map.set(item.id, item);
                }
              }
            });
            return Array.from(map.values());
          };

          const mergedPockets = mergeById(localState.savingsPockets, dbState.savingsPockets);
          const mergedTransactions = mergeById(localState.transactions, dbState.transactions);
          const mergedBills = mergeById(localState.bills, dbState.bills);

          const currentBalance = localState.user?.currentBalance !== undefined
            ? localState.user.currentBalance
            : (dbState.user?.currentBalance || 420);

          useStore.setState({
            ...dbState,
            syncStatus: 'synced',
            savingsPockets: mergedPockets,
            transactions: mergedTransactions,
            bills: mergedBills,
            coachSessions: dbState.coachSessions !== undefined ? dbState.coachSessions : localState.coachSessions,
            coachMessagesMap: dbState.coachMessagesMap !== undefined ? dbState.coachMessagesMap : localState.coachMessagesMap,
            coachCurrentSessionId: dbState.coachCurrentSessionId !== undefined ? dbState.coachCurrentSessionId : localState.coachCurrentSessionId,
            user: {
              ...(dbState.user || localState.user),
              currentBalance
            }
          });
        } else {
          if (data.reason && data.reason.includes('No DATABASE_URL')) {
            useStore.setState({ syncStatus: 'disabled' });
          } else {
            useStore.setState({ syncStatus: 'error' });
          }
        }
      } catch (err) {
        console.error('[StoreSyncHandler] failed to sync state from database:', err);
        const currentState = useStore.getState();
        if (typeof window !== 'undefined' && !navigator.onLine) {
          currentState.setSyncStatus('offline');
        } else {
          currentState.setSyncStatus('error');
        }
      }
    };
    
    syncFromDB();
  }, []);

  return null;
}
