# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Coding Standards

Before generating any code, you MUST first read and follow the relevant documentation files in the `docs/` directory. These files define the mandatory coding standards for this project. All generated code must strictly adhere to the standards outlined in those documents.

Current docs:
- `docs/ui.md` — UI component and date formatting standards
- `docs/data-fetching.md` — Data fetching, database queries, and user data isolation

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured yet.

## Architecture

This is a Next.js 16 app using the App Router (`src/app/`), React 19, TypeScript, and Tailwind CSS v4.

- `src/app/layout.tsx` — Root layout with global font and HTML structure
- `src/app/page.tsx` — Home page (entry point)
- `src/app/globals.css` — Global styles with Tailwind directives

Tailwind is configured via PostCSS (`postcss.config.mjs`). There is no separate `tailwind.config` file — Tailwind v4 is configured through CSS.

The `@/*` path alias maps to `./src/*` (e.g., `@/app/page` → `src/app/page`).
