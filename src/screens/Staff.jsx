import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { PageHead, Section, Empty } from '../components/ui.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import { AppQR } from './Info.jsx';
import { event, t } from '../lib/config.js';
import { api, useApiMode } from '../lib/api.js';

// Staff screen (#/staff): prize drawing, photo approval, live announcements
// and data exports. The passcode is checked by the server (STAFF_PASSCODE).

const TABS = [['draw', 'Drawing', 'gift'], ['photos', 'Photos', 'image'], ['announce', 'Announce', 'bell'], ['data', 'Data', 'download']];

export default function Staff() {
  const mode = useApiMode();
  const [code, setCode] = useState(() => sessionStorage.getItem('staff-pass') || '');
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('draw');

  async function login(c = code) {
    setErr('');
    try { await api('staff/check', { method: 'POST', body: {}, staff: c }); sessionStorage.setItem('staff-pass', c); setOk(true); }
    catch (e) { setOk(false); setErr(e.message); }
  }
  useEffect(() => { if (code && mode === 'live') login(code); }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (mode === 'local') return (
    <div className="content"><PageHead backTo="info" title="Staff tools" />
      <Empty icon="lock" title="Staff tools need the Netlify functions">Deploy from Git or with the Netlify CLI (see SETUP.md) so the drawing, photo approval and announcements can run.</Empty>
    </div>
  );

  if (!ok) return (
    <div className="content"><PageHead backTo="info" title="Staff tools" sub="For the conference team. Enter the staff passcode." />
      <form className="staff-login" onSubmit={e => { e.preventDefault(); login(); }}>
        <label className="field"><span>Staff passcode</span><input type="password" value={code} onChange={e => setCode(e.target.value)} autoComplete="current-password" /></label>
        {err && <p className="form-msg" role="alert">{err}</p>}
        <button className="btn">Open staff tools</button>
      </form>
    </div>
  );

  return (
    <div className="content staff">
      <PageHead backTo="info" title="Staff tools" sub={event.name} />
      <div className="seg" role="tablist">
        {TABS.map(([id, label, icon]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}><Icon name={icon} size={16} />{label}</button>)}
      </div>
      {tab === 'draw' && <Drawing pass={code} />}
      {tab === 'photos' && <PhotoQueue pass={code} />}
      {tab === 'announce' && <Announce pass={code} />}
      {tab === 'data' && <Data pass={code} />}
    </div>
  );
}

function Drawing({ pass }) {
  const [stats, setStats] = useState(null);
  const [board, setBoard] = useState(null);
  const [rolling, setRolling] = useState('');
  const [winner, setWinner] = useState(null);
  const [msg, setMsg] = useState('');
  const timer = useRef(null);
  const load = () => { api('staff/stats', { staff: pass }).then(setStats); api('leaderboard').then(setBoard); };
  useEffect(() => { load(); }, [pass]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearInterval(timer.current), []);

  async function draw() {
    setMsg(''); setWinner(null);
    const names = (board?.rows || []).map(r => r.name);
    if (!names.length) { setMsg('No cards have been turned in yet.'); return; }
    let i = 0;
    timer.current = setInterval(() => setRolling(names[i++ % names.length]), 70);
    try {
      const [r] = await Promise.all([api('staff/draw', { method: 'POST', body: {}, staff: pass }), new Promise(res => setTimeout(res, 2600))]);
      setWinner({ ...r.winner, pool: r.pool, poolTickets: r.poolTickets });
    } catch (e) { setMsg(e.message); }
    clearInterval(timer.current); setRolling(''); load();
  }
  const act = async (path, body, confirmText) => {
    if (confirmText && !confirm(confirmText)) return;
    try { await api(path, { method: path.startsWith('staff/winners') ? 'DELETE' : 'POST', body, staff: pass }); setWinner(null); load(); } catch (e) { setMsg(e.message); }
  };

  return (
    <>
      <Section title={`Draw the ${event.challenge.prize} winner`}>
        <p className="small muted">Each ticket is one chance, so more tickets means better odds. Each person's latest card counts once. Past winners are left out of the next draw.</p>
        {stats?.testMode && <p className="test-banner"><b>Test mode is on.</b> Cards turned in now are test cards. Turn it off before the real Challenge.</p>}
        <div className="draw-stage" aria-live="polite">
          {rolling ? <span className="draw-rolling">{rolling}</span>
            : winner ? <span className="draw-winner"><Icon name="trophy" size={34} /><b>{winner.name}</b><span>{winner.org}</span><span className="small">{winner.tickets} tickets · drawn from {winner.pool} players ({winner.poolTickets} tickets){winner.email ? ` · ${winner.email}` : ''}</span></span>
            : <span className="muted">{board ? `${board.players} players · ${board.tickets} tickets in the drawing` : 'Loading…'}</span>}
        </div>
        <div className="btn-row">
          <button className="btn accent big" onClick={draw} disabled={!!rolling}><Icon name="gift" size={20} />{stats?.winners?.some(w => !!w.test === !!stats.testMode) ? 'Draw again' : 'Draw'}</button>
        </div>
        {msg && <p className="form-msg" role="alert">{msg}</p>}
        {stats?.winners?.filter(w => !!w.test === !!stats.testMode).length > 0 && (
          <>
            <h3 className="sub-h">Drawn so far</h3>
            <ol className="plain-list">{stats.winners.filter(w => !!w.test === !!stats.testMode).map(w => <li key={w.at}><b>{w.name}</b><span className="small muted">{w.org} · {w.tickets} tickets · {new Date(w.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></li>)}</ol>
            <button className="link-btn" onClick={() => act('staff/winners', undefined, 'Clear the winners list? The leaderboard stops showing a winner.')}>Clear winners</button>
          </>
        )}
      </Section>
      <Section title="Test mode">
        <p className="small">Test mode opens the card and leaderboard right away so you can rehearse. Test cards are kept apart from real ones.</p>
        <div className="btn-row">
          <button className="btn secondary" onClick={() => act('staff/testmode', { on: !stats?.testMode })}>{stats?.testMode ? 'Turn test mode off' : 'Turn test mode on'}</button>
          <button className="btn secondary" onClick={() => act('staff/reset', { scope: 'test' }, 'Delete all test cards and test winners?')}>Clear test cards</button>
        </div>
      </Section>
      <Section><Leaderboard top={50} /></Section>
    </>
  );
}

function PhotoQueue({ pass }) {
  const [photos, setPhotos] = useState(null);
  const [filter, setFilter] = useState('pending');
  const load = () => api('staff/photos', { staff: pass }).then(d => setPhotos(d.photos));
  useEffect(() => { load(); }, [pass]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = async (id, status) => {
    if (status === 'deleted' && !confirm('Delete this photo permanently?')) return;
    await api(`staff/photos/${id}`, { method: 'POST', body: { status }, staff: pass }); load();
  };
  const list = (photos || []).filter(p => filter === 'all' || p.status === filter);
  const count = s => (photos || []).filter(p => p.status === s).length;
  return (
    <Section title="Photo approval">
      <p className="small muted">{event.photos.requireApproval ? 'New photos wait here until you approve them for the gallery.' : 'Photos go straight to the gallery. Hide any that shouldn\'t be there.'}</p>
      <div className="chip-row">
        {[['pending', `Waiting (${count('pending')})`], ['approved', `In gallery (${count('approved')})`], ['hidden', `Hidden (${count('hidden')})`], ['all', 'All']].map(([id, l]) => <button key={id} className={`chip ${filter === id ? 'on' : ''}`} onClick={() => setFilter(id)}>{l}</button>)}
      </div>
      {photos === null ? <p className="muted">Loading…</p> : list.length === 0 ? <Empty icon="image" title="Nothing here" /> : (
        <ul className="staff-photos">
          {list.map(p => (
            <li key={p.id}>
              <a href={`/api/staff/photos/${p.id}/file?k=${encodeURIComponent(pass)}`} target="_blank" rel="noopener noreferrer"><img src={`/api/staff/photos/${p.id}/file?k=${encodeURIComponent(pass)}`} alt="" loading="lazy" /></a>
              <div className="small"><b>{p.name}</b>{p.org && ` · ${p.org}`}<br />{p.caption && <span>{p.caption}<br /></span>}<span className="muted">{p.source === 'challenge' ? 'Challenge photo' : 'Gallery'} · {new Date(p.at).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span></div>
              <div className="btn-row">
                {p.status !== 'approved' && <button className="btn small" onClick={() => set(p.id, 'approved')}>Approve</button>}
                {p.status !== 'hidden' && <button className="btn small secondary" onClick={() => set(p.id, 'hidden')}>Hide</button>}
                <button className="link-btn small" onClick={() => set(p.id, 'deleted')}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Announce({ pass }) {
  const [list, setList] = useState([]);
  const [f, setF] = useState({ title: '', body: '', link: '', banner: false });
  const [msg, setMsg] = useState('');
  const load = () => api('broadcasts').then(d => setList(d.broadcasts || []));
  useEffect(() => { load(); }, []);
  async function send(e) {
    e.preventDefault(); setMsg('');
    try { await api('staff/broadcasts', { method: 'POST', body: f, staff: pass }); setF({ title: '', body: '', link: '', banner: false }); setMsg('Sent. Phones pick it up within a minute.'); load(); }
    catch (err) { setMsg(err.message); }
  }
  const del = async id => { await api(`staff/broadcasts/${id}`, { method: 'DELETE', staff: pass }); load(); };
  return (
    <>
      <Section title="Send an announcement">
        <form onSubmit={send} className="stack">
          <label className="field"><span>Title</span><input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} maxLength={120} required placeholder="Room change for Thursday" /></label>
          <label className="field"><span>Message</span><textarea rows={3} value={f.body} onChange={e => setF({ ...f, body: e.target.value })} maxLength={600} /></label>
          <label className="field"><span>Open this screen when tapped (optional)</span>
            <select value={f.link} onChange={e => setF({ ...f, link: e.target.value })}>
              <option value="">Nothing</option><option value="#/agenda">Agenda</option><option value="#/venue">Venue & map</option><option value="#/challenge">Challenge</option><option value="#/photos">Photos</option><option value="#/feedback">Feedback</option>
              {event.sessions.map(s => <option key={s.id} value={`#/session/${s.id}`}>Session: {t(s.title)}</option>)}
            </select>
          </label>
          <label className="check"><input type="checkbox" checked={f.banner} onChange={e => setF({ ...f, banner: e.target.checked })} /> Also show as a banner at the top of the app</label>
          <button className="btn"><Icon name="bell" size={18} />Send to everyone</button>
          {msg && <p className="small" role="status">{msg}</p>}
        </form>
      </Section>
      <Section title="Sent">
        {list.length === 0 ? <p className="muted">No announcements yet. Scheduled notifications from event.js appear automatically at their times.</p> : (
          <ul className="plain-list">{[...list].reverse().map(b => <li key={b.id}><b>{b.title}</b><span className="small muted">{new Date(b.at).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}{b.body ? ` · ${b.body}` : ''}</span><button className="link-btn small" onClick={() => del(b.id)}>Delete</button></li>)}</ul>
        )}
      </Section>
    </>
  );
}

function Data({ pass }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { api('staff/stats', { staff: pass }).then(setStats); }, [pass]);
  const dl = kind => `/api/staff/export/${kind}?k=${encodeURIComponent(pass)}`;
  return (
    <>
      <Section title="Download">
        <ul className="doc-list">
          <li><a className="doc-link" href={dl('feedback')}><Icon name="download" /><span className="doc-title">Survey answers (CSV)</span><span className="doc-kind">{stats ? `${stats.feedback} responses` : ''}</span></a></li>
          <li><a className="doc-link" href={dl('cards')}><Icon name="download" /><span className="doc-title">Challenge cards (CSV)</span><span className="doc-kind">{stats ? `${stats.cards} cards` : ''}</span></a></li>
          <li><a className="doc-link" href={dl('photos')}><Icon name="download" /><span className="doc-title">Photo list (CSV)</span><span className="doc-kind">{stats ? `${stats.photos} photos` : ''}</span></a></li>
        </ul>
      </Section>
      <Section title="App QR code for signage">
        <div className="install-card"><AppQR size={200} /><p className="small">Print this on table tents and slides so attendees can open the app.</p></div>
      </Section>
    </>
  );
}
