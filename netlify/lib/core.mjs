// Conference API: Challenge cards + live leaderboard + prize drawing, photo
// gallery, survey answers and live announcements.
//
// Storage-agnostic: `store` is a Netlify Blobs store in production
// (netlify/functions/api.mjs) and a local folder store in `npm run dev`
// (dev/api-plugin.js). Both expose the same small API.

import event from '../../event/event.js';
import { scoreCard, displayName, normCode } from '../../src/lib/scoring.js';
import { eventTime } from '../../src/lib/time.js';

const TZ = event.timezone;
const CH = event.challenge || { squares: [] };
const GRACE_MS = 5 * 60 * 1000;
const MAX_PHOTO_BYTES = 4.2 * 1024 * 1024;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
const err = (message, status = 400) => json({ error: message }, status);
const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

async function sha16(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}
// Same person = same email, or same name when no email is given.
export function playerKey(p = {}) {
  const e = String(p.email || '').trim().toLowerCase();
  return e || String(p.name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}
const clean = (s, n = 200) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

async function getState(store) {
  return (await store.get('state', { type: 'json' })) || { testMode: false, winners: [] };
}
async function listJSON(store, prefix) {
  const { blobs } = await store.list({ prefix });
  const out = await Promise.all(blobs.map(b => store.get(b.key, { type: 'json' })));
  return out.filter(Boolean);
}

async function leaderboard(store, now) {
  const state = await getState(store);
  const opens = eventTime(CH.leaderboardOpensAt || CH.unlockAt, TZ);
  const locked = !state.testMode && now < opens;
  const cards = (await listJSON(store, 'cards/')).filter(c => Boolean(c.test) === Boolean(state.testMode) && c.tickets > 0);
  cards.sort((a, b) => b.tickets - a.tickets || a.firstAt - b.firstAt);
  let rank = 0, prev = null;
  const rows = cards.map((c, i) => {
    if (c.tickets !== prev) { rank = i + 1; prev = c.tickets; }
    return { rank, id: c.id, name: displayName(c.name), org: c.org, tickets: c.tickets, squares: c.squaresDone, lines: c.lines, blackout: c.blackout };
  });
  const winners = (state.winners || []).filter(w => Boolean(w.test) === Boolean(state.testMode));
  const w = winners[winners.length - 1];
  return {
    updated: new Date().toISOString(), testMode: !!state.testMode, locked,
    players: rows.length, tickets: rows.reduce((n, r) => n + r.tickets, 0),
    rows: locked ? [] : rows,
    winner: w ? { name: w.name, org: w.org, tickets: w.tickets, at: w.at, test: !!w.test, round: winners.length } : null,
  };
}

async function turnIn(store, body, now) {
  const state = await getState(store);
  const unlock = eventTime(CH.unlockAt, TZ), close = eventTime(CH.closeAt, TZ);
  if (!state.testMode) {
    if (now < unlock) return err('The Challenge hasn’t started yet.', 403);
    if (now > close + GRACE_MS) return err('The Challenge has closed.', 403);
  }
  const p = body.player || {};
  const name = clean(p.name, 80);
  if (!name) return err('Add your name to turn in your card.');
  const squares = {};
  for (const def of CH.squares) {
    const e = (body.squares || {})[def.id];
    if (!e) continue;
    const value = {};
    for (const [k, v] of Object.entries(e.value || {})) value[clean(k, 60)] = clean(v, 500);
    squares[def.id] = { done: !!e.done, value, photo: e.photo ? clean(e.photo, 60) : undefined };
  }
  const score = scoreCard(CH, squares);
  if (!score.squaresDone) return err('Complete at least one square to turn in your card.');
  const id = await sha16(playerKey({ name, email: p.email }));
  const key = `cards/${id}`;
  const prev = await store.get(key, { type: 'json' });
  const card = {
    id, name, org: clean(p.org, 120), email: clean(p.email, 160).toLowerCase(),
    squares, tickets: score.tickets, squaresDone: score.squaresDone, lines: score.lines, blackout: score.blackout,
    test: !!state.testMode, firstAt: prev?.test === !!state.testMode && prev?.firstAt ? prev.firstAt : now, at: now,
  };
  await store.setJSON(key, card);
  return json({ ok: true, id, tickets: card.tickets, squares: card.squaresDone, lines: card.lines, blackout: card.blackout });
}

async function addPhoto(store, body, now) {
  if (!event.photos?.enabled) return err('Photo sharing is off.', 403);
  if (!body.release) return err('Agree to the photo release to share photos.');
  const name = clean(body.name, 80);
  if (!name) return err('Add your name so we know whose photo it is.');
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(String(body.image || ''));
  if (!m) return err('That file isn’t a photo.');
  const bytes = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0));
  if (bytes.byteLength > MAX_PHOTO_BYTES) return err('That photo is too large.');
  const id = rid();
  const meta = {
    id, name, display: displayName(name), org: clean(body.org, 120), caption: clean(body.caption, 280),
    source: body.source === 'challenge' ? 'challenge' : 'gallery', square: clean(body.square, 40) || undefined,
    status: event.photos.requireApproval ? 'pending' : 'approved', type: m[1], size: bytes.byteLength, at: now,
  };
  await store.set(`photos/img/${id}`, bytes, { metadata: { type: m[1] } });
  await store.setJSON(`photos/meta/${id}`, meta);
  return json({ ok: true, id, status: meta.status });
}

async function photoList(store, all = false) {
  const metas = await listJSON(store, 'photos/meta/');
  metas.sort((a, b) => b.at - a.at);
  return all ? metas : metas.filter(p => p.status === 'approved')
    .map(({ id, display, caption, at, source }) => ({ id, name: display, caption, at, source }));
}

async function photoFile(store, id, staff) {
  const meta = await store.get(`photos/meta/${id}`, { type: 'json' });
  if (!meta || (meta.status !== 'approved' && !staff)) return new Response('Not found', { status: 404 });
  const res = await store.getWithMetadata(`photos/img/${id}`, { type: 'arrayBuffer' });
  if (!res) return new Response('Not found', { status: 404 });
  return new Response(res.data, { headers: { 'content-type': res.metadata?.type || meta.type || 'image/jpeg', 'cache-control': staff ? 'no-store' : 'public, max-age=300' } });
}

async function addFeedback(store, body, now) {
  const surveyId = clean(body.surveyId, 40);
  if (!event.surveys?.[surveyId]) return err('Unknown survey.');
  const answers = {};
  for (const [k, v] of Object.entries(body.answers || {})) {
    answers[clean(k, 80)] = Array.isArray(v) ? v.map(x => clean(x, 200)) : (typeof v === 'object' && v ? Object.fromEntries(Object.entries(v).map(([a, b]) => [clean(a, 60), clean(b, 120)])) : clean(v, 4000));
  }
  if (!Object.keys(answers).length) return err('Answer at least one question to send.');
  const rec = {
    id: rid(), surveyId, sessionId: clean(body.sessionId, 40) || undefined, sessionTitle: clean(body.sessionTitle, 200) || undefined,
    answers, contact: { name: clean(body.contact?.name, 80), email: clean(body.contact?.email, 160), followUp: !!body.contact?.followUp },
    at: now, clientId: clean(body.clientId, 60),
  };
  await store.setJSON(`feedback/${surveyId}/${rec.id}`, rec);
  return json({ ok: true });
}

// ------------------------------------------------------------- CSV export
function toCSV(rows) {
  const cols = [...rows.reduce((s, r) => { Object.keys(r).forEach(k => s.add(k)); return s; }, new Set())];
  const esc = v => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n');
}
function flatten(prefix, v, out) {
  if (Array.isArray(v)) out[prefix] = v.join('; ');
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) flatten(`${prefix}.${k}`, x, out);
  else out[prefix] = v;
  return out;
}
async function exportCSV(store, kind) {
  let rows = [];
  if (kind === 'cards') {
    const cards = await listJSON(store, 'cards/');
    rows = cards.sort((a, b) => b.tickets - a.tickets).map(c => {
      const r = { name: c.name, org: c.org, email: c.email, tickets: c.tickets, squares: c.squaresDone, lines: c.lines, blackout: c.blackout, test: c.test, turned_in: new Date(c.at).toISOString() };
      for (const def of CH.squares) { const e = c.squares[def.id]; r[`sq.${def.id}`] = e?.done ? Object.values(e.value || {}).join(' | ') || 'done' : ''; }
      return r;
    });
  } else if (kind === 'feedback') {
    const all = await listJSON(store, 'feedback/');
    rows = all.sort((a, b) => a.at - b.at).map(f => flatten('a', f.answers, {
      survey: f.surveyId, session: f.sessionTitle || '', submitted: new Date(f.at).toISOString(),
      name: f.contact?.name || '', email: f.contact?.email || '', follow_up: f.contact?.followUp ? 'yes' : '',
    }));
  } else if (kind === 'photos') {
    rows = (await photoList(store, true)).map(p => ({ id: p.id, name: p.name, org: p.org, caption: p.caption, source: p.source, status: p.status, submitted: new Date(p.at).toISOString(), file: `/api/staff/photos/${p.id}/file` }));
  } else return err('Unknown export.');
  return new Response(toCSV(rows), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${event.id}-${kind}.csv"` } });
}

function pickWeighted(cards) {
  const total = cards.reduce((n, c) => n + c.tickets, 0);
  const r = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32 * total;
  let acc = 0;
  for (const c of cards) { acc += c.tickets; if (r < acc) return c; }
  return cards[cards.length - 1];
}

async function staff(store, req, parts, body, now) {
  const [what, id, sub] = parts;
  const state = await getState(store);
  if (what === 'check') return json({ ok: true, testMode: !!state.testMode });
  if (what === 'photos' && req.method === 'GET' && id && sub === 'file') return photoFile(store, id, true);
  if (what === 'photos' && req.method === 'GET') return json({ photos: await photoList(store, true) });
  if (what === 'photos' && req.method === 'POST' && id) {
    const meta = await store.get(`photos/meta/${id}`, { type: 'json' });
    if (!meta) return err('Not found', 404);
    if (body.status === 'deleted') { await store.delete(`photos/meta/${id}`); await store.delete(`photos/img/${id}`); return json({ ok: true }); }
    if (!['approved', 'hidden', 'pending'].includes(body.status)) return err('Bad status');
    meta.status = body.status; await store.setJSON(`photos/meta/${id}`, meta);
    return json({ ok: true, photo: meta });
  }
  if (what === 'draw' && req.method === 'POST') {
    const already = new Set((state.winners || []).filter(w => Boolean(w.test) === Boolean(state.testMode)).map(w => w.id));
    const pool = (await listJSON(store, 'cards/')).filter(c => Boolean(c.test) === Boolean(state.testMode) && c.tickets > 0 && !already.has(c.id));
    if (!pool.length) return err('No eligible cards to draw from.');
    const c = pickWeighted(pool);
    const w = { id: c.id, name: c.name, org: c.org, email: c.email, tickets: c.tickets, at: new Date(now).toISOString(), test: !!state.testMode };
    state.winners = [...(state.winners || []), w];
    await store.setJSON('state', state);
    return json({ ok: true, winner: w, pool: pool.length, poolTickets: pool.reduce((n, x) => n + x.tickets, 0) });
  }
  if (what === 'winners' && req.method === 'DELETE') {
    state.winners = (state.winners || []).filter(w => Boolean(w.test) !== Boolean(state.testMode));
    await store.setJSON('state', state); return json({ ok: true });
  }
  if (what === 'testmode' && req.method === 'POST') {
    state.testMode = !!body.on; await store.setJSON('state', state); return json({ ok: true, testMode: state.testMode });
  }
  if (what === 'reset' && req.method === 'POST') {
    // 'test' clears test cards + test winners; 'cards' clears every card and winner.
    const cards = await store.list({ prefix: 'cards/' });
    for (const b of cards.blobs) {
      if (body.scope === 'cards') { await store.delete(b.key); continue; }
      const c = await store.get(b.key, { type: 'json' }); if (c?.test) await store.delete(b.key);
    }
    state.winners = body.scope === 'cards' ? [] : (state.winners || []).filter(w => !w.test);
    await store.setJSON('state', state); return json({ ok: true });
  }
  if (what === 'broadcasts' && req.method === 'POST') {
    const title = clean(body.title, 120); if (!title) return err('Add a title.');
    const list = (await store.get('broadcasts', { type: 'json' })) || [];
    const b = { id: `b-${rid()}`, at: new Date(now).toISOString(), title, body: clean(body.body, 600), link: clean(body.link, 200) || undefined, banner: !!body.banner };
    await store.setJSON('broadcasts', [...list, b].slice(-100)); return json({ ok: true, broadcast: b });
  }
  if (what === 'broadcasts' && req.method === 'DELETE' && id) {
    const list = (await store.get('broadcasts', { type: 'json' })) || [];
    await store.setJSON('broadcasts', list.filter(b => b.id !== id)); return json({ ok: true });
  }
  if (what === 'export') return exportCSV(store, id);
  if (what === 'stats') {
    const [cards, photos, fb] = await Promise.all([store.list({ prefix: 'cards/' }), store.list({ prefix: 'photos/meta/' }), store.list({ prefix: 'feedback/' })]);
    return json({ cards: cards.blobs.length, photos: photos.blobs.length, feedback: fb.blobs.length, testMode: !!state.testMode, winners: state.winners || [] });
  }
  return err('Not found', 404);
}

// opts: { store, staffPasscode, allowTimeTravel }
export async function handle(req, opts) {
  const { store } = opts;
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/(?:api|\.netlify\/functions\/api)\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  let now = Date.now();
  const travel = req.headers.get('x-preview-now');
  if (opts.allowTimeTravel && travel && !Number.isNaN(+travel)) now = +travel;

  let body = {};
  if (req.method === 'POST') { try { body = await req.json(); } catch { return err('Bad request'); } }

  try {
    const [head, ...rest] = parts;
    if (head === 'health') return json({ ok: true, event: event.id });
    if (head === 'leaderboard' && req.method === 'GET') return json(await leaderboard(store, now));
    if (head === 'challenge' && req.method === 'POST') return turnIn(store, body, now);
    if (head === 'photos' && req.method === 'GET' && rest[0]) return photoFile(store, rest[0], false);
    if (head === 'photos' && req.method === 'GET') return json({ photos: await photoList(store) });
    if (head === 'photos' && req.method === 'POST') return addPhoto(store, body, now);
    if (head === 'feedback' && req.method === 'POST') return addFeedback(store, body, now);
    if (head === 'broadcasts' && req.method === 'GET') return json({ broadcasts: (await store.get('broadcasts', { type: 'json' })) || [] });
    if (head === 'staff') {
      if (!opts.staffPasscode) return err('Staff tools are off. Set STAFF_PASSCODE in Netlify → Site configuration → Environment variables.', 403);
      if (req.headers.get('x-staff-passcode') !== opts.staffPasscode && url.searchParams.get('k') !== opts.staffPasscode) return err('Wrong staff passcode.', 401);
      return staff(store, req, rest, body, now);
    }
    return err('Not found', 404);
  } catch (e) {
    console.error(e);
    return err('Something went wrong on the server.', 500);
  }
}

export { normCode };
