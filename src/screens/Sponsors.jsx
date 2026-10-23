import { PageHead, Section } from '../components/ui.jsx';
import { SponsorTile } from './Home.jsx';
import { event, t } from '../lib/config.js';

export default function Sponsors() {
  return (
    <div className="content">
      <PageHead backTo="people" title="Sponsors" sub="Thank you to the sponsors and partners who make this conference possible." />
      {event.sponsorTiers.map((tier, i) => {
        const list = event.sponsors.filter(s => s.tier === tier.id);
        if (!list.length) return null;
        return (
          <Section key={tier.id} title={tier.label}>
            {tier.blurb && <p className="muted">{t(tier.blurb)}</p>}
            <div className={`sponsor-grid tier-${i}`}>
              {list.map(s => (
                <div key={s.name} className="sponsor-card">
                  <SponsorTile s={s} big={i === 0} />
                  {s.blurb && <p className="small muted">{t(s.blurb)}</p>}
                </div>
              ))}
            </div>
          </Section>
        );
      })}
      {event.exhibitors?.length > 0 && (
        <Section title="Exhibitors">
          <ul className="plain-list">
            {event.exhibitors.map(x => <li key={x.name}><b>{x.name}</b><span className="muted small">{x.where}{x.blurb ? ` · ${t(x.blurb)}` : ''}</span></li>)}
          </ul>
        </Section>
      )}
    </div>
  );
}
