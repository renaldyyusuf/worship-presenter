# WorshipPresenter

> Modern church presentation software — lyrics, Bible, stage display, service flow.

Built with **Next.js 15**, **Supabase**, **Socket.io**, **Zustand**, and **TailwindCSS**.

---

## Screenshots

| Control Panel | Output Screen | Stage Display |
|---|---|---|
| `/control` | `/output` | `/stage` |

---

## Features

- 🎵 **Song Library** — CRUD, lyrics editor, section drag-reorder, auto slide generation
- 📖 **Bible Module** — Reference search (`John 3:16`), keyword search, KJV seed included
- 🖥️ **Presentation Output** — Fullscreen with background image/video, text shadow/stroke, cross-fade transitions
- 🎭 **Stage Display** — Confidence monitor with current/next slide, live clock, countdown timer, operator messages
- 📋 **Service Flow** — Drag-drop order, songs + Bible + media + announcements
- 🖼️ **Media Library** — Upload images/video, set as background
- 🎨 **Theme System** — Font, size, alignment, shadow, stroke — reusable templates
- ⌨️ **Keyboard Shortcuts** — `→` next, `←` prev, `B` black, `C` clear, `L` logo, `Esc` normal
- 🔴 **Realtime Sync** — Socket.io keeps output + stage + multiple operators in sync

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Styling | TailwindCSS + shadcn/ui |
| State | Zustand (6 stores) |
| Database | Supabase (PostgreSQL) |
| Realtime | Socket.io |
| Drag & Drop | dnd-kit |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table |
| Icons | Lucide |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/your-org/worship-presenter
cd worship-presenter
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run database migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push schema
supabase db push

# Seed demo songs (optional)
psql "your-connection-string" -f supabase/migrations/002_seed_songs.sql
```

### 5. Seed Bible data (optional but recommended)

```bash
npx tsx scripts/seed-bible.ts
```

This downloads the KJV (public domain) and seeds ~31,000 verses. Takes ~3 minutes.

### 6. Start the server

```bash
npm run dev
```

The custom server starts Next.js + Socket.io on port 3000.

---

## Usage

### Windows to open

| Window | URL | Purpose |
|---|---|---|
| Operator | `/control` | Main dashboard — runs on operator computer |
| Output | `/output` | Project to audience screen (fullscreen) |
| Stage | `/stage` | Confidence monitor — place on stage |

**Tip:** Open `/output` and `/stage` in separate browser windows, drag to the appropriate monitors, and press `F11` for fullscreen.

### Keyboard shortcuts (Operator)

| Key | Action |
|---|---|
| `→` / `Space` / `PageDown` | Next slide |
| `←` / `PageUp` | Previous slide |
| `Home` | First slide |
| `End` | Last slide |
| `B` | Toggle Black screen |
| `C` | Toggle Clear |
| `L` | Toggle Logo |
| `Esc` | Back to Normal |
| `1–9` | Jump to slide N |

### Lyrics format

```
Amazing Grace
John Newton

VERSE 1
Amazing grace how sweet the sound
That saved a wretch like me

CHORUS
My chains are gone I've been set free
My God my Savior has ransomed me

BRIDGE
Name above all names
Worthy of all praise
```

Supported section headers: `VERSE 1`, `CHORUS`, `BRIDGE`, `TAG`, `INTRO`, `OUTRO`, `PRE-CHORUS`, `INSTRUMENTAL`

---

## Project Structure

```
worship-presenter/
├── app/
│   ├── (operator)/          # Auth-protected operator pages
│   │   ├── control/         # Main dashboard
│   │   ├── songs/           # Song library + editor
│   │   ├── bible/           # Bible search
│   │   ├── media/           # Media library
│   │   ├── service/         # Service flow builder
│   │   └── settings/        # Theme + output config
│   ├── (display)/           # No-auth kiosk screens
│   │   ├── output/          # Audience fullscreen
│   │   └── stage/           # Stage confidence monitor
│   └── api/                 # REST API routes
├── components/
│   ├── layout/              # OperatorLayout, Sidebar, BottomBar
│   ├── presentation/        # PresentationCanvas, BackgroundPicker
│   └── shared/              # SocketProvider, ConnectionStatus
├── stores/                  # Zustand stores (6 domains)
├── hooks/                   # useKeyboardShortcuts, useSocketStatus, etc.
├── lib/                     # supabase, socket, lyrics-parser, bible-api
├── types/                   # TypeScript domain types
├── server/                  # Socket.io server setup
├── scripts/                 # seed-bible.ts
└── supabase/migrations/     # SQL schema + seed data
```

---

## Development

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Regenerate Supabase types (after schema changes)
npm run db:types
```

---

## Deployment

### Vercel (recommended)

Note: Socket.io requires a persistent server connection. Use a custom server on a platform that supports WebSockets:

- **Railway** — `npm start` (uses `server.ts`)
- **Render** — Web Service, start command: `npm start`
- **VPS** — Run behind nginx with WebSocket proxy support

```nginx
# nginx WebSocket config
location /api/socket {
  proxy_pass http://localhost:3000;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```

### Environment variables for production

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Roadmap

- [ ] Multi-user auth (Supabase Auth)
- [ ] Per-church multi-tenancy (RLS by org)
- [ ] CCLI SongSelect import
- [ ] Additional Bible translations (NIV, ESV via licensed API)
- [ ] Countdown video overlay
- [ ] Announcement slide builder
- [ ] Service plan PDF export
- [ ] OBS virtual camera integration
- [ ] Mobile app for stage display (PWA)

---

## License

MIT — free for church use.

---

*Built for churches, by people who serve in them.*
