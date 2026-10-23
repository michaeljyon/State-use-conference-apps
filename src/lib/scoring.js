// Connections Challenge scoring. Shared by the app and the server so both
// always agree on a card's ticket count.
//
// A 3 x 3 card. Each finished square earns `square` tickets, each completed
// row/column/diagonal earns `line` tickets, and the whole card earns a
// `blackout` bonus. (Defaults match the Synergy app: 1 / 2 / 5, so a full
// card is 9 + 16 + 5 = 30 tickets.)

export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],   // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],   // columns
  [0, 4, 8], [2, 4, 6],              // diagonals
];

export function normCode(s) {
  return String(s || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Is one square complete, given its definition and the player's entry?
export function squareDone(def, entry) {
  if (!entry || !entry.done) return false;
  const v = entry.value || {};
  if (def.type === 'code') return normCode(v.code) !== '' && normCode(v.code) === normCode(def.code);
  if (def.type === 'photo') return Boolean(entry.photo || v.photo || entry.done);
  // text: at least one field filled in
  return Object.values(v).some(x => String(x || '').trim() !== '');
}

export function scoreCard(challenge, squares = {}) {
  const s = { square: 1, line: 2, blackout: 5, ...(challenge.scoring || {}) };
  const done = challenge.squares.map(def => squareDone(def, squares[def.id]));
  const squaresDone = done.filter(Boolean).length;
  const lines = LINES.filter(l => l.every(i => done[i])).length;
  const blackout = squaresDone === challenge.squares.length;
  const tickets = squaresDone * s.square + lines * s.line + (blackout ? s.blackout : 0);
  return { done, squaresDone, lines, blackout, tickets };
}

// "Jordan Avery" -> "Jordan A."
export function displayName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'Player';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}
