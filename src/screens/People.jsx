import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { PageHead, Section, Avatar, Empty } from '../components/ui.jsx';
import { event, t, peopleById } from '../lib/config.js';
import { clock } from '../lib/time.js';

const GROUPS = [
  { id: 'speakers', label: 'Speakers', roles: ['keynote', 'speaker'] },
  { id: 'team', label: 'Conference team', roles: ['staff'] },
];

export default function People({ route }) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('speakers');
  const id = route.args[0];
  if (id) return <PersonDetail p={peopleById[id]} />;

  const g = GROUPS.find(x => x.id === group);
  const needle = q.trim().toLowerCase();
  const list = event.people
    .filter(p => g.roles.includes(p.role))
    .filter(p => !needle || `${p.name} ${p.title} ${t(p.org)}`.toLowerCase().includes(needle))
    .sort((a, b) => (a.role === 'keynote' ? -1 : 0) - (b.role === 'keynote' ? -1 : 0) || a.name.split(' ').pop().localeCompare(b.name.split(' ').pop()));

  return (
    <div className="content">
      <PageHead title="People" sub="Speakers, the conference team and sponsors." />
      <div className="seg" role="tablist">
        {GROUPS.map(x => <button key={x.id} role="tab" aria-selected={group === x.id} className={group === x.id ? 'on' : ''} onClick={() => setGroup(x.id)}>{x.label}</button>)}
        <a className="seg-link" href="#/sponsors">Sponsors</a>
      </div>
      <label className="search-wrap">
        <Icon name="search" size={18} />
        <span className="sr-only">Search people</span>
        <input type="search" placeholder="Search by name or organization" value={q} onChange={e => setQ(e.target.value)} />
      </label>
      {list.length === 0 ? <Empty icon="search" title="No one matches">Try a different search.</Empty> : (
        <ul className="person-list">
          {list.map(p => (
            <li key={p.id}>
              <a className="person-row" href={`#/people/${p.id}`}>
                <Avatar person={p} size={52} />
                <span>
                  <span className="name">{p.name}{p.role === 'keynote' && <span className="pill gold-pill">Keynote</span>}</span>
                  <span className="org">{p.title}{p.org ? `, ${t(p.org)}` : ''}</span>
                </span>
                <Icon name="chevronR" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PersonDetail({ p }) {
  if (!p) return <div className="content"><PageHead title="Person" backTo="people" /><Empty title="Not found" /></div>;
  const talks = event.sessions.filter(s => (s.speakers || []).includes(p.id));
  return (
    <div className="content">
      <PageHead backTo="people" title="">
        <div className="p-hero">
          <Avatar person={p} size={96} />
          <div>
            <h1 className="p-name">{p.name}</h1>
            <p className="p-title">{p.title}</p>
            <p className="p-org">{t(p.org)}</p>
          </div>
        </div>
      </PageHead>
      {p.bio && <Section title="About"><p className="prose">{t(p.bio)}</p></Section>}
      {talks.length > 0 && (
        <Section title={talks.length > 1 ? 'Sessions' : 'Session'}>
          <ul className="talk-list">
            {talks.map(s => (
              <li key={s.id}><a href={`#/session/${s.id}`} className="talk"><span className="talk-title">{t(s.title)}</span><span className="muted small">{event.days.find(d => d.date === s.day)?.long} · {clock(s.start)}</span><Icon name="chevronR" /></a></li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
