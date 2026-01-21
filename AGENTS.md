# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the Astro app: `components/`, `layouts/`, `pages/` (routes), `support/` utilities, and `images/`.
- `src/content/` stores content collections, including `posts/`, `categories/`, and `friends/`.
- `public/` contains static assets served as-is (favicons, robots.txt, etc.).
- `scripts/` contains maintenance helpers like `db_to_md.js` and `image.js`.
- Root config files include `astro.config.mjs`, `tailwind.config.js`, `tsconfig.json`, and `eslint.config.js`.

## Build, Test, and Development Commands
- `pnpm install`: Install dependencies (recommended by the README).
- `pnpm run dev`: Start the Astro dev server with HMR.
- `pnpm run build`: Build the production static site.
- `pnpm run preview`: Serve the production build locally.
- `pnpm run lint`: Run ESLint across the repo.
- `pnpm run lint:fix`: Auto-fix lint issues where possible.

## Coding Style & Naming Conventions
- Indentation is 4 spaces with LF line endings (`.editorconfig`).
- ESLint uses the `@antfu` config; prefer single quotes and 1TBS braces.
- Astro + TypeScript + React are enabled; keep components small and colocate styles where practical.
- Content lives in `src/content/*`; keep file names readable and ensure frontmatter stays consistent with collection schemas.

## Testing Guidelines
- No automated tests are present in this repo.
- Use `pnpm run lint` and `pnpm run build` as the minimum quality gates.
- For UI changes, verify pages manually via `pnpm run dev` or `pnpm run preview`.

## Commit & Pull Request Guidelines
- Recent Git history uses very short messages (e.g., `w`) with no clear convention.
- Prefer concise, imperative commit messages that describe the change (e.g., “Add timeline layout”).
- PRs should include a brief summary, list of key changes, and screenshots for visual updates.

## Configuration & Secrets
- Review `.env.example` before introducing new environment variables.
- Do not commit secrets; keep local values in `.env`.
- Site-level settings are centralized in `src/config.ts`.
