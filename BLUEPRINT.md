# Eglis Cut Club — Application Blueprint

> Status: **proposal / blueprint** (no code written yet). Built from `Brand.md`, `stitch_eglis_cut_club_digital_experience/` (home, services, book, confirmation screens) and `DESIGN.md`.

## 0. Decisions locked

| Topic | Decision |
|---|---|
| Deliverable | This document first; scaffold after approval |
| Online-bookable services | **Fresh Cut** and **Full Reset** only. Packages (Summer Pass, Beach to Night, Crew) are shown on the site but routed to **Call / Inquire**, not online booking |
| Slot model | **30-minute back-to-back slots** (10:00, 10:30, … 23:30). One booking = one slot. No cleanup buffer for v1 (overrides the 40-min note in Brand.md) |
| Admin v1 | View/manage reservations · Block time & days off · Manage hours/season · Edit services & prices |
| Account required | No. Customers book with name + phone only |
| Payment | At the shop. No online payment, no SMS/email confirmation |
| Languages | English (default), Albanian, Italian |

---

## 1. High-level architecture

**One Next.js application** containing both the public website and the admin panel, with Supabase as the single backend (Postgres + Auth).

```
┌─────────────────────────────────────────────────────────┐
│  Next.js (App Router, TypeScript, Tailwind)              │
│                                                          │
│  Public site  /(site)        Admin  /(admin) [auth gate] │
│  - home, services, book      - dashboard, reservations,  │
│  - confirmation, cancel        availability, settings,   │
│  - i18n en/sq/it               services                  │
│                                                          │
│  Server Actions / Route Handlers  ── call ──▶ Supabase   │
└──────────────────────────────────────────────┬──────────┘
                                                │
                          ┌─────────────────────▼──────────────────┐
                          │ Supabase                                │
                          │  Postgres (RLS + SECURITY DEFINER RPCs) │
                          │  Auth (email/password) for admins       │
                          │  Storage (optional: photos)             │
                          └─────────────────────────────────────────┘
```

### Tech stack
- **Next.js 15** (App Router, React Server Components, Server Actions) + **TypeScript**
- **Tailwind CSS** configured with the exact tokens from `DESIGN.md` (colors, fonts, spacing). Fonts: Chivo, Hanken Grotesk, JetBrains Mono via `next/font`.
- **Supabase**: `@supabase/supabase-js` + `@supabase/ssr` for cookie-based auth.
- **next-intl** for i18n (en/sq/it), English default.
- **zod** for input validation (shared client + server).
- Dates/times handled in the **location timezone** (`Europe/Tirane`) — store `date` + `time` separately, not naive UTC timestamps.
- Hosting target: **Vercel**.

### Why this shape
- Booking correctness (no double-booking) is the highest-risk part, so the atomic insert + validation lives in **Postgres functions**, not app code. The web app calls one RPC and trusts the DB to be the source of truth.
- Server Actions keep the Supabase **service role key server-only**; the browser never sees it.

---

## 2. Routes

### Public — `app/[locale]/(site)/`
| Route | Purpose |
|---|---|
| `/` | Home: hero, quick-info bar, location selection, caravan story, meet Eglis, location/directions, final CTA |
| `/services` | Fresh Cut + Full Reset cards; packages section (Summer Pass / Beach to Night / Crew → "Inquire / Call") |
| `/book` | Booking flow: service → (location) → date → time → name + phone → confirm |
| `/r/[ref]` | Confirmation "ticket" page (screenshot-friendly). Reads `?t=<cancel_token>` to enable Cancel |
| `/locations` | Saranda (book) + Elbasan (info only, "online reservations unavailable") |

Locale prefix: `/en`, `/sq`, `/it`. `/` redirects to detected/default locale.

### Admin — `app/[locale]/(admin)/admin/`
| Route | Purpose |
|---|---|
| `/admin/login` | Supabase email/password sign-in |
| `/admin` | Dashboard: today's schedule per location, counts, quick actions |
| `/admin/reservations` | List/filter by date+location+status; mark done / no-show / cancel |
| `/admin/availability` | Block individual slots or whole days off (per location) |
| `/admin/settings` | Opening hours, Saranda season toggle/months, Elbasan online-booking toggle, shop phone |
| `/admin/services` | CRUD services: name, description, price, duration, active, bookable-online |

`middleware.ts` protects everything under `/admin` (except `/admin/login`) by checking the Supabase session and an admin allowlist.

---

## 3. Data model (Postgres)

```text
locations
  id              uuid pk
  slug            text unique           -- 'saranda' | 'elbasan'
  name            text
  address         text
  landmark        text
  phone           text                  -- tap-to-call
  lat, lng        numeric null
  timezone        text default 'Europe/Tirane'
  opening_time    time default '10:00'
  closing_time    time default '24:00'  -- midnight; last start 23:30
  slot_minutes    int  default 30
  online_booking  bool default true     -- Elbasan = false
  season_months   int[] null            -- Saranda = {6,7,8,9}; null = all year
  active          bool default true
  sort_order      int

services
  id              uuid pk
  slug            text unique
  name            text
  description     text
  price_all       int                   -- 1000, 1500 (no decimals; ALL)
  duration_min    int  default 30
  bookable_online bool default true
  active          bool default true
  sort_order      int

reservations
  id              uuid pk
  public_ref      text unique           -- 'ECC-8942'
  cancel_token    uuid                  -- secret; required to cancel/view
  location_id     uuid fk -> locations
  service_id      uuid fk -> services
  customer_name   text
  phone           text
  res_date        date
  start_time      time
  end_time        time
  price_all       int                   -- snapshot of price at booking time
  status          text  -- 'confirmed' | 'cancelled' | 'done' | 'no_show'
  locale          text
  created_at      timestamptz default now()
  cancelled_at    timestamptz null

  -- THE anti-double-booking guard:
  -- partial unique index on active bookings only
  UNIQUE (location_id, res_date, start_time) WHERE status = 'confirmed'

availability_blocks
  id              uuid pk
  location_id     uuid fk -> locations
  block_date      date
  full_day        bool default false
  start_time      time null             -- used when full_day = false
  end_time        time null
  reason          text null
  created_at      timestamptz

admins                                   -- allowlist mapped to auth.users
  user_id         uuid pk -> auth.users
  email           text
  created_at      timestamptz
```

`public_ref` generated as `ECC-` + random 4 digits, retried on collision. `cancel_token` is a uuid that gates both viewing details and cancelling, so a stranger with only the ref can't see someone's phone.

---

## 4. Booking logic & the slot engine

### Available-slot computation (`get_available_slots(location_slug, service_slug, date)` RPC)
1. Reject if location inactive, `online_booking=false`, or `date` month not in `season_months`.
2. Generate candidate slots from `opening_time` to `closing_time - slot_minutes`, stepping `slot_minutes`.
3. Remove slots already taken by a `confirmed` reservation at that `(location, date, start_time)`.
4. Remove slots covered by `availability_blocks` (full-day or overlapping range).
5. If `date == today` (in `location.timezone`), remove slots whose start is in the past (with a small lead-time buffer, e.g. now + 15 min).
6. Return the remaining list. Empty list ⇒ **"Fully booked"** UI state.

### Create reservation (`create_reservation(...)` RPC, `SECURITY DEFINER`)
Single atomic transaction so two simultaneous bookers can't grab the same slot:
1. Re-run all availability checks server-side (never trust the client's slot list).
2. Snapshot the service price.
3. Generate `public_ref` + `cancel_token`.
4. `INSERT`; the partial unique index rejects a duplicate → caught and returned as a clean **"That slot was just taken"** error so the UI can refresh slots.
5. Return `{ public_ref, cancel_token }`. App redirects to `/r/<ref>?t=<token>`.

### Cancel reservation (`cancel_reservation(ref, token)` RPC)
- Verify `token` matches. Set `status='cancelled'`, `cancelled_at=now()`. Idempotent (cancelling an already-cancelled booking is a no-op success). Brand says cancel anytime, no penalty.

---

## 5. Edge cases (and how each is handled)

| # | Edge case | Handling |
|---|---|---|
| 1 | Two people book the same slot at the same instant | Partial unique index `(location,date,start_time) WHERE confirmed`; loser gets "slot just taken" + auto-refreshed slots |
| 2 | Slot taken between page-load and submit | `create_reservation` re-validates server-side; same error path as #1 |
| 3 | Booking a time earlier today that already passed | Slot engine filters past slots using **location timezone** + lead-time buffer; server re-checks |
| 4 | Whole day fully booked | Empty slot list → "Fully booked for today." + suggested other dates + tap-to-call ("Need help finding a time? Call Eglis.") |
| 5 | Saranda out of season (Oct–May) | Season-month check blocks date selection; show seasonal-closed message |
| 6 | Elbasan booking attempt | `online_booking=false` → location card shows "Online reservations currently unavailable"; no booking entry |
| 7 | Admin blocks a slot/day that already has bookings | Existing confirmed reservations are preserved; only **new** bookings are prevented. Admin sees a warning listing affected reservations |
| 8 | Invalid / fake phone or empty name | `zod` validation client + server; phone normalized to E.164-ish (Albanian +355 default, intl allowed) |
| 9 | Last slot overruns closing time | Last start = `closing_time - slot_minutes` (e.g. 23:30 for midnight close) |
| 10 | Double-submit / network retry on confirm | Submit button disabled during request; idempotency via the unique index; on retry returns existing if same payload |
| 11 | Cancel link shared / brute-forced | `cancel_token` (uuid) required to view full details and to cancel; ref alone is not enough |
| 12 | Cancelling an already-cancelled / past booking | Idempotent success; past bookings still cancellable per brand (no deadline) |
| 13 | DST / timezone drift | All slot math in `Europe/Tirane`; never store naive UTC for the appointment time |
| 14 | Service edited/disabled after a booking exists | `reservations` snapshots `price_all`; disabling a service hides it from `/book` but keeps history intact |
| 15 | Clock skew on "today" | Server (DB `now()` at location TZ) is authoritative, not the browser clock |

---

## 6. Design system → implementation

Tailwind config seeded from `DESIGN.md`:
- **Colors:** `caravan-cream #F2EFE4`, `on-background #1b1c1c` (near-black), `deep-walnut #43342B`, `burnt-earth #C72A00` (accent, CTAs only), `surface #fbf9f9`, plus the full Material token set already in the screens.
- **Type scale:** `display-xl`, `headline-lg`, `subheading`, `body-lg/md`, `label-caps` (mono), `button`. Fonts via `next/font`: Chivo (headlines/buttons), Hanken Grotesk (body), JetBrains Mono (labels/metadata).
- **Shape:** sharp `0px` corners everywhere. **No drop shadows** — depth via 1px/2px borders and the brutalist **hard shadow** (`2px/4px solid offset, no blur`) on floating elements (mobile Book bar, confirmation ticket).
- **Spacing:** 8px baseline; `section-gap 120px`, mobile margin 20px, desktop 64px; 12-col desktop / 4-col mobile grid.
- **Salty divider:** repeated mono dashes / dashed hairline between sections.

### Component inventory (mapped to the screens)
- `TopAppBar` (menu · brand wordmark · location icon) + language switcher
- `MobileBottomNav` (Home / Book / Location / Menu) + persistent **Book a Cut** FAB
- Home: `Hero`, `QuickInfoBar`, `LocationSelectCards`, `CaravanStory`, `MeetEglis`, `FinalCTA`, `Footer`
- Services: `ServiceCard`, `PackageCard` (with "Inquire/Call" CTA for Crew/Summer/Beach-to-Night)
- Book: `Stepper`, `ServiceSelect`, `LocationSummary`, `DateRibbon` (horizontal scroll), `TimeSlotGrid`, `FullyBookedNotice`, `CustomerForm`, sticky `ConfirmReservationBar`
- Confirmation: `ReservationTicket` (screenshot card with ECC ref, client, location, service, date, time, "DUE AT SHOP", ticket-notch styling), `CancelButton`, `CallForAssistance`

### Improvements over the static designs
1. **Fix duration label:** the book screen says "FULL RESET · 45 MIN" — both services are **30 MIN** per the locked decision.
2. **Remove Summer Pass from the bookable list** in `/book` (it's not online-bookable in v1); keep it on `/services` with an Inquire CTA.
3. **Add a real stepper / progress** to the booking page so service→date→time→details feels guided on mobile.
4. **Time grid only appears after a date is chosen**, and swaps to the Fully-Booked notice when empty (the static file hard-codes the booked state).
5. **Language switcher** (en/sq/it) which the static screens don't show.
6. **Accessible** focus states (burnt-earth focus ring per DESIGN.md), tap-to-call as real `tel:` links, `aria` on the slot grid.

---

## 7. Security & access

- **Service role key** used only inside Server Actions / Route Handlers (server-only env). Never shipped to the browser.
- **RLS on** for all tables. Public/anon can: read `locations`, `services` (active only); call the three booking RPCs. Anon cannot directly read `reservations` (prevents harvesting phone numbers) — confirmation page fetches via a server action that requires the `cancel_token`.
- **Admin RPCs/queries** require an authenticated user present in the `admins` allowlist; enforced by RLS + middleware.
- `cancel_token` (uuid) gates viewing and cancelling a reservation.

### Environment variables (to be filled from the Supabase project)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only
NEXT_PUBLIC_SITE_URL=
DEFAULT_LOCALE=en
```

---

## 8. Proposed project structure

```
app/
  [locale]/
    (site)/
      page.tsx                 # home
      services/page.tsx
      book/page.tsx
      r/[ref]/page.tsx         # confirmation + cancel
      locations/page.tsx
    (admin)/
      admin/login/page.tsx
      admin/page.tsx
      admin/reservations/page.tsx
      admin/availability/page.tsx
      admin/settings/page.tsx
      admin/services/page.tsx
  actions/                     # server actions (book, cancel, admin)
components/
  site/  admin/  ui/
lib/
  supabase/{server,client,admin}.ts
  booking/slots.ts             # client-side mirror of slot helpers
  i18n/
messages/{en,sq,it}.json
supabase/
  migrations/0001_init.sql     # tables, indexes, RLS, RPC functions
  seed.sql                     # locations (Saranda, Elbasan), services
middleware.ts                  # admin auth gate + locale
tailwind.config.ts             # DESIGN.md tokens
```

> Note: the repo currently has a minimal `src/index.ts` / `tsconfig.json`. Scaffolding will initialize Next.js and supersede that starter.

---

## 9. Build sequence (after approval)

1. Scaffold Next.js + Tailwind (DESIGN.md tokens) + fonts + i18n skeleton.
2. Supabase migration `0001_init.sql`: tables, partial unique index, RLS, the 3 RPCs; `seed.sql` for locations + services.
3. Supabase clients (server/client/admin) + auth middleware.
4. Public site pages styled to the screens (home, services, locations).
5. Booking flow + slot engine wired to RPCs (the core, with all edge cases).
6. Confirmation + cancel page.
7. Admin: login → reservations → availability → settings → services.
8. i18n strings for en/sq/it.
9. Manual run-through of the edge-case table.

---

## 10. Open / assumed items (flag if any are wrong)

- **Addresses, landmark, exact phone, map coords** for Saranda/Elbasan are `[ADD …]` in Brand.md → placeholders in `seed.sql` until you provide them.
- **Admin accounts**: assuming a small allowlist (Eglis + maybe one more), created in Supabase Auth manually. No self-signup.
- **Photography**: design uses placeholder editorial images; assuming you'll supply real caravan/shop photos (Supabase Storage or `/public`).
- **Crew / Beach-to-Night / Summer Pass**: "Inquire / Call" only in v1, as decided. Can become online flows later.
- **No-show/done** are admin-only status changes; customers only ever see confirmed/cancelled.
```
