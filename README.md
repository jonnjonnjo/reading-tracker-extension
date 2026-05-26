# url-reading-tracker

A Firefox extension to mark pages as read and sync them to your reading tracker API.

## Setup

1. Install the extension from [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/url-reading-tracker)
2. Open the extension preferences and fill in:
   - **API Base URL** — e.g. `https://api.example.com`
   - **API Key** — your Bearer token
   - **Allowed Domains** — one domain per line (leave empty to activate on all sites)

## Behaviour

- When you navigate to a whitelisted page, a toast notification appears at the top of the page telling you whether you've read it or not. It auto-dismisses after 8 seconds (or hit ✕ to close early).
- The extension icon shows a **✓ badge** on already-read pages.
- Opening the popup on an already-read URL shows the date it was read.
- The icon is disabled on domains not in the whitelist.

## Releases

Versioning is fully automated via GitHub Actions on every push to `main`.

| Commit prefix | Bump |
|---|---|
| `feat:` | minor — `1.2.0` → `1.3.0` |
| `fix:` / `chore:` / `style:` | patch — `1.2.0` → `1.2.1` |
| `feat!:` / `BREAKING CHANGE` | major — `1.2.0` → `2.0.0` |

The workflow updates `manifest.json`, tags the commit, and attaches a ready-to-install `.zip` to the GitHub release automatically.

## API

| Method | Endpoint | Params / Body | Response | Source |
|--------|----------|---------------|----------|--------|
| `POST` | `/reads` | `{ url, notes? }` | `201` — added, `204` — removed (toggle) | [reading-tracker-web](https://github.com/jonnjonnjo/reading-tracker-web) |
| `GET` | `/reads/check` | `?url=` | `200` — `{ exists, read }` | [reading-tracker-api](https://github.com/jonnjonnjo/reading-tracker-api) |

All requests are authenticated with `Authorization: Bearer <api-key>`.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Submit |
| `Shift+Enter` | New line in notes |
