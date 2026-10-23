import Icon from '../components/Icon.jsx';
import { PageHead, Section, Avatar, Empty } from '../components/ui.jsx';
import { useSaved, isNow, TYPE_LABEL } from '../components/SessionRow.jsx';
import { event, t, now, sessionsById, peopleById, roomsById, trackById } from '../lib/config.js';
import { clock, sessionStart } from '../lib/time.js';
import { useLocal } from '../lib/store.js';

export default function SessionDetail({ route }) {
  const s = sessionsById[route.args[0]];
  const [saved, toggle] = useSaved();
  const [done] = useLocal('surveys-done', []);
  if (!s) return <div className="content"><PageHead title="Session" backTo="agenda" /><Empty title="Session not found" /></div>;
  const day = event.days.find(d => d.date === s.day);
  const room = roomsById[s.room];
  const tr = s.track && trackById[s.track];
  const speakers = (s.speakers || []).map(id => peopleById[id]).filter(Boolean);
  const started = now() >= sessionStart(s, event.timezone);
  const on = saved.includes(s.id);

  return (
    <div className="content">
      <PageHead backTo="agenda" eyebrow={[TYPE_LABEL[s.type], tr && `${tr.name}: ${tr.label}`].filter(Boolean).join(' · ')} title={t(s.title)}>
        <p className="detail-when"><Icon name="clock" size={16} />{day?.long} · {clock(s.start)}{s.end && `–${clock(s.end)}`}{isNow(s) && <span className="pill live"><span className="live-dot" />Now</span>}</p>
        {room && <p className="detail-when"><Icon name="pin" size={16} />{room.name}, {room.level.name} <a className="link-btn" href={`#/venue?room=${room.id}`}>Show on map</a></p>}
        <div className="detail-actions">
          {!['meal', 'break'].includes(s.type) && (
            <button className={`btn ${on ? 'secondary' : ''}`} onClick={() => toggle(s.id)} aria-pressed={on}>
              <Icon name="star" filled={on} size={18} />{on ? 'Saved to my schedule' : 'Save to my schedule'}
            </button>
          )}
          {s.link && <a className="btn" href={s.link}>Open <Icon name="chevronR" size={18} /></a>}
        </div>
      </PageHead>

      {s.description && <Section title="About this session"><p className="prose">{t(s.description)}</p></Section>}

      {speakers.length > 0 && (
        <Section title={speakers.length > 1 ? 'Speakers' : 'Speaker'}>
          <ul className="person-list">
            {speakers.map(p => (
              <li key={p.id}><a className="person-row" href={`#/people/${p.id}`}><Avatar person={p} size={48} /><span><span className="name">{p.name}</span><span className="org">{p.title}, {t(p.org)}</span></span><Icon name="chevronR" /></a></li>
            ))}
          </ul>
        </Section>
      )}

      {(s.materials?.length > 0 || s.survey) && (
        <Section title="Materials">
          {s.materials?.length ? (
            <ul className="doc-list">
              {s.materials.map(m => (
                <li key={m.file}><a className="doc-link" href={m.file} target="_blank" rel="noopener noreferrer"><Icon name="file" /><span className="doc-title">{m.title}</span><span className="doc-kind">PDF · opens in a new tab</span></a></li>
              ))}
            </ul>
          ) : <p className="muted">This session's materials will be posted here when the presenter shares them.</p>}
        </Section>
      )}

      {s.survey && event.surveys?.session && (
        <Section>
          {done.includes(`session:${s.id}`)
            ? <p className="done-note"><Icon name="check" size={18} />Thanks, your feedback for this session was sent.</p>
            : started
              ? <a className="feedback-cta" href={`#/feedback/session/${s.id}`}><Icon name="message" /><span><b>Rate this session</b><span>Two minutes, every question optional.</span></span><Icon name="chevronR" /></a>
              : <p className="muted small">The survey opens when the session starts at {clock(s.start)}.</p>}
        </Section>
      )}
    </div>
  );
}
