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
  let stillUnsynced = [];
  for (const run of unsynced) {
    try {
      // Replace with your real API endpoint
      await fetch('/api/sync-run', {
        method: 'POST',
        body: JSON.stringify(run),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      // If any fail, keep them for next sync
      stillUnsynced.push(run);
    }
  }
  if (stillUnsynced.length > 0) {
    await self.idbKeyval.set(KEY, stillUnsynced);
  } else {
    await self.idbKeyval.del(KEY);
  }
} 