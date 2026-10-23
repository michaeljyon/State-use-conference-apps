import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import { brand, event, t } from '../lib/config.js';
import { back } from '../lib/router.js';

export function Logo({ className = 'header-logo' }) {
  if (brand.logo) return <img className={className} src={brand.logo} alt={brand.org} />;
  // No approved logo yet: plain typed name (never a recreated mark).
  return <span className={`${className} wordmark`}>{brand.wordmark || brand.org}</span>;
}

export function SampleRibbon() {
  if (!event.isSample) return null;
  return (
    <div className="sample-ribbon" role="note">
      <b>Sample event</b> · placeholder content · edit <code>event/event.js</code>
    </div>
  );
}

export function Initials({ name, size = 48, className = '' }) {
  const ini = String(name || '?').replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(w => /^[A-Za-z]/.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return <span className={`avatar ${className}`} style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">{ini || '?'}</span>;
}

export function Avatar({ person, size = 48 }) {
  if (person?.photo) return <img className="avatar img" src={person.photo} alt="" width={size} height={size} style={{ width: size, height: size }} />;
  return <Initials name={person?.name} size={size} />;
}

export function PageHead({ title, sub, backTo, eyebrow, children }) {
  return (
    <header className="page-head">
      {backTo !== undefined && (
        <button className="back-btn" onClick={() => back(backTo)}><Icon name="chevronL" size={20} /> Back</button>
      )}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {title && <h1>{title}</h1>}
      {sub && <p className="page-sub">{sub}</p>}
      {children}
    </header>
  );
}

export function Section({ title, action, children, className = '' }) {
  return (
    <section className={`section ${className}`}>
      {(title || action) && (
        <div className="section-row">
          {title && <h2 className="section-title">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Sheet({ open, onClose, title, children, wide }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    ref.current?.focus();
    const key = e => e.key === 'Escape' && onClose();
    addEventListener('keydown', key);
    document.body.classList.add('no-scroll');
    return () => { removeEventListener('keydown', key); document.body.classList.remove('no-scroll'); prev?.focus?.(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className={`sheet ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

export function Empty({ icon = 'info', title, children }) {
  return (
    <div className="empty">
      <Icon name={icon} size={30} />
      <p className="empty-title">{title}</p>
      {children && <p>{children}</p>}
    </div>
  );
}

export const T = ({ children }) => <>{t(children)}</>;
