# url-reading-tracker

A Firefox extension to mark pages as read and sync them to your reading tracker API.

## Setup

1. Install the extension from [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/url-reading-tracker)
2. Open the extension preferences and fill in:
   - **API Base URL** — e.g. `https://api.example.com`
   - **API Key** — your Bearer token

## API

The API must comply with `POST /reads` as defined in [reading-tracker-web](https://github.com/jonnjonnjo/reading-tracker-web).

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Submit |
| `Shift+Enter` | New line in notes |
