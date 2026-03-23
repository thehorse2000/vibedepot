# Custom MDX Components — VibeDepot Docs

All components live in `docs/src/components/`. Create the file if it doesn't
exist yet, using the scaffold below.

---

## `<PermissionBadge>`

Renders an inline coloured badge for a permission name with a lock icon.

**File:** `docs/src/components/PermissionBadge.astro`

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | required | Permission identifier (e.g. `storage.files`) |
| `auto` | `boolean` | `false` | If true, renders a green "auto-granted" variant |

**Usage:**

```mdx
import PermissionBadge from '~/components/PermissionBadge.astro';

Requires <PermissionBadge name="network" /> permission in your manifest.

The <PermissionBadge name="storage.kv" auto /> tier is granted automatically.
```

**Scaffold:**

```astro
---
// docs/src/components/PermissionBadge.astro
interface Props {
  name: string;
  auto?: boolean;
}
const { name, auto = false } = Astro.props;
const color = auto ? 'var(--sl-color-green)' : 'var(--sl-color-accent)';
---
<code
  style={`background: ${color}20; color: ${color}; border: 1px solid ${color}40;
         padding: 1px 6px; border-radius: 4px; font-size: 0.8em;`}
>
  🔒 {name}{auto ? ' (auto)' : ''}
</code>
```

---

## `<ApiMethod>`

Renders a structured block for a single Bridge API method with its signature,
parameters, return type, and code example.

**File:** `docs/src/components/ApiMethod.astro`

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | required | Full method signature string |
| `returns` | `string` | required | Return type string |
| `permission` | `string` | `'none'` | Required permission or "none" |
| `async` | `boolean` | `true` | Whether the method is async |

**Usage:**

```mdx
import ApiMethod from '~/components/ApiMethod.astro';

<ApiMethod
  name="callAI(params)"
  returns="Promise<{ text: string, usage: UsageObject }>"
  permission="none"
>
Sends a prompt to the user's active AI provider.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `prompt` | `string` | Yes | The user/system prompt |
| `model` | `string` | No | Override the default model |

```js
const { text } = await window.vibeDepot.ai.callAI({
  prompt: 'Summarise this text: ...',
});
```
</ApiMethod>
```

**Scaffold:**

```astro
---
// docs/src/components/ApiMethod.astro
interface Props {
  name: string;
  returns: string;
  permission?: string;
  async?: boolean;
}
const { name, returns, permission = 'none', async: isAsync = true } = Astro.props;
---
<div class="api-method" style="border: 1px solid var(--sl-color-gray-5);
     border-radius: 8px; padding: 1rem 1.5rem; margin: 1.5rem 0;">
  <div style="font-family: var(--sl-font-mono); font-size: 1rem; font-weight: 600;
              color: var(--sl-color-accent);">
    {isAsync ? 'async ' : ''}{name}
  </div>
  <div style="font-size: 0.8em; color: var(--sl-color-gray-2); margin-top: 0.25rem;">
    Returns: <code>{returns}</code>
    {permission !== 'none' && (
      <> · Permission: <code>{permission}</code></>
    )}
  </div>
  <div style="margin-top: 1rem;">
    <slot />
  </div>
</div>
```

---

## `<PlatformTabs>`

Shows platform-specific instructions for macOS, Windows, and Linux in a tab UI.

**File:** `docs/src/components/PlatformTabs.astro`

**Props:** None — uses named slots.

**Usage:**

```mdx
import PlatformTabs from '~/components/PlatformTabs.astro';

<PlatformTabs>
  <Fragment slot="mac">
  App data is stored at `~/Library/Application Support/VibeDepot/`.
  </Fragment>
  <Fragment slot="windows">
  App data is stored at `%APPDATA%\VibeDepot\`.
  </Fragment>
  <Fragment slot="linux">
  App data is stored at `~/.config/vibedepot/`.
  </Fragment>
</PlatformTabs>
```

**Scaffold:**

```astro
---
// docs/src/components/PlatformTabs.astro
// Uses Starlight's built-in <Tabs> — no custom JS needed
import { Tabs, TabItem } from '@astrojs/starlight/components';
---
<Tabs>
  <TabItem label="macOS" icon="apple">
    <slot name="mac" />
  </TabItem>
  <TabItem label="Windows" icon="windows">
    <slot name="windows" />
  </TabItem>
  <TabItem label="Linux" icon="linux">
    <slot name="linux" />
  </TabItem>
</Tabs>
```

---

## `<PersonaBadge>`

Renders a "For: [Persona]" tag at the top of a page to signal the target audience.

**File:** `docs/src/components/PersonaBadge.astro`

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `for` | `'end-user' \| 'vibecoder' \| 'developer' \| 'all'` | required | Target persona |

**Usage:**

```mdx
import PersonaBadge from '~/components/PersonaBadge.astro';

<PersonaBadge for="vibecoder" />
```

**Scaffold:**

```astro
---
// docs/src/components/PersonaBadge.astro
interface Props {
  for: 'end-user' | 'vibecoder' | 'developer' | 'all';
}
const { for: persona } = Astro.props;
const labels: Record<string, string> = {
  'end-user': '👤 For: Everyday Users',
  'vibecoder': '⚡ For: Vibecoders',
  'developer': '🛠 For: Developers',
  'all': '🌐 For: Everyone',
};
---
<p style="font-size: 0.85em; font-weight: 600; color: var(--sl-color-gray-2);
           margin-bottom: 1.5rem; border-bottom: 1px solid var(--sl-color-gray-6);
           padding-bottom: 0.5rem;">
  {labels[persona]}
</p>
```

---

## `<StepFlow>`

Numbered step list styled with connecting lines for visual flow clarity.

**File:** `docs/src/components/StepFlow.astro`

**Props:** None — wraps slot content (a Markdown ordered list).

**Usage:**

```mdx
import StepFlow from '~/components/StepFlow.astro';

<StepFlow>
1. **Open the Store** — Click the Store icon in the sidebar.
2. **Find an app** — Search or browse categories.
3. **Click Install** — Review permissions, then click **Allow & Install**.
</StepFlow>
```

**Scaffold:**

```astro
---
// docs/src/components/StepFlow.astro
---
<div class="step-flow" style="counter-reset: steps;">
  <slot />
</div>

<style>
  .step-flow :global(ol) {
    list-style: none;
    padding: 0;
  }
  .step-flow :global(li) {
    counter-increment: steps;
    padding-left: 2.5rem;
    position: relative;
    margin-bottom: 1.25rem;
  }
  .step-flow :global(li::before) {
    content: counter(steps);
    position: absolute;
    left: 0;
    top: 0;
    background: var(--sl-color-accent);
    color: white;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
  }
</style>
```

---

## `<SecurityNote>`

A prominent security callout with a shield icon. Stronger visual weight than
a standard `:::danger` callout — use when explaining security guarantees or
constraints central to VibeDepot's model.

**File:** `docs/src/components/SecurityNote.astro`

**Props:** None — wraps slot content.

**Usage:**

```mdx
import SecurityNote from '~/components/SecurityNote.astro';

<SecurityNote>
  The raw API key is **never** passed to any app WebView. Your app receives only
  the AI response — it has no way to read, log, or transmit your credentials.
</SecurityNote>
```

**Scaffold:**

```astro
---
// docs/src/components/SecurityNote.astro
---
<aside style="background: var(--sl-color-orange-low, #2d1a00);
              border-left: 4px solid var(--sl-color-orange, #f59e0b);
              border-radius: 4px; padding: 1rem 1.25rem; margin: 1.5rem 0;">
  <p style="margin: 0; font-weight: 700; font-size: 0.9em; margin-bottom: 0.5rem;">
    🔐 Security Guarantee
  </p>
  <div>
    <slot />
  </div>
</aside>
```
