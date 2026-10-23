# Setup guide: State Use Conference App Template

A React + Vite progressive web app (PWA) for State Use conferences, built on the structure of WVARF's *Statewide Synergy* app. It ships with a **sample event** (all placeholder content) and **19 brand presets**, one per State Use program, each using only that program's official logo and colors.

**Screens:** Home · Agenda (with ☆ My schedule) · Session pages · People · Sponsors & exhibitors · Venue map · Info · Materials · Feedback surveys · Photos & gallery · Connections Challenge with live leaderboard · Notifications · Staff tools (prize drawing, photo approval, announcements, CSV exports).

---

## 1. What's in the zip

| Path | What it is |
|---|---|
| `event/event.js` | **The one file you edit for each conference.** Agenda, people, rooms, sponsors, notifications, Challenge squares, surveys. |
| `src/brands/brands.js` | The brand presets (logo path + official colors per program). |
| `public/brands/<id>/` | Each program's official logo (background removed) and app icons. |
| `public/materials/` | Session PDFs. Ships with one sample handout. |
| `netlify/functions/api.mjs` | The server: leaderboard, card turn-in, photos, surveys, announcements, staff tools. Stores data in Netlify Blobs. |
| `netlify/lib/core.mjs` | The server logic itself (shared with local dev). |
| `dev/` | Lets `npm run dev` run the same server locally against a `.data/` folder. |
| `scripts/prepare-logo.py` | Prepares a new official logo (removes the white box, makes icons). |
| `scripts/seed-sample.mjs` | Fills the sample event with demo players, photos and survey answers for testing. |

---

## 2. Try it on your computer (10 minutes)

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. Everything works locally, including the live leaderboard, photo gallery and staff tools.

To see the app with demo activity, leave `npm run dev` running and in a second terminal run:

```bash
npm run seed-sample
```

**Preview tricks** (only while `preview` is on in `event.js`):

- `?now=2027-05-20T11:50` shows the app as it will look at that moment (event time). Use `?now=real` to go back.
- `?brand=ny-nysid` previews another program's preset. The Info screen also has a preset picker.
- Staff tools are at **#/staff**. The local passcode is `demo`.

---

## 3. Make it your conference

Open `event/event.js`. Every section has comments. Work top to bottom:

1. **Identity.** Change `id` (for example `wvarf-2027`). A new `id` gives the event a fresh, empty data store, so reuse never mixes last year's cards or photos in. Set `name`, `shortName`, `edition`, `theme`, `timezone`, `days`, `dateLabel`.
2. **Turn off sample mode.** `isSample: false` removes the "Sample event" ribbon.
3. **Turn off previews before launch.** `preview.allowBrandSwitch: false` and `preview.allowTimeTravel: false`.
4. **Venue.** Name, address, hotel, parking, accessibility notes.
5. **Floor plan.** Each level is a list of rooms drawn as rectangles on a 400 × 260 grid. Rooms marked `use: 'event'` are tappable and highlighted. Session `room` values point at these room `id`s, which powers "Show on map."
6. **People.** `role` is `keynote`, `speaker` or `staff`. For headshots, put square photos in `public/people/` and add `photo: '/people/name.jpg'`. Without one, the app shows initials.
7. **Sessions.** `type` sets the look (keynote, plenary, breakout, meal, break, reception, awards, challenge). `track` links to `tracks`. `survey: true` adds a feedback survey that opens when the session starts. `materials` lists PDFs in `public/materials/`.
8. **Sponsors & exhibitors.** Sponsor logos go in `public/sponsors/` (`logo: '/sponsors/acme.png'`).
9. **Notifications.** Each one appears in the bell at its `at` time. `banner: true` also shows it across the top of the app.
10. **Connections Challenge.** Exactly 9 squares (a 3 × 3 card, read left to right). Square types:
    - `code`: a code word attendees get at an exhibitor table (not case-sensitive)
    - `text`: one or more short answers (`fields`)
    - `photo`: a photo, also offered to the gallery

    `unlockAt` hides the card until that moment; `closeAt` is the last moment to turn in. Scoring defaults to the Synergy rules: **1 ticket per square, 2 per completed line, 5 for a blackout** (a full card = 30 tickets).
11. **Photos.** `requireApproval: true` holds new photos for staff approval before they appear in the gallery. Edit the release wording if your counsel prefers different language.
12. **Surveys.** Question types: `stars`, `scale`, `choice`, `multi`, `text`, `grid`, `nps`. Text can use `{org}`, `{orgFull}`, `{program}` and `{event}`, which fill in from the brand preset.

---

## 4. Pick the brand preset

Set the preset either way:

- In `event/event.js`: `brand: 'wv-wvarf'`
- Or in Netlify as an environment variable: `VITE_BRAND = ny-nysid` (this wins)

| ID | Program | Status |
|---|---|---|
| `ca-sbc` | CA · Signature Business Consulting | Official |
| `ct-alliance` | CT · Connecticut Community Nonprofit Alliance | Official |
| `de-and` | DE · Ability Network of Delaware | Official |
| `fl-respect` | FL · RESPECT of Florida | Official (logo file + brand guide) |
| `ga-geps` | GA · Georgia Enterprises for Products & Services | Official |
| `in-ability` | IN · Ability Indiana | Official |
| `la-eds` | LA · Employment Development Services | Official (low-res logo; ask EDS for a vector) |
| `md-mdworks` | MD · Maryland Works | Official |
| `nv-preferred` | NV · Nevada Preferred Purchase | **Pending**: plain typed name, neutral colors |
| `nj-accses` | NJ · ACCSES New Jersey | Official |
| `nm-horizons` | NM · Horizons of New Mexico | Official |
| `ny-nysid` | NY · NYSID | Official (small logo; ask NYSID for a vector) |
| `ny-nibny` | NY · NIBNY (formerly NYSPSP) | Official |
| `ok-omes` | OK · Oklahoma State Use Program (OMES) | Official State of Oklahoma logo. **Get OMES approval before publishing.** |
| `or-ora` | OR · Oregon Resource Association | Official |
| `pa-uniquesource` | PA · UniqueSource | Official (tagline cropped for the header) |
| `tx-workquest` | TX · WorkQuest | Official |
| `wi-stateuse` | WI · Wisconsin State Use Program | **Pending**: plain typed name, neutral colors |
| `wv-wvarf` | WV · WVARF | Official |

**How the colors are used.** `primary` fills the hero, buttons and active tab with white text (every preset passes 4.5:1 contrast). `accent` is used for ticket counts, the winner card and highlights, always with large text. Headings and links use `ink`. White, light gray and slate text are shared neutrals.

**Updating or adding a preset**

1. Get the program's official logo file (PNG or SVG, ideally from the program).
2. Run `python3 scripts/prepare-logo.py path/to/logo.png <id>`. It removes the flat background behind the logo (never the artwork), trims it and makes the app icons. Add `--crop-bottom-gap` to drop a baked-in tagline.
3. Sample the colors from the logo itself (an eyedropper on the original file, or a palette sampler). Don't eyeball or approximate.
4. Add an entry in `src/brands/brands.js` with `primary`, `onPrimary`, `accent`, `onAccent`, `ink`. Check contrast: white on `primary` must be at least 4.5:1.

For Nevada and Wisconsin, drop in the official files when they arrive, remove `status: 'pending'` and `wordmark`, and add the sampled colors.

---

## 5. Put it online with Netlify

The live features (leaderboard, photo gallery, announcements, staff tools, survey collection) run as a Netlify Function with Netlify Blobs storage. There's no database to set up.

**Recommended: deploy from Git**

1. Put this folder in a GitHub repository.
2. In Netlify: **Add new project → Import an existing project**, pick the repo. The build settings come from `netlify.toml` (build `npm run build`, publish `dist`, functions `netlify/functions`).
3. **Project configuration → Environment variables** (called Site configuration on older accounts), add:
   - `STAFF_PASSCODE`: the passcode for the staff screen (required; staff tools stay off without it)
   - `VITE_BRAND`: optional, to pick the preset without editing `event.js`
4. Deploy. Visit `https://<your-site>/api/health`. It should show `{"ok":true,...}`.

**Or deploy from your computer** with the Netlify CLI: `npm i -g netlify-cli`, then `netlify deploy --build --prod`.

**Drag-and-drop deploys** (dropping the `dist` folder on Netlify) work, but without functions. The agenda, map, materials and Challenge card still work, answers are saved on each phone, and live features say they're off. Use Git or the CLI for the full app.

---

## 6. Before the event

- [ ] `isSample: false`, previews off, real `id`
- [ ] Every session's `room` matches a floor-plan room
- [ ] Challenge `unlockAt` / `closeAt` set, and each exhibitor has its code word
- [ ] `STAFF_PASSCODE` set; staff can open **#/staff**
- [ ] **Rehearse the Challenge**: Staff tools → Drawing → *Turn test mode on*. The card and board open right away. Turn in a few test cards, do a test draw, then *Clear test cards* and *Turn test mode off*.
- [ ] Send yourself a test announcement from Staff tools → Announce, then delete it
- [ ] Print the app QR code (Staff tools → Data, or the Info screen) on table tents and slides
- [ ] Ask presenters for PDFs and add them to `materials`

## 7. During the event

- **Announcements:** Staff tools → Announce. Phones pick them up within a minute. Tick the banner box for anything urgent, like a room change.
- **Photos:** Staff tools → Photos. Approve or hide. Approved photos appear in the gallery within a minute.
- **Prize drawing:** Staff tools → Drawing → **Draw**. Each ticket is one chance. The winner shows on everyone's leaderboard. **Draw again** skips past winners.
- **Updating content** (a room change, a new PDF): edit `event.js`, push or redeploy. Phones update the next time the app opens.

## 8. After the event

Staff tools → Data → download **Survey answers**, **Challenge cards** and **Photo list** as CSV files. Approved photos open full size from the staff Photos tab. For next year, copy the project, change `id`, and you start with a clean data store.

---

## Good to know

- **Phone alerts.** Attendees can tap *Turn on alerts* in the bell. Alerts show while the app is open or was opened recently. Push to fully closed apps (which needs a push service and keys) isn't included.
- **Code words** live in the app's code, the same as in the Synergy app. They keep the game honest at the table, but they aren't secret from a determined developer.
- **Staff passcode** is one shared secret for the team. Change it after the event.
- **Privacy.** The leaderboard shows first name and last initial. Emails on Challenge cards are only in the staff CSV. Survey contact details are only kept when someone ticks *you can contact me*.
- **Accessibility.** 17 px body text, large touch targets, full keyboard support, visible focus outlines, and the live indicator respects *reduce motion*.
- **Fonts.** Archivo and Source Sans 3 by default (the Synergy app's fonts). The RESPECT preset uses Futura where installed, with Roboto. The ORA preset uses Open Sans.

## Troubleshooting

| Problem | Fix |
|---|---|
| Leaderboard says "needs the conference server" | The function isn't deployed. Deploy from Git or the CLI, not drag-and-drop. Check `/api/health`. |
| Staff tools say "Staff tools are off" | Add `STAFF_PASSCODE` in Netlify environment variables, then redeploy. |
| Leaderboard says it opens later | That's `leaderboardOpensAt` / `unlockAt`. Use test mode to rehearse earlier. |
| Changes don't show on a phone | Close and reopen the app; it updates itself in the background. |
| A logo has a white box on color | Re-run `scripts/prepare-logo.py` on the original file. |
| Times look off by an hour | Check `timezone` in `event.js` (for example `America/New_York`). |
