import { useState } from 'react';
import { PageHead, Empty } from '../components/ui.jsx';
import SessionRow, { useSaved } from '../components/SessionRow.jsx';
import { event, now } from '../lib/config.js';
import { clock } from '../lib/time.js';

function todayIndex() {
  const d = new Date(now()).toLocaleDateString('en-CA', { timeZone: event.timezone });
  const i = event.days.findIndex(x => x.date === d);
  return i < 0 ? 0 : i;
}

export default function Agenda({ route }) {
  const [day, setDay] = useState(todayIndex);
  const [filter, setFilter] = useState(route.query.view === 'mine' ? 'mine' : 'all');
  const [saved] = useSaved();
  const date = event.days[day].date;

  let list = event.sessions.filter(s => s.day === date);
  if (filter === 'mine') list = list.filter(s => saved.includes(s.id));
  else if (filter !== 'all') list = list.filter(s => !s.track || s.track === filter);

  const groups = [];
  for (const s of list.sort((a, b) => a.start.localeCompare(b.start))) {
    const g = groups[groups.length - 1];
    if (g && g.start === s.start) g.items.push(s); else groups.push({ start: s.start, items: [s] });
  }

  return (
    <div className="content">
      <PageHead title="Agenda" sub={`${event.venue.name} · ${event.dateLabel}`} />
      <div className="day-tabs" role="tablist" aria-label="Day">
        {event.days.map((d, i) => (
          <button key={d.date} role="tab" aria-selected={i === day} className={i === day ? 'on' : ''} onClick={() => setDay(i)}>
            <span className="day-short">{d.label}</span><span className="day-long">{d.long.split(', ')[1]}</span>
          </button>
        ))}
      </div>
      <div className="chip-row" role="group" aria-label="Filter">
        {[['all', 'All'], ['mine', '☆ My schedule'], ...event.tracks.map(tr => [tr.id, tr.name])].map(([id, label]) => (
          <button key={id} className={`chip ${filter === id ? 'on' : ''}`} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>
      {filter !== 'all' && filter !== 'mine' && <p className="muted small">{event.tracks.find(t => t.id === filter)?.label}, plus sessions for everyone.</p>}

      {groups.length === 0 ? (
        filter === 'mine'
          ? <Empty icon="star" title="Your schedule is empty for this day">Tap ☆ on any session to save it here.</Empty>
          : <Empty icon="calendar" title="Nothing scheduled" />
      ) : groups.map(g => (
        <section key={g.start} className="time-group">
          <h2 className="time-heading">{clock(g.start)}</h2>
          <ul className="session-list">{g.items.map(s => <SessionRow key={s.id} s={s} showTime={false} />)}</ul>
        </section>
      ))}
    </div>
  );
}
