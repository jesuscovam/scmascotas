# SC Pets 🐾

**Registro comunitario de mascotas perdidas en San Cristóbal de las Casas, Chiapas.**

> Community-driven missing pet registry for San Cristóbal de las Casas. Report a missing pet in seconds — no account required.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ¿Qué es? / What is it?

SC Pets is an open-source, searchable registry that complements (not replaces) the existing Facebook community group for lost pets in San Cristóbal. Anyone can post a report anonymously. The community can browse, filter, and share listings.

## Stack

- **Frontend:** SvelteKit 5 + TypeScript + Tailwind CSS v4
- **Database:** Neon (serverless Postgres) + Drizzle ORM
- **Storage:** Vercel Blob (pet photos)
- **Hosting:** Vercel
- **Monorepo:** Turborepo + pnpm workspaces

## Packages

| Package | Description |
|---------|-------------|
| `apps/web` | Main SvelteKit app |
| `packages/db` | Drizzle schema + Neon client |
| `packages/services` | Business logic layer |
| `packages/schemas` | Zod validation schemas |
| `packages/ui` | Shared Svelte components |
| `packages/typescript-config` | Shared tsconfig |
| `packages/eslint-config` | Shared ESLint config |
| `packages/tailwind-config` | Shared Tailwind preset |

## Getting Started

```bash
# Clone & install
git clone https://github.com/scpets/scpets
cd scpets
pnpm install

# Set up environment
cp .env.example apps/web/.env
# Fill in DATABASE_URL and BLOB_READ_WRITE_TOKEN

# Run migrations & seed
pnpm --filter @scpets/db db:migrate
pnpm --filter @scpets/db db:seed

# Start dev server
pnpm dev
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All contributions welcome — bug reports, translations, feature ideas, and code.

## License

[MIT](LICENSE)
