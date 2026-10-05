# Contributing to 3ASYWEALTH

Thanks for helping! 3ASYWEALTH is a small, free, local-first utility. Contributions are welcome under the MIT license.

## Principles

1. **Local only.** Everything runs in the browser. No backend, accounts, analytics, bank connections, live quotes or paid services.
2. **Correct numbers first.** Every figure comes from the pure functions in `src/domain`. Never compute totals inside a component.
3. **Clear, kind product.** Plain language, no judgement about anyone’s wealth, no fake precision (manual exchange rate, estimates are estimates).
4. **Small and maintainable.** Use the existing stack (React, TypeScript, Vite, Tailwind, Radix/shadcn, Zustand, Recharts, i18next, jsPDF) before adding dependencies.

## Getting started

```bash
npm ci
npm run dev      # http://localhost:8080
npm run check    # typecheck + lint + tests + build — run before every PR
```

## Where things live

| Path | Purpose |
| --- | --- |
| `src/domain/` | Pure model and maths (types, number parsing, `summarize`, simulations, snapshots, validation/migration, demo data). No React, no browser APIs. |
| `src/lib/` | Persistence (`storage.ts`), CSV, import pipeline, report model and PDF, downloads. |
| `src/stores/` | Zustand stores. `wealthStore` exposes a factory so tests can use an in-memory storage. |
| `src/components/`, `src/pages/` | Presentation. Read data via selectors (`useWorkspace`, `useSummary`, `useWealth(s => s.x)`), never `useWealth(s => s)`. |
| `src/i18n/locales/` | `it.json` is the master; `en.json` and `es.json` must have the same keys. Italian and Spanish need `_one`, `_many` and `_other` plural forms. |

## Changing the data model

- Bump `SCHEMA_VERSION` in `src/domain/types.ts` and extend `readDocument` in `src/domain/validate.ts` to migrate older documents.
- Never drop user data silently: invalid records must be reported (`Issue`) and a backup must exist before anything is rewritten.
- Add tests showing that totals are preserved across the migration.

## Tests

Vitest, next to the code (`*.test.ts`). Please add assertions for any behaviour you change — especially calculations, import/export and persistence. The locale test fails if a key used in the code is missing from any language.

## Pull requests

- Keep PRs focused; open an issue first for larger ideas.
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).
- Check both themes, all three languages, and a phone-sized viewport for UI changes.
