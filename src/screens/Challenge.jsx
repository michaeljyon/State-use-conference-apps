import { useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { PageHead, Section, Sheet } from '../components/ui.jsx';
import Leaderboard, { refreshLeaderboards } from '../components/Leaderboard.jsx';
import { event, t, now, at, roomName } from '../lib/config.js';
import { useLocal, useMe } from '../lib/store.js';
import { api, queue, useApiMode } from '../lib/api.js';
import { scoreCard, squareDone, normCode } from '../lib/scoring.js';
import { fmtEventDateTime, clock } from '../lib/time.js';
import { uploadPhoto } from './Photos.jsx';
import { resizeImage } from '../lib/image.js';

const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

export default function Challenge() {
  const ch = event.challenge;
  const mode = useApiMode();
  const [me, setMe] = useMe();
  const [card, setCard] = useLocal('challenge', { squares: {}, turnedIn: null });
  const [open, setOpen] = useState(null);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);
  const n = now();
  const locked = n < at(ch.unlockAt);
  const closed = n > at(ch.closeAt);
  const score = scoreCard(ch, card.squares);
  const s = { square: 1, line: 2, blackout: 5, ...ch.scoring };
  const turned = card.turnedIn;
  const changed = turned && turned.tickets !== score.tickets;
  const chSession = event.sessions.find(x => x.type === 'challenge');

  if (!ch?.enabled) return <div className="content"><PageHead title="Challenge" backTo="" /><p>The Challenge isn't running at this event.</p></div>;

  async function turnIn() {
    setMsg(null);
    if (!me.name.trim()) { setMsg({ bad: true, text: 'Add your name above to turn in your card.' }); return; }
    if (!score.squaresDone) { setMsg({ bad: true, text: 'Complete at least one square to turn in your card.' }); return; }
    const squares = Object.fromEntries(Object.entries(card.squares).filter(([, e]) => e)
      .map(([k, e]) => [k, { done: e.done, value: e.value, photo: e.photo }]));
    const payload = { player: me, squares };
    setSending(true);
    try {
      if (mode !== 'live') throw Object.assign(new Error('Turning in needs the conference server (Netlify functions). Your card is saved on this phone.'), { status: 409 });
      const r = await api('challenge', { method: 'POST', body: payload });
      setCard(c => ({ ...c, turnedIn: { tickets: r.tickets, id: r.id, at: Date.now() } }));
      setMsg({ good: true, text: `Card turned in with ${plural(r.tickets, 'ticket')}. You're in the drawing!` });
      refreshLeaderboards();
    } catch (e) {
      if (e.status && e.status < 500) setMsg({ bad: true, text: e.message });
      else {
        queue('challenge', payload);
        setCard(c => ({ ...c, turnedIn: { tickets: score.tickets, pending: true, at: Date.now() } }));
        setMsg({ text: 'Saved on your phone. It will send when you\'re back online.' });
      }
    } finally { setSending(false); }
  }

  const Hero = (
    <section className="ch-hero">
      <p className="ch-eyebrow">{ch.when}</p>
      <h1>{ch.name}</h1>
      <p>A networking game played right here in the app. Every square you finish earns a ticket for the {ch.prize} drawing.</p>
      <p className="ch-facts"><span><Icon name="clock" size={16} />{fmtEventDateTime(ch.unlockAt).split(' at ')[0]}, {clock(chSession?.start || ch.unlockAt.split('T')[1])}–{clock(chSession?.end || ch.closeAt.split('T')[1])}</span>{ch.room && <span><Icon name="pin" size={16} />{roomName(ch.room)}</span>}</p>
    </section>
  );

  const How = (
    <div className="ch-how">
      <p><b>How to play:</b> tap a square, do the task in person, and fill it in. Every square is {plural(s.square, 'ticket')}, every full row, column or diagonal adds {s.line}, and the whole card adds a {s.blackout}-ticket bonus.</p>
    </div>
  );

  if (locked) return (
    <div className="content ch-content">
      <PageHead backTo="" title="" />
      {Hero}
      <div className="ch-locked">
        <Icon name="lock" size={28} />
        <p className="ch-locked-title">Your card unlocks {fmtEventDateTime(ch.unlockAt)}.</p>
        <p>The squares are a surprise until then. Come back to this page when the Challenge starts, fill in squares to earn tickets, and turn in your card before {clock(ch.closeAt.split('T')[1])}.</p>
      </div>
      {How}
      <Rules />
    </div>
  );

  return (
    <div className="content ch-content">
      <PageHead backTo="" title="" />
      {Hero}
      <div className="ch-mini"><Leaderboard compact myId={turned?.id} /></div>
      {How}

      {closed && <div className="ch-closed"><Icon name="trophy" size={22} /><p><b>The Challenge has closed.</b> Thanks for playing! The winner is announced at the drawing and shown on the leaderboard below.</p></div>}

      <Section title="Your card">
        <div className="ch-player two-col">
          <label className="field"><span>Your name</span><input value={me.name} onChange={e => setMe({ ...me, name: e.target.value })} disabled={closed} autoComplete="name" /></label>
          <label className="field"><span>Organization</span><input value={me.org} onChange={e => setMe({ ...me, org: e.target.value })} disabled={closed} autoComplete="organization" /></label>
          <label className="field ph-wide"><span>Email <span className="muted">(so we can reach you if you win)</span></span><input type="email" value={me.email} onChange={e => setMe({ ...me, email: e.target.value })} disabled={closed} autoComplete="email" /></label>
        </div>

        <div className="ch-tickets" aria-live="polite">
          <span className="ch-tickets-n">{score.tickets}</span>
          <span className="ch-tickets-l">{score.tickets === 1 ? 'ticket' : 'tickets'}<span className="small">{score.squaresDone}/9 squares · {plural(score.lines, 'line')}{score.blackout ? ' · blackout!' : ''}</span></span>
        </div>

        <ol className="ch-grid" aria-label="Challenge card">
          {ch.squares.map((def, i) => {
            const done = squareDone(def, card.squares[def.id]);
            return (
              <li key={def.id}>
                <button className={`ch-sq ${done ? 'done' : ''} ${score.done[i] && score.lines ? '' : ''}`} onClick={() => setOpen(def)} aria-label={`${def.title}${done ? ', done' : ''}`}>
                  <span className="ch-sq-ico">{done ? <Icon name="check" size={20} strokeWidth={3} /> : <Icon name={def.type === 'photo' ? 'camera' : def.type === 'code' ? 'ticket' : 'people'} size={20} />}</span>
                  <span className="ch-sq-title">{t(def.title)}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {!closed && (
          <div className="ch-turnin">
            <button className="btn accent big" onClick={turnIn} disabled={sending || (turned && !changed && !turned.pending)}>
              {sending ? 'Sending…' : turned ? (changed ? 'Update my card' : 'Card turned in ✓') : 'Turn in my card'}
            </button>
            {msg && <p className={`ch-hint ${msg.bad ? 'bad' : msg.good ? 'good' : ''}`} role="status">{msg.text}</p>}
            {!msg && turned && changed && <p className="ch-hint">Your card has {plural(score.tickets, 'ticket')}; the board shows {turned.tickets}. Tap Update.</p>}
            <p className="small muted">Turn in before {clock(ch.closeAt.split('T')[1])}. You can update your card as you fill more squares.</p>
          </div>
        )}
      </Section>

      <Section><Leaderboard myId={turned?.id} /></Section>
      <Rules />

      <SquareSheet def={open} entry={open && card.squares[open.id]} closed={closed} me={me} mode={mode}
        onClose={() => setOpen(null)}
        onSave={(id, entry) => { setCard(c => ({ ...c, squares: { ...c.squares, [id]: entry } })); setOpen(null); }} />
    </div>
  );
}

function Rules() {
  return (
    <Section title="Rules" className="ch-rules">
      <ul>{event.challenge.rules.map((r, i) => <li key={i}>{t(r)}</li>)}</ul>
    </Section>
  );
}

function SquareSheet({ def, entry, onClose, onSave, closed, me, mode }) {
  const [value, setValue] = useState({});
  const [photo, setPhoto] = useState(null);
  const [share, setShare] = useState(true);
  const [hint, setHint] = useState(null);
  const [busy, setBusy] = useState(false);
  const file = useRef(null);
  const [lastId, setLastId] = useState(null);
  if (def && def.id !== lastId) { setLastId(def.id); setValue(entry?.value || {}); setPhoto(entry?.thumb || null); setHint(null); }
  if (!def) return null;
  const done = squareDone(def, entry);

  async function onPhoto(f) {
    if (!f) return;
    setBusy(true); setHint(null);
    const thumb = await resizeImage(f, 480, 0.75).catch(() => null);
    setPhoto(thumb);
    let photoId;
    if (share && mode === 'live' && me.name.trim()) {
      try { photoId = (await uploadPhoto({ file: f, me, caption: value['Who\'s in it? (optional)'] || t(def.title), source: 'challenge', square: def.id })).id; setHint({ good: true, text: 'Photo sent. Thanks!' }); }
      catch { setHint({ text: 'The photo couldn\'t upload (weak signal?). It still counts.' }); }
    } else if (share && !me.name.trim()) setHint({ text: 'Add your name at the top so we know whose photo it is. The square still counts.' });
    setBusy(false);
    onSave(def.id, { done: true, value: { ...value, photo: 'taken' }, photo: photoId, thumb });
  }

  function save() {
    if (def.type === 'code') {
      const code = value.code || '';
      if (normCode(code) !== normCode(def.code)) { setHint({ bad: true, text: 'That\'s not the code. Ask at the table.' }); return; }
      onSave(def.id, { done: true, value: { code } });
      return;
    }
    if (!Object.values(value).some(v => String(v || '').trim())) { setHint({ bad: true, text: 'Fill in at least one field to complete this square.' }); return; }
    onSave(def.id, { done: true, value });
  }

  return (
    <Sheet open onClose={onClose} title={t(def.title)}>
      <p className="ch-task">{t(def.task)}</p>
      {def.type === 'code' && (
        <label className="field"><span>{def.field || 'Code word'}</span>
          <input value={value.code || ''} onChange={e => setValue({ code: e.target.value })} autoCapitalize="characters" autoComplete="off" disabled={closed} /></label>
      )}
      {(def.fields || []).filter(() => def.type !== 'code').map(f => (
        <label key={f} className="field"><span>{f}</span><input value={value[f] || ''} onChange={e => setValue(v => ({ ...v, [f]: e.target.value }))} disabled={closed} /></label>
      ))}
      {def.type === 'photo' && (
        <div className="ch-photo">
          {photo && <img src={photo} alt="Your Challenge photo" />}
          <label className="check"><input type="checkbox" checked={share} onChange={e => setShare(e.target.checked)} /> {t('{org}')} may share this photo in the gallery and on social media (see the photo release on the Photos screen).</label>
          <button className="btn" disabled={closed || busy} onClick={() => file.current.click()}><Icon name="camera" size={18} />{busy ? 'Sending…' : photo ? 'Retake photo' : 'Take the photo'}</button>
          <input ref={file} type="file" accept="image/*" capture="environment" hidden onChange={e => { onPhoto(e.target.files[0]); e.target.value = ''; }} />
        </div>
      )}
      {hint && <p className={`ch-hint ${hint.bad ? 'bad' : hint.good ? 'good' : ''}`} role="status">{hint.text}</p>}
      {!closed && def.type !== 'photo' && (
        <div className="sheet-actions">
          <button className="btn" onClick={save}><Icon name="check" size={18} />{done ? 'Update square' : 'Mark square done'}</button>
          {done && <button className="link-btn" onClick={() => onSave(def.id, undefined)}>Clear this square</button>}
        </div>
      )}
      {!closed && def.type === 'photo' && done && <button className="link-btn" onClick={() => onSave(def.id, undefined)}>Clear this square</button>}
    </Sheet>
  );
}
