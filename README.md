# url-reading-tracker

A Firefox extension to mark pages as read and sync them to your reading tracker API.

## Setup

1. Install the extension from [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/url-reading-tracker)
2. Open the extension preferences and fill in:
   - **API Base URL** — e.g. `https://api.example.com`
   - **API Key** — your Bearer token
   - **Allowed Domains** — one domain per line (leave empty to activate on all sites)

## Behaviour

- When you navigate to a page on an allowed domain, the extension automatically checks if you've read it and shows a **✓ badge** on the icon if so.
- Opening the popup on an already-read URL shows the date it was read.
- The icon is disabled on domains not in the whitelist.

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
