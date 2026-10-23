import { useEffect, useState, useCallback } from 'react';
import { event } from './config.js';

// Everything an attendee does is saved on their phone first, keyed by event.
const PREFIX = `${event.id}:`;
const subs = new Map();

export function readLocal(key, fallback) {
  try { const v = localStorage.getItem(PREFIX + key); return v == null ? fallback : JSON.parse(v); }
  catch { return fallback; }
}
export function writeLocal(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* full or blocked */ }
  (subs.get(key) || []).forEach(fn => fn(value));
}

export function useLocal(key, fallback) {
  const [v, setV] = useState(() => readLocal(key, fallback));
  useEffect(() => {
    const list = subs.get(key) || [];
    list.push(setV); subs.set(key, list);
    return () => subs.set(key, (subs.get(key) || []).filter(f => f !== setV));
  }, [key]);
  const set = useCallback(next => {
    const value = typeof next === 'function' ? next(readLocal(key, fallback)) : next;
    writeLocal(key, value);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return [v, set];
}

// The attendee's name/org/email, shared by Challenge, Photos and surveys.
export const useMe = () => useLocal('me', { name: '', org: '', email: '' });
