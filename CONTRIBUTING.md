# Contributing to SC Mascotas

Thanks for your interest in contributing! This project is for the San Cristóbal de las Casas community and improves thanks to people like you.

## Ways to Contribute

- **Bug reports** — open a GitHub issue
- **Feature suggestions** — open a GitHub issue with the `enhancement` label
- **Code** — open a pull request (see below)
- **Translations** — the UI is in Spanish but we welcome PRs for other languages

## Development Setup

1. Fork and clone the repo
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `apps/web/.env` and fill in the values
4. Run migrations: `pnpm --filter @scmascotas/db db:migrate`
5. Seed data: `pnpm --filter @scmascotas/db db:seed`
6. Start dev server: `pnpm dev`

## Pull Request Process

1. Branch from `main`: `git checkout -b feat/your-feature`
2. Keep PRs focused — one feature or fix per PR
3. Make sure `pnpm turbo lint check-types` passes
4. Describe _why_ the change is needed, not just what it does
5. Request review — at least one approval required to merge

## Code Style

- TypeScript everywhere
- No comments explaining _what_ the code does — only _why_ when non-obvious
- No half-finished features — if it's not ready, it shouldn't be in `main`
- Follow the existing five-layer architecture: Routes → API Routes → Services → DB → Postgres

## Commit Messages

Use conventional commits:

- `feat:` new feature
- `fix:` bug fix
- `chore:` tooling, deps, config
- `docs:` documentation only

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Be kind.
