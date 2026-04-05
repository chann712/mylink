# GEMINI.md - Project Context and Instructions

This file provides foundational mandates and context for Gemini CLI interactions within the `my-link` repository.

## Project Overview

The `my-link` repository is a monorepo-style structure containing a personal profile application in the `my-profile` directory.

- **Main Application:** `my-profile` (Next.js 16.2.1)
- **Frameworks/Libraries:**
    - **React:** 19.2.4
    - **Next.js:** 16.2.1 (App Router)
    - **Styling:** Tailwind CSS 4 (`@tailwindcss/postcss`)
    - **Language:** TypeScript 5
- **Purpose:** A profile/link sharing site bootstrapped with `create-next-app`.

## Building and Running

Commands should be executed within the `my-profile` directory:

- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Production Start:** `npm run start`
- **Linting:** `npm run lint`

## Architecture and Structure

- **App Router:** The application follows the Next.js App Router pattern located in `my-profile/app/`.
- **Public Assets:** Static files are located in `my-profile/public/`.
- **Styling:** Global styles are defined in `my-profile/app/globals.css`, utilizing Tailwind CSS 4.
- **Configuration:**
    - `my-profile/next.config.ts`
    - `my-profile/tsconfig.json`
    - `my-profile/eslint.config.mjs`
    - `my-profile/postcss.config.mjs`

## Important Mandates (from AGENTS.md)

**CRITICAL: Next.js 16 Breaking Changes**
Next.js 16.2.1 in this project contains breaking changes compared to previous versions (v15 and earlier). APIs, conventions, and file structures may differ from standard training data.

- **Action required:** Before making significant architectural changes or writing new components, refer to the documentation in `my-profile/node_modules/next/dist/docs/`.
- **Linting:** Always run `npm run lint` after changes to ensure compatibility with Next.js 16 rules.

## Development Conventions

- **Surgical Updates:** When modifying files, maintain existing patterns and styles.
- **TypeScript:** Strict mode is enabled. Do not bypass the type system.
- **ESLint:** The project uses Flat Config (`eslint.config.mjs`).
- **Tests:** No testing framework (like Jest or Vitest) is explicitly configured yet. Any new features should include a plan for verification.

## Future Plans (TODO)
- [ ] Consolidate root `README.md` and `my-profile/README.md`.
- [ ] Add unit and E2E testing.
- [ ] Implement actual profile links and data.
