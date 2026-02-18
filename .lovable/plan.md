
## In-App Turso Setup Panel (No CLI Required)

### Goal
Replace the CLI-based setup with a built-in setup wizard inside the dashboard. The user pastes their Turso URL and auth token directly into a UI panel. The app then:
1. Runs the full schema SQL via the Turso HTTP REST API
2. Seeds the 9 agents
3. Confirms the connection is live

Anyone who duplicates this Lovable project just opens the setup panel and fills in their own credentials — no terminal, no Windows/Mac differences, no CLI install.

### How It Works

The Turso HTTP API (`/v2/pipeline`) already supports multi-statement batches. We send the entire `tursoSchema.sql` content as a series of execute requests directly from the browser. Credentials are stored in `localStorage` as a temporary runtime override (since Lovable secrets require a rebuild to take effect), so the connection goes live immediately without a redeploy.

### Files to Create / Edit

**1. `src/lib/tursoConfig.ts`** (new)
- Reads credentials from `localStorage` first (runtime), then falls back to `import.meta.env` (build-time secrets)
- Exports `getTursoUrl()`, `getTursoToken()`, `isTursoConfigured()`, `saveCredentials()`, `clearCredentials()`
- This makes credentials hot-swappable without a rebuild

**2. `src/lib/turso.ts`** (edit)
- Update `TURSO_URL` / `TURSO_TOKEN` to read from `tursoConfig` instead of directly from `import.meta.env`
- Add a `runSchema()` helper that sends the full schema SQL as a pipeline batch

**3. `src/components/dashboard/TursoSetup.tsx`** (new)
- A card/modal shown when `isTursoConfigured()` is false
- Fields: Database URL, Auth Token (password input), "Initialize Database" button
- Steps shown inline:
  1. Test connection (SELECT 1)
  2. Apply schema (all CREATE TABLE + triggers)
  3. Seed agents (INSERT OR IGNORE)
  4. Show success + "Go to Dashboard" button
- On success, saves to localStorage and triggers a page reload so the live badge appears

**4. `src/components/dashboard/MissionControl.tsx`** (edit)
- If not configured, render `<TursoSetup />` as an overlay or first tab
- If configured, render dashboard as normal with the Live badge

**5. `src/pages/Index.tsx`** (edit, if needed)
- Pass through the setup state to MissionControl

### Setup Flow for Users / Duplicators

```text
1. Open the dashboard
2. See "Connect Turso" setup panel (shown automatically when not configured)
3. Go to https://turso.tech → sign up free → create DB "openclaw-state"
4. Copy the DB URL (libsql://... → change to https://)
5. Create a token on the Turso dashboard
6. Paste both into the setup panel → click "Initialize Database"
7. App runs schema + seeds agents → shows "Connected" → done
```

No terminal. No CLI. Works identically on Windows, Mac, Linux.

### Technical Details

- Schema SQL is imported as a raw string using Vite's `?raw` import: `import schemaSql from '@/lib/tursoSchema.sql?raw'`
- Statements are split on `;\n` and sent as individual `execute` requests in one pipeline batch
- `localStorage` key: `turso_url` and `turso_token`
- The `libsql://` prefix is auto-corrected to `https://` in the UI if the user pastes the wrong one
- Error messages from Turso (e.g. table already exists) are shown inline so the user knows what happened
- A "Re-run Schema" button is available after setup in case the DB needs to be reset

### What Changes for Duplicators

Someone who duplicates this Lovable project:
- Gets all the same code
- Opens the app, sees the setup panel
- Pastes their own Turso URL + token
- Hits "Initialize" — done in ~3 seconds

No secrets to configure in Lovable, no CLI, no SQL files to manually run.
