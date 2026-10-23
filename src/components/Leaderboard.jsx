import { useEffect, useState } from 'react';
import { api, useApiMode } from '../lib/api.js';
import { event, now, at } from '../lib/config.js';
import { fmtEventDateTime } from '../lib/time.js';

const POLL_MS = 15000;
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

export function useLeaderboard(enabled = true) {
  const mode = useApiMode();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    if (!enabled || mode !== 'live') return;
    let stop = false;
    const load = () => api('leaderboard').then(d => { if (!stop) { setData(d); setError(false); } }).catch(() => !stop && setError(true));
    load();
    const id = setInterval(() => document.visibilityState === 'visible' && load(), POLL_MS);
    const vis = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', vis);
    addEventListener('lb-refresh', load);
    return () => { stop = true; clearInterval(id); document.removeEventListener('visibilitychange', vis); removeEventListener('lb-refresh', load); };
  }, [enabled, mode, nonce]);
  return { mode, data, error, refresh: () => setNonce(n => n + 1) };
}

// Ask every leaderboard on screen to reload now (e.g. right after a turn-in).
export function refreshLeaderboards() {
  [400, 3000].forEach(ms => setTimeout(() => dispatchEvent(new Event('lb-refresh')), ms));
}

export default function Leaderboard({ compact = false, myId, top = 10 }) {
  const { mode, data, error } = useLeaderboard();
  const ch = event.challenge;
  if (mode === 'local') return <p className="lb-empty">The live leaderboard needs the conference server. Your card is saved on your phone.</p>;
  const rows = data?.rows || [];
  const me = myId && rows.find(r => r.id === myId);
  const opens = ch.leaderboardOpensAt || ch.unlockAt;

  let body;
  if (!data && error) body = <p className="lb-empty">The leaderboard can't load right now. Your card is still saved on your phone.</p>;
  else if (!data) body = <p className="lb-empty">Loading…</p>;
  else if (data.locked || (!data.testMode && now() < at(opens))) body = <p className="lb-empty">The leaderboard opens {fmtEventDateTime(opens)}.</p>;
  else if (!rows.length) body = <p className="lb-empty">No cards turned in yet. Fill a square and tap <b>Turn in my card</b> to be first on the board.</p>;
  else body = (
    <ol className="lb-list">
      {rows.slice(0, compact ? 3 : top).map(r => (
        <li key={r.id} className={`${r.id === myId ? 'is-me' : ''} ${r.rank <= 3 ? `top top-${r.rank}` : ''}`}>
          <span className="lb-rank" aria-label={`Rank ${r.rank}`}>{r.rank}</span>
          <span className="lb-who"><b>{r.name}{r.id === myId && <span className="you-tag">You</span>}</b>{r.org && <span>{r.org}</span>}</span>
          <span className="lb-tix"><b>{r.tickets}</b> {r.tickets === 1 ? 'ticket' : 'tickets'}</span>
        </li>
      ))}
    </ol>
  );

  return (
    <div className={`lb ${compact ? 'compact' : ''}`}>
      <div className="lb-head">
        {!compact && <h3>Live leaderboard</h3>}
        <span className={`lb-badge ${error ? 'off' : ''}`}><span className="live-dot" aria-hidden="true" />{error ? 'Offline' : 'Live'}</span>
        {data && <span className="lb-meta" aria-live="polite">{plural(data.players, 'player')} · {plural(data.tickets, 'ticket')}{data.testMode && <span className="test-tag">Test</span>}</span>}
      </div>
      {data?.winner && (
        <p className="lb-winner"><span>{data.winner.test ? 'Test drawing winner' : `${ch.prize[0].toUpperCase()}${ch.prize.slice(1)} winner`}</span><b>{data.winner.name}</b>{data.winner.org}</p>
      )}
      {body}
      {me && me.rank > (compact ? 3 : top) && <p className="lb-me">You're #{me.rank} with {plural(me.tickets, 'ticket')}.</p>}
      {compact ? <a className="link-btn" href="#/challenge">Open the Challenge</a>
        : <p className="lb-note small muted">Shows first name and last initial. Your score updates each time you tap Turn in or Update my card. More tickets means better odds in the drawing.</p>}
    </div>
  );
}
