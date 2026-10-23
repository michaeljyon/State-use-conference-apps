import { useEffect, useState } from 'react';

// Tiny hash router: #/agenda, #/session/s4, #/venue?room=birch
function parse() {
  const raw = location.hash.replace(/^#\/?/, '') || 'home';
  const [path, qs = ''] = raw.split('?');
  const [name, ...args] = path.split('/').filter(Boolean);
  return { name: name || 'home', args, query: Object.fromEntries(new URLSearchParams(qs)) };
}

export function useRoute() {
  const [r, setR] = useState(parse);
  useEffect(() => {
    const on = () => { setR(parse()); window.scrollTo(0, 0); };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return r;
}

export const go = to => { location.hash = to.startsWith('#') ? to : `#/${to}`; };
export const back = fallback => (history.length > 1 ? history.back() : go(fallback || 'home'));
