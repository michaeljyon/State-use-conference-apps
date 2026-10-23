import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Icon from '../components/Icon.jsx';
import { PageHead, Section, Logo } from '../components/ui.jsx';
import { event, brand, t, setPreviewBrand } from '../lib/config.js';
import { BRANDS } from '../brands/brands.js';

export function AppQR({ size = 168 }) {
  const [src, setSrc] = useState('');
  const url = location.origin + '/';
  useEffect(() => { QRCode.toDataURL(url, { margin: 1, width: size * 2, color: { dark: '#000000', light: '#FFFFFF' } }).then(setSrc).catch(() => {}); }, [url, size]);
  return src ? <img src={src} width={size} height={size} alt={`QR code for ${url}`} className="qr" /> : null;
}

export default function Info() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return (
    <div className="content info-content">
      <PageHead title="Info" sub="About the conference, resources and contacts." />

      <div className="quick-grid three">
        <a className="quick-card" href="#/materials"><Icon name="file" size={24} /><span className="quick-title">Materials</span></a>
        <a className="quick-card" href="#/feedback"><Icon name="message" size={24} /><span className="quick-title">Feedback</span></a>
        {event.photos?.enabled && <a className="quick-card" href="#/photos"><Icon name="camera" size={24} /><span className="quick-title">Photos</span></a>}
      </div>

      <Section title="About the conference">
        {event.about.map((p, i) => <p key={i} className="prose">{t(p)}</p>)}
        {event.registrationUrl && <a className="link-btn" href={event.registrationUrl} target="_blank" rel="noopener noreferrer">Registration & event page <Icon name="external" size={14} /></a>}
      </Section>

      <Section title={`About ${brand.short}`}>
        <div className="org-card">
          <Logo className="org-logo" />
          {brand.tagline && <p className="brand-tagline">{brand.tagline}</p>}
          <p className="small muted">{brand.org} supports the {brand.program} program in its state, connecting public buyers with products and services from organizations that employ people with disabilities.</p>
          <a className="btn secondary" href={brand.website} target="_blank" rel="noopener noreferrer">Visit {brand.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '')} <Icon name="external" size={16} /></a>
        </div>
        {event.programServices?.length > 0 && (
          <>
            <h3 className="sub-h">Services our partners provide</h3>
            <ul className="value-pills">{event.programServices.map(s => <li key={s}>{s}</li>)}</ul>
          </>
        )}
      </Section>

      {event.contacts?.length > 0 && (
        <Section title="Contacts">
          {event.contacts.map(c => (
            <div key={c.label} className="contact-card">
              <p className="contact-label">{c.label}</p>
              <p><b>{t(c.name)}</b></p>
              <div className="contact-ways">
                {c.phone && <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}><Icon name="phone" size={16} />{c.phone}</a>}
                {c.email && <a href={`mailto:${c.email}`}><Icon name="mail" size={16} />{c.email}</a>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {event.resources?.length > 0 && (
        <Section title="Resources">
          <ul className="doc-list">
            {event.resources.map(r => <li key={r.title}><a className="doc-link" href={t(r.url)} target="_blank" rel="noopener noreferrer"><Icon name={r.url.endsWith('.pdf') ? 'file' : 'external'} /><span className="doc-title">{t(r.title)}</span></a></li>)}
          </ul>
        </Section>
      )}

      <Section title="Put this app on your home screen">
        <div className="install-card">
          <AppQR />
          <div>
            {isIOS
              ? <p>In Safari, tap <b>Share</b> <Icon name="share" size={16} />, then <b>Add to Home Screen</b>.</p>
              : <p>In Chrome, tap the <b>⋮ menu</b>, then <b>Add to Home screen</b> or <b>Install app</b>.</p>}
            <p className="small muted">It works offline once it's opened. Scan the code to share the app with a colleague.</p>
          </div>
        </div>
      </Section>

      {event.preview?.allowBrandSwitch && (
        <Section title="Preview another program's brand" className="preview-tools">
          <p className="small muted">Template preview only. Turn this off in <code>event.js</code> (preview.allowBrandSwitch) before launch.</p>
          <label className="field">
            <span>Brand preset</span>
            <select value={brand.id} onChange={e => setPreviewBrand(e.target.value)}>
              {Object.values(BRANDS).map(b => <option key={b.id} value={b.id}>{b.state} · {b.org}{b.status === 'pending' ? ' (logo pending)' : ''}</option>)}
            </select>
          </label>
        </Section>
      )}

      <p className="credit muted small center">Conference app for {event.name}. <a href="#/staff">Staff</a></p>
    </div>
  );
}
