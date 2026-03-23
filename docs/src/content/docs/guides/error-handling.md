---
title: Handling Errors
description: How to catch, interpret, and display errors from the Bridge API in your VibeDepot app.
---

All Bridge API methods can throw errors. VibeDepot uses a structured error system called **DxError** that provides an error code, a message, and a developer-friendly suggestion.

## The DxError Format

When a Bridge API call fails, the thrown error has these properties:

```javascript
{
  code: 'MISSING_API_KEY',           // Machine-readable error code
  message: 'No API key available...', // Human-readable description
  suggestion: 'Open Settings and...'  // Guidance for fixing the issue
}
```

## Catching Errors

Always wrap Bridge API calls in try/catch:

```javascript
try {
  const response = await window.vibeDepot.ai.callAI({
    messages: [{ role: 'user', content: 'Hello!' }]
  });
  displayResult(response.content);
} catch (err) {
  displayError(err.message);
  console.error(err.code, err.suggestion);
}
```

## Error Codes

| Code | When It Fires | Typical Suggestion |
|---|---|---|
| `PERMISSION_DENIED` | App lacks the required permission | Add the permission to `manifest.json` |
| `MISSING_API_KEY` | No API key configured for any supported provider | Open Settings and add an API key |
| `INVALID_PARAMS` | Parameters failed Zod validation | Check the Bridge API docs for correct format |
| `AI_PROVIDER_ERROR` | The AI provider API returned an error | Check API key validity and credits |
| `STORAGE_ERROR` | KV storage operation failed | Check storage permissions |
| `DB_ERROR` | SQLite operation failed | Check SQL syntax and `storage.db` permission |
| `UNKNOWN` | Unexpected error | Report the issue |

## Handling Specific Errors

### Permission Errors

```javascript
try {
  await window.vibeDepot.ai.callAI({ messages: [...] });
} catch (err) {
  if (err.code === 'PERMISSION_DENIED') {
    showBanner('This feature requires additional permissions. ' + err.suggestion);
    return;
  }
  throw err; // Re-throw unexpected errors
}
```

### Missing API Keys

```javascript
try {
  await window.vibeDepot.ai.callAI({ messages: [...] });
} catch (err) {
  if (err.code === 'MISSING_API_KEY') {
    showSetupPrompt('Please configure an API key in VibeDepot Settings to use this app.');
    return;
  }
  throw err;
}
```

### AI Provider Errors

These include rate limits, invalid keys, insufficient credits, and model errors:

```javascript
try {
  await window.vibeDepot.ai.callAI({ messages: [...] });
} catch (err) {
  if (err.code === 'AI_PROVIDER_ERROR') {
    // err.message includes the provider name and original error
    showError('AI service error. Try again in a moment.');
    return;
  }
  throw err;
}
```

### Database Errors

```javascript
try {
  await window.vibeDepot.db.run('INSERT INTO notes (title) VALUES (?)', ['Hello']);
} catch (err) {
  if (err.code === 'DB_ERROR') {
    // Could be invalid SQL, blocked statement, or SQLite error
    console.error('Database error:', err.message);
    return;
  }
  throw err;
}
```

## Streaming Error Handling

Streaming calls (`streamAI`) can also throw. The error fires when the stream encounters a problem:

```javascript
try {
  await window.vibeDepot.ai.streamAI(
    { messages: [{ role: 'user', content: 'Hello!' }] },
    (chunk) => {
      output.textContent += chunk;
    }
  );
} catch (err) {
  // Stream failed — could be mid-stream
  output.textContent += '\n\n[Stream error: ' + err.message + ']';
}
```

## User-Facing Error Display

A pattern for showing errors to users:

```javascript
function showError(err) {
  const errorDiv = document.getElementById('error');

  if (err.code === 'MISSING_API_KEY') {
    errorDiv.textContent = 'Please add an API key in VibeDepot Settings.';
  } else if (err.code === 'AI_PROVIDER_ERROR') {
    errorDiv.textContent = 'The AI service returned an error. Please try again.';
  } else if (err.code === 'PERMISSION_DENIED') {
    errorDiv.textContent = 'This app needs additional permissions to work.';
  } else {
    errorDiv.textContent = 'Something went wrong. Please try again.';
  }

  errorDiv.style.display = 'block';
}
```

Don't expose raw error messages or suggestions to end users — those are for developers. Show friendly messages instead.

## Next Steps

- [Error Codes Reference](/reference/error-codes/) — Complete error code documentation
- [Bridge API Reference](/reference/bridge-api/) — Full API documentation
- [Configuring Permissions](/guides/permissions/) — Prevent permission errors
