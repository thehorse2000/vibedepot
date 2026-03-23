---
title: Error Codes Reference
description: Complete reference for all DxError codes — when they fire, their messages, and how to resolve them.
---

VibeDepot uses a structured error system called **DxError**. Every error thrown by the Bridge API includes a machine-readable `code`, a human-readable `message`, and a developer-friendly `suggestion`.

## Error Structure

```typescript
{
  code: DxErrorCode;       // Machine-readable error type
  message: string;         // What went wrong
  suggestion: string;      // How to fix it
}
```

## Error Codes

### `PERMISSION_DENIED`

The app attempted to use a Bridge API method without the required permission.

| Property | Value |
|---|---|
| **When** | Any Bridge call where the app lacks the required permission |
| **Message** | `App "{appId}" does not have "{permission}" permission` |
| **Suggestion** | `Add "{permission}" to the permissions array in your manifest.json` |

**Resolution:** Add the missing permission to your `manifest.json` permissions array.

```javascript
// Example: App calls AI without "ai" permission
try {
  await window.vibeDepot.ai.callAI({ messages: [...] });
} catch (err) {
  // err.code === 'PERMISSION_DENIED'
}
```

---

### `MISSING_API_KEY`

No API key is configured for any provider the app supports.

| Property | Value |
|---|---|
| **When** | AI call when no supported provider has a key configured |
| **Message** | `No API key available. Tried providers: {providers}` |
| **Suggestion** | `Open Settings and add an API key for one of your app's supported providers` |

**Resolution:** The user needs to add an API key in VibeDepot Settings for at least one of the providers listed in the app's `models.providers`.

---

### `INVALID_PARAMS`

The parameters passed to a Bridge API method failed Zod validation.

| Property | Value |
|---|---|
| **When** | Any Bridge call with malformed parameters |
| **Message** | `Invalid parameters: {field}: {issue}; ...` |
| **Suggestion** | `Check the Bridge API documentation for the correct parameter format` |

**Resolution:** Check the parameter format against the [Bridge API Reference](/reference/bridge-api/). Common issues:
- Missing required `messages` array in AI calls
- Invalid `role` value (must be `'user'`, `'assistant'`, or `'system'`)
- `temperature` outside 0–2 range
- Storage key exceeding 256 characters

---

### `AI_PROVIDER_ERROR`

The AI provider's API returned an error.

| Property | Value |
|---|---|
| **When** | The AI SDK call fails (rate limit, invalid key, insufficient credits, etc.) |
| **Message** | `{provider} API error: {originalMessage}` |
| **Suggestion** | `Check that your API key is valid and you have sufficient credits` |

**Resolution:** Common causes:
- Invalid or expired API key
- Insufficient account credits
- Rate limit exceeded
- Model not available for the account
- Network connectivity issues

---

### `STORAGE_ERROR`

A KV storage operation failed.

| Property | Value |
|---|---|
| **When** | KV storage read/write fails (disk error, corruption, etc.) |
| **Message** | `Storage {operation} failed: {originalMessage}` |
| **Suggestion** | `Ensure your app has the correct storage permissions in manifest.json` |

**Resolution:** Usually indicates a disk issue or corrupted `store.json`. The user can clear the app's data from the Library.

---

### `DB_ERROR`

A SQLite database operation failed.

| Property | Value |
|---|---|
| **When** | SQL execution fails (syntax error, blocked statement, constraint violation, etc.) |
| **Message** | `Database {operation} failed: {originalMessage}` |
| **Suggestion** | `Check your SQL syntax and ensure your app has "storage.db" permission in manifest.json` |

**Resolution:** Common causes:
- SQL syntax error
- Using a blocked SQL statement (see [SQL Allowlist](/reference/sql-allowlist/))
- Constraint violation (unique, not null, foreign key)
- Missing `storage.db` permission

---

### `UNKNOWN`

An unexpected error occurred.

| Property | Value |
|---|---|
| **When** | Any unhandled exception in the main process |
| **Message** | Varies |
| **Suggestion** | Varies |

**Resolution:** Check the error message for details. If the issue persists, report it.

## Factory Functions

The codebase provides factory functions for creating errors consistently (defined in `packages/shared/src/dx-errors.ts`):

| Function | Creates |
|---|---|
| `permissionDenied(appId, permission)` | `PERMISSION_DENIED` |
| `missingApiKey(triedProviders)` | `MISSING_API_KEY` |
| `invalidParams(zodError)` | `INVALID_PARAMS` |
| `aiProviderError(provider, originalMessage)` | `AI_PROVIDER_ERROR` |
| `storageError(operation, originalMessage)` | `STORAGE_ERROR` |
| `dbError(operation, originalMessage)` | `DB_ERROR` |

## Error Handling Pattern

```javascript
try {
  const response = await window.vibeDepot.ai.callAI({
    messages: [{ role: 'user', content: 'Hello' }]
  });
} catch (err) {
  switch (err.code) {
    case 'PERMISSION_DENIED':
    case 'MISSING_API_KEY':
    case 'INVALID_PARAMS':
    case 'AI_PROVIDER_ERROR':
    case 'STORAGE_ERROR':
    case 'DB_ERROR':
      console.error(`[${err.code}] ${err.message}`);
      console.info('Fix:', err.suggestion);
      break;
    default:
      console.error('Unexpected error:', err);
  }
}
```
