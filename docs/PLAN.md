# SC Pets — Missing Pet Registry for San Cristóbal de las Casas

> **Working title.** Final name TBD. Domain candidates: `scmascotas.mx`, `scgatosyperros.mx`, `mascotassc.mx`.

An **open-source**, structured, searchable registry for missing and found pets in San Cristóbal de las Casas, Chiapas. Complements (does not compete with) the existing Facebook group by giving each missing pet a permanent URL with live status, sightings, and contact info — solving the chronological-bumping problem inherent to FB feeds.

The matching algorithm and proximity-scoring model are public and open to community PRs — see [`packages/services/src/matching/README.md`](#11-matching-pipeline).

---

## Table of contents

1. [Problem & positioning](#1-problem--positioning)
2. [Tech stack](#2-tech-stack)
3. [Monorepo architecture](#3-monorepo-architecture)
4. [Architectural conventions](#4-architectural-conventions)
5. [Data model & migrations](#5-data-model--migrations)
6. [API routes & forms](#6-api-routes--forms)
7. [Service layer](#7-service-layer)
8. [UI package & shadcn-svelte](#8-ui-package--shadcn-svelte)
9. [Auth strategy](#9-auth-strategy)
10. [Facebook share integration](#10-facebook-share-integration)
11. [Matching pipeline](#11-matching-pipeline)
12. [UX principles](#12-ux-principles)
13. [Open-source setup](#13-open-source-setup)
14. [Sprint plan](#14-sprint-plan)
15. [Future phases](#15-future-phases)
16. [Open questions](#16-open-questions)
17. [Appendix: useful snippets](#17-appendix-useful-snippets)

---

## 1. Problem & positioning

**The problem.** San Cristóbal has an active Facebook group for missing/found pets. It works, but suffers from three structural flaws:

- **Chronological decay.** Posts about still-missing pets get buried in days.
- **Bump-spam.** Owners comment on their own old posts to surface them again, polluting the feed.
- **No structured data.** No way to filter by neighborhood, species, color, or date. No programmatic way to match a "found" report to an active "missing" entry.

**The positioning.** Not a replacement for the FB group — an *index* underneath it. Every missing pet gets a permanent URL whose status stays current. Users post to the FB group as they always have, but include the link. The link is the living document; the FB post is the flyer.

The pitch to FB group admins, once Sprint 3 is live:

> "Tu publicación en el grupo se entierra en dos días. Si incluyes un link a esta página, la gente puede ver el estado actual sin scrollear 50 comentarios — y si alguien encuentra a la mascota, te aviso automáticamente."

**Why open source.** This project is community infrastructure. Other cities should be able to fork and deploy it. The matching/proximity algorithm — the part that decides whose pet might be whose — should be transparent and reviewable. The repository goes public from commit one. Contributions invited.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Monorepo | **Turborepo** + pnpm workspaces | Pipeline caching, parallel builds, clean package boundaries. Future-proof for the Capacitor app. |
| Framework | **SvelteKit** (SSR) | Full-stack in one app, but mutations go through API routes (`+server.ts`) for reusability with the future mobile/SPA app. |
| Language | **TypeScript** everywhere | Pinned 5.x, strict mode. |
| UI components | **shadcn-svelte** (latest) | Copy-paste components built on bits-ui + Tailwind. Installed into `@scmascotas/ui` package. |
| Styling | **Tailwind CSS v4** | Shared config in `@scmascotas/tailwind-config`. |
| DB | **Neon Postgres** (serverless) | Branchable databases, generous free tier, first-class Drizzle support, designed for Vercel. |
| ORM | **Drizzle** | Type-safe SQL. Pairs natively with better-auth's drizzle adapter. Lives in `@scmascotas/db`. |
| Storage | **Vercel Blob** | Native to Vercel hosting. CDN included. Simple upload API. |
| Auth | **better-auth** | Modern SvelteKit support, drizzle adapter, plugins for passkeys + API keys for future SPA. Framework-agnostic. |
| Forms | **sveltekit-superforms + zod v4** | Same Zod schemas reused on client (validation) and server (API route bodies). |
| Hosting | **Vercel** (hobby tier) | Zero-config SvelteKit deploys. Free tier handles this scale. |
| PWA | **vite-plugin-pwa** | Install banner, offline shell. |
| Maps (client) | **Leaflet 1.9.x** + `svelte-leafletjs` | Smallest, most-vetted JS map library. SSR-safe via dynamic import. MIT. |
| Map tiles | **Stadia Maps** (free tier) → OSM fallback | 200k req/mo free; falls back to `tile.openstreetmap.org` for forks without an API key. |
| Geospatial | **PostGIS** (Neon extension) | `geography(Point, 4326)` columns + `ST_DWithin` for matching. No infra cost on Neon. |
| CI | **GitHub Actions** | Free for public repos. Lint, type-check, test, db-migrate-dry-run on PRs. |
| License | **MIT** | Maximum adoption. (Tradeoff discussion in §13.) |

**Versions to pin (verify at project start):**

- Node 22 LTS
- pnpm 9.x
- Turborepo 2.x
- SvelteKit 2.x latest
- Svelte 5.x (runes mode)
- Tailwind 4.x
- Drizzle ORM latest + drizzle-kit
- @neondatabase/serverless latest
- @vercel/blob latest
- better-auth latest (+ passkey, apiKey plugins)
- sveltekit-superforms latest
- zod 4.x
- Leaflet 1.9.x (Sprint 6)
- `svelte-leafletjs` latest — verify Svelte 5 support at sprint start (Sprint 6)

---

## 3. Monorepo architecture

```
scpets/
├── apps/
│   ├── web/                          # SvelteKit SSR app (the primary deliverable)
│   │   ├── src/
│   │   │   ├── app.html
│   │   │   ├── app.css
│   │   │   ├── hooks.server.ts       # better-auth handler, session population
│   │   │   ├── lib/
│   │   │   │   ├── server/
│   │   │   │   │   ├── auth.ts       # better-auth instance
│   │   │   │   │   └── rate-limit.ts
│   │   │   │   └── client/
│   │   │   │       └── auth-client.ts
│   │   │   └── routes/
│   │   ├── static/
│   │   ├── svelte.config.js
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── mobile/                       # Future: Capacitor + SvelteKit SPA
│       └── (placeholder — Sprint 7+)
│
├── packages/
│   ├── db/                           # @scmascotas/db — schema, migrations, client
│   │   ├── src/
│   │   │   ├── client.ts             # neon serverless driver + drizzle client
│   │   │   ├── schema/
│   │   │   │   ├── pets.ts
│   │   │   │   ├── photos.ts
│   │   │   │   ├── sightings.ts
│   │   │   │   ├── found.ts
│   │   │   │   ├── matches.ts
│   │   │   │   ├── colonias.ts
│   │   │   │   ├── auth.ts           # better-auth tables
│   │   │   │   ├── rate-limits.ts
│   │   │   │   └── index.ts          # barrel export of all tables
│   │   │   └── index.ts              # exports db client + all schema
│   │   ├── migrations/               # generated SQL — commit to git
│   │   │   ├── 0000_initial.sql
│   │   │   ├── 0001_triggers.sql
│   │   │   └── meta/
│   │   ├── scripts/
│   │   │   ├── generate.ts           # drizzle-kit generate wrapper
│   │   │   ├── migrate.ts            # drizzle-kit migrate wrapper
│   │   │   ├── seed.ts               # dev/test seed data (colonias, etc.)
│   │   │   └── studio.ts             # drizzle-kit studio launcher
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   ├── services/                     # @scmascotas/services — business logic
│   │   ├── src/
│   │   │   ├── services/
│   │   │   │   ├── pets.service.ts
│   │   │   │   ├── photos.service.ts
│   │   │   │   ├── sightings.service.ts
│   │   │   │   ├── found.service.ts
│   │   │   │   ├── matches.service.ts
│   │   │   │   └── colonias.service.ts
│   │   │   ├── matching/             # pure scoring logic, easy to test
│   │   │   │   ├── score.ts
│   │   │   │   ├── score.test.ts
│   │   │   │   └── README.md         # community-facing algorithm doc
│   │   │   ├── storage/
│   │   │   │   └── blob.ts           # Vercel Blob wrapper
│   │   │   ├── utils/
│   │   │   │   ├── slug.ts
│   │   │   │   ├── tokens.ts
│   │   │   │   └── whatsapp.ts
│   │   │   └── index.ts
│   │   └── package.json              # depends on @scmascotas/db
│   │
│   ├── schemas/                      # @scmascotas/schemas — shared zod v4 schemas
│   │   ├── src/
│   │   │   ├── pets.ts
│   │   │   ├── sightings.ts
│   │   │   ├── found.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                           # @scmascotas/ui — shadcn-svelte components
│   │   ├── src/lib/                  # `sv create` library layout
│   │   │   ├── components/
│   │   │   │   ├── ui/               # shadcn primitives
│   │   │   │   ├── pet-card.svelte
│   │   │   │   ├── photo-upload.svelte
│   │   │   │   ├── colonia-select.svelte
│   │   │   │   ├── whatsapp-input.svelte
│   │   │   │   ├── share-button.svelte
│   │   │   │   ├── sightings-list.svelte
│   │   │   │   └── match-suggestions.svelte
│   │   │   ├── utils.ts              # cn() helper, etc.
│   │   │   └── index.ts              # public exports
│   │   ├── components.json           # shadcn-svelte config
│   │   ├── svelte.config.js          # for svelte-package
│   │   └── package.json
│   │
│   ├── tailwind-config/
│   ├── eslint-config/
│   └── typescript-config/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # lint, type-check, test
│   │   └── db-migrations-check.yml   # verify migrations apply cleanly
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
│
├── .env.example                      # committed; documents required env
├── .gitignore                        # .env.* (except .example) gitignored
├── LICENSE                           # MIT
├── README.md                         # bilingual, es-MX primary
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

**Package dependency graph:**

```
apps/web
  ├── @scmascotas/ui
  ├── @scmascotas/services
  ├── @scmascotas/schemas
  ├── @scmascotas/db                    (for migration script wiring; runtime via services)
  ├── @scmascotas/tailwind-config
  └── @scmascotas/typescript-config

@scmascotas/services
  ├── @scmascotas/db                    (direct import; services own DB access)
  ├── @scmascotas/schemas
  └── @scmascotas/typescript-config

@scmascotas/db
  └── @scmascotas/typescript-config

@scmascotas/ui
  ├── @scmascotas/tailwind-config
  └── @scmascotas/typescript-config

@scmascotas/schemas
  └── @scmascotas/typescript-config
```

**Why this shape:**

- **`@scmascotas/db` is the schema source of truth.** Tables, migrations, the Drizzle client factory. Other packages import the client and schema from here. Migrations are generated SQL files in `packages/db/migrations/` and they live in git.
- **`@scmascotas/services` imports the db directly** — `import { db, pets } from '@scmascotas/db'`. This is option A from the discussion. Cleaner than passing the db client around. The mobile app doesn't need its own DB connection; it talks to the web app's API routes.
- **`@scmascotas/schemas` is the wire contract.** Same Zod schema validates the form in the browser (via Superforms) and the JSON body of the API route. Single source of truth.
- **`@scmascotas/ui` is presentational only.** No data fetching, no SvelteKit-specific imports. Scaffolded with `sv create` library mode so package.json exports and svelte-package are correctly set up.

---

## 4. Architectural conventions

### 4.1 The five-layer rule

```
┌──────────────────────────────────────────────────────┐
│  ROUTES (apps/web/src/routes/**/*.svelte)            │
│  - UI composition, form orchestration                │
│  - Reads via load functions                          │
│  - Submits to /api routes via fetch + superForm      │
└──────────────────────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────────────┐
│  API ROUTES (apps/web/src/routes/api/**/+server.ts)  │
│  - Parse + validate request (zod schema)             │
│  - Auth check (event.locals.user)                    │
│  - Rate limiting                                     │
│  - Call service methods                              │
│  - NO Drizzle imports, NO raw SQL                    │
└──────────────────────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────────────┐
│  SERVICES (@scmascotas/services)                         │
│  - Class with static methods                         │
│  - Imports db client from @scmascotas/db                 │
│  - Business rules + authorization                    │
│  - Storage operations (Vercel Blob)                  │
└──────────────────────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────────────┐
│  DB CLIENT (@scmascotas/db)                              │
│  - Neon serverless driver + Drizzle                  │
│  - Schema definitions                                │
│  - Migration scripts                                 │
└──────────────────────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────────────┐
│  NEON POSTGRES                                       │
└──────────────────────────────────────────────────────┘
```

### 4.2 Mutations go through API routes, not form actions

The standard SvelteKit pattern is form actions (`+page.server.ts` with an `actions` export). I'm deliberately bypassing that. Reasons:

- The future Capacitor app cannot call form actions — they're SvelteKit-specific. API routes are framework-agnostic JSON over HTTP.
- Superforms supports `+page.server.ts` actions *and* explicit endpoints via SPA mode.
- API routes naturally become the backend the Capacitor app calls. Same auth (via API key sessions), same validation, same services.

**Convention:** All `POST`/`PATCH`/`DELETE` go through `/api/*`. `GET` for reads stays in `+page.server.ts` load functions (faster, cached, no separate hop) — except where the same data is needed by the future SPA, in which case mirror it as an API route too.

### 4.3 Services own the database

Every DB interaction goes through a service class with **static methods**. No instances, no DI container, no magic. Services import the db client directly from `@scmascotas/db`.

```ts
// packages/services/src/services/pets.service.ts
import { db, pets, petPhotos, sightings } from '@scmascotas/db';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateMissingPetInput } from '@scmascotas/schemas';

export class PetsService {
  static async listActive(opts: { /* ... */ } = {}) { /* ... */ }
  static async getBySlug(slug: string) { /* ... */ }
  static async create(input: CreateMissingPetInput, ctx: { userId?: string; ipHash: string }) { /* ... */ }
  static async markReunited(petId: string, ctx: ActorContext) { /* ... */ }
}
```

**Why static methods:** No setup, no constructor, no `new PetsService()` ceremony. Testable in isolation by mocking the db import. If you ever need DI, refactoring is mechanical.

**Authorization in services, not routes.** Service methods take `ctx: { actorUserId?, editToken? }` and decide internally whether the action is permitted. Routes pass through; the service is the source of truth on "can this happen." Business rules can't be bypassed by a new route that forgets the check.

### 4.4 Schemas are the contract

```ts
// packages/schemas/src/pets.ts
import { z } from 'zod';

export const createMissingPetSchema = z.object({
  type: z.enum(['dog', 'cat']),
  name: z.string().trim().max(60).optional(),
  description: z.string().trim().min(20).max(1000),
  colonia: z.string().min(1),
  lastSeenAt: z.coerce.date(),
  primaryColor: z.string().optional(),
  size: z.enum(['chico', 'mediano', 'grande']).optional(),
  approxAge: z.enum(['cachorro', 'adulto', 'viejito']).optional(),
  distinctiveFeatures: z.string().trim().max(500).optional(),
  contactWhatsapp: z.string().regex(/^\+\d{10,15}$/, 'Número WhatsApp inválido'),
  contactName: z.string().trim().max(60).optional(),
  photoIds: z.array(z.string().uuid()).min(1, 'Sube al menos una foto'),
});

export type CreateMissingPetInput = z.infer<typeof createMissingPetSchema>;
```

Photos upload first (separate `/api/uploads/photo` endpoint → Vercel Blob), then their IDs are submitted with the form. Sidesteps multipart-form complexity and gives clean upload progress UX.

---

## 5. Data model & migrations

### 5.1 Schema definitions

Defined in Drizzle inside `@scmascotas/db`. The schema *is* the source of truth for migrations.

```ts
// packages/db/src/schema/pets.ts
import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const petTypeEnum = pgEnum('pet_type', ['dog', 'cat']);
export const petStatusEnum = pgEnum('pet_status', ['missing', 'reunited', 'archived']);

export const pets = pgTable('pets', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),
  type: petTypeEnum('type').notNull(),
  name: text('name'),
  description: text('description').notNull(),
  colonia: text('colonia').notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull(),
  status: petStatusEnum('status').notNull().default('missing'),
  primaryColor: text('primary_color'),
  size: text('size'),
  approxAge: text('approx_age'),
  distinctiveFeatures: text('distinctive_features'),
  contactWhatsapp: text('contact_whatsapp').notNull(),
  contactName: text('contact_name'),
  editToken: text('edit_token').notNull(),
  reporterUserId: uuid('reporter_user_id'),
  reporterIpHash: text('reporter_ip_hash'),
  reunitedAt: timestamp('reunited_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

Tables:

- **`pets`** — missing pets, primary entity.
- **`pet_photos`** — many-to-one with pets. `embedding vector(768)` column reserved (nullable) from Sprint 1 even though it's only populated in Sprint 5.
- **`sightings`** — community-reported sightings. Triggers update `pets.last_seen_at`.
- **`found_reports`** — someone found a pet. Mirror of `pets`.
- **`found_photos`** — same shape as `pet_photos`.
- **`match_results`** — cached pipeline output. `(found_id, pet_id)` unique. `human_verdict` for labeling.
- **`colonias`** — seed list of San Cristóbal neighborhoods.
- **`rate_limits`** — IP-hash + action + window tracking.
- **better-auth tables** — `user`, `session`, `account`, `verification`, `passkey`, `apiKey`. Generated by better-auth CLI from your schema config.

### 5.2 Migration workflow

**Never `drizzle-kit push` against shared databases.** All schema changes go through generate → review → commit → migrate.

Scripts in `packages/db/scripts/`:

```ts
// packages/db/scripts/generate.ts
// Wraps `drizzle-kit generate` — produces a new SQL file in migrations/
```

```ts
// packages/db/scripts/migrate.ts
// Wraps `drizzle-kit migrate` — applies pending SQL files
// Reads DATABASE_URL from env. Used in CI/CD and local dev.
```

```ts
// packages/db/scripts/seed.ts
// Idempotent. Inserts colonias and dev fixtures.
```

```ts
// packages/db/scripts/studio.ts
// Launches drizzle-kit studio on the configured DATABASE_URL.
```

Package.json scripts in `@scmascotas/db`:

```json
{
  "scripts": {
    "db:generate": "tsx scripts/generate.ts",
    "db:migrate": "tsx scripts/migrate.ts",
    "db:seed": "tsx scripts/seed.ts",
    "db:studio": "tsx scripts/studio.ts"
  }
}
```

Wired through Turborepo for monorepo-level commands: `pnpm db:migrate` from root works.

**Branch-per-PR for migrations.** Neon supports DB branching. Recommended workflow:

1. Developer creates a Neon branch off `main`.
2. Develops migration locally against that branch.
3. PR is opened — CI runs `drizzle-kit migrate` against an *ephemeral* branch to verify migrations apply cleanly.
4. After merge, a deploy step migrates production.

This means **no direct push to production DB ever**.

### 5.3 Triggers

Drizzle doesn't manage triggers natively. Hand-roll them in `packages/db/migrations/0001_triggers.sql`:

```sql
-- Bump pets.last_seen_at when a sighting is added
create or replace function bump_last_seen() returns trigger as $$
begin
  update pets
  set last_seen_at = new.created_at, updated_at = now()
  where id = new.pet_id
    and status = 'missing'
    and new.created_at > last_seen_at;
  return new;
end;
$$ language plpgsql security definer;

create trigger sighting_bumps_pet
  after insert on sightings
  for each row execute function bump_last_seen();
```

The migrate script applies all `.sql` files in order — both generated and hand-rolled.

### 5.4 Edit tokens vs auth

Sprint 1 ships with anonymous reporting + edit tokens (lowest-friction adoption). Sprint 2 adds better-auth. Users who reported anonymously can claim their pet by entering the edit token while signed in — `PetsService.claim(petId, { editToken, userId })` ties `reporterUserId` to the auth user.

### 5.5 Spatial data (Sprint 6)

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Two columns added to `pets` and `spotted_pets`:

- `location geography(Point, 4326)` — precise pin location chosen by reporter. NULL allowed for legacy rows pending backfill.
- `location_precision text` (`'precise' | 'colonia' | 'unknown'`) — provenance flag so the UI can show "ubicación aproximada (colonia)" vs "ubicación exacta".

One column added to `colonias`:

- `centroid geography(Point, 4326)` — used for backfilling and as fallback when reporter skips pin-drop.

Spatial GIST index on both `location` columns. Migration `0011_postgis.sql` is hand-rolled (Drizzle doesn't manage PostGIS extension activation). Migration `0012_colonia_centroids.sql` seeds centroids for the existing colonia list (research-derived coordinates committed to git). Migration `0013_backfill_locations.sql` backfills existing `pets` and `spotted_pets` rows to their colonia centroid with `location_precision='colonia'`.

**Privacy rule.** Precise coordinates never leave the server unfiltered. Every public-facing API endpoint that returns coordinates calls `LocationService.fuzz()` first — see §7 / Sprint 6 for the deterministic fuzzing helper.

---

## 6. API routes & forms

### 6.1 Form pattern

Every form uses Superforms in **SPA mode**, submitting JSON to an API route:

```svelte
<!-- apps/web/src/routes/reportar/+page.svelte -->
<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { goto } from '$app/navigation';
  import { createMissingPetSchema } from '@scmascotas/schemas';
  import { Button, Input, Textarea } from '@scmascotas/ui';

  let { data } = $props();

  const { form, errors, enhance, submitting } = superForm(data.form, {
    SPA: true,
    validators: zod4Client(createMissingPetSchema),
    onSubmit: async ({ cancel }) => {
      cancel();
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify($form),
      });
      if (res.ok) {
        const { slug } = await res.json();
        goto(`/exito/${slug}`);
      }
    },
  });
</script>

<form method="POST" use:enhance>
  <!-- fields -->
</form>
```

### 6.2 API routes

```
apps/web/src/routes/api/
├── pets/
│   ├── +server.ts                # POST: create missing pet
│   ├── [id]/
│   │   ├── +server.ts            # PATCH: update; DELETE: archive
│   │   └── reunited/+server.ts   # POST: mark reunited
│   └── [id]/sightings/+server.ts # POST: add sighting
├── found/
│   ├── +server.ts                # POST: create found report + run matching
│   └── [id]/+server.ts           # PATCH: update; DELETE: resolve
├── matches/
│   └── [id]/verdict/+server.ts   # POST: human verdict on a match
├── uploads/
│   └── photo/+server.ts          # POST: photo upload → Vercel Blob → returns photoId
├── colonias/+server.ts           # GET: autocomplete
└── auth/[...all]/+server.ts      # better-auth catch-all (Sprint 2)
```

**API route template:**

```ts
// apps/web/src/routes/api/pets/+server.ts
import { json, error } from '@sveltejs/kit';
import { PetsService } from '@scmascotas/services';
import { createMissingPetSchema } from '@scmascotas/schemas';
import { hashIp, checkRateLimit } from '$lib/server/rate-limit';

export async function POST({ request, locals, getClientAddress }) {
  const body = await request.json();
  const parsed = createMissingPetSchema.safeParse(body);
  if (!parsed.success) throw error(400, { message: 'Invalid input', issues: parsed.error.issues });

  const ipHash = hashIp(getClientAddress());
  const allowed = await checkRateLimit(ipHash, 'pets', 3, 60);
  if (!allowed) throw error(429, 'Demasiados reportes. Intenta más tarde.');

  const { slug, editToken } = await PetsService.create(parsed.data, {
    userId: locals.user?.id,
    ipHash,
  });

  return json({ slug, editToken });
}
```

Notice what's NOT in this route: any Drizzle import, any SQL, any business logic beyond "validate, rate-limit, delegate."

### 6.3 Photo upload route

```ts
// apps/web/src/routes/api/uploads/photo/+server.ts
import { json, error } from '@sveltejs/kit';
import { PhotosService } from '@scmascotas/services';

export async function POST({ request, locals, getClientAddress }) {
  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) throw error(400, 'Missing file');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw error(400, 'Tipo de archivo no soportado');
  }
  if (file.size > 10 * 1024 * 1024) throw error(400, 'Imagen demasiado grande (máx 10MB)');

  const { id, url } = await PhotosService.upload(file, { userId: locals.user?.id });
  return json({ id, url });
}
```

`PhotosService.upload()` handles the Vercel Blob `put()` call and inserts a `pet_photos` row with `pet_id = null` (linked later when the form is submitted).

---

## 7. Service layer

### 7.1 Class structure

```ts
// packages/services/src/services/pets.service.ts
import { db, pets, petPhotos, sightings } from '@scmascotas/db';
import { eq, and, desc, inArray } from 'drizzle-orm';
import type { CreateMissingPetInput } from '@scmascotas/schemas';
import { generateSlug } from '../utils/slug';
import { newEditToken } from '../utils/tokens';

export type ActorContext = {
  actorUserId?: string;
  editToken?: string;
};

export class PetsService {
  static async listActive(opts: {
    colonia?: string;
    type?: 'dog' | 'cat';
    limit?: number;
    offset?: number;
  } = {}) {
    const { limit = 20, offset = 0 } = opts;
    const conditions = [eq(pets.status, 'missing')];
    if (opts.colonia) conditions.push(eq(pets.colonia, opts.colonia));
    if (opts.type) conditions.push(eq(pets.type, opts.type));

    return db
      .select()
      .from(pets)
      .where(and(...conditions))
      .orderBy(desc(pets.lastSeenAt))
      .limit(limit)
      .offset(offset);
  }

  static async getBySlug(slug: string) {
    const [pet] = await db.select().from(pets).where(eq(pets.slug, slug)).limit(1);
    if (!pet) return null;
    const photos = await db.select().from(petPhotos).where(eq(petPhotos.petId, pet.id));
    const recentSightings = await db
      .select()
      .from(sightings)
      .where(eq(sightings.petId, pet.id))
      .orderBy(desc(sightings.createdAt))
      .limit(10);
    return { ...pet, photos, sightings: recentSightings };
  }

  static async create(
    input: CreateMissingPetInput,
    ctx: { userId?: string; ipHash: string }
  ): Promise<{ slug: string; editToken: string }> {
    const slug = generateSlug(input.name, input.type);
    const editToken = newEditToken();

    return db.transaction(async (tx) => {
      const [pet] = await tx.insert(pets).values({
        slug,
        type: input.type,
        name: input.name,
        description: input.description,
        colonia: input.colonia,
        lastSeenAt: input.lastSeenAt,
        primaryColor: input.primaryColor,
        size: input.size,
        approxAge: input.approxAge,
        distinctiveFeatures: input.distinctiveFeatures,
        contactWhatsapp: input.contactWhatsapp,
        contactName: input.contactName,
        editToken,
        reporterUserId: ctx.userId,
        reporterIpHash: ctx.ipHash,
      }).returning();

      await tx.update(petPhotos)
        .set({ petId: pet.id })
        .where(inArray(petPhotos.id, input.photoIds));

      return { slug, editToken };
    });
  }

  static async markReunited(petId: string, ctx: ActorContext) {
    await PetsService.assertCanEdit(petId, ctx);
    await db.update(pets)
      .set({ status: 'reunited', reunitedAt: new Date() })
      .where(eq(pets.id, petId));
  }

  private static async assertCanEdit(petId: string, ctx: ActorContext) {
    const [pet] = await db.select({ reporterUserId: pets.reporterUserId, editToken: pets.editToken })
      .from(pets).where(eq(pets.id, petId)).limit(1);
    if (!pet) throw new Error('NOT_FOUND');
    const isOwner = ctx.actorUserId && pet.reporterUserId === ctx.actorUserId;
    const validToken = ctx.editToken && pet.editToken === ctx.editToken;
    if (!isOwner && !validToken) throw new Error('FORBIDDEN');
  }
}
```

### 7.2 Testability

```ts
// packages/services/src/services/pets.service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { PetsService } from './pets.service';
import { setupTestDb } from '../test-utils';

describe('PetsService', () => {
  beforeEach(setupTestDb);

  it('create() generates unique slug and edit token', async () => {
    const { slug, editToken } = await PetsService.create(validInput, { ipHash: 'x' });
    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(editToken).toHaveLength(24);
  });

  it('markReunited() requires owner or valid token', async () => {
    const { slug } = await PetsService.create(validInput, { ipHash: 'x' });
    const pet = await PetsService.getBySlug(slug);
    await expect(
      PetsService.markReunited(pet!.id, {})
    ).rejects.toThrow('FORBIDDEN');
  });
});
```

Test setup uses a Neon test branch (or pglite for fast unit tests). The matching algorithm tests are pure-function and need no DB at all.

---

## 8. UI package & shadcn-svelte

### 8.1 Setup

Use `sv create` library mode to scaffold `@scmascotas/ui` — it sets up package.json exports, svelte-package, tsconfig correctly:

```bash
cd packages
pnpm dlx sv create ui
# Select: library
# Select: TypeScript, ESLint, Prettier
```

Then add shadcn-svelte inside the package:

```bash
cd packages/ui
pnpm dlx shadcn-svelte@latest init
```

Configure `components.json` to point at the shared Tailwind config and use the lib aliases:

```json
{
  "style": "default",
  "tailwind": {
    "config": "../tailwind-config/tailwind.config.ts",
    "css": "src/app.css",
    "baseColor": "neutral"
  },
  "aliases": {
    "components": "$lib/components",
    "ui": "$lib/components/ui",
    "utils": "$lib/utils"
  }
}
```

Install components:

```bash
cd packages/ui
pnpm dlx shadcn-svelte@latest add button card input textarea select dialog sonner
```

Re-export from `packages/ui/src/lib/index.ts`:

```ts
// Primitives
export * from './components/ui/button';
export * from './components/ui/card';
export * from './components/ui/input';
export * from './components/ui/textarea';
export * from './components/ui/select';
export * from './components/ui/dialog';

// Composed
export { default as PetCard } from './components/pet-card.svelte';
export { default as PhotoUpload } from './components/photo-upload.svelte';
export { default as ColoniaSelect } from './components/colonia-select.svelte';
export { default as WhatsappInput } from './components/whatsapp-input.svelte';
export { default as ShareButton } from './components/share-button.svelte';
export { default as SightingsList } from './components/sightings-list.svelte';
export { default as MatchSuggestions } from './components/match-suggestions.svelte';
```

Use in the app:

```svelte
<script>
  import { Button, PetCard } from '@scmascotas/ui';
</script>
```

> **Note:** shadcn-svelte CLI and `components.json` format change frequently. Verify against https://www.shadcn-svelte.com/docs/installation at session start.

### 8.2 The presentational-only discipline

`@scmascotas/ui` components **must not** import from:

- `$app/*`
- `$env/*`
- `sveltekit-superforms`
- `@scmascotas/services`
- `@scmascotas/db`

Components take data via props and emit user intent via callbacks. The app wraps them and handles routing/forms/data.

```svelte
<!-- packages/ui/src/lib/components/pet-card.svelte -->
<script lang="ts">
  import { Card } from './ui/card';

  type Props = {
    pet: {
      slug: string;
      name: string | null;
      type: 'dog' | 'cat';
      colonia: string;
      lastSeenAt: Date | string;
      photoUrl: string | null;
    };
    onclick?: (slug: string) => void;
  };
  let { pet, onclick }: Props = $props();
</script>

<Card class="cursor-pointer" onclick={() => onclick?.(pet.slug)}>
  <!-- ... -->
</Card>
```

When the Capacitor app comes (Sprint 7+), the same `PetCard` is reused — only the click handler differs.

---

## 9. Auth strategy

### 9.1 Sprint 2 ships full auth foundations

**better-auth** has a plugin model that makes adding auth methods cheap. Sprint 2 lands:

- Email + password
- Social login (Google to start; Facebook later given the audience)
- Passkeys (via `passkey` plugin)
- API key sessions (via `apiKey` plugin) — for the future Capacitor SPA

```ts
// apps/web/src/lib/server/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { passkey } from 'better-auth/plugins/passkey';
import { apiKey } from 'better-auth/plugins/api-key';
import { getRequestEvent } from '$app/server';
import { db } from '@scmascotas/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    passkey({
      rpName: 'SC Pets',
      rpID: process.env.AUTH_RP_ID!,  // e.g. 'scmascotas.mx'
    }),
    apiKey({
      // For future SPA: each user can mint API keys for their mobile app session.
      // The SPA sends them as Authorization: Bearer <key>
      defaultPrefix: 'scp_',
    }),
    sveltekitCookies(getRequestEvent),  // must be last
  ],
});
```

```ts
// apps/web/src/hooks.server.ts
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

export async function handle({ event, resolve }) {
  const session = await auth.api.getSession({ headers: event.request.headers });
  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }
  return svelteKitHandler({ event, resolve, auth, building });
}
```

```ts
// apps/web/src/routes/api/auth/[...all]/+server.ts
import { auth } from '$lib/server/auth';
export const GET = ({ request }) => auth.handler(request);
export const POST = ({ request }) => auth.handler(request);
```

> **Why all three in Sprint 2:** the plugins are config + minor UI work. Passkeys especially are worth shipping early because they're better UX than passwords and we want to encourage their use from day one. API keys cost almost nothing to add and unblock the future SPA — the mobile app authenticates by sending `Authorization: Bearer scp_...` headers to `/api/*`, which better-auth's `apiKey` plugin validates and populates `event.locals.user` from.

### 9.2 The auth gradient

| Action | Anonymous? | Auth required? |
|---|---|---|
| View directory | ✅ | — |
| Report missing pet | ✅ (edit token) | Optional |
| Submit a sighting | ✅ | Optional |
| Mark as reunited (own pet) | ✅ with token | ✅ if signed in |
| Admin moderation | — | ✅ (env-listed emails) |
| Claim past anonymous reports | — | ✅ + token |
| Future SPA queries | — | ✅ via API key |

`PetsService.create()` accepts both `userId` and `ipHash`. If both present, the pet belongs to that user. If only `ipHash`, it's anonymous-with-token.

---

## 10. Facebook share integration

Summary (full reasoning in planning conversation):

- Direct programmatic posting to FB groups via API is dead (Groups API deprecated 2024).
- Use Web Share API (`navigator.share`) as primary path.
- Copy-text + deep-link to FB app (`fb://group/{ID}`) as fallback.
- Big share button on `/exito/[slug]`, `/mascota/[slug]`, `/reunido/[slug]`.

`ShareButton` lives in `@scmascotas/ui`. Pure presentational — takes `pet`, `siteUrl`, `fbGroupId` props.

```svelte
<!-- packages/ui/src/lib/components/share-button.svelte -->
<script lang="ts">
  import { Button } from './ui/button';
  import { Dialog, DialogContent } from './ui/dialog';

  type Props = {
    pet: { slug: string; name: string | null; type: 'dog' | 'cat'; /* ... */ };
    siteUrl: string;
    fbGroupId: string;
  };
  let { pet, siteUrl, fbGroupId }: Props = $props();

  let showFallback = $state(false);

  const text = $derived(buildPostText(pet, siteUrl));
  const url = $derived(`${siteUrl}/mascota/${pet.slug}`);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Perdido: ${pet.name ?? pet.type}`, text, url });
        return;
      } catch (e) { if ((e as Error).name === 'AbortError') return; }
    }
    showFallback = true;
  }
</script>

<Button onclick={share}>Compartir en Facebook</Button>
```

---

## 11. Matching pipeline

The matching algorithm is **the community-facing surface** of this project. It decides when a "found" report should alert the owner of a missing pet, and when an expensive image-embedding lookup should fire. Tuning matters; transparency matters more.

Lives in `@scmascotas/services/src/matching/`. Pure functions, no DB access, easy to test, easy to review in PRs.

### 11.1 Sprint 4 baseline (no images)

```ts
// packages/services/src/matching/score.ts
import type { Pet, FoundReport } from '@scmascotas/db';

const FEATURE_KEYWORDS = [
  'cojea','collar','cicatriz','manchas','blanco','negro','café','gris',
  'orejas','cola','rayado','atigrado','siamés','persa','chiquito','grande',
  'cachorro','viejito','flaco','gordo','peludo','rapado','tuerto','sin'
];

export type MatchBreakdown = {
  time: number;
  colonia: number;
  attributes: number;
  description: number;
  visual: number;    // Sprint 5+
  total: number;
};

export function scoreMatch(found: FoundReport, missing: Pet): MatchBreakdown {
  const daysApart = (+new Date(found.foundAt) - +new Date(missing.lastSeenAt)) / 86_400_000;
  const time = 30 * Math.exp(-Math.max(0, daysApart) / 30);

  const colonia = found.colonia === missing.colonia ? 30 : 0;

  let attributes = 0;
  if (eq(found.primaryColor, missing.primaryColor)) attributes += 5;
  if (eq(found.size, missing.size)) attributes += 5;
  if (eq(found.approxAge, missing.approxAge)) attributes += 5;

  const description = scoreDescriptionOverlap(found, missing);
  const visual = 0;

  return { time, colonia, attributes, description, visual, total: time + colonia + attributes + description + visual };
}
```

**Sprint 6 augmentation: geographic distance.** Once `pets.location` and `spotted_pets.location` are populated, `scoreMatch()` gains a `geo` field:

```ts
// Within 500m: full 20 pts. Linear decay to 0 at 3000m. Beyond 3km: 0.
const geo = distanceMeters <= 500
  ? 20
  : distanceMeters >= 3000
    ? 0
    : 20 * (1 - (distanceMeters - 500) / 2500);
```

Geo augments — does not replace — the colonia score (which remains a useful fallback when `location_precision='colonia'` on both sides). When both reports are `'precise'`, geo carries the weight; when either is `'colonia'`, colonia carries the weight.

### 11.2 Cold → warm → hot lead model

This is the key insight that justifies the architecture: **image embedding is expensive, so we use cheap signals to decide when to fire it.**

```
                ┌──────────────────┐
   FOUND        │  Layer 1: SQL    │   Cheap. Filter by species,
   REPORT  ───▶ │  hard filters    │   active status, time window.
                └────────┬─────────┘   Output: ~5-50 candidates
                         │
                         ▼
                ┌──────────────────┐   Cheap. Time decay, colonia,
                │  Layer 2: score  │   color/size/age, keyword overlap.
                │  (cold → warm)   │   Output: ranked list with scores.
                └────────┬─────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
       score < 30                score ≥ 30
            │                         │
            ▼                         ▼
       discard               ┌──────────────────┐
                             │  Layer 3: image  │   Expensive (Replicate).
                             │  (warm → hot)    │   Only run on warm leads.
                             └────────┬─────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │  Final ranking   │   Combined score.
                             │  + human verdict │   ≥60: notify owner.
                             └──────────────────┘   30-59: show in list.
```

The threshold for "warm enough to be worth embedding" (currently score ≥ 30) is tunable and PR-discussable.

**Sprint 6 addition to Layer 1:** when both the spotted-pet and missing-pet rows have `location_precision='precise'`, the SQL candidate filter adds `ST_DWithin(spotted.location, missing.location, 5000)` (5km radius) before scoring. This cuts the candidate set further when precise locations are available, while keeping the colonia-only fallback path for legacy/unfilled rows.

### 11.3 `packages/services/src/matching/README.md`

This file goes in the repo as the community-facing algorithm doc. Sketch:

```markdown
# Matching algorithm

This document describes how SC Pets decides whether a "found pet" report
might match an active "missing pet" report.

## Goals

- High recall: don't miss reunions.
- High precision: don't spam owners with false hopes.
- Low cost: only run expensive image similarity when cheaper signals
  indicate a warm lead.

## Signals and weights

(table of weights with rationale for each)

## Thresholds

(table of cutoffs with calibration notes)

## How to propose a change

1. Open an issue describing the case the current algorithm gets wrong.
2. Discuss whether the fix is a weight change, new signal, or restructuring.
3. PR includes:
   - Algorithm change with unit tests
   - Before/after scores on a fixture dataset (see `score.fixtures.ts`)
4. Maintainer reviews. Calibration data from production may inform
   acceptance/rejection.

## Current calibration

(populated post-launch with anonymized labeled data — keep updated)
```

### 11.4 Sprint 5: image embeddings

- Enable `pgvector` on Neon (Neon supports it natively).
- Replicate integration via CLIP (`clip-vit-large-patch14` to start).
- Embed on photo upload, async — push results via WebSocket or polling.
- Extend `scoreMatch()` with visual score (up to 30 pts).
- Cosine-similarity SQL in Layer 1 query.

---

## 12. UX principles

1. **Speed of submission > completeness of data.**
2. **Spanish-only, es-MX register.** ("mascota," "perrito," "gatito" — not Spain-Spanish.)
3. **Mobile-first, one-thumb operation.** 44px tap targets.
4. **WhatsApp is the contact protocol.** Every contact CTA is a `wa.me` link with prefilled message.
5. **Photos render fast.** Vercel Blob serves via CDN; client requests appropriate sizes.
6. **Status changes are public events.** Sightings and reunions visible — builds trust.
7. **The "found pet" flow is the killer feature.**
8. **Match results are hints, never conclusions.** "Esta mascota podría ser…" — never "Encontramos."
9. **No dark patterns.** No notification beg, no email harvesting.
10. **Loading states everywhere.** Slow Mexican mobile data is the operating reality.

---

## 13. Open-source setup

### 13.1 License — MIT vs AGPL

**Recommendation: MIT.**

| | MIT | AGPL-3.0 |
|---|---|---|
| Adoption | ✅ Maximum. Companies can use freely. | ⚠️ Some orgs won't touch AGPL. |
| Forks contribute back | ❌ Not required. | ✅ Network-use clause forces source. |
| Forks deploy as SaaS commercially | ✅ Allowed. | ⚠️ Must release modifications. |
| Community-good fit | Good. | Better. |

The argument for AGPL: this is community infrastructure; a corp shouldn't be able to fork it, monetize, and never contribute back. The argument for MIT: nothing about a *missing pets* registry is going to attract that scenario — adoption matters more than legal protection against a hypothetical. **Go MIT** unless you feel strongly otherwise.

### 13.2 Repo structure

Files committed at root from day one:

- `LICENSE` — MIT.
- `README.md` — bilingual (Spanish primary). What the project is, screenshots, "deploy your own", contribution invitation.
- `CONTRIBUTING.md` — how to set up locally, the architectural conventions in §4, PR process.
- `CODE_OF_CONDUCT.md` — Contributor Covenant.
- `SECURITY.md` — how to report vulnerabilities (private email, not GitHub issues).
- `.github/ISSUE_TEMPLATE/` — bug report, feature request, algorithm proposal.
- `.github/pull_request_template.md` — checklist (tests, migration generated, docs updated).
- `.github/workflows/ci.yml` — lint, type-check, test on every PR.
- `.github/workflows/db-migrations-check.yml` — verify migrations apply cleanly against a Neon ephemeral branch.
- `.env.example` — committed.
- `.gitignore` — includes `.env`, `.env.local`, `.env.*.local` (NOT `.env.example`).

### 13.3 Secrets discipline

**`.env.example` is committed and complete.** Every variable the app reads must appear here with a placeholder and a one-line comment explaining what it is and where to get it:

```bash
# .env.example

# Database — get from https://console.neon.tech
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# Storage — get from Vercel project settings → Storage → Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Auth — generate with `openssl rand -hex 32`
BETTER_AUTH_SECRET="..."
AUTH_RP_ID="localhost"  # set to your domain in prod

# Google OAuth — get from https://console.cloud.google.com → APIs & Services → Credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Rate limiting — generate with `openssl rand -hex 32`
RATE_LIMIT_SALT=""

# Facebook share integration
PUBLIC_FB_GROUP_ID=""  # numeric group ID from FB
PUBLIC_SITE_URL="http://localhost:5173"

# Sprint 5+: image embeddings
REPLICATE_API_TOKEN=""

# Sprint 6: maps — get from https://client.stadiamaps.com → API Keys (free tier: 200k req/mo)
PUBLIC_STADIA_MAPS_KEY=""   # empty → falls back to direct OSM tiles

# Admin
ADMIN_EMAILS=""  # comma-separated
```

**Never commit `.env`, never commit secrets to docs.** Pre-commit hook (`husky` + `lint-staged`) runs `git-secrets` or similar to catch leaks.

**Vercel-side:** secrets live in Vercel project env vars. Three environments: Development (local `.env.local`), Preview (PRs get Neon branch + scoped Blob), Production.

### 13.4 README outline (bilingual)

```markdown
# SC Pets

[English below | English abajo]

## Español

Registro de mascotas perdidas y encontradas en San Cristóbal de las Casas.

(screenshots)

### ¿Por qué?

El grupo de Facebook funciona, pero los posts se entierran rápido y no hay
forma estructurada de matchear "encontré un perrito" con "perdí mi perrito".
Esto es un índice complementario al grupo, no un reemplazo.

### Deploy tu propia ciudad

1. Fork este repo
2. (steps...)

### Contribuir

(link to CONTRIBUTING.md)

---

## English

(mirror)
```

### 13.5 Contribution flow

CONTRIBUTING.md covers:

1. Local setup: clone, `pnpm install`, copy `.env.example`, get a free Neon DB, `pnpm db:migrate`, `pnpm dev`.
2. The architectural conventions (link to §4 of this plan, ported to docs).
3. Branch naming, commit conventions (Conventional Commits).
4. PR process: tests, migrations generated (not pushed), docs updated.
5. Areas especially welcome: matching algorithm tuning, colonia list, translations, accessibility.

### 13.6 Algorithm-as-discussion-forum

The matching `README.md` (§11.3) plus an "algorithm proposal" issue template make tuning a structured community activity rather than maintainer-only work.

---

## 14. Sprint plan

Each sprint ≈ one week of focused evening/weekend work (~10-12h). Ship something at the end of each.

### Sprint 0: Open-source setup (~3-4h, before Sprint 1)

**Goal:** Repo exists publicly, contribution-ready scaffolding in place.

- [ ] Create GitHub repo, public, MIT license.
- [ ] Add `README.md` (bilingual stub), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.
- [ ] Add `.github/ISSUE_TEMPLATE/` and `pull_request_template.md`.
- [ ] Init Turborepo with pnpm. Create directory structure from §3.
- [ ] Add `.env.example` with all expected variables.
- [ ] Configure `.gitignore` for env files.
- [ ] Add CI workflow: lint, type-check, test on push and PR.
- [ ] Add pre-commit hook for secret-scanning.

**Deliverable:** Empty but contribution-ready repo.

### Sprint 1: Foundation & barebones report-and-browse

**Goal:** Anyone can report a missing pet anonymously, anyone can browse and see detail pages. No auth, no sightings, no matching.

**Setup:**

- [ ] Wire `@scmascotas/typescript-config`, `@scmascotas/eslint-config`, `@scmascotas/tailwind-config`.
- [ ] Init `@scmascotas/schemas` with zod v4. Add `createMissingPetSchema`.
- [ ] Init `@scmascotas/db`: Drizzle schemas for `pets`, `pet_photos`, `colonias`, `rate_limits`. Add scripts (`db:generate`, `db:migrate`, `db:seed`, `db:studio`).
- [ ] Init `@scmascotas/services` importing from `@scmascotas/db`.
- [ ] Init `@scmascotas/ui` with `sv create` library mode, then shadcn-svelte init. Install button, card, input, textarea, select, dialog.
- [ ] Init `apps/web` SvelteKit app. Wire all packages.
- [ ] Create Neon project + dev branch. Set up Vercel Blob.
- [ ] Run first migration. Seed colonias.
- [ ] Deploy to Vercel with custom domain.

**Service layer:**

- [ ] `PetsService.listActive()`, `getBySlug()`, `create()`.
- [ ] `PhotosService.upload()` (Vercel Blob `put()`, inserts `pet_photos` row).
- [ ] `ColoniasService.list()`.

**API routes:**

- [ ] `POST /api/pets`.
- [ ] `POST /api/uploads/photo`.
- [ ] `GET /api/colonias`.

**UI components:**

- [ ] shadcn primitives.
- [ ] Composed: PetCard, PhotoUpload, ColoniaSelect, WhatsappInput, EditTokenDisplay.

**App routes:**

- [ ] `/`, `/reportar`, `/exito/[slug]`, `/mascota/[slug]`, `/acerca`.

**Deliverable:** Live URL, public repo with deployable code, working report+browse flow.

### Sprint 2: Auth (email/password + social + passkeys + API keys) ✅ — v0.5.0 (2026-05-17)

**Goal:** Sign-in works with multiple methods. Anonymous flow unchanged. SPA-readiness via API keys.

- [x] Add better-auth tables to `@scmascotas/db/schema/auth.ts`. Migrate.
- [x] Configure better-auth with `passkey` and `apiKey` plugins.
- [x] Wire `hooks.server.ts` with session population.
- [x] Add `/api/auth/[...all]/+server.ts`.
- [x] Build `/login`, `/registro`, `/cuenta/passkeys`, `/cuenta/api-keys` pages.
- [x] Add Google OAuth credentials to Vercel env.
- [x] `PetsService.listByUser(userId)`, `PetsService.claim(petId, { editToken, userId })`.
- [x] `/mis-mascotas` dashboard for signed-in users.
- [x] Allow `PetsService.create()` to accept `userId`.
- [x] Document API key usage in CONTRIBUTING.md for future SPA contributors.

**Also shipped in this sprint:**
- [x] Email verification on signup via Resend
- [x] Upstash rate limiting on report, upload, and contact endpoints
- [x] `contact_messages` table + `/api/contact` with email notification
- [x] Contact / suggestions form on landing page
- [x] Redesigned footer with "Hecho con ❤️ desde San Cristóbal de las Casas"
- [x] Alpha banner, "¿Cómo funciona?" landing section
- [x] `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` via static env imports

**Deliverable:** Full auth foundations. Anonymous flow unchanged.

### Sprint 3: Sightings + sharing + edit/reunite ✅ — v0.6.0 (2026-05-24)

**Goal:** Bumping problem solved. Pets get sighting updates. Share-to-Facebook ships.

**Service layer:**

- [x] `SpottedPetsService.listForPet()` — sightings on pet detail page come from `spotted_pets WHERE matched_pet_id = pet.id` (consolidated; `sightings` table kept but inactive).
- [x] `PetsService.markReunited()`, `update()` with authorization.

**API routes:**

- [x] `POST /api/pets/[id]/reunited`, `PATCH /api/pets/[id]`.

**UI components:**

- [x] `SightingsList`, `ShareButton`, `SpeciesPicker` (shared between both report wizards).

**App routes:**

- [x] `/mascota/[slug]/vista`, `/mascota/[slug]/editar`, `/reunido/[slug]`.
- [x] Share button on `/exito`, `/mascota/[slug]`, `/reunido/[slug]`.
- [x] Filters on `/`, `/mascotas`, `/avistamientos` (species + colonia, using `Select` component).

**Also shipped in this sprint:**
- [x] `/mascotas` and `/avistamientos` listing pages with filters
- [x] `mis-avistamientos` dashboard for signed-in users
- [x] Navigation restructure: Mascotas + Avistamientos in top nav; Mi cuenta dropdown
- [x] Species picker step renamed "Especie" and unified across both report wizards
- [x] `Select` component `max-h-64` cap to prevent overflow on long lists

**Deliverable:** Full bumping cycle. Sightings visible. Shareable. Reunited pets celebrated.

### Sprint 4: Structured matching

**Goal:** Killer feature ships. Spotted pet reports surface possible missing-pet matches via cheap structured signals.

**Note:** The "found pet" flow originally planned here shipped in Sprint 3 via `spotted_pets` / `SpottedPetsService` / `/reportar/vi` / `/avistamientos/[slug]`. This sprint is the matching intelligence layer on top.

**Service layer:**

- [x] `SpottedPetsService.create()`, `getBySlug()`, `listAll()`, `listForPet()` — shipped in Sprint 3 (covers `FoundService`).
- [x] `match_results` table — Drizzle schema + migration `0007`. `(spotted_pet_id, pet_id)` composite unique, `score integer`, `human_verdict text`.
- [x] `MatchesService.getMatchesFor(spottedPetId)` — lazy-compute: returns cached rows or scores on first visit.
- [x] `MatchesService.recordVerdict(matchId, verdict)`.
- [x] Pure `scoreMatch(spotted, missing): MatchBreakdown` in `packages/services/src/matching/score.ts` — type(40) + colonia(30) + color(10) + size(10) + recency(10). 11 vitest tests pass.
- [x] Color synonym normalization in `packages/services/src/matching/color-normalize.ts` — group-based Spanish synonyms, accent-stripped. No external deps.
- [x] Published `packages/services/src/matching/README.md` for community discussion.

**API routes:**

- [x] `POST /api/spotted-pets` — covers `POST /api/found` (Sprint 3).
- [x] `POST /api/matches/[id]/verdict` — zod-validated, records `human_verdict` in DB.

**UI components:**

- [x] `MatchSuggestions` (`@scmascotas/ui`) — SVG score ring (r=15.9, circumference≈100), amber gradient header, signal pills (colonia/color/size lit amber when matching), staggered reveals. Color matching mirrors `colorsOverlap()` groups in component.

**App routes:**

- [x] `/reportar/vi` — covers `/encontre` (Sprint 3).
- [x] `/avistamientos/[slug]` — covers `/encontrada/[slug]` (Sprint 3).
- [x] `MatchSuggestions` wired into `/avistamientos/[slug]` detail page — shown only when `status='open'` and `matchedPetId` is null.

**Deliverable:** Spotted pet reports surface possible owners with score breakdown. Community can propose algorithm tweaks via PR. ✅ — v0.7.0

### Sprint 5: Image embeddings (cold→warm→hot)

**Goal:** Image similarity for warm leads. Cost-conscious by design.

- [ ] Enable `pgvector` on Neon.
- [ ] Add `embedding vector(768)` columns to photo tables.
- [ ] Replicate integration.
- [ ] `EmbeddingsService.generate(photoUrl)`.
- [ ] Embed on photo upload, async.
- [ ] Extend `scoreMatch()` with visual score.
- [ ] Re-tune thresholds based on Sprint 4 labeled data.
- [ ] Cost monitoring + alerts.

**Deliverable:** Visual matching for warm leads. Documented cost profile in repo.

### Sprint 6: Maps & geography

**Goal:** Every missing-pet and spotted-pet report carries a precise location. Users browse pets on an interactive map of San Cristóbal. The matching score uses geographic distance as a primary signal. Sharing a pet sends recipients straight into Google Maps with a marker — the way Mexican users actually navigate.

**Why this sprint exists at all:** Mexican users overwhelmingly use Google Maps to get to a place. Shipping v1.0 without that integration reduces every sighting to free-text. Colonia-only granularity is also too coarse — barrios in San Cristóbal can stretch >1km, which both inflates false positives and misses real matches.

**Migrations:**

- [ ] `0011_postgis.sql` — `CREATE EXTENSION IF NOT EXISTS postgis;` + `geography(Point, 4326)` columns on `pets`, `spotted_pets`, `colonias.centroid`. Add `location_precision` enum. Add GIST indexes on both `location` columns.
- [ ] `0012_colonia_centroids.sql` — seed centroids for the existing `colonias` rows (San Cristóbal neighborhoods, coordinates curated and committed).
- [ ] `0013_backfill_locations.sql` — backfill `pets.location` and `spotted_pets.location` from `colonias.centroid` where NULL, setting `location_precision='colonia'`.

**Schemas (`@scmascotas/schemas`):**

- [ ] `latLngSchema` — `{ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }`.
- [ ] Extend `createMissingPetSchema` and `createSpottedPetSchema` with `location: latLngSchema.optional()`. Optional because legacy clients/forks may submit without; service layer falls back to colonia centroid.

**Service layer (`@scmascotas/services`):**

- [ ] `LocationService.fuzz(point, meters=150, seed)` — deterministic per-pet random offset (seeded from pet ID) so the public point stays stable across renders.
- [ ] `LocationService.googleMapsUrl(lat, lng)` and `appleMapsUrl(lat, lng)` — pure helpers, no deps.
- [ ] `PetsService.create()` / `SpottedPetsService.create()` accept `location?: LatLng`. Default to colonia centroid + `location_precision='colonia'` when omitted.
- [ ] `PetsService.listInBounds({ north, south, east, west, status })` — returns pets whose **fuzzed** point falls inside the map viewport. Used by `GET /api/pets/map`.
- [ ] `MatchesService.scoreMatch()` — extend with the `geo` field per §11.
- [ ] `MatchesService` Layer 1 SQL filter — gains `ST_DWithin(...)` when both reports are `location_precision='precise'`.

**API routes:**

- [ ] `GET /api/pets/map?bounds=...&status=missing` — viewport-scoped lookups, returns `{ slug, lat, lng, type, name, photoUrl }[]`. **Returns fuzzed coordinates only.**
- [ ] `GET /api/spotted-pets/map?bounds=...` — same shape for spotted pets.
- [ ] `POST /api/pets` and `POST /api/spotted-pets` accept the new optional `location` field via the extended schemas.

**UI components (`@scmascotas/ui`) — built via the `frontend-design:frontend-design` skill:**

All four components below are produced through dedicated `frontend-design` sessions, not hand-built mid-sprint. The prop contracts here are the *minimum* interface — the skill is free to add polish (loading/empty states, "ubicación aproximada" badges, marker clustering) within them.

- [ ] `LocationPicker.svelte` — draggable marker on a Leaflet map.
  - Props: `initialCenter` (default San Cristóbal `16.7370, -92.6376`), `initialZoom?`, `onLocationChange(latLng)`.
  - Uses dynamic `import('leaflet')` for SSR-safety.
  - Includes "Usar centroide de colonia" fallback button.
  - Design brief: forgiving form step with clear microcopy ("Arrastra el pin al lugar exacto") and obvious feedback when the pin moves.

- [ ] `MapView.svelte` — full-page map.
  - Props: `markers: { slug, lat, lng, type, photoUrl, name? }[]`, `onMarkerClick(slug)`, `tileUrl`, `tileAttribution`, `onBoundsChange?(bounds)`.
  - No data fetching (presentational discipline per §8.2).
  - Design brief: marquee page of v1.0. Dog/cat marker icons distinct from spotted-pet amber pins. Hover-popovers showing pet cards. Graceful "no pets in this area" empty state.

- [ ] `MapPreview.svelte` — small embedded map (~300px) for pet detail pages.
  - Read-only. Shows fuzzed point + "Cómo llegar" CTA.
  - Design brief: visually lightweight so it doesn't dominate the contact card. Bonus: static-image fallback for reduced-motion / no-JS.

- [ ] `OpenInMapsButton.svelte` — single button. Detects iOS via `navigator.platform` → Apple Maps; otherwise Google Maps.
  - Server-renders to the Google Maps URL (works without JS); client-side enhances to swap href for iOS.
  - Design brief: this is the button Mexican users will tap most. Treat as a primary CTA with a clear "Cómo llegar (Google Maps)" label.

When invoking `frontend-design`, hand it the prop contract, the existing `packages/ui/src/lib/components/` directory for style match, the Tailwind config from `@scmascotas/tailwind-config`, and `MatchSuggestions.svelte` as a precedent for the spotted-pet amber palette.

**App routes (`apps/web`):**

- [ ] `/mapa` — full-page map of all active missing pets. Bounded queries as user pans. URL hash sync (`#16.737,-92.638,14z`) for shareability.
- [ ] `/mapa/avistamientos` — same for spotted pets, amber styling.
- [ ] `/reportar` and `/reportar/vi` — add `LocationPicker` step *after* the colonia select. Submission omits `location` if the user skipped pin-drop.
- [ ] `/mascota/[slug]` and `/avistamientos/[slug]` — `MapPreview` block above the contact card. "Cómo llegar (Google Maps)" CTA wired to `OpenInMapsButton`.

**Share & WhatsApp integration:**

- [ ] `ShareButton` — append a Google Maps URL line to the prefilled share text: `📍 Cómo llegar: https://www.google.com/maps?q=16.737,-92.638` (using fuzzed point).
- [ ] `waLink()` helper in `@scmascotas/services/src/utils/whatsapp.ts` — accept optional `location` arg; if provided, append `\n📍 https://www.google.com/maps?q=...` to the message body. Audit call sites (`/mascota/[slug]` contact CTA, spotted-pet "this might be yours" notify) to opt in.

**Tile config (`apps/web/src/lib/client/tiles.ts`):**

- [ ] One module exporting `tileUrl` / `tileAttribution`. Reads `PUBLIC_STADIA_MAPS_KEY` from `$env/static/public`. If empty, falls back to `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` with OSM attribution. Single import point for every map in the app.

**Cost monitoring:**

- [ ] `.env.example` documents Stadia Maps free tier limits.
- [ ] One paragraph in `CONTRIBUTING.md` under "Deploy your own city" explaining the tile-provider choice for forks (default to direct OSM if no key, swap to Stadia Maps for production-grade reliability).

**Verification:**

- [ ] Manual: report a missing pet → confirm pin saved → view on `/mapa` → confirm fuzzed point visible → confirm "Cómo llegar" opens Google Maps app on Android, Apple Maps on iOS.
- [ ] Unit: `LocationService.fuzz()` is deterministic per-id; output stays within 150m of input.
- [ ] Unit: `scoreMatch()` geo signal matches the spec curve (500m=20, 1750m=10, 3000m=0).
- [ ] Integration: existing pets (Sprint 3 era) appear on `/mapa` at their colonia centroid with `location_precision='colonia'` badge visible.
- [ ] Lighthouse mobile pass on `/mapa` — interactive in <3s on slow 3G.

**Out of scope (deferred to future sprints / PRs):**

- Address geocoding / typeahead (Nominatim or Mapbox dependency).
- Heatmaps / marker clustering at scale.
- User-controlled privacy fuzzing radius (ship the 150m default).
- Multi-city geography refactor (still lives in §15).
- Real-time pet location tracking — out of scope forever; this is a registry, not a tracker.

**Deliverable:** Live `/mapa` page. Every report carries lat/lng. Score uses distance. Google Maps deep-linking from every share/contact action. — v0.8.0

### Sprint 7: Polish, PWA, moderation, launch hardening

- [ ] PWA: manifest, install banner, offline shell, app icons.
- [ ] Admin moderation page.
- [ ] Rate-limit hardening.
- [ ] Error tracking (Sentry free tier).
- [ ] Plausible/Umami analytics.
- [ ] Long-term-missing section.
- [ ] `/reunidos` page.
- [ ] Real-device QA on slow 3G.
- [ ] Reach out to FB group admins.

**Deliverable:** Soft launch.

### Buffer sprint 8

- [ ] Bugs from real usage.
- [ ] One post-launch UX issue.
- [ ] Spam/abuse response if needed.

---

## 15. Future phases

- **Push notifications.** Web Push.
- **Capacitor mobile app (`apps/mobile`).** SvelteKit SPA, shares `@scmascotas/ui` + `@scmascotas/schemas`. Auth via better-auth API key plugin.
- **WhatsApp Business API.** Proactive alerts.
- **Multi-city.** Refactor "San Cristóbal" out of assumptions.
- **Bring-your-own LLM key.** Only when AI features land that are per-user.

---

## 16. Open questions

1. **Final name + domain.** Need to pick before Sprint 1's Vercel custom-domain step.
2. **Colonia list completeness.** Authoritative list source — INEGI? Crowdsource from FB group admins?
3. **Anonymous reporting in Sprint 1.** Plan says yes with edit tokens. Revisit if spam surfaces.
4. **Long-term missing cutoff.** 180 days for matching window; keep in directory under "Búsquedas antiguas."
5. **WhatsApp number exposure.** Public on pet page? Or gated behind "Contact owner" button creating `wa.me` link without exposing the number? Recommend: gate it.
6. **FB group admin partnership.** When to reach out — after Sprint 4 launch or after Sprint 6? Recommend: after 5-10 organic users.
7. **Cost alerts.** Neon, Vercel, Vercel Blob, Replicate at 80% of free tier.

---

## 17. Appendix: useful snippets

### Drizzle + Neon client

```ts
// packages/db/src/client.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export * from './schema';
```

### drizzle.config.ts

```ts
// packages/db/drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
  verbose: true,
});
```

### Migration script

```ts
// packages/db/scripts/migrate.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

await migrate(db, { migrationsFolder: './migrations' });
console.log('✅ Migrations applied');
```

### Vercel Blob upload service

```ts
// packages/services/src/storage/blob.ts
import { put } from '@vercel/blob';

export class BlobStorage {
  static async upload(file: File, opts: { folder: 'pets' | 'sightings' | 'found' }) {
    const key = `${opts.folder}/${crypto.randomUUID()}-${file.name}`;
    const blob = await put(key, file, {
      access: 'public',
      addRandomSuffix: false,
    });
    return { url: blob.url, key };
  }
}
```

### Slug, edit token, WhatsApp helpers

```ts
// packages/services/src/utils/slug.ts
const ADJECTIVES = ['valiente', 'curioso', 'peludo', 'pequeño', 'grande', 'tierno'];
const RAND_CHARS = 'abcdefghijkmnpqrstuvwxyz23456789';

export function generateSlug(name: string | null | undefined, type: 'dog' | 'cat'): string {
  const base = name
    ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : `${type === 'dog' ? 'perro' : 'gato'}-${pick(ADJECTIVES)}`;
  const suffix = Array.from({ length: 4 }, () =>
    RAND_CHARS[Math.floor(Math.random() * RAND_CHARS.length)]
  ).join('');
  return `${base}-${suffix}`.slice(0, 60);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
```

```ts
// packages/services/src/utils/tokens.ts
import { randomBytes } from 'node:crypto';
export const newEditToken = () => randomBytes(18).toString('base64url');
```

```ts
// packages/services/src/utils/whatsapp.ts
export function waLink(e164: string, message?: string): string {
  const num = e164.replace(/[^0-9]/g, '');
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function normalizeMxWhatsapp(input: string): string | null {
  const digits = input.replace(/[^0-9]/g, '');
  if (digits.length === 10) return `+52${digits}`;
  if (digits.length === 12 && digits.startsWith('52')) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith('521')) return `+${digits}`;
  return null;
}
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".svelte-kit/**", ".vercel/**", "dist/**"]
    },
    "dev": { "cache": false, "persistent": true },
    "lint": { "dependsOn": ["^lint"] },
    "check": { "dependsOn": ["^check"] },
    "test": { "dependsOn": ["^build"] },
    "db:generate": { "cache": false },
    "db:migrate": { "cache": false },
    "db:seed": { "cache": false }
  }
}
```

### CI workflow starter

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo lint check test
```

---

## Notes for Claude Code session

When you open Claude Code with this plan tomorrow:

1. **Read this whole file before starting.** The conventions in §4 and the OSS posture in §13 shape every decision.
2. **Sprint 0 first.** Public repo, license, contribution scaffolding before any code. Don't write a feature until the repo is shaped to receive contributions.
3. **Verify current docs.** shadcn-svelte, better-auth (especially passkey + apiKey plugins), Neon serverless driver, Vercel Blob — all move fast. Skim before pinning.
4. **Resist scope creep.** Sprint plan is the source of truth on what ships when.
5. **No `drizzle-kit push`, ever.** Always `generate` → review → commit → `migrate`. The SQL files in `packages/db/migrations/` are the audit log of schema history.
6. **No secrets in commits.** `.env.example` is checked in with placeholders; `.env` and `.env.local` are gitignored. Pre-commit hook catches accidents.
7. **No Drizzle imports outside `@scmascotas/db` and `@scmascotas/services`.** If an API route is about to `import { eq } from 'drizzle-orm'`, stop. Add a service method.
8. **No SvelteKit imports in `@scmascotas/ui`.** Props in, events out.
9. **shadcn-svelte CLI runs inside `packages/ui`.**
10. **The matching algorithm's `README.md` is part of the deliverable.** Don't ship Sprint 4 without it — that's the surface community contributors engage with.

Good luck. 🐾
