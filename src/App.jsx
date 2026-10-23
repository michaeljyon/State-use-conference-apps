import { useEffect, useState } from 'react';
import Icon from './components/Icon.jsx';
import { Logo, SampleRibbon, Sheet } from './components/ui.jsx';
import { useRoute, go } from './lib/router.js';
import { useNotifications, enableAlerts } from './lib/notifications.js';
import { flushOutbox } from './lib/api.js';
import { event, timeTravel, now } from './lib/config.js';

import Home from './screens/Home.jsx';
import Agenda from './screens/Agenda.jsx';
import SessionDetail from './screens/SessionDetail.jsx';
import People from './screens/People.jsx';
import Venue from './screens/Venue.jsx';
import Info from './screens/Info.jsx';
import Sponsors from './screens/Sponsors.jsx';
import Materials from './screens/Materials.jsx';
import Feedback from './screens/Feedback.jsx';
import Photos from './screens/Photos.jsx';
import Challenge from './screens/Challenge.jsx';
import Staff from './screens/Staff.jsx';

const TABS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'agenda', label: 'Agenda', icon: 'calendar', match: ['agenda', 'session'] },
  { id: 'people', label: 'People', icon: 'people', match: ['people', 'sponsors'] },
  { id: 'venue', label: 'Venue', icon: 'map' },
  { id: 'info', label: 'Info', icon: 'info', match: ['info', 'materials', 'feedback', 'photos'] },
];

const SCREENS = {
  home: Home, agenda: Agenda, session: SessionDetail, people: People, venue: Venue, info: Info,
  sponsors: Sponsors, materials: Materials, feedback: Feedback, photos: Photos, challenge: Challenge, staff: Staff,
};

export default function App() {
  const route = useRoute();
  const notif = useNotifications();
  const [bellOpen, setBellOpen] = useState(false);
  const Screen = SCREENS[route.name] || Home;

  useEffect(() => { flushOutbox(); }, [route.name]);

  const openNotif = x => { notif.markRead([x.id]); setBellOpen(false); if (x.link) go(x.link); };

  return (
    <div className="app">
      <header className="app-header">
        <a className="header-brand" href="#/" aria-label={`${event.shortName} home`}><Logo /></a>
        <div className="header-event">
          <span className="header-event-name">{event.shortName}</span>
          <span className="header-event-date">{event.dateLabel}</span>
        </div>
        <button className="icon-btn bell" onClick={() => setBellOpen(true)} aria-label={`Notifications${notif.unread.length ? `, ${notif.unread.length} unread` : ''}`}>
          <Icon name="bell" />
          {notif.unread.length > 0 && <span className="bell-badge">{notif.unread.length > 9 ? '9+' : notif.unread.length}</span>}
        </button>
      </header>
      <SampleRibbon />
      {timeTravel && <div className="preview-clock" role="note">Preview clock: {new Date(now()).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit', timeZone: event.timezone })} event time · <a href="?now=real">use real time</a></div>}

      {notif.banner && !['staff', 'home', String(notif.banner.link || '').replace(/^#\/?/, '').split(/[/?]/)[0]].includes(route.name) && (
        <div className="notif-banner" role="status">
          <button className="notif-banner-main" onClick={() => openNotif(notif.banner)}>
            <span className="notif-banner-kicker"><span className="live-dot" aria-hidden="true" />Happening now</span>
            <span className="notif-banner-title">{notif.banner.title}</span>
          </button>
          <button className="icon-btn" aria-label="Dismiss" onClick={() => notif.dismiss(notif.banner.id)}><Icon name="x" size={18} /></button>
        </div>
      )}

      <main className="app-main" id="main">
        <Screen route={route} />
      </main>

      {route.name !== 'staff' && (
        <nav className="tabbar" aria-label="Main">
          {TABS.map(tab => {
            const active = (tab.match || [tab.id]).includes(route.name);
            return (
              <a key={tab.id} href={`#/${tab.id === 'home' ? '' : tab.id}`} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}>
                <Icon name={tab.icon} filled={false} />
                <span>{tab.label}</span>
              </a>
            );
          })}
        </nav>
      )}

      <Sheet open={bellOpen} onClose={() => setBellOpen(false)} title="Notifications">
        <NotificationList notif={notif} onOpen={openNotif} />
      </Sheet>
    </div>
  );
}

function NotificationList({ notif, onOpen }) {
  const [perm, setPerm] = useState(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
  return (
    <div className="notif-list-wrap">
      {perm === 'default' && (
        <div className="notif-alerts">
          <p>Get a phone alert when the conference team posts an update.</p>
          <button className="btn small" onClick={async () => setPerm(await enableAlerts())}>Turn on alerts</button>
        </div>
      )}
      {notif.items.length === 0 ? (
        <p className="muted center pad">No notifications yet. Updates from the conference team will show up here.</p>
      ) : (
        <>
          {notif.unread.length > 0 && <button className="link-btn right" onClick={notif.markAllRead}>Mark all as read</button>}
          <ul className="notif-list">
            {notif.items.map(x => (
              <li key={x.id}>
                <button className={`notif ${notif.unread.some(u => u.id === x.id) ? 'unread' : ''}`} onClick={() => onOpen(x)}>
                  <span className="notif-dot" aria-hidden="true" />
                  <span className="notif-main">
                    <span className="notif-title">{x.title}</span>
                    {x.body && <span className="notif-body">{x.body}</span>}
                    <span className="notif-meta">{x.live ? 'From the conference team · ' : ''}{new Date(x.time).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit', timeZone: event.timezone })}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
