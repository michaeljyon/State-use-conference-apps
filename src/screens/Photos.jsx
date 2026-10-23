import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { PageHead, Section, Sheet, Empty } from '../components/ui.jsx';
import { event, t } from '../lib/config.js';
import { useLocal, useMe } from '../lib/store.js';
import { api, useApiMode } from '../lib/api.js';
import { resizeImage } from '../lib/image.js';

export async function uploadPhoto({ file, me, caption, source = 'gallery', square }) {
  const image = await resizeImage(file);
  const res = await api('photos', { method: 'POST', body: { image, name: me.name, org: me.org, caption, source, square, release: true } });
  return { ...res, thumb: await resizeImage(file, 360, 0.7) };
}

export function useGallery(mode) {
  const [photos, setPhotos] = useState(null);
  useEffect(() => {
    if (mode !== 'live') return;
    let stop = false;
    const load = () => api('photos').then(d => !stop && setPhotos(d.photos)).catch(() => !stop && setPhotos(p => p || []));
    load();
    const id = setInterval(() => document.visibilityState === 'visible' && load(), 60000);
    return () => { stop = true; clearInterval(id); };
  }, [mode]);
  return photos;
}

export default function Photos() {
  const mode = useApiMode();
  const [me, setMe] = useMe();
  const [agreed, setAgreed] = useLocal('photo-release', false);
  const [mine, setMine] = useLocal('my-photos', []);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [view, setView] = useState(null);
  const take = useRef(null), pick = useRef(null);
  const gallery = useGallery(mode);
  const cfg = event.photos;
  const ready = me.name.trim() && agreed;

  async function onFiles(files) {
    if (!files?.length) return;
    setBusy(true); setMsg('');
    for (const file of [...files].slice(0, 10)) {
      try {
        if (mode !== 'live') throw Object.assign(new Error('Photo sharing needs the conference server. This photo is saved on your phone only.'), { local: true });
        const r = await uploadPhoto({ file, me, caption });
        setMine(m => [{ id: r.id, status: r.status, thumb: r.thumb, caption, at: Date.now() }, ...m].slice(0, 60));
      } catch (e) {
        const thumb = await resizeImage(file, 360, 0.7).catch(() => '');
        setMine(m => [{ id: `local-${Date.now()}`, status: 'failed', thumb, caption, at: Date.now() }, ...m].slice(0, 60));
        setMsg(e.local ? e.message : e.status ? e.message : 'The photo couldn\'t upload (weak signal?). Try again in a minute.');
      }
    }
    setCaption(''); setBusy(false);
  }

  return (
    <div className="content ph-content">
      <PageHead backTo="info" title="Conference photos" sub={`Snap a moment from ${event.shortName} and share it with ${t('{org}')}. Approved photos appear in the gallery below.`} />

      <Section title="Share a photo">
        <div className="ph-form">
          <div className="two-col">
            <label className="field"><span>Your name</span><input value={me.name} onChange={e => setMe({ ...me, name: e.target.value })} autoComplete="name" /></label>
            <label className="field"><span>Organization</span><input value={me.org} onChange={e => setMe({ ...me, org: e.target.value })} autoComplete="organization" /></label>
          </div>
          <label className="field"><span>Caption (optional)</span><input value={caption} onChange={e => setCaption(e.target.value)} maxLength={280} placeholder="Who's in it, what's happening" /></label>
          <details className="ph-release" open={!agreed}>
            <summary>Photo release</summary>
            <ul>{cfg.release.map((r, i) => <li key={i}>{t(r)}</li>)}</ul>
          </details>
          <label className="check"><input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} /> I agree to the photo release for every photo I share.</label>
          <div className="ph-actions">
            <button className="btn" disabled={!ready || busy} onClick={() => take.current.click()}><Icon name="camera" size={18} />{busy ? 'Sending…' : 'Take a photo'}</button>
            <button className="btn secondary" disabled={!ready || busy} onClick={() => pick.current.click()}><Icon name="image" size={18} />Upload from my phone</button>
          </div>
          {!ready && <p className="small muted">Add your name and agree to the photo release to share photos.</p>}
          {msg && <p className="form-msg" role="alert">{msg}</p>}
          <input ref={take} type="file" accept="image/*" capture="environment" hidden onChange={e => { onFiles(e.target.files); e.target.value = ''; }} />
          <input ref={pick} type="file" accept="image/*" multiple hidden onChange={e => { onFiles(e.target.files); e.target.value = ''; }} />
        </div>
      </Section>

      {mine.length > 0 && (
        <Section title="Photos you've shared">
          <ul className="ph-mine">
            {mine.map(p => (
              <li key={p.id}>
                {p.thumb && <img src={p.thumb} alt={p.caption || 'Your photo'} />}
                <span className={`ph-status ${p.status}`}>{p.status === 'approved' ? 'In the gallery' : p.status === 'pending' ? 'Sent · awaiting approval' : 'Not sent'}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Gallery">
        {mode !== 'live' ? <Empty icon="image" title="Gallery is off on this deploy">The photo gallery needs the conference server (Netlify functions).</Empty>
          : gallery === null ? <p className="muted">Loading photos…</p>
          : gallery.length === 0 ? <Empty icon="image" title="No photos yet">Be the first to share one.</Empty>
          : (
            <ul className="gallery">
              {gallery.map(p => <li key={p.id}><button onClick={() => setView(p)} aria-label={`Open photo${p.caption ? `: ${p.caption}` : ''} by ${p.name}`}><img src={`/api/photos/${p.id}`} alt="" loading="lazy" /></button></li>)}
            </ul>
          )}
      </Section>

      <Sheet open={!!view} onClose={() => setView(null)} title={view?.caption || 'Photo'} wide>
        {view && <figure className="lightbox"><img src={`/api/photos/${view.id}`} alt={view.caption || ''} /><figcaption className="small muted">Shared by {view.name}</figcaption></figure>}
      </Sheet>
    </div>
  );
}
