import Icon from '../components/Icon.jsx';
import { PageHead, Empty } from '../components/ui.jsx';
import { event, t, peopleById } from '../lib/config.js';
import { clock } from '../lib/time.js';

export default function Materials() {
  const talks = event.sessions.filter(s => s.speakers?.length && !['meal', 'break'].includes(s.type));
  const posted = talks.filter(s => s.materials?.length);
  return (
    <div className="content mat-content">
      <PageHead backTo="info" title="Materials" sub="Presentations, handouts and resources from each session. More are added as presenters share them, so check back after each session." />
      {posted.length === 0 && <Empty icon="file" title="No materials posted yet">They'll appear under each session below as presenters send them in.</Empty>}
      <ul className="mat-sessions">
        {[...posted, ...talks.filter(s => !s.materials?.length)].map(s => (
          <li key={s.id} className="mat-session">
            <a className="mat-session-head" href={`#/session/${s.id}`}>
              <span className="mat-session-title">{t(s.title)}</span>
              <span className="muted small">{event.days.find(d => d.date === s.day)?.label} {clock(s.start)} · {(s.speakers || []).map(id => peopleById[id]?.name).join(', ')}</span>
            </a>
            {s.materials?.length ? (
              <ul className="mat-list">
                {s.materials.map(m => (
                  <li key={m.file} className="mat-item">
                    <Icon name="file" />
                    <span className="mat-title">{m.title}</span>
                    <a className="btn small" href={m.file} target="_blank" rel="noopener noreferrer">Open</a>
                  </li>
                ))}
              </ul>
            ) : <p className="mat-none muted small">Not posted yet</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
