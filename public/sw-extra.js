// Added to the generated service worker: open the app (at the right screen)
// when someone taps a conference notification.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const link = (e.notification.data && e.notification.data.link) || '#/';
  const url = new URL('/' + (link.startsWith('#') ? link : '#/' + link), self.location.origin).href;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) { if ('focus' in w) { await w.focus(); w.navigate ? w.navigate(url) : null; return; } }
    return self.clients.openWindow(url);
  })());
});
