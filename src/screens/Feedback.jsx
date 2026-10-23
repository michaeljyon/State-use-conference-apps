import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { PageHead, Section, Empty } from '../components/ui.jsx';
import { event, t, now, sessionsById } from '../lib/config.js';
import { clock, sessionStart } from '../lib/time.js';
import { useLocal, useMe } from '../lib/store.js';
import { api, queue, apiMode } from '../lib/api.js';

export default function Feedback({ route }) {
  const [kind, id] = route.args;
  if (kind === 'conference') return <SurveyForm surveyId="conference" />;
  if (kind === 'session' && sessionsById[id]) return <SurveyForm surveyId="session" session={sessionsById[id]} />;
  return <FeedbackList />;
}

function FeedbackList() {
  const [done] = useLocal('surveys-done', []);
  const [later, setLater] = useLocal('surveys-later', []);
  const n = now();
  const rateable = event.sessions.filter(s => s.survey).sort((a, b) => sessionStart(a, event.timezone) - sessionStart(b, event.timezone));
  const started = rateable.filter(s => sessionStart(s, event.timezone) <= n);
  const todo = started.filter(s => !done.includes(`session:${s.id}`) && !later.includes(s.id));
  const rest = started.filter(s => !todo.includes(s));
  const upcoming = rateable.filter(s => sessionStart(s, event.timezone) > n);

  const Row = ({ s }) => {
    const isDone = done.includes(`session:${s.id}`);
    return (
      <li className="sv-row">
        <a href={`#/feedback/session/${s.id}`}>
          <span className="sv-row-text"><span className="sv-row-title">{t(s.title)}</span><span className="muted small">{event.days.find(d => d.date === s.day)?.label} {clock(s.start)}</span></span>
          <span className={`sv-status ${isDone ? 'done' : 'go'}`}>{isDone ? <><Icon name="check" size={14} />Sent</> : 'Rate'}</span>
        </a>
        {!isDone && !later.includes(s.id) && <button className="link-btn small" onClick={() => setLater(l => [...l, s.id])}>Didn't attend</button>}
      </li>
    );
  };

  return (
    <div className="content sv-content">
      <PageHead backTo="info" title="Your feedback" sub="Tell us what helped and what would help more. Each survey takes a few minutes, and every question is optional." />
      <a className={`feedback-cta big ${done.includes('conference:') ? 'is-done' : ''}`} href="#/feedback/conference">
        <Icon name="heart" />
        <span><b>Whole conference</b><span>Content, tracks, the {t('{program}')} program and the event itself</span></span>
        {done.includes('conference:') ? <span className="sv-status done"><Icon name="check" size={14} />Sent</span> : <Icon name="chevronR" />}
      </a>
      <Section title="Session feedback">
        {started.length === 0 ? <Empty icon="message" title="Nothing to rate yet">Session surveys open when each session starts.</Empty> : (
          <ul className="sv-list">{todo.map(s => <Row key={s.id} s={s} />)}{rest.map(s => <Row key={s.id} s={s} />)}</ul>
        )}
        {upcoming.length > 0 && <p className="muted small">{upcoming.length} more session surveys open as the sessions start.</p>}
      </Section>
      <p className="sv-privacy small muted">Answers go to the {t('{org}')} conference team. Your name and email are optional and only used if you ask us to follow up.</p>
    </div>
  );
}

function Stars({ value, onChange, label }) {
  return (
    <div className="stars" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} className={value >= n ? 'on' : ''} onClick={() => onChange(value === n ? undefined : n)}>
          <Icon name="star" filled={value >= n} size={30} />
        </button>
      ))}
    </div>
  );
}

function Question({ q, value, set }) {
  const label = t(q.label);
  if (q.type === 'stars') return <fieldset className="sv-q"><legend>{label}</legend><Stars value={value} onChange={set} label={label} /></fieldset>;
  if (q.type === 'text') return <label className="sv-q field"><span className="legend">{label}</span><textarea rows={3} value={value || ''} onChange={e => set(e.target.value)} /></label>;
  if (q.type === 'nps') return (
    <fieldset className="sv-q"><legend>{label}</legend>
      <div className="nps">{Array.from({ length: 11 }, (_, i) => <button type="button" key={i} aria-pressed={value === i} className={value === i ? 'on' : ''} onClick={() => set(value === i ? undefined : i)}>{i}</button>)}</div>
      {q.ends && <div className="scale-ends small muted"><span>{q.ends[0]}</span><span>{q.ends[1]}</span></div>}
    </fieldset>
  );
  if (q.type === 'scale' || q.type === 'choice') return (
    <fieldset className="sv-q"><legend>{label}</legend>
      <div className={`sv-options ${q.type === 'scale' ? 'row' : ''}`}>
        {q.options.map(o => <button type="button" key={o} aria-pressed={value === o} className={value === o ? 'on' : ''} onClick={() => set(value === o ? undefined : o)}>{t(o)}</button>)}
      </div>
    </fieldset>
  );
  if (q.type === 'multi') {
    const v = value || [];
    return (
      <fieldset className="sv-q"><legend>{label}</legend>
        <div className="sv-options">{q.options.map(o => <button type="button" key={o} aria-pressed={v.includes(o)} className={v.includes(o) ? 'on' : ''} onClick={() => set(v.includes(o) ? v.filter(x => x !== o) : [...v, o])}>{v.includes(o) && <Icon name="check" size={14} />}{t(o)}</button>)}</div>
      </fieldset>
    );
  }
  if (q.type === 'grid') {
    const v = value || {};
    return (
      <fieldset className="sv-q sv-grid"><legend>{label}</legend>
        {q.rows.map(r => (
          <div key={r.id} className="sv-grid-row">
            <p>{t(r.label)}</p>
            <div className="sv-options row tight">{q.options.map(o => <button type="button" key={o} aria-pressed={v[r.id] === o} className={v[r.id] === o ? 'on' : ''} onClick={() => set({ ...v, [r.id]: v[r.id] === o ? undefined : o })}>{o}</button>)}</div>
          </div>
        ))}
      </fieldset>
    );
  }
  return null;
}

function SurveyForm({ surveyId, session }) {
  const def = event.surveys[surveyId];
  const key = session ? `session:${session.id}` : 'conference:';
  const [draft, setDraft] = useLocal(`survey-draft:${key}`, {});
  const [done, setDone] = useLocal('surveys-done', []);
  const [me] = useMe();
  const [contact, setContact] = useState({ name: me.name, email: me.email, followUp: false });
  const [state, setState] = useState(done.includes(key) ? 'sent' : 'idle');
  const [msg, setMsg] = useState('');

  const clean = Object.fromEntries(Object.entries(draft).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && !v.length) && !(typeof v === 'object' && !Array.isArray(v) && !Object.values(v).some(Boolean))));

  async function submit(e) {
    e.preventDefault();
    if (!Object.keys(clean).length) { setMsg('Answer at least one question to send.'); return; }
    const payload = { surveyId, sessionId: session?.id, sessionTitle: session && t(session.title), answers: clean, contact: contact.followUp ? contact : { followUp: false }, clientId: `${key}:${Date.now()}` };
    setState('sending');
    try {
      if ((await apiMode()) !== 'live') throw Object.assign(new Error('local'), { local: true });
      await api('feedback', { method: 'POST', body: payload });
      setMsg('');
    } catch (err) {
      if (err.status && err.status < 500) { setState('idle'); setMsg(err.message); return; }
      queue('feedback', payload);
      setMsg(navigator.onLine ? 'Saved on this phone. It will send when the conference server is reachable.' : 'You seem to be offline. Your answers are saved on this phone and will send automatically when you\'re back online.');
    }
    setDone(d => [...new Set([...d, key])]);
    setDraft({});
    setState('sent');
  }

  if (state === 'sent') return (
    <div className="content">
      <PageHead backTo="feedback" title="Thank you" />
      <div className="sv-thanks"><Icon name="check" size={36} /><p>{msg ? 'Your feedback is saved.' : 'Your feedback was sent.'} It helps us plan sessions that are more useful to you.</p>{msg && <p className="small muted">{msg}</p>}<a className="btn" href="#/feedback">Back to feedback</a></div>
    </div>
  );

  return (
    <div className="content">
      <PageHead backTo="feedback" eyebrow={def.title} title={session ? t(session.title) : t('{event}')} sub={t(def.intro)} />
      <form className="sv-form" onSubmit={submit}>
        {def.questions.map(q => <Question key={q.id} q={q} value={draft[q.id]} set={v => setDraft(d => ({ ...d, [q.id]: v }))} />)}
        <fieldset className="sv-q">
          <legend>May {t('{org}')} follow up with you about your answers?</legend>
          <label className="check"><input type="checkbox" checked={contact.followUp} onChange={e => setContact(c => ({ ...c, followUp: e.target.checked }))} /> Yes, you can contact me</label>
          {contact.followUp && (
            <div className="two-col">
              <label className="field"><span>Name</span><input value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))} /></label>
              <label className="field"><span>Email</span><input type="email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} /></label>
            </div>
          )}
          <p className="small muted">Leave unchecked to stay anonymous.</p>
        </fieldset>
        {msg && <p className="form-msg" role="alert">{msg}</p>}
        <button className="btn big" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send feedback'}</button>
      </form>
    </div>
  );
}
