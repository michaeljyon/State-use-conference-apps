/*
 * ============================================================================
 *  SAMPLE EVENT. Every name, session, speaker, sponsor, room and code word in
 *  this file is placeholder content. Replace it with your own conference.
 * ============================================================================
 *
 * This one file drives the whole app: agenda, people, venue map, sponsors,
 * materials, notifications, surveys, the Connections Challenge and photos.
 * Times are local to `timezone` and written as 'YYYY-MM-DD' + 'HH:MM' (24 h).
 *
 * Text tokens you can use anywhere: {org} brand short name, {orgFull} full
 * name, {program} the state's program name, {event} event short name.
 */

const D1 = '2027-05-18', D2 = '2027-05-19', D3 = '2027-05-20';

export default {
  id: 'sample-2027',            // also names the data store; change it for each new event
  isSample: true,               // shows the "Sample event" ribbon. Set false for a real event.
  brand: 'wv-wvarf',            // default preset; see src/brands/brands.js (VITE_BRAND overrides)

  preview: {
    allowBrandSwitch: true,     // ?brand=ny-nysid previews another preset. Turn off for launch.
    allowTimeTravel: true,      // ?now=2027-05-20T11:35 previews a moment in time. Turn off for launch.
  },

  name: 'Sample State Use Conference 2027',
  shortName: 'State Use 2027',
  edition: 'Annual State Use Conference',
  theme: 'Working Together, Buying With Purpose',
  timezone: 'America/New_York',
  days: [
    { date: D1, label: 'Tue', long: 'Tuesday, May 18' },
    { date: D2, label: 'Wed', long: 'Wednesday, May 19' },
    { date: D3, label: 'Thu', long: 'Thursday, May 20' },
  ],
  dateLabel: 'May 18–20, 2027',
  registrationUrl: 'https://example.org/register',

  welcome:
    'Join nonprofit leaders, state buyers and community partners for two days of learning, connection and celebration. ' +
    'Everything you need is here: the agenda, speakers, sponsors, the venue map and {org} resources.',
  about: [
    '{event} brings together Community Rehabilitation Programs (CRPs), state agency buyers and partners to share what works in {program} contracting.',
    'Sessions cover contracts and operations, sales and marketing, and workforce development, with plenty of time to meet people. An awards dinner on Wednesday honors outstanding partners.',
  ],

  venue: {
    name: 'Lakeside Conference Center',
    address: '100 Sample Way, Anytown, ST 00000',
    mapsQuery: 'Conference Center',
    phone: '(555) 010-0100',
    hotel: { rate: '$179/night conference rate', deadline: 'Book by April 18, 2027', url: 'https://example.org/hotel' },
    parking: 'Free self-parking in the main lot. Accessible spaces at the north entrance.',
    note: 'Most sessions are on the Conference Level, one floor below the lobby.',
  },

  accessibility: [
    { title: 'Mobility', text: 'The conference center is wheelchair accessible throughout. Elevators are beside the main stairs.' },
    { title: 'Reserved seating', text: 'Front-row seats can be held for attendees who are hard of hearing or have low vision. Ask at the registration desk.' },
    { title: 'Service animals', text: 'Welcome throughout the venue.' },
    { title: 'Scent-free', text: 'Please go easy on scented products. Some attendees are sensitive.' },
  ],

  contacts: [
    { label: 'Conference questions', name: 'Sample Organizer', email: 'events@example.org', phone: '(555) 010-0101' },
    { label: 'Registration desk', name: 'Lobby Level, open 7:30 AM daily', phone: '(555) 010-0102' },
  ],

  tracks: [
    { id: 'A', name: 'Track A', label: 'Contracts & Operations' },
    { id: 'B', name: 'Track B', label: 'Sales & Marketing' },
    { id: 'C', name: 'Track C', label: 'Workforce & Inclusion' },
  ],

  // ---------------------------------------------------------------- venue map
  // Simple floor plans drawn from rectangles (viewBox 0 0 400 260).
  // `use`: 'event' = used by this conference, 'other' = rest of the building.
  floorplan: {
    note: 'Sample floor plan. Replace with your venue\'s rooms.',
    levels: [
      {
        id: 'lobby', name: 'Lobby Level', note: 'Entry level. You arrive here.',
        rooms: [
          { id: 'ballroom', name: 'Grand Ballroom', x: 20, y: 20, w: 200, h: 130, use: 'event', what: 'Keynote, plenaries, lunches and the awards dinner', divider: true },
          { id: 'foyer', name: 'Ballroom Foyer', x: 20, y: 160, w: 200, h: 50, use: 'event', what: 'Registration, breakfast and the exhibitor tables' },
          { id: 'lobby', name: 'Main Lobby', x: 235, y: 110, w: 145, h: 100, use: 'other' },
          { id: 'terrace', name: 'Lake Terrace', x: 235, y: 20, w: 145, h: 78, use: 'event', what: 'Tuesday welcome reception' },
          { id: 'restaurant', name: 'Restaurant', x: 20, y: 218, w: 120, h: 32, use: 'other' },
        ],
      },
      {
        id: 'conference', name: 'Conference Level', note: 'One floor down. Take the stairs or elevator from the lobby.',
        rooms: [
          { id: 'birch', name: 'Birch Room', x: 20, y: 20, w: 110, h: 90, use: 'event', what: 'Track A breakouts' },
          { id: 'cedar', name: 'Cedar Room', x: 145, y: 20, w: 110, h: 90, use: 'event', what: 'Track B breakouts' },
          { id: 'maple', name: 'Maple Room', x: 270, y: 20, w: 110, h: 90, use: 'event', what: 'Track C breakouts' },
          { id: 'conf-foyer', name: 'Conference Foyer', x: 20, y: 125, w: 360, h: 50, use: 'event', what: 'Breaks and the Connections Challenge' },
          { id: 'office', name: 'Shared Office', x: 20, y: 190, w: 110, h: 60, use: 'event', what: 'Quiet room for calls. The conference team is here too.' },
          { id: 'storage', name: 'Service', x: 145, y: 190, w: 235, h: 60, use: 'other' },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- people
  // role: 'keynote' | 'speaker' | 'staff'. photo: path under public/, or omit for initials.
  people: [
    { id: 'p1', name: 'Jordan Avery', role: 'keynote', title: 'Executive Director', org: 'Sample State Use Program', bio: 'Sample bio. Jordan has led a statewide central nonprofit agency for twelve years and helped grow contract sales into new service lines. Replace this text with your keynote speaker\'s bio.' },
    { id: 'p2', name: 'Priya Raman', role: 'speaker', title: 'Director of Purchasing', org: 'Sample State Agency', bio: 'Sample bio. Priya manages statewide contracts and works with CRPs to match agency needs with available products and services.' },
    { id: 'p3', name: 'Marcus Bell', role: 'speaker', title: 'Business Development Manager', org: 'Riverbend Industries', bio: 'Sample bio. Marcus builds commercial and government partnerships for a CRP that provides janitorial and document services.' },
    { id: 'p4', name: 'Elena Ortiz', role: 'speaker', title: 'Workforce Programs Lead', org: 'Sample Workforce Board', bio: 'Sample bio. Elena connects apprenticeship funding and training resources to community employers.' },
    { id: 'p5', name: 'Sam Whitfield', role: 'speaker', title: 'Chief Financial Officer', org: 'Northfield Services', bio: 'Sample bio. Sam has guided nonprofits through growth, audits and lean years.' },
    { id: 'p6', name: 'Dana Brooks', role: 'speaker', title: 'Marketing Director', org: 'Summit Works', bio: 'Sample bio. Dana leads brand and outreach for a statewide network of employment programs.' },
    { id: 'p7', name: 'Chris Okafor', role: 'speaker', title: 'Accessibility Consultant', org: 'Open Door Digital', bio: 'Sample bio. Chris helps organizations build websites and documents everyone can use.' },
    { id: 'p8', name: 'Taylor Nguyen', role: 'speaker', title: 'Benefits Counselor', org: 'Sample Benefits Network', bio: 'Sample bio. Taylor helps job seekers understand how work affects their benefits.' },
    { id: 'p9', name: 'Morgan Lee', role: 'speaker', title: 'Operations Director', org: 'Lakeview Enterprises', bio: 'Sample bio. Morgan runs facilities and grounds contracts across five counties.' },
    { id: 'p10', name: 'Riley Grant', role: 'speaker', title: 'Policy Advisor', org: 'Sample Advocacy Group', bio: 'Sample bio. Riley tracks legislation that affects disability employment and nonprofit contracting.' },
    { id: 'p11', name: 'Avery Kim', role: 'speaker', title: 'Employment Specialist', org: 'Hillside Partners', bio: 'Sample bio. Avery places job seekers in competitive integrated employment.' },
    { id: 'p12', name: 'Jamie Castillo', role: 'staff', title: 'Conference Coordinator', org: '{org}', bio: 'Sample bio. Find Jamie at the registration desk or the Shared Office.' },
  ],

  // ---------------------------------------------------------------- agenda
  // type: reception | meal | break | plenary | keynote | breakout | challenge | awards
  sessions: [
    { id: 's1', day: D1, start: '18:30', end: '20:30', type: 'reception', title: 'Welcome Reception', room: 'terrace', description: 'Drinks and light bites by the lake. Come meet people before sessions start.' },

    { id: 's2', day: D2, start: '07:30', end: '08:30', type: 'meal', title: 'Registration & Networking Breakfast', room: 'foyer' },
    { id: 's3', day: D2, start: '08:30', end: '09:45', type: 'keynote', title: 'Keynote: Why {program} Works', room: 'ballroom', speakers: ['p1'], description: 'How State Use contracting creates jobs, delivers quality and saves agencies time. A look at what is working across the country and where programs can grow next.', survey: true,
      materials: [{ title: 'Keynote slides (sample PDF)', file: '/materials/sample-handout.pdf' }] },
    { id: 's4', day: D2, start: '10:00', end: '11:00', type: 'breakout', track: 'A', title: 'What Buyers Wish CRPs Knew', room: 'birch', speakers: ['p2'], description: 'A state purchasing director walks through how agencies find, evaluate and renew {program} contracts.', survey: true },
    { id: 's5', day: D2, start: '10:00', end: '11:00', type: 'breakout', track: 'B', title: 'Strategy to Story: Your Brand and Message', room: 'cedar', speakers: ['p6'], description: 'Turn your strategic plan into a clear message buyers remember.', survey: true,
      materials: [{ title: 'Messaging worksheet (sample PDF)', file: '/materials/sample-handout.pdf' }] },
    { id: 's6', day: D2, start: '10:00', end: '11:00', type: 'breakout', track: 'C', title: 'Apprenticeships for Community Employers', room: 'maple', speakers: ['p4'], description: 'New pathways, funding sources and how to get started.', survey: true },
    { id: 's7', day: D2, start: '11:15', end: '12:15', type: 'breakout', track: 'A', title: 'Beyond Cleaning: Total Facilities Management', room: 'birch', speakers: ['p9'], description: 'Bundling services to win larger, longer contracts.', survey: true },
    { id: 's8', day: D2, start: '11:15', end: '12:15', type: 'breakout', track: 'B', title: 'From Production to Purchase: Growing eCommerce', room: 'cedar', speakers: ['p3'], description: 'Getting products in front of agency and commercial buyers online.', survey: true },
    { id: 's9', day: D2, start: '11:15', end: '12:15', type: 'breakout', track: 'C', title: 'Benefits Counseling and Employment', room: 'maple', speakers: ['p8'], description: 'Helping employees work more without losing the supports they rely on.', survey: true },
    { id: 's10', day: D2, start: '12:15', end: '13:15', type: 'meal', title: 'Buffet Lunch', room: 'ballroom' },
    { id: 's11', day: D2, start: '13:30', end: '14:30', type: 'plenary', title: 'Plenary: An Accessible Digital Front Door', room: 'ballroom', speakers: ['p7'], description: 'Practical steps to make your website, forms and documents work for every visitor.', survey: true },
    { id: 's12', day: D2, start: '14:45', end: '15:45', type: 'breakout', track: 'A', title: 'Cash Is King: Managing Cash Flow', room: 'birch', speakers: ['p5'], description: 'Keeping operations steady when payments lag.', survey: true },
    { id: 's13', day: D2, start: '14:45', end: '15:45', type: 'breakout', track: 'B', title: 'Smart Purchasing for Nonprofits', room: 'cedar', speakers: ['p3', 'p6'], description: 'Group purchasing, discounts and free tools that stretch your budget.', survey: true },
    { id: 's14', day: D2, start: '14:45', end: '15:45', type: 'breakout', track: 'C', title: 'Job Negotiation for Integrated Placements', room: 'maple', speakers: ['p11'], description: 'Working with local employers to create roles that fit.', survey: true },
    { id: 's15', day: D2, start: '15:45', end: '16:15', type: 'break', title: 'Snack Break', room: 'conf-foyer' },
    { id: 's16', day: D2, start: '17:30', end: '20:00', type: 'awards', title: 'Awards Dinner', room: 'ballroom', description: 'Reception at 5:30 PM in the Ballroom Foyer, then dinner and the awards ceremony at 6:30 PM.' },

    { id: 's17', day: D3, start: '07:30', end: '08:30', type: 'meal', title: 'Networking Breakfast', room: 'foyer' },
    { id: 's18', day: D3, start: '08:45', end: '09:45', type: 'plenary', title: 'Legislative Update', room: 'ballroom', speakers: ['p10'], description: 'What changed this session and what to watch next year.', survey: true },
    { id: 's19', day: D3, start: '10:00', end: '11:00', type: 'breakout', track: 'A', title: 'Who\'s Next? Succession Planning', room: 'birch', speakers: ['p5'], description: 'Building a leadership plan before you need one.', survey: true },
    { id: 's20', day: D3, start: '10:00', end: '11:00', type: 'breakout', track: 'B', title: 'Practical AI for Business Development', room: 'cedar', speakers: ['p3'], description: 'Simple AI tools that save time on proposals, research and follow-up.', survey: true },
    { id: 's21', day: D3, start: '10:00', end: '11:00', type: 'breakout', track: 'C', title: 'Hiring Solutions and Disclosure', room: 'maple', speakers: ['p11', 'p8'], description: 'Supporting job seekers through disclosure conversations.', survey: true },
    { id: 's22', day: D3, start: '11:30', end: '12:30', type: 'challenge', title: 'Connections Challenge', room: 'conf-foyer', description: 'A networking game played in the app. Fill squares on your card to earn tickets for the prize drawing.', link: '#/challenge' },
    { id: 's23', day: D3, start: '12:45', end: '14:00', type: 'plenary', title: 'Closing Lunch & Plenary', room: 'ballroom', speakers: ['p2', 'p4'], description: 'A panel on the state of disability employment, plus the prize drawing winner.', survey: true },
  ],

  // ---------------------------------------------------------------- sponsors
  sponsorTiers: [
    { id: 'title', label: 'Title Sponsor', blurb: 'Thank you for making the conference possible.' },
    { id: 'gold', label: 'Gold Sponsors' },
    { id: 'partner', label: 'Community Partners' },
    { id: 'friend', label: 'Friends of the Conference' },
  ],
  // logo: path under public/ (optional; initials are shown without one)
  sponsors: [
    { tier: 'title', name: 'Sample Title Sponsor', blurb: 'Placeholder sponsor. Replace with your title sponsor.', url: 'https://example.org' },
    { tier: 'gold', name: 'Sample Gold Sponsor One', url: 'https://example.org' },
    { tier: 'gold', name: 'Sample Gold Sponsor Two', url: 'https://example.org' },
    { tier: 'partner', name: 'Sample Partner A' },
    { tier: 'partner', name: 'Sample Partner B' },
    { tier: 'partner', name: 'Sample Partner C' },
    { tier: 'friend', name: 'Sample Friend One' },
    { tier: 'friend', name: 'Sample Friend Two' },
  ],
  // Exhibitor tables (also used by the Challenge's code-word squares)
  exhibitors: [
    { name: 'Sample Exhibitor A', where: 'Ballroom Foyer, table 1', blurb: 'Placeholder exhibitor.' },
    { name: 'Sample Exhibitor B', where: 'Ballroom Foyer, table 2', blurb: 'Placeholder exhibitor.' },
  ],

  // ---------------------------------------------------------------- info screen
  resources: [
    { title: 'About {orgFull}', url: '{website}' },
    { title: 'Sample annual report (PDF)', url: '/materials/sample-handout.pdf' },
  ],
  programServices: [
    'Janitorial and facilities services', 'Grounds maintenance', 'Document imaging and secure shredding',
    'Contact center support', 'Temporary staffing', 'Office and safety products',
  ],

  // ---------------------------------------------------------------- notifications
  // Shown in the bell at `at` (local event time). Staff can also send live
  // announcements from the staff screen when the Netlify functions are deployed.
  notifications: [
    { id: 'n-welcome', at: '2027-05-01T09:00', title: 'Welcome to {event}', body: 'Everything you need is in this app: the agenda, speakers, sponsors and venue map. Tap to browse the agenda.', link: '#/agenda' },
    { id: 'n-hotel', at: '2027-04-04T09:00', title: 'Hotel block closes April 18', body: 'The conference rate is held until April 18 or until the block fills. Details on the Venue tab.', link: '#/venue' },
    { id: 'n-reception', at: `${D1}T16:00`, title: 'Welcome reception tonight', body: 'Drinks and light bites on the Lake Terrace from 6:30 PM.', link: '#/session/s1' },
    { id: 'n-tracks', at: `${D2}T09:45`, title: 'Three tracks to choose from', body: 'Breakouts start at 10:00 on the Conference Level. Save the ones you want with ☆.', link: '#/agenda' },
    { id: 'n-awards', at: `${D2}T15:30`, title: 'Awards dinner tonight', body: 'Reception at 5:30 PM in the Ballroom Foyer, dinner at 6:30 PM.', link: '#/session/s16' },
    { id: 'n-feedback-1', at: `${D2}T16:00`, title: 'How were today\'s sessions?', body: 'Take two minutes to rate the sessions you attended.', link: '#/feedback' },
    { id: 'n-challenge', at: `${D3}T11:28`, title: 'The Connections Challenge is on!', body: 'Open your card, fill squares and earn tickets for the prize drawing.', link: '#/challenge', banner: true },
    { id: 'n-turnin', at: `${D3}T12:25`, title: 'Turn in your Challenge card', body: 'Tap "Turn in my card" before 12:40 PM to be in the drawing.', link: '#/challenge' },
    { id: 'n-conf-survey', at: `${D3}T13:45`, title: 'Tell us how the conference went', body: 'Five minutes, every question optional.', link: '#/feedback/conference' },
  ],

  // ---------------------------------------------------------------- Connections Challenge
  challenge: {
    enabled: true,
    name: 'Connections Challenge',
    prize: 'prize basket',
    when: 'Thursday networking hour',
    unlockAt: `${D3}T11:28`,     // card is hidden until this moment
    closeAt: `${D3}T12:40`,      // last moment to turn in a card
    leaderboardOpensAt: `${D3}T11:28`,
    room: 'conf-foyer',
    scoring: { square: 1, line: 2, blackout: 5 },  // tickets
    // Exactly 9 squares (3 x 3, read left to right). type:
    //   code  - code word from a table (case-insensitive)
    //   text  - fill in the field(s)
    //   photo - take or upload a photo (also offered to the photo gallery)
    squares: [
      { id: 'exA', type: 'code', title: 'Visit Sample Exhibitor A', task: 'Stop by the Sample Exhibitor A table and ask what they offer. They\'ll give you the code word.', code: 'SAMPLE', field: 'Code word' },
      { id: 'trade', type: 'text', title: 'Trade a takeaway', task: 'Find someone who went to a session you missed. Ask for the one thing they\'ll use back at work.', fields: ['Their name', 'What they learned'] },
      { id: 'first', type: 'text', title: 'First-timer welcome', task: 'Find someone at their first conference and ask what they\'ve enjoyed most.', fields: ['Their name', 'What they\'ve enjoyed'] },
      { id: 'cross', type: 'text', title: 'Cross the state', task: 'Meet someone from a different kind of organization than yours (a state agency, a CRP, a business or a partner).', fields: ['Their name', 'Their organization'] },
      { id: 'snap', type: 'photo', title: 'Conference snapshot', task: 'Group photo with at least 3 people from 3 different organizations. Big smiles!', fields: ['Who\'s in it? (optional)'] },
      { id: 'buyer', type: 'text', title: 'Meet a buyer', task: 'Find someone who buys for a state agency and ask what they purchase most often.', fields: ['Their name', 'What they buy'] },
      { id: 'exB', type: 'code', title: 'Visit Sample Exhibitor B', task: 'Stop by the Sample Exhibitor B table and learn one way they help members. They\'ll give you the code word.', code: 'PARTNER', field: 'Code word' },
      { id: 'story', type: 'text', title: 'First contract story', task: 'Ask someone how their organization won its first {program} contract.', fields: ['Their name', 'The story, in a sentence'] },
      { id: 'trade2', type: 'text', title: 'Trade another', task: 'Trade takeaways with a second person, from a different session than your first trade.', fields: ['Their name', 'What they learned'] },
    ],
    rules: [
      'One card per person. Your latest turned-in card is the one that counts.',
      'Exhibitor squares need the code word from that table.',
      'Trades must be with people you didn\'t come with.',
      'The winner is drawn at random from all tickets. Must be present or reachable by email.',
    ],
  },

  // ---------------------------------------------------------------- photos
  photos: {
    enabled: true,
    requireApproval: true,       // staff approve photos before they appear in the gallery
    maxPerPerson: 25,
    release: [
      'I took this photo or have the right to share it, and the people in it agreed to be photographed and to have the photo shared.',
      'I give {org} permission to use it, without payment, on its website, social media, newsletters and other materials about the conference and the {program} program, with or without a photo credit.',
      'I won\'t share photos of children without a parent\'s or guardian\'s permission.',
    ],
  },

  // ---------------------------------------------------------------- surveys
  // Question types: stars (1-5), scale (labeled options in a row), choice (pick one),
  // multi (pick any), text, grid (rows rated on shared options), nps (0-10).
  surveys: {
    session: {
      title: 'Session feedback',
      intro: 'Two minutes, and every answer is optional. Your feedback shapes next year\'s sessions.',
      questions: [
        { id: 'overall', type: 'stars', label: 'Overall, how would you rate this session?' },
        { id: 'agree', type: 'grid', label: 'Please rate…', options: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
          rows: [{ id: 'speaker', label: 'The presenter(s) were knowledgeable and engaging.' }, { id: 'organized', label: 'The session was well organized.' }, { id: 'described', label: 'The session matched its description.' }] },
        { id: 'level', type: 'scale', label: 'The content level was…', options: ['Too basic', 'About right', 'Too advanced'] },
        { id: 'useful_role', type: 'scale', label: 'How useful was this session for your role?', options: ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'] },
        { id: 'use', type: 'choice', label: 'Will you put something from this session to use?', options: ['Already planning to', 'Yes, later this year', 'Not sure yet', 'Probably not'] },
        { id: 'most_useful', type: 'text', label: 'What was the most useful thing you took away?' },
        { id: 'more_useful', type: 'text', label: 'What would have made this session more useful to you?' },
        { id: 'more_of', type: 'multi', label: 'Next time, more of… (pick any)', options: ['Practical tools and templates', 'Local examples', 'Contract specifics', 'Funding information', 'Time for questions', 'Peer discussion', 'Hands-on activity'] },
      ],
    },
    conference: {
      title: 'Conference feedback',
      intro: 'About five minutes, and every answer is optional. Tell us what worked and what would make next year better.',
      questions: [
        { id: 'overall', type: 'stars', label: 'Overall, how would you rate {event}?' },
        { id: 'recommend', type: 'nps', label: 'How likely are you to recommend this conference to a colleague?', ends: ['Not at all likely', 'Extremely likely'] },
        { id: 'first_time', type: 'choice', label: 'Was this your first time at this conference?', options: ['Yes', 'No'] },
        { id: 'content', type: 'grid', label: 'Content and relevance', options: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
          rows: [{ id: 'relevant', label: 'The content was relevant to my role.' }, { id: 'ideas', label: 'I\'m leaving with ideas I can use right away.' }, { id: 'speakers', label: 'Speakers were knowledgeable and well prepared.' }] },
        { id: 'tracks', type: 'grid', label: 'How useful was each track you attended?', options: ['Didn\'t attend', 'Not useful', 'Somewhat', 'Very useful'],
          rows: [{ id: 'A', label: 'Track A: Contracts & Operations' }, { id: 'B', label: 'Track B: Sales & Marketing' }, { id: 'C', label: 'Track C: Workforce & Inclusion' }] },
        { id: 'program_value', type: 'scale', label: 'How would you rate the value of {program} participation to your organization right now?', options: ['Low', 'Fair', 'Good', 'Very good', 'Excellent'] },
        { id: 'resources', type: 'multi', label: 'Which {org} resources would you like to hear more about? (pick any)', options: ['New contract opportunities', 'Commodities and eCommerce', 'Training and apprenticeships', 'Legislative updates', 'Compliance and reporting', 'Peer networking', 'Purchasing programs'] },
        { id: 'experience', type: 'grid', label: 'Event experience', options: ['Poor', 'Fair', 'Good', 'Excellent'],
          rows: [{ id: 'registration', label: 'Registration and check-in' }, { id: 'venue', label: 'Venue and meeting rooms' }, { id: 'food', label: 'Meals and breaks' }, { id: 'networking', label: 'Networking opportunities' }, { id: 'app', label: 'This conference app' }] },
        { id: 'next_year', type: 'text', label: 'What topics, tracks or speakers would you like next year?' },
        { id: 'improve', type: 'text', label: 'What one change would most improve next year\'s conference?' },
        { id: 'role', type: 'choice', label: 'Which best describes your role?', options: ['Executive director / CEO', 'Program or operations manager', 'Employment or vocational staff', 'Finance or administration', 'Sales, marketing or business development', 'State agency or government partner', 'Business, vendor or sponsor', 'Other'] },
      ],
    },
  },
};
