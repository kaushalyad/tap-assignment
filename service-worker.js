importScripts('https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/idb-keyval-iife.min.js');

self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-runs') {
    event.waitUntil(syncRuns());
  }
});

async function syncRuns() {
  // Use idb-keyval for IndexedDB
  const KEY = 'unsynced_runs';
  let unsynced = [];
  try {
    unsynced = (await self.idbKeyval.get(KEY)) || [];
  } catch {}
  console.log('[ServiceWorker] Starting syncRuns. Unsynced runs:', unsynced.length);
  let stillUnsynced = [];
  for (const run of unsynced) {
    try {
      await fetch('https://httpbin.org/post', {
        method: 'POST',
        body: JSON.stringify(run),
        headers: { 'Content-Type': 'application/json' }
      });
      let runs = [];
      try {
        runs = JSON.parse(self.localStorage.getItem('jogger_runs') || '[]');
      } catch {}
      runs.unshift(run);
      self.localStorage.setItem('jogger_runs', JSON.stringify(runs));
      console.log('[ServiceWorker] Synced run and added to jogger_runs:', run);
    } catch {
      stillUnsynced.push(run);
      console.log('[ServiceWorker] Failed to sync run, keeping in unsynced:', run);
    }
  }
  if (stillUnsynced.length > 0) {
    await self.idbKeyval.set(KEY, stillUnsynced);
    console.log('[ServiceWorker] Updated unsynced_runs in IndexedDB. Remaining:', stillUnsynced.length);
  } else {
    await self.idbKeyval.del(KEY);
    console.log('[ServiceWorker] All runs synced. Cleared unsynced_runs in IndexedDB.');
  }
} 