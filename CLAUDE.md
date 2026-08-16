# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Install dependencies: `npm install`
- Run the server: `node server.js` (listens on `http://127.0.0.1:3000`; there is no `npm start` script)
- Check server + DB connectivity: `curl http://127.0.0.1:3000/api/db/health`
- No test suite or linter is configured — `npm test` is a placeholder that just exits with an error.
- `.env` (gitignored) must exist with `DATABASE_URL` for `db.js`/`server.js` to connect to Postgres — copy `.env.example` and fill in real values. Special characters in the password (`@`, `#`, etc.) must be percent-encoded or the connection string fails to parse and crashes the server on the first DB-touching request.
- Schema changes are plain, hand-numbered SQL files in `sql/` (`001_create_memo.sql`, `002_create_bookmark.sql`, ...) — there is no migration runner. Apply a file by hand, e.g.:
  ```
  node -e "require('dotenv').config(); const {Pool}=require('pg'); const fs=require('fs'); const pool=new Pool({connectionString:process.env.DATABASE_URL}); pool.query(fs.readFileSync('sql/00X_xxx.sql','utf8')).then(()=>pool.end())"
  ```

## Architecture

**Server (`server.js`)** is a plain `http.createServer` — not Express, even though `express` is listed in `package.json` (unused dependency). It does its own routing by checking `pathname`/`req.method` in sequence, its own static file serving (`.html` requests are served from `views/`, everything else from `public/`), and its own JSON body parsing (`readJsonBody`/`sendJson` helpers — no body-parser middleware).

**Database** (`db.js`) exports a single `pg` `Pool`, configured from `DATABASE_URL` (or individual `PG*` vars) via `dotenv`.

**API convention**: routes live under `/api/<resource>` (currently `memo`, `bookmark`), each exposing `GET` (list), `POST` (create), and `PUT /api/<resource>/:id` (update — matched with a regex against the path, since there's no router). Responses are always `{ ok: true, rows: [...] }` / `{ ok: true, row: {...} }` on success, or `{ ok: false, error: "..." }` on failure.

**Frontend** (`views/index.html` + `public/js/` + `public/css/fn.css`) is a hand-rolled, build-step-free micro-framework called `fn`, loaded as three `<script>` tags **in this order** — order matters, since each file uses globals the previous one defines:

1. `fn.js` — core primitives: `fn.element.create` (the one function used to build/configure every DOM node: `tagName`, `attribute`, `style`, `event`, `text`/`html`, `parent`, `complete`), `fn.element.draggable` (Pointer Events-based dragging — no jQuery anywhere in this project), `fn.ajax` (thin `fetch` wrapper: GET/HEAD get no body, other methods send JSON), and the `fn.component.create` / `fn.component.layout.set` / `.get` named-layout registry.
2. `fn.layout.js` — registers the actual components via `fn.component.layout.set({ name, value: function(o) {...} })`: `popup`, `popup-actions` (the header button bar — pulled into `popup` via `fn.component.create({ name: 'popup-actions', ... })` rather than being inlined), `form`, `list`, `menu`. Also owns dark/light theme state (`data-fn-theme` attribute on `<html>`, persisted via `fn.localStorage`).
3. `fn.devtool.js` — the actual application built on top of the framework: `fn.devtool.toggle()` builds the DevTool popup and its menu (Memo, Bookmark, Settings), and a `DOMContentLoaded` handler boots the floating gear button that calls it.

Conventions to preserve when extending `fn`:
- Build DOM synchronously with `parent: someParent` passed inline — don't nest `complete` callbacks to attach children. `complete` is only for handing a finished component back to the *caller* (e.g. `fn.devtool.js` reacting to a popup being ready), not for wiring up a layout's own children. Nesting `complete` callbacks here previously caused real bugs (an inner `complete`'s parameter shadowed the outer `o`, silently breaking the title/save-button/the popup's own `o.complete()` call).
- A popup is brought to front by bumping `el.style.zIndex` on `mousedown` — never by re-inserting it into the DOM. `appendChild`-ing an already-attached node restarts its CSS entrance animation (`dt-popup-in`), which shows up as a visible flicker on every click, drag, or close.
- Styling lives in `public/css/fn.css` as CSS custom properties (`--dt-*` tokens, with a dark-mode block). JS `style: {}` blocks on `fn.element.create` calls should only carry per-instance dynamic values (position, column width) — anything expressible as a static `.__*` class rule belongs in the CSS file, not inline.
