// Floor plan drawn from the rooms in event.js. Tap a room to see what it's for.
export default function FloorPlan({ level, focus, onPick }) {
  return (
    <svg className="fp-svg" viewBox="0 0 400 260" role="img" aria-label={`${level.name} floor plan`}>
      <rect x="6" y="6" width="388" height="248" rx="10" className="fp-walls" />
      {level.rooms.map(r => {
        const on = r.id === focus;
        const cls = `fp-room ${r.use} ${on ? 'focus' : ''}`;
        const fs = Math.min(16, Math.max(11, (r.w - 8) / (r.name.length * 0.58)));
        return (
          <g key={r.id} className={cls} onClick={() => onPick?.(r.id)} role="button" tabIndex={0}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onPick?.(r.id)} aria-label={r.name}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="5" />
            {r.divider && <line x1={r.x + r.w / 2} y1={r.y + 6} x2={r.x + r.w / 2} y2={r.y + r.h - 6} className="fp-divider" />}
            <text x={r.x + r.w / 2} y={r.y + r.h / 2} dominantBaseline="middle" textAnchor="middle" fontSize={fs}>{r.name}</text>
          </g>
        );
      })}
    </svg>
  );
}
