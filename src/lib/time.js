// Event times are written as local wall-clock times in the event's time zone
// ('2027-05-20' + '11:30', or '2027-05-20T11:30'). These helpers turn them into
// real instants, so a phone in another time zone still unlocks things on time.

function tzOffsetMs(utcMs, timeZone) {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p = Object.fromEntries(f.formatToParts(new Date(utcMs)).map(x => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  return asUtc - utcMs;
}

// '2027-05-20T11:30' (event local) -> epoch ms
export function eventTime(local, timeZone) {
  if (!local) return NaN;
  const [d, t = '00:00'] = String(local).split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [hh, mm] = t.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, day, hh, mm);
  let ms = guess - tzOffsetMs(guess, timeZone);
  ms = guess - tzOffsetMs(ms, timeZone); // second pass handles DST edges
  return ms;
}

export function sessionStart(s, tz) { return eventTime(`${s.day}T${s.start}`, tz); }
export function sessionEnd(s, tz) { return eventTime(`${s.day}T${s.end || s.start}`, tz); }

// '13:30' -> '1:30 PM'
export function clock(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`;
}

export function fmtEventDateTime(local) {
  const [d, t] = String(local).split('T');
  const dt = new Date(`${d}T12:00:00Z`);
  const day = dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
  return t ? `${day} at ${clock(t)}` : day;
}
