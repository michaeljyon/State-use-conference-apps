import { useEffect, useState } from 'react';
import { now, timeTravel } from './config.js';
import { readLocal, writeLocal } from './store.js';

// Live features (leaderboard, gallery, staff tools, announcements) use the
// /api functions. If they aren't deployed (e.g. a drag-and-drop deploy), the
// app switches to "on this phone" mode and keeps working without them.

let mode = null; // 'live' | 'local'
let modePromise = null;
const listeners = new Set();

export function apiMode() {
  if (mode) return Promise.resolve(mode);
  modePromise ||= fetch('/api/health', { cache: 'no-store' })
    .then(r => (r.ok && (r.headers.get('content-type') || '').includes('json') ? 'live' : 'local'))
    .catch(() => (navigator.onLine ? 'local' : 'offline-unknown'))
    .then(m => {
      if (m === 'offline-unknown') { modePromise = null; return readLocal('lastMode', 'live'); }
      mode = m; writeLocal('lastMode', m); listeners.forEach(f => f(m)); return m;
    });
  return modePromise;
}

export function useApiMode() {
  const [m, setM] = useState(mode || readLocal('lastMode', null));
  useEffect(() => { listeners.add(setM); apiMode().then(setM); return () => listeners.delete(setM); }, []);
  return m;
}

function headers(extra = {}) {
  const h = { Accept: 'application/json', ...extra };
  if (timeTravel) h['x-preview-now'] = String(now());
  return h;
}

export async function api(path, { method = 'GET', body, staff } = {}) {
  const h = headers(body ? { 'Content-Type': 'application/json' } : {});
  if (staff) h['x-staff-passcode'] = staff;
  const res = await fetch(`/api/${path}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  const type = res.headers.get('content-type') || '';
  const data = type.includes('json') ? await res.json() : null;
  if (!res.ok) {
    const e = new Error(data?.error || `Request failed (${res.status})`);
    e.status = res.status; throw e;
  }
  return data;
}

// ---- outbox: things to send when the phone is back online (surveys, cards)
export function queue(kind, payload) {
  const box = readLocal('outbox', []);
  box.push({ kind, payload, at: Date.now() });
  writeLocal('outbox', box);
}
const ENDPOINT = { feedback: 'feedback', challenge: 'challenge', photo: 'photos' };
let flushing = false;
export async function flushOutbox() {
  if (flushing || !navigator.onLine) return;
  if ((await apiMode()) !== 'live') return;
  flushing = true;
  try {
    let box = readLocal('outbox', []);
    while (box.length) {
      const item = box[0];
      try { await api(ENDPOINT[item.kind], { method: 'POST', body: item.payload }); }
      catch (e) { if (!e.status || e.status >= 500) break; } // keep for later; drop 4xx
      box = readLocal('outbox', []).slice(1);
      writeLocal('outbox', box);
    }
  } finally { flushing = false; }
}
addEventListener('online', flushOutbox);
