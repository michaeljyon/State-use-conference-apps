/*
 * Brand presets, one per State Use program.
 *
 * Every logo is the program's own official file (public/brands/<id>/logo.png,
 * background removed, never redrawn or recolored). Every color is sampled from
 * that logo or the program's own brand guide. No other organization's marks or
 * colors are mixed in.
 *
 * Color roles
 *   primary   hero band, buttons, active tab. White text sits on it (>= 4.5:1).
 *   onPrimary text color on primary.
 *   accent    highlights: rules, progress, ticket counts, badges.
 *   onAccent  text color on accent. Accent fills only carry large, bold text
 *             (ticket counts, big numbers), so the bar is 3:1 (WCAG large text).
 *   ink       headings and links on white (>= 4.5:1).
 * Neutrals (white, #F3F4F6 page, #2C313F body text) are shared by all presets.
 *
 * status: 'official' = logo and colors from official files.
 *         'pending'  = no approved logo/palette yet. The app shows the org name
 *                      as plain type on a neutral palette until files arrive.
 *
 * To add or update a program: run scripts/prepare-logo.py on the official file,
 * sample its colors (see SETUP.md), and add an entry below.
 */

const NEUTRAL = { primary: '#2C313F', onPrimary: '#FFFFFF', accent: '#2C313F', onAccent: '#FFFFFF', ink: '#2C313F' };

export const BRANDS = {
  'ca-sbc': {
    state: 'CA', org: 'Signature Business Consulting', short: 'SBC',
    program: 'State Use', website: 'https://www.signaturebc.org',
    tagline: 'Educating government agencies and empowering the disability community.',
    colors: { primary: '#262E4F', onPrimary: '#FFFFFF', accent: '#A7AAB7', onAccent: '#262E4F', ink: '#262E4F' },
    source: 'Sampled from the SBC logo (signaturebc.org), Oct 2026',
  },
  'ct-alliance': {
    state: 'CT', org: 'Connecticut Community Nonprofit Alliance', short: 'The Alliance',
    program: 'Preferred Purchasing', website: 'https://ctnonprofitalliance.org/preferred-purchasing',
    tagline: 'Voice of Community Nonprofits',
    colors: { primary: '#1E376D', onPrimary: '#FFFFFF', accent: '#008366', onAccent: '#FFFFFF', ink: '#1E376D' },
    source: 'Sampled from The Alliance logo, Oct 2026',
  },
  'de-and': {
    state: 'DE', org: 'Ability Network of Delaware', short: 'A.N.D.',
    program: 'State Use', website: 'https://abilitynetworkde.org',
    tagline: 'Connecting & Strengthening Community Service Providers',
    colors: { primary: '#E22329', onPrimary: '#FFFFFF', accent: '#717076', onAccent: '#FFFFFF', ink: '#E22329' },
    source: 'Sampled from the A.N.D. logo, Oct 2026',
  },
  'fl-respect': {
    state: 'FL', org: 'RESPECT of Florida', short: 'RESPECT',
    program: 'State Use', website: 'https://www.respectofflorida.org',
    tagline: 'Empowering Abilities, Enriching Lives',
    // Brand guide: RESPECT Blue #009ADA fields, Deep Navy #0D5292 headings,
    // Midnight #1A2A3A body copy. Max three colors per piece.
    colors: { primary: '#0D5292', onPrimary: '#FFFFFF', accent: '#009ADA', onAccent: '#1A2A3A', ink: '#0D5292' },
    fontBody: "'Roboto'", fontHead: "Futura, 'Futura PT', 'Roboto'",
    source: 'RESPECT of Florida Brand Style Guide; logo file supplied by Mike, Oct 2026',
  },
  'ga-geps': {
    state: 'GA', org: 'Georgia Enterprises for Products & Services', short: 'GEPS',
    program: 'State Use', website: 'https://www.georgiaenterprises.com',
    tagline: '',
    // One-color mark: navy carries every role.
    colors: { primary: '#013976', onPrimary: '#FFFFFF', accent: '#013976', onAccent: '#FFFFFF', ink: '#013976' },
    source: 'Sampled from the GEPS logo, Oct 2026',
  },
  'in-ability': {
    state: 'IN', org: 'Ability Indiana', short: 'Ability Indiana',
    program: 'Ability Indiana Program', website: 'https://www.abilityin.org',
    tagline: 'Solutions at Work',
    colors: { primary: '#163869', onPrimary: '#FFFFFF', accent: '#FDC23D', onAccent: '#163869', ink: '#163869' },
    source: 'Sampled from the Ability Indiana logo, Oct 2026',
  },
  'la-eds': {
    state: 'LA', org: 'Employment Development Services', short: 'EDS',
    program: 'State Use', website: 'http://edsla.com',
    tagline: 'Opportunities at work.',
    colors: { primary: '#D31145', onPrimary: '#FFFFFF', accent: '#0B0906', onAccent: '#FFFFFF', ink: '#0B0906' },
    source: 'Sampled from the EDS logo, Oct 2026 (low-resolution source; ask EDS for a vector)',
  },
  'md-mdworks': {
    state: 'MD', org: 'Maryland Works', short: 'Maryland Works',
    program: 'Employment Works Program', website: 'https://mdworks.com',
    tagline: 'Where all abilities work.™',
    colors: { primary: '#BA2025', onPrimary: '#FFFFFF', accent: '#3A3A3A', onAccent: '#FFFFFF', ink: '#3A3A3A' },
    source: 'Sampled from the Maryland Works logo, Oct 2026',
  },
  'nv-preferred': {
    state: 'NV', org: 'Nevada Preferred Purchase', short: 'Preferred Purchase',
    program: 'Preferred Purchase', website: 'https://preferredpurchase.nv.gov',
    tagline: '',
    status: 'pending', wordmark: 'Nevada Preferred Purchase',
    colors: NEUTRAL,
    source: 'PENDING: logo download is blocked by the state site. Upload the official file, then sample its colors.',
  },
  'nj-accses': {
    state: 'NJ', org: 'ACCSES New Jersey', short: 'ACCSES NJ',
    program: 'State Use', website: 'https://accsesnj.org',
    tagline: 'Purchasing With A Purpose',
    colors: { primary: '#28317E', onPrimary: '#FFFFFF', accent: '#1DB04C', onAccent: '#2C313F', ink: '#28317E' },
    source: 'Sampled from the ACCSES NJ color logo, Oct 2026',
  },
  'nm-horizons': {
    state: 'NM', org: 'Horizons of New Mexico', short: 'Horizons NM',
    program: 'State Use', website: 'https://horizonsofnewmexico.org',
    tagline: 'Jobs for People with Disabilities',
    // Zia yellow + red stay paired; blue is the third logo color.
    colors: { primary: '#B50F19', onPrimary: '#FFFFFF', accent: '#FFE617', onAccent: '#B50F19', ink: '#0273BE' },
    source: 'Sampled from the Horizons NM logo (JPEG), Oct 2026',
  },
  'ny-nysid': {
    state: 'NY', org: 'NYSID', short: 'NYSID',
    program: 'Preferred Source', website: 'https://nysid.org',
    tagline: 'Purchasing That Powers Employment',
    colors: { primary: '#0078AE', onPrimary: '#FFFFFF', accent: '#4BAA42', onAccent: '#2C313F', ink: '#0078AE' },
    source: 'Sampled from the NYSID logo, Oct 2026 (small source file; ask NYSID for a vector)',
  },
  'ny-nibny': {
    state: 'NY', org: 'NIBNY', short: 'NIBNY',
    program: 'Preferred Source', website: 'https://www.nibny.org',
    tagline: 'Purchase with a Purpose',
    colors: { primary: '#204C70', onPrimary: '#FFFFFF', accent: '#4088C1', onAccent: '#FFFFFF', ink: '#204C70' },
    source: 'Sampled from the NIBNY logo (JPEG), Oct 2026. Formerly NYSPSP.',
  },
  'ok-omes': {
    state: 'OK', org: 'Oklahoma State Use Program (OMES)', short: 'OK State Use',
    program: 'State Use', website: 'https://oklahoma.gov/omes',
    tagline: '',
    colors: { primary: '#004E9A', onPrimary: '#FFFFFF', accent: '#D15420', onAccent: '#FFFFFF', ink: '#464646' },
    source: 'State of Oklahoma logo (the program has no logo of its own). Get OMES approval before publishing.',
  },
  'or-ora': {
    state: 'OR', org: 'Oregon Resource Association', short: 'ORA',
    program: 'Oregon Forward', website: 'https://oregonresource.org',
    tagline: 'Support · Advocate · Collaborate',
    colors: { primary: '#336699', onPrimary: '#FFFFFF', accent: '#FE9C03', onAccent: '#2C313F', ink: '#336699' },
    fontBody: "'Open Sans'",
    source: 'Sampled from the ORA SVG logo, Oct 2026',
  },
  'pa-uniquesource': {
    state: 'PA', org: 'UniqueSource Products & Services', short: 'UniqueSource',
    program: 'State Use', website: 'https://www.uniquesource.com',
    tagline: 'Creating Employment Opportunities for Pennsylvanians with Disabilities',
    colors: { primary: '#485564', onPrimary: '#FFFFFF', accent: '#CD545B', onAccent: '#FFFFFF', ink: '#485564' },
    source: 'Sampled from the UniqueSource color logo, Oct 2026 (tagline cropped off for the header)',
  },
  'tx-workquest': {
    state: 'TX', org: 'WorkQuest', short: 'WorkQuest',
    program: 'State Use', website: 'https://workquest.com',
    tagline: 'The Right Solution Since 1978',
    colors: { primary: '#006271', onPrimary: '#FFFFFF', accent: '#09293A', onAccent: '#FFFFFF', ink: '#09293A' },
    source: 'Sampled from the WorkQuest header logo, Oct 2026',
  },
  'wi-stateuse': {
    state: 'WI', org: 'Wisconsin State Use Program', short: 'WI State Use',
    program: 'State Use', website: 'https://stateuseprogram.wi.gov',
    tagline: '',
    status: 'pending', wordmark: 'Wisconsin State Use Program',
    colors: NEUTRAL,
    source: 'PENDING: the program has no flat logo (only a site banner). Use the state-approved identity once supplied.',
  },
  'wv-wvarf': {
    state: 'WV', org: 'WVARF', short: 'WVARF',
    program: 'State Use', website: 'https://wvarf.org',
    tagline: 'Putting Success Within Reach',
    colors: { primary: '#11308A', onPrimary: '#FFFFFF', accent: '#FADB74', onAccent: '#11308A', ink: '#11308A' },
    source: 'Sampled from the WVARF logo, Oct 2026 (same navy as the Statewide Synergy app)',
  },
};

for (const [id, b] of Object.entries(BRANDS)) {
  b.id = id;
  b.status = b.status || 'official';
  b.logo = b.status === 'pending' ? null : `/brands/${id}/logo.png`;
  b.icons = {
    192: `/brands/${id}/icon-192.png`,
    512: `/brands/${id}/icon-512.png`,
    maskable: `/brands/${id}/icon-maskable-512.png`,
    apple: `/brands/${id}/apple-touch-icon.png`,
  };
}

export const BRAND_IDS = Object.keys(BRANDS);

export function getBrand(id) {
  return BRANDS[id] || BRANDS['wv-wvarf'];
}
