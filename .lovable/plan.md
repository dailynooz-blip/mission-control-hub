
## Fix: SQL Schema Parsing for Multi-line Triggers

### The Problem

The `runSchema()` function in `src/lib/turso.ts` splits the schema SQL on every `;\n`. This breaks multi-line trigger statements like:

```sql
CREATE TRIGGER IF NOT EXISTS guard_subtask_count
BEFORE INSERT ON tasks
WHEN NEW.parent_task_id IS NOT NULL
BEGIN
  SELECT RAISE(ABORT, '...')
  WHERE (...) >= 5;   ← split happens here, inside the trigger body!
END;
```

The Turso HTTP API receives the trigger body as a half-written statement, then gets a bare `END` as a separate execute — causing:
- `SQL_PARSE_ERROR: unexpected end of input`
- `cannot commit - no transaction is active`
- Index creation failures (tables not yet created)

### The Fix

**File: `src/lib/turso.ts`** — rewrite the `runSchema()` statement splitter to track `BEGIN...END` depth and only split at top-level semicolons.

The new algorithm:
1. Walk the SQL character by character
2. Track a `depth` counter — increment on `BEGIN`, decrement on `END`
3. Only split into a new statement when hitting `;` while `depth === 0`
4. This keeps each trigger intact as a single statement

The fix also ignores errors for statements that are safe to skip (already exists, duplicate column, no transaction active from PRAGMA) while failing hard on real errors.

### Technical Details

- No new files needed — only `src/lib/turso.ts` changes
- The `runSchema()` function's statement-parsing logic is replaced
- `PRAGMA` statements are still skipped (not supported by Turso HTTP API)
- `BEGIN`/`END` depth tracking handles nested blocks correctly
- All other existing behavior (credential handling, error reporting, progress callback) stays the same

### What This Fixes

After this change, clicking "Initialize Database" in the setup panel will:
1. Test connection — ✓ (already working)
2. Apply schema — ✓ CREATE TABLEs, INDEXes, and TRIGGERs all sent as complete statements
3. Seed agents — ✓ INSERT OR IGNORE runs cleanly
4. Show "Connected — Go to Dashboard" — ✓
