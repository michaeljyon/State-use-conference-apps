import event from '../../event/event.js';
import { BRANDS, getBrand } from '../brands/brands.js';
import { eventTime } from './time.js';

const params = new URLSearchParams(location.search);

// ---- brand: build-time preset, optionally previewed with ?brand=<id>
function resolveBrand() {
  let id = typeof __BRAND_ID__ !== 'undefined' ? __BRAND_ID__ : event.brand;
  if (event.preview?.allowBrandSwitch) {
    const q = params.get('brand');
    try {
      if (q && BRANDS[q]) sessionStorage.setItem('preview-brand', q);
      const saved = sessionStorage.getItem('preview-brand');
      if (saved && BRANDS[saved]) id = saved;
    } catch { /* storage blocked */ }
  }
  return getBrand(id);
}
export const brand = resolveBrand();
export { event };

export function setPreviewBrand(id) {
  try { sessionStorage.setItem('preview-brand', id); } catch { /* ignore */ }
  location.reload();
}

// ---- time: real clock, or ?now=2027-05-20T11:35 (event local) for previews
let offset = 0;
if (event.preview?.allowTimeTravel) {
  const q = params.get('now');
  try {
    if (q) sessionStorage.setItem('preview-now', JSON.stringify({ target: eventTime(q, event.timezone), at: Date.now() }));
    if (params.get('now') === 'real') sessionStorage.removeItem('preview-now');
    const saved = JSON.parse(sessionStorage.getItem('preview-now') || 'null');
    if (saved && !Number.isNaN(saved.target)) offset = saved.target - saved.at;
  } catch { /* ignore */ }
}
export const timeTravel = offset !== 0;
export const now = () => Date.now() + offset;
export const at = local => eventTime(local, event.timezone);

// ---- text tokens
export function t(s) {
  return String(s ?? '')
    .replaceAll('{orgFull}', brand.org)
    .replaceAll('{org}', brand.short)
    .replaceAll('{program}', brand.program)
    .replaceAll('{event}', event.shortName)
    .replaceAll('{website}', brand.website);
}

// ---- apply the brand to CSS
export function applyBrand() {
  const r = document.documentElement.style;
  const c = brand.colors;
  r.setProperty('--primary', c.primary);
  r.setProperty('--on-primary', c.onPrimary);
  r.setProperty('--accent', c.accent);
  r.setProperty('--on-accent', c.onAccent);
  r.setProperty('--ink', c.ink);
  if (brand.fontBody) r.setProperty('--font-body', `${brand.fontBody}, system-ui, sans-serif`);
  if (brand.fontHead) r.setProperty('--font-head', `${brand.fontHead}, system-ui, sans-serif`);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', c.primary);
  document.documentElement.dataset.brand = brand.id;
}

export const sessionsById = Object.fromEntries(event.sessions.map(s => [s.id, s]));
export const peopleById = Object.fromEntries(event.people.map(p => [p.id, p]));
export const roomsById = Object.fromEntries(
  (event.floorplan?.levels || []).flatMap(l => l.rooms.map(r => [r.id, { ...r, level: l }])),
);
export const trackById = Object.fromEntries((event.tracks || []).map(tr => [tr.id, tr]));
export const roomName = id => roomsById[id]?.name || id || '';
