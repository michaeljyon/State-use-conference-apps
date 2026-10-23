// Netlify Function: every /api/* request lands here.
// Data lives in Netlify Blobs (no database to set up). The store is named
// after event.id, so each conference keeps its own cards, photos and answers.
import { getStore } from '@netlify/blobs';
import { handle } from '../lib/core.mjs';
import event from '../../event/event.js';

export default async (req) => handle(req, {
  store: getStore({ name: `conf-${event.id}`, consistency: 'strong' }),
  staffPasscode: process.env.STAFF_PASSCODE || '',
  allowTimeTravel: process.env.ALLOW_TIME_TRAVEL === '1',
});

export const config = { path: '/api/*' };
