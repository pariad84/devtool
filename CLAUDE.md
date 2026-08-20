# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Install dependencies: `npm install`
- Run the server: `node server.js` (listens on `http://127.0.0.1:3000`; there is no `npm start` script)
- Check server + DB connectivity: `curl http://127.0.0.1:3000/api/db/health`
- No test suite or linter is configured — `npm test` is a placeholder that just exits with an error.
- `.env` (gitignored) must exist with `DATABASE_URL` for `db.js`/`server.js` to connect to Postgres — copy `.env.example` and fill in real values. Special characters in the password (`@`, `#`, etc.) must be percent-encoded or the connection string fails to parse and crashes the server on the first DB-touching request.
- Schema changes are plain, hand-numbered SQL files in `sql/` (`001_create_memo.sql`, `002_create_bookmark.sql`, `003_create_resource.sql`, `004_create_entry_tables.sql`) — there is no migration runner. Apply a file by hand, e.g.:
  ```
  node -e "require('dotenv').config(); const {Pool}=require('pg'); const fs=require('fs'); const pool=new Pool({connectionString:process.env.DATABASE_URL}); pool.query(fs.readFileSync('sql/00X_xxx.sql','utf8')).then(()=>pool.end())"
  ```
- The original per-resource typed-column tables (`memo`, `bookmark`) were migrated into `memo_entry`/`bookmark_entry` and dropped — the DB only has `resource`, `memo_entry`, `bookmark_entry` now. `sql/001_create_memo.sql`/`002_create_bookmark.sql` are kept as historical record of that earlier design, not as tables to recreate.

## Terminology

These four terms are used precisely and distinctly — don't use them interchangeably:

- **Screen** — the popup a DevTool menu item opens (a list + a detail/form). A pure frontend concept; not a DB table.
- **Resource** — metadata *describing* a screen: one row in the `resource` table (`name`, `resource_key`, `fields`). `GET /api/resource` returns these.
- **Field** — one attribute definition inside a resource's `fields` array (e.g. memo's `content`). Not a physical DB column.
- **Entry** — one actual data record belonging to a resource (a specific memo, a specific bookmark). Lives in `{resource_key}_entry`, served by `GET/POST/PUT /api/:resourceKey`.

This is why the frontend has two separate client helpers: `fn.ajax` (generic HTTP) and `fn.data.select/insert/update` (entry CRUD specifically) — it's named `fn.data`, not `fn.resource`, because it operates on entries; "resource" is reserved for the definition/metadata layer.

## Architecture

**Server (`server.js`)** is a thin Express bootstrap: middleware, the `/api/db/health` route, mounting `routes/resource.js` at `/api`, then static file serving (`express.static(viewsDir)` then `express.static(publicDir)` — `.html` lives in `views/`, everything else — CSS/JS — in `public/`), then a 404 handler. `express.json()` handles body parsing. Route logic that isn't a one-off lives under `routes/`, not in `server.js` itself.

**Database** (`db.js`) exports a single `pg` `Pool`, configured from `DATABASE_URL` (or individual `PG*` vars) via `dotenv`.

**Resource / entry data model** — this is the core design to understand before touching data:
- `resource` is a metadata table: one row per "kind of thing" the DevTool menu manages (`id`, `name` — display label, `resource_key` — e.g. `'memo'`, `fields` — a JSONB array of field definitions, each shaped `{ name, label, list: {width, dataType, inputType}, form: {...} }`; a field missing `list` is excluded from the list view, missing `form` is excluded from the detail form). A resource with no `fields` (e.g. Settings) gets a plain popup with no list/form.
- Actual data for a resource lives in a same-shaped **entry table** named `{resource_key}_entry`: always exactly `id SERIAL PRIMARY KEY, data JSONB NOT NULL, created_at, updated_at` — no resource-specific columns, ever. This is what makes the API generic (see below). Adding a new resource means inserting one `resource` row and creating one `{resource_key}_entry` table from that fixed template (`sql/004_create_entry_tables.sql` has the pattern) — never an `ALTER TABLE`.

**API convention** (`routes/resource.js`, an `express.Router()` mounted at `/api`): `GET /api/resource` lists resource definitions. `GET/POST /api/:resourceKey` and `PUT /api/:resourceKey/:id` are **one generic implementation** that serves *any* resource: it looks up `resourceKey` in the `resource` table (404s if not found — this is also what keeps the dynamically-interpolated `{resourceKey}_entry` table name safe from injection, alongside a `^[a-z][a-z0-9_]*$` regex check), then reads/writes that resource's entry table, spreading `data` back into a flat object (`{ id, ...data, created_at, updated_at }`) so API responses look the same as if each resource still had real columns. Responses are always `{ ok: true, rows: [...] }` / `{ ok: true, row: {...} }` on success, `{ ok: false, error: "..." }` on failure. The literal `/resource` route is registered before the `/:resourceKey` catch-all in the router, since Express matches routes in registration order.

**Frontend** (`views/index.html` + `public/js/` + `public/css/fn.css`) is a hand-rolled, build-step-free micro-framework called `fn`, loaded as three `<script>` tags **in this order** — order matters, since each file uses globals the previous one defines:

1. `fn.js` — core primitives: `fn.element.create` (the one function used to build/configure every DOM node: `tagName`, `attribute`, `style`, `event`, `text`/`html`, `parent`, `complete`), `fn.element.draggable` (Pointer Events-based dragging — no jQuery anywhere in this project), `fn.ajax` (thin `fetch` wrapper: GET/HEAD get no body, other methods send JSON; throws on a non-OK response instead of taking success/error callbacks), `fn.data.select`/`.insert`/`.update` (the entry-CRUD client, built on `fn.ajax` — see Terminology above for why it's `data` and not `resource`), and the `fn.component.create` / `fn.component.layout.set` / `.get` named-layout registry.
2. `fn.layout.js` — registers the actual components via `fn.component.layout.set({ name, value: function(o) {...} })`: `popup`, `popup-edit-btn`/`popup-save-btn`/`popup-refresh-btn`/`popup-close-btn` (header buttons, composed by `popup-actions`), `popup-theme-btn` (dark/light toggle — deliberately *not* in `popup-actions`; it's mounted inside the Settings screen's content instead, since it's a global preference, not a per-popup action), `form`, `list`, `menu`. `list`/`form` accept the raw `resource.fields` shape directly and internally skip any column missing `.list`/`.form` — callers never pre-filter columns themselves. Also owns dark/light theme state (`data-fn-theme` attribute on `<html>`, persisted via `fn.localStorage`) and popup keyboard/focus handling (see below).
3. `fn.devtool.js` — the actual application: `fn.devtool.toggle()` opens the DevTool popup, then fetches `GET /api/resource` and builds the menu from the result. `openResource(config)` is the one generic function that drives every menu item's list/detail/save flow against `/api/{config.resource_key}` — there's no per-resource code here, so adding a menu item is a DB change (a `resource` row + entry table), not a code change. A `DOMContentLoaded` handler boots the floating gear button that calls `fn.devtool.toggle()`.

**Local (offline, no DB) variant** — `views/index-local.html` serves the same app without Postgres or `server.js`'s API at all: it loads `fn.js`, then `fn.local.js`, then `fn.layout.js`, then `fn.devtool.js` (one extra script, inserted right after `fn.js`). `fn.local.js` monkey-patches `fn.ajax` itself to read/write `localStorage` instead of calling `fetch`, matching the exact request/response shapes `routes/resource.js` produces (`{ ok: true, rows/row }`, throwing on error) for `GET /api/resource` and `GET/POST/PUT /api/:resourceKey[/:id]`. Because `fn.data.*` and `fn.devtool.js` only ever go through `fn.ajax`, neither needed any changes — the override is the entire diff between the two modes. Resource definitions default to a hardcoded seed (mirroring the `memo`/`bookmark`/`settings` rows a fresh DB would have) written into `localStorage` on first access; entries are stored per resource under `fn-local-{resource_key}-entry` as the same `{ id, data, created_at, updated_at }` shape as an entry table row. Keep `fn.local.js` as the only file that knows about `localStorage`-as-backend — don't special-case "local mode" inside `fn.js`/`fn.layout.js`/`fn.devtool.js`.

Conventions to preserve when extending `fn`:
- Build DOM synchronously with `parent: someParent` passed inline — don't nest `complete` callbacks to attach children. `complete` is only for handing a finished component back to the *caller*, not for wiring up a layout's own children. Nesting `complete` callbacks here previously caused real bugs (an inner `complete`'s parameter shadowed the outer `o`, silently breaking the title/save-button/the popup's own `o.complete()` call).
- A popup is brought to front by bumping `el.style.zIndex` on `pointerdown` (capture phase, not `mousedown` — `fn.element.draggable`'s handler calls `preventDefault()` on the header's `pointerdown`, which suppresses the browser's compatibility `mousedown` event entirely for header clicks) — never by re-inserting it into the DOM. `appendChild`-ing an already-attached node restarts its CSS entrance animation (`dt-popup-in`), which shows up as a visible flicker on every click, drag, or close.
- The "active" popup isn't derived from z-index (that's a rendering concern only) — `fn.component.data['popup']` doubles as an ordered stack: `fn.component.create` already appends to it on creation, and `bringToFront`/`closePopup` (in `fn.layout.js`) splice a popup within it on focus/close. `getTopPopup()` just reads the last element. Escape closes whatever that currently is (one `document`-level `keydown` listener, not one per popup); closing moves focus to the new top popup (`.__popup` has `tabindex="-1"` so it's programmatically focusable) or to the gear button if none remain.
- Styling lives in `public/css/fn.css` as CSS custom properties (`--dt-*` tokens, with a dark-mode block). JS `style: {}` blocks on `fn.element.create` calls should only carry per-instance dynamic values (position, column width) — anything expressible as a static `.__*` class rule belongs in the CSS file, not inline.
- Don't add resource-specific columns or routes anywhere (DB or `server.js`) — new resources go through `resource` + `{resource_key}_entry`, not bespoke tables/endpoints.
