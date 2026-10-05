# 3ASYWEALTH

**Your net worth, finally clear.** · _Il tuo patrimonio, finalmente chiaro._

A small, free utility from [3ASY.APP](https://www.3asy.app): write down what you own and what you owe, see what **your share** is really worth, how it is composed, and keep dated snapshots over time.

No account, no server, no bank connections, no live quotes. Everything runs and stays in your browser.

Live: <https://wealth.3asy.app>

---

## What it does

| Area | What you get |
| --- | --- |
| **Overview** | Net worth, assets, debts and cash at a glance; asset composition (as % of total assets); top holdings; the real date of the last change and the oldest valuation. |
| **Holdings** | Assets and debts in a sortable, searchable, filterable table on desktop and a compact list on phones. Guided add/edit dialog with a live preview of the contribution to net worth. Duplicate, delete with undo. |
| **History** | “Save snapshot” stores an immutable, dated copy of assets, debts, values and exchange rate. Trend chart and difference between snapshots. |
| **What if…?** | Three local simulations — buy something with cash (optionally with explicit financing), revalue an asset, repay a debt — showing cash, assets, debts and net worth before/after. Real data is never touched. |
| **Data** | Full JSON backup and restore, CSV export/import with preview, PDF report, automatic local backups, display currency and manual EUR/USD rate, language, theme, “Hide amounts”. |
| **Demo** | Fictional sample data kept in memory only. Leaving the demo discards it; personal data is never overwritten. |

Languages: Italian, English, Spanish. Light and dark themes. Keyboard and screen-reader friendly; respects reduced motion.

## How the numbers work

All figures — dashboard, table, charts, simulations, snapshots and PDF — come from one pure function, [`summarize`](src/domain/calc.ts).

- **Your share.** For each asset you say whether the amount is *already your share* or *the value of the whole item* plus the percentage you own. The percentage is applied once. Example: a €300,000 home owned 50% counts €150,000; a 10% stake in a company valued €500,000 counts €50,000, and so does entering €50,000 as “already my share”.
- **Debts.** Enter the outstanding principal you personally owe. Linking a debt to an asset is informational only and never subtracts it twice.
- **Net worth** = assets attributed to you − your outstanding debts. It can be negative.
- **Cash (liquidity)** is only the *Cash* category (accounts, cash, deposits). Homes, company stakes and investments are not cash.
- **Composition** percentages are relative to total assets, never to net worth; debts are shown separately.
- **Currencies.** EUR and USD with a **manual** rate (1 EUR = x USD) that you set; it is never presented as a live quote. Changing the display currency does not alter stored amounts. Items that cannot be converted (no rate) are flagged and excluded from totals with a visible warning — never counted as zero.
  Example: with 1 EUR = 1.10 USD, €100 + $110 = €200 or $220.
- **Rounding.** Each item is converted and rounded to the cent once; totals are the sum of those rounded values, so table rows always add up to the totals. Overviews show whole units.
- **Snapshots.** Each snapshot stores its own currency and rate. Shown in another currency, it is converted with *its own* recorded rate, so later rate changes do not rewrite the past. The difference between snapshots includes new items, repayments, revaluations and FX — it is a change in value, **not a financial return**.

## Your data

- Stored in this browser’s `localStorage` as a single versioned document (`3asywealth:data`, `schemaVersion: 2`). It is **not encrypted**; “Hide amounts” is a visual feature only.
- Clearing browser data deletes it. Download a JSON backup regularly.
- If the browser refuses to save (private mode, quota exceeded), the app says so and offers a backup download — it never pretends the save worked.
- Unreadable saved data is never overwritten: the app offers to download it and set it aside.
- Automatic local backups are created before format migrations, replacements, restores and “delete all” (the last few are kept; migration backups are never pruned). Manage them in **Data → Local backups**.

### Upgrading from v1

On first load, v1 data (`wealth-storage`) is copied to a backup key, then migrated:

- the old `value` is treated as already attributed to you, so totals are preserved with the same exchange rate;
- the old free-text ownership is kept as “to review” information and never used to recalculate;
- dates become ISO strings and settings (display currency, rate) are carried over.

v1 JSON exports and v1 CSV files (including the old Italian template headers) can still be imported.

### File formats

**JSON backup** — complete and versioned:

```json
{ "app": "3asywealth", "schemaVersion": 2, "kind": "backup", "savedAt": "…",
  "data": { "assets": [], "liabilities": [], "snapshots": [], "settings": {} } }
```

**CSV** — tabular data for spreadsheets. Exported columns:
`Type, Name, Category, Currency, Amount, Value basis, Ownership %, Valuation date, Linked asset, Notes, Source, Legacy ownership`.

Import accepts `,` `;` or tab separators, quoted fields with multiline notes, EN/IT/ES headers, and local number formats (`1.234,56`, `1,234.56`). Before anything changes you get a preview with per-row errors, duplicate detection and a choice between *add* and *replace*; cancelling changes nothing. Text cells that a spreadsheet could execute as formulas are prefixed with `'` on export.

**PDF** — generated locally with jsPDF as real text and paginated tables (no HTML rendering of user data).

## Development

Requirements: Node.js 20+ and npm. No API keys or environment variables are needed.

```bash
npm ci
npm run dev        # http://localhost:8080
npm run check      # typecheck + lint + tests + production build
```

Individual scripts: `typecheck`, `lint`, `test` (Vitest), `test:watch`, `build`, `preview`.

### Structure

```
src/
  domain/      pure model and maths: types, numbers, calc, scenarios, snapshots, validation & migration, demo
  lib/         storage (localStorage + backups), CSV, import pipeline, report model, PDF, downloads
  stores/      Zustand stores (wealth data, UI dialogs)
  components/  app shell, dialogs, shared UI (shadcn/Radix primitives in components/ui)
  pages/       Overview, Holdings, History, Data
  i18n/        i18next setup and it/en/es locales
```

Tests live next to the code (`*.test.ts`) and cover shares, debts, negative net worth, mixed currencies, locale input, v1 migration, backup round-trips, malformed imports, simulations, snapshot immutability, demo isolation and locale completeness.

## Deployment

The site is static and deployed to **GitHub Pages** by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to `main`, served at `wealth.3asy.app` via [`public/CNAME`](public/CNAME) (base path `/`).

GitHub Pages has no URL rewrites, so deep links such as `/history` would 404 on refresh. The build copies `index.html` to `404.html` (see `spaFallback` in [`vite.config.ts`](vite.config.ts)); Pages serves it for unknown paths and the client router renders the right page. v1 routes (`/assets`, `/summary`, `/about`) redirect to their new homes.

To deploy elsewhere, serve `dist/` and route unknown paths to `index.html`.

## License

MIT © Michele “Miky” Monti — see [LICENSE](LICENSE). Part of [3ASY.APP](https://www.3asy.app).
