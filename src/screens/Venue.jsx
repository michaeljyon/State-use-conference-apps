import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { PageHead, Section } from '../components/ui.jsx';
import FloorPlan from '../components/FloorPlan.jsx';
import { event, t, roomsById } from '../lib/config.js';
import { clock } from '../lib/time.js';

export default function Venue({ route }) {
  const fp = event.floorplan;
  const start = roomsById[route.query.room];
  const [levelId, setLevelId] = useState(start?.level.id || fp?.levels[0]?.id);
  const [focus, setFocus] = useState(start?.id || null);
  const level = fp?.levels.find(l => l.id === levelId);
  const v = event.venue;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.name} ${v.address}`)}`;
  const picked = focus && roomsById[focus];
  const inRoom = picked ? event.sessions.filter(s => s.room === picked.id) : [];

  return (
    <div className="content">
      <PageHead title="Venue & map" sub={v.name} />
      <div className="venue-card">
        <p className="venue-address"><Icon name="pin" size={18} />{v.address}</p>
        {v.phone && <p className="muted small"><Icon name="phone" size={14} /> {v.phone}</p>}
        <a className="btn" href={maps} target="_blank" rel="noopener noreferrer">Directions in maps <Icon name="external" size={16} /></a>
        {v.note && <p className="small">{t(v.note)}</p>}
      </div>

      {fp && (
        <Section title="Find your way">
          <div className="seg" role="tablist" aria-label="Choose a level">
            {fp.levels.map(l => <button key={l.id} role="tab" aria-selected={l.id === levelId} className={l.id === levelId ? 'on' : ''} onClick={() => { setLevelId(l.id); setFocus(null); }}>{l.name}</button>)}
          </div>
          <p className="muted small">{level.note}</p>
          <div className="fp-card"><FloorPlan level={level} focus={focus} onPick={id => setFocus(id === focus ? null : id)} /></div>
          <div className="fp-legend"><span><i className="sw event" />This conference</span><span><i className="sw focus" />Selected room</span><span><i className="sw other" />Rest of the building</span></div>
          {picked && (
            <div className="room-detail" aria-live="polite">
              <h3>{picked.name}</h3>
              {picked.what && <p>{t(picked.what)}</p>}
              {inRoom.length > 0 && <ul className="plain-list">{inRoom.map(s => <li key={s.id}><a href={`#/session/${s.id}`}>{t(s.title)}</a><span className="muted small">{event.days.find(d => d.date === s.day)?.label} {clock(s.start)}</span></li>)}</ul>}
            </div>
          )}
          {fp.note && <p className="muted small">{fp.note}</p>}
        </Section>
      )}

      {fp && (
        <Section title="Where things happen">
          <ul className="room-list">
            {fp.levels.flatMap(l => l.rooms.filter(r => r.use === 'event').map(r => (
              <li key={r.id}><button className="room-item" onClick={() => { setLevelId(l.id); setFocus(r.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <span><b>{r.name}</b><span className="muted small">{l.name}</span>{r.what && <span className="small">{t(r.what)}</span>}</span><Icon name="pin" />
              </button></li>
            )))}
          </ul>
        </Section>
      )}

      {(v.hotel || v.parking) && (
        <Section title="Hotel & parking">
          {v.hotel && <div className="info-row"><b>Hotel</b><span>{v.hotel.rate}. {v.hotel.deadline}.</span>{v.hotel.url && <a className="link-btn" href={v.hotel.url} target="_blank" rel="noopener noreferrer">Book a room <Icon name="external" size={14} /></a>}</div>}
          {v.parking && <div className="info-row"><b>Parking</b><span>{v.parking}</span></div>}
        </Section>
      )}

      {event.accessibility?.length > 0 && (
        <Section title="Accessibility">
          {event.accessibility.map(a => <div key={a.title} className="info-row"><b>{a.title}</b><span>{t(a.text)}</span></div>)}
        </Section>
      )}
    </div>
  );
}
