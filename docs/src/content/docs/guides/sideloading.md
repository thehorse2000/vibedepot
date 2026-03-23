---
title: Sideloading Apps for Development
description: How to load apps from local folders for testing during development.
---

Sideloading lets you run your app directly from a local folder without publishing it to the registry. Changes to your files auto-reload in the running app.

## Enable Publisher Mode

Sideloading requires Publisher Mode:

1. Open VibeDepot and go to **Settings**.
2. Toggle **Publisher Mode** on.
3. The Library page now shows a **Sideload App** button.

## Sideload via CLI

The fastest way to sideload:

```bash
cd my-app
vibedepot preview
```

On macOS, this opens VibeDepot and loads your app automatically. On other platforms, it prints manual sideloading instructions.

## Sideload Manually

1. Go to the **Library** page.
2. Click **Sideload App**.
3. Select the folder containing your `manifest.json`.
4. Your app appears in the Library with a sideloaded badge.
5. Click **Launch** to open it.

## Hot Reload

When your app is sideloaded and running, VibeDepot watches your app folder for changes. When any file is modified:

1. The file watcher detects the change (with a 300ms debounce).
2. The app's `manifest.json` is re-read to pick up any manifest changes.
3. The app window reloads automatically.

No need to re-sideload — just save your file and the app updates.

## Dev Warnings

Sideloaded apps get special developer warnings. If your app tries to use a Bridge API method without declaring the required permission, VibeDepot injects a warning banner at the top of the app window instead of silently failing.

This helps you catch missing permissions during development before publishing.

## Removing a Sideloaded App

To stop sideloading an app:

1. Close the app if it's running.
2. In the Library, click **Remove** on the sideloaded app.

This only removes the app from VibeDepot's list — your local files are not deleted.

## Tips

- Keep your `manifest.json` valid — the app won't reload if the manifest can't be parsed.
- The entry file must exist at the path specified in `manifest.entry`.
- Sideloaded apps have full access to the Bridge API, same as installed apps.
- Use `vibedepot validate` before publishing to catch issues the dev warnings don't cover.

## Next Steps

- [Building Your First App](/guides/building-your-first-app/) — Full app tutorial
- [Using the CLI](/guides/using-the-cli/) — Preview and validate commands
- [Publishing to the Registry](/guides/publishing/) — When you're ready to share
