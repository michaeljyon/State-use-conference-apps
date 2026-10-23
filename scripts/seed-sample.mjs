// Fill the SAMPLE event with demo activity so the leaderboard, gallery and
// staff tools have something to show. Runs against `npm run dev`.
//
//   npm run dev            (in one terminal)
//   npm run seed-sample    (in another)
//
// Every name below is made up. Don't run this against a real event's deploy.
import fs from 'node:fs';
import event from '../event/event.js';
import { eventTime } from '../src/lib/time.js';

const BASE = process.argv[2] || 'http://localhost:5173';
const PASS = process.env.STAFF_PASSCODE || 'demo';
const during = eventTime(event.challenge.unlockAt, event.timezone) + 20 * 60e3;

async function post(path, body, extra = {}) {
  const r = await fetch(`${BASE}/api/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-preview-now': String(during), 'x-staff-passcode': PASS, ...extra },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${path}: ${j.error || r.status}`);
  return j;
}

// Sample players: [name, org, how many squares, pattern]
const players = [
  ['Casey Morgan', 'Riverbend Industries', [0, 1, 2, 3, 4, 5, 6, 7, 8]],
  ['Drew Patel', 'Sample State Agency', [0, 1, 2, 3, 4, 5, 6, 7, 8]],
  ['Lee Santos', 'Northfield Services', [0, 4, 8, 1, 7, 3]],
  ['Jesse Romero', 'Summit Works', [0, 1, 2, 4, 6]],
  ['Pat Okoye', 'Lakeview Enterprises', [2, 4, 6, 0]],
  ['Rowan Fisher', 'Hillside Partners', [3, 4, 5]],
  ['Quinn Baker', 'Open Door Digital', [1, 4, 7]],
  ['Skyler Hart', 'Sample Workforce Board', [0, 5]],
  ['Blair Chen', 'Riverbend Industries', [8]],
];

function entry(def, who) {
  if (def.type === 'code') return { done: true, value: { code: def.code } };
  if (def.type === 'photo') return { done: true, value: { photo: 'taken' } };
  return { done: true, value: Object.fromEntries((def.fields || ['Note']).map(f => [f, `Sample answer from ${who}`])) };
}

async function main() {
  await fetch(`${BASE}/api/health`).then(r => { if (!r.ok) throw new Error('Start `npm run dev` first.'); });
  for (const [name, org, idx] of players) {
    const squares = {};
    idx.forEach(i => { const def = event.challenge.squares[i]; squares[def.id] = entry(def, name.split(' ')[0]); });
    const r = await post('challenge', { player: { name, org, email: `${name.split(' ')[0].toLowerCase()}@example.org` }, squares });
    console.log(`card  ${name.padEnd(14)} ${r.tickets} tickets`);
  }

  // Sample photos (abstract placeholders labeled SAMPLE) from scripts/sample-photos/
  for (let i = 0; i < 6; i++) {
    const jpg = fs.readFileSync(new URL(`./sample-photos/sample-${i + 1}.jpg`, import.meta.url));
    const r = await post('photos', { image: `data:image/jpeg;base64,${jpg.toString('base64')}`, name: players[i][0], org: players[i][1], caption: `Sample photo ${i + 1}`, release: true, source: i % 2 ? 'challenge' : 'gallery' });
    if (i < 5) await post(`staff/photos/${r.id}`, { status: 'approved' });
    console.log(`photo ${i + 1} ${i < 5 ? 'approved' : 'left waiting for approval'}`);
  }

  const s = event.sessions.find(x => x.survey);
  await post('feedback', { surveyId: 'session', sessionId: s.id, sessionTitle: s.title, answers: { overall: 5, use: 'Already planning to', most_useful: 'Sample answer' } });
  await post('feedback', { surveyId: 'conference', answers: { overall: 4, recommend: 9, improve: 'Sample answer' } });
  console.log('feedback 2 sample responses');

  await post('staff/broadcasts', { title: 'Sample announcement: lunch is served', body: 'Buffet lunch is open in the Grand Ballroom.', link: '#/venue?room=ballroom' });
  console.log('announcement sent');
  console.log('\nDone. Staff passcode for local dev is "demo".');
}
main().catch(e => { console.error(e.message); process.exit(1); });
