import Icon from './Icon.jsx';
import { useLocal } from '../lib/store.js';
import { clock, sessionStart, sessionEnd } from '../lib/time.js';
import { event, t, now, peopleById, roomName, trackById } from '../lib/config.js';

export function useSaved() {
  const [saved, setSaved] = useLocal('saved', []);
  const toggle = id => setSaved(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
  return [saved, toggle];
}

export const isNow = s => { const n = now(); return n >= sessionStart(s, event.timezone) && n < sessionEnd(s, event.timezone); };
export const TYPE_LABEL = { keynote: 'Keynote', plenary: 'Plenary', breakout: 'Breakout', reception: 'Reception', meal: 'Meal', break: 'Break', challenge: 'Challenge', awards: 'Awards' };

export function speakerNames(s) {
  return (s.speakers || []).map(id => peopleById[id]?.name).filter(Boolean).join(', ');
}

export default function SessionRow({ s, showTime = true }) {
  const [saved, toggle] = useSaved();
  const on = saved.includes(s.id);
  const live = isNow(s);
  const tr = s.track && trackById[s.track];
  const savable = !['meal', 'break'].includes(s.type);
  return (
    <li className={`session type-${s.type} ${live ? 'is-now' : ''}`}>
      <a className="session-link" href={s.link && !s.description ? s.link : `#/session/${s.id}`}>
        {showTime && <span className="time-col">{clock(s.start)}<span className="dur">{s.end ? `– ${clock(s.end)}` : ''}</span></span>}
        <span className="session-body">
          <span className="pills">
            {live && <span className="pill live"><span className="live-dot" aria-hidden="true" />Now</span>}
            {tr && <span className="pill track">{tr.name}</span>}
            {['keynote', 'plenary', 'awards', 'challenge'].includes(s.type) && <span className="pill">{TYPE_LABEL[s.type]}</span>}
          </span>
          <span className="session-title">{t(s.title)}</span>
          <span className="session-meta">
            {s.room && <span><Icon name="pin" size={14} />{roomName(s.room)}</span>}
            {speakerNames(s) && <span className="who">{speakerNames(s)}</span>}
          </span>
        </span>
      </a>
      {savable && (
        <button className={`save-btn ${on ? 'on' : ''}`} onClick={() => toggle(s.id)} aria-pressed={on}
          aria-label={on ? `Remove ${t(s.title)} from my schedule` : `Save ${t(s.title)} to my schedule`}>
          <Icon name="star" filled={on} />
        </button>
      )}
    </li>
  );
}
