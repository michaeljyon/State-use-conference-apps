import Icon from '../components/Icon.jsx';
import { Section, Avatar, Logo } from '../components/ui.jsx';
import SessionRow, { isNow } from '../components/SessionRow.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import { event, brand, t, now, at } from '../lib/config.js';
import { sessionStart } from '../lib/time.js';
import { fmtEventDateTime } from '../lib/time.js';

const QUICK = [
  { href: '#/agenda', icon: 'calendar', title: 'Agenda', sub: 'Every session' },
  { href: '#/agenda?view=mine', icon: 'star', title: 'My schedule', sub: 'Sessions you saved' },
  { href: '#/challenge', icon: 'grid', title: 'Challenge', sub: 'Play & win', key: 'challenge' },
  { href: '#/photos', icon: 'camera', title: 'Photos', sub: 'Share & browse', key: 'photos' },
  { href: '#/materials', icon: 'file', title: 'Materials', sub: 'Slides & handouts' },
  { href: '#/feedback', icon: 'message', title: 'Feedback', sub: 'Rate sessions' },
];

export default function Home() {
  const n = now();
  const tz = event.timezone;
  const live = event.sessions.filter(isNow);
  const upcoming = event.sessions.filter(s => sessionStart(s, tz) > n).sort((a, b) => sessionStart(a, tz) - sessionStart(b, tz));
  const nextStart = upcoming[0] && sessionStart(upcoming[0], tz);
  const next = upcoming.filter(s => sessionStart(s, tz) === nextStart);
  const ch = event.challenge;
  const chOpen = ch?.enabled && n >= at(ch.unlockAt) && n <= at(ch.closeAt);
  const chDone = ch?.enabled && n > at(ch.closeAt);
  const keynotes = event.people.filter(p => p.role === 'keynote');
  const speakers = event.people.filter(p => p.role === 'speaker');
  const title = event.sponsors.filter(s => s.tier === event.sponsorTiers[0]?.id);
  const quick = QUICK.filter(q => (q.key === 'challenge' ? ch?.enabled : q.key === 'photos' ? event.photos?.enabled : true));

  return (
    <div className="content home-content">
      <section className="hero">
        <p className="hero-eyebrow">{t(event.edition)}</p>
        <h1 className="hero-title">{event.name}</h1>
        {event.theme && <p className="hero-theme">{t(event.theme)}</p>}
        <p className="hero-when"><Icon name="calendar" size={16} />{event.dateLabel}<span aria-hidden="true">·</span><Icon name="pin" size={16} />{event.venue.name}</p>
        <a className="btn on-primary" href="#/agenda">Open the agenda <Icon name="chevronR" size={18} /></a>
      </section>

      {chOpen && (
        <a className="challenge-live" href="#/challenge">
          <span className="challenge-live-ico"><Icon name="grid" size={26} /></span>
          <span>
            <span className="kicker"><span className="live-dot" aria-hidden="true" />Happening now</span>
            <span className="challenge-live-title">The {ch.name} is on!</span>
            <span className="challenge-live-sub">Open your card · turn in by {fmtEventDateTime(ch.closeAt).split(' at ')[1]}</span>
          </span>
          <Icon name="chevronR" />
        </a>
      )}

      {(live.length > 0 || next.length > 0) && (
        <Section title={live.length ? 'Happening now' : 'Up next'} action={<a className="link-btn" href="#/agenda">Full agenda</a>}>
          <ul className="session-list compact">{(live.length ? live : next).slice(0, 4).map(s => <SessionRow key={s.id} s={s} />)}</ul>
        </Section>
      )}

      <Section>
        <div className="quick-grid">
          {quick.map(q => (
            <a key={q.href} className="quick-card" href={q.href}>
              <Icon name={q.icon} size={24} />
              <span className="quick-title">{q.title}</span>
              <span className="quick-sub">{q.sub}</span>
            </a>
          ))}
        </div>
      </Section>

      {(chOpen || chDone) && <Section title="Live leaderboard"><Leaderboard compact /></Section>}

      {ch?.enabled && !chOpen && !chDone && (
        <a className="challenge-card" href="#/challenge">
          <span className="challenge-eyebrow">{ch.when}</span>
          <span className="challenge-title">{ch.name}</span>
          <span className="challenge-blurb">A networking game played right here in the app. Every square you finish earns a ticket for the {ch.prize} drawing.</span>
          <span className="challenge-cta"><Icon name="lock" size={16} />Card unlocks {fmtEventDateTime(ch.unlockAt)}</span>
        </a>
      )}

      {keynotes.length > 0 && (
        <Section title="Keynote">
          {keynotes.map(p => (
            <a key={p.id} className="keynote-card" href={`#/people/${p.id}`}>
              <Avatar person={p} size={64} />
              <span><span className="speaker-name">{p.name}</span><span className="speaker-org">{p.title}, {t(p.org)}</span></span>
              <Icon name="chevronR" />
            </a>
          ))}
        </Section>
      )}

      <Section title="Speakers" action={<a className="link-btn" href="#/people">See all</a>}>
        <ul className="speaker-grid">
          {speakers.slice(0, 6).map(p => (
            <li key={p.id}><a href={`#/people/${p.id}`}><Avatar person={p} size={60} /><span className="speaker-name">{p.name}</span><span className="speaker-org">{t(p.org)}</span></a></li>
          ))}
        </ul>
      </Section>

      <Section title="Thank you to our sponsors" action={<a className="link-btn" href="#/sponsors">See all</a>}>
        <div className="sponsor-strip">
          {title.map(s => <SponsorTile key={s.name} s={s} big />)}
          <p className="muted small">{event.sponsors.length} sponsors and partners make this event possible.</p>
        </div>
      </Section>

      <Section>
        <div className="presented-by">
          <span className="muted small">Presented by</span>
          <a href={brand.website} target="_blank" rel="noopener noreferrer" className="presented-logo"><Logo className="presented-img" /></a>
          {brand.tagline && <p className="brand-tagline">{brand.tagline}</p>}
        </div>
      </Section>
    </div>
  );
}

export function SponsorTile({ s, big }) {
  const body = (
    <>
      {s.logo ? <img src={s.logo} alt="" className="sponsor-logo" /> : <span className="sponsor-initials" aria-hidden="true">{s.name.split(/\s+/).filter(w => /^[A-Z]/.test(w)).slice(0, 3).map(w => w[0]).join('')}</span>}
      <span className="sponsor-name">{s.name}</span>
    </>
  );
  return s.url
    ? <a className={`sponsor-tile ${big ? 'big' : ''}`} href={s.url} target="_blank" rel="noopener noreferrer">{body}</a>
    : <div className={`sponsor-tile ${big ? 'big' : ''}`}>{body}</div>;
}
