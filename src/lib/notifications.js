import { useEffect, useMemo, useState } from 'react';
import { event, now, at, t } from './config.js';
import { api, useApiMode } from './api.js';
import { useLocal, readLocal, writeLocal } from './store.js';

// Two sources: scheduled notifications in event.js (appear at their time) and
// live announcements staff send from the staff screen (needs the functions).

let cachedBroadcasts = readLocal('broadcasts', []);

export function useNotifications() {
  const mode = useApiMode();
  const [tick, setTick] = useState(0);
  const [broadcasts, setBroadcasts] = useState(cachedBroadcasts);
  const [readIds, setReadIds] = useLocal('notif-read', []);
  const [dismissed, setDismissed] = useLocal('notif-dismissed', []);

  useEffect(() => { const id = setInterval(() => setTick(x => x + 1), 30000); return () => clearInterval(id); }, []);

  useEffect(() => {
    if (mode !== 'live') return;
    let stop = false;
    const load = () => api('broadcasts').then(d => {
      if (stop) return;
      cachedBroadcasts = d.broadcasts || []; writeLocal('broadcasts', cachedBroadcasts); setBroadcasts(cachedBroadcasts);
    }).catch(() => {});
    load();
    const id = setInterval(() => document.visibilityState === 'visible' && load(), 60000);
    return () => { stop = true; clearInterval(id); };
  }, [mode]);

  const items = useMemo(() => {
    const n = now();
    const scheduled = (event.notifications || [])
      .map(x => ({ ...x, time: at(x.at), title: t(x.title), body: t(x.body) }))
      .filter(x => x.time <= n);
    const live = broadcasts.map(b => ({ ...b, time: Date.parse(b.at), live: true }));
    return [...scheduled, ...live].sort((a, b) => b.time - a.time);
  }, [broadcasts, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const unread = items.filter(x => !readIds.includes(x.id));
  const banner = unread.find(x => x.banner && !dismissed.includes(x.id) && now() - x.time < 3 * 3600e3);

  // Phone notification for anything new, when the attendee turned alerts on.
  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const shown = readLocal('notif-shown', []);
    const fresh = unread.filter(x => !shown.includes(x.id) && now() - x.time < 2 * 3600e3);
    if (!fresh.length) return;
    writeLocal('notif-shown', [...shown, ...fresh.map(x => x.id)]);
    navigator.serviceWorker?.ready.then(reg => fresh.slice(0, 3).forEach(x =>
      reg.showNotification(x.title, { body: x.body, tag: x.id, icon: document.querySelector('link[rel=icon]')?.href, data: { link: x.link } }),
    )).catch(() => {});
  }, [unread.map(x => x.id).join()]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    items, unread, banner,
    markRead: ids => setReadIds(prev => [...new Set([...prev, ...ids])]),
    markAllRead: () => setReadIds(items.map(x => x.id)),
    dismiss: id => { setDismissed(prev => [...prev, id]); setReadIds(prev => [...new Set([...prev, id])]); },
  };
}

export async function enableAlerts() {
  if (typeof Notification === 'undefined') return 'unsupported';
  const p = await Notification.requestPermission();
  if (p === 'granted') {
    // Don't replay everything already in the bell.
    const n = now();
    const due = (event.notifications || []).filter(x => at(x.at) <= n).map(x => x.id);
    writeLocal('notif-shown', [...new Set([...readLocal('notif-shown', []), ...due, ...readLocal('broadcasts', []).map(b => b.id)])]);
  }
  return p;
}
