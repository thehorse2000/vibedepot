---
name: vibedepot-aesthetic
description: Design system and visual language for the VibeDepot project. Use when creating or modifying UI components, pages, or layouts in the VibeDepot shell or associated apps to ensure consistency with the "Industrial Minimalism" aesthetic.
---

# VibeDepot Aesthetic

This skill provides the visual and structural patterns for the VibeDepot ecosystem. It prioritizes high-contrast functional elements, deep elevation, and bold typography within a neutral, minimal foundation.

## Design Philosophy

The VibeDepot aesthetic is "Industrial Minimalism." It avoids soft, generic "AI slop" gradients in favor of sharp, intentional design choices.

### Key Visual Pillars

1.  **Bold Typography**: High-impact headings with `tracking-tight` and `font-black`.
2.  **Deep Elevation**: Primary containers use a `rounded-3xl` (24px) radius and `shadow-xl`.
3.  **Vibrant Accents**: Use the primary electric blue for actions and semantic colors (Emerald, Amber) for status.
4.  **Glassmorphism Lite**: Subtle use of `backdrop-blur-md` on overlays and badges.

## Implementation Guide

### 1. The Vibe-Themed Card
Use `shadcn/ui` Cards with the following pattern for a consistent look:
- Class: `rounded-3xl border border-border bg-card hover:shadow-lg transition-all duration-300`
- Content: Maintain generous padding and use clear hierarchy.

### 2. Typography
- **Headings**: `text-4xl font-black tracking-tight text-foreground`
- **Body**: `text-muted-foreground font-medium leading-relaxed`
- **Mono/Technical**: `font-mono text-[10px] uppercase tracking-widest`

### 3. Navigation & Sidebar
Use the custom `AppSidebar` pattern with Lucide icons and `SidebarMenuButton`. Ensure active states use `bg-accent text-accent-foreground font-medium`.

### 4. Interactive Feedback
Always include transitions:
- Hover states: `hover:bg-accent/50`, `hover:text-primary`, `hover:shadow-md`.
- Animations: Use Tailwind's `animate-in` utilities for entries (`fade-in`, `slide-in-from-bottom-4`).

## References

For detailed CSS tokens, color palettes, and more code examples, see [references/theme.md](references/theme.md).

## Verification Checklist

- [ ] Does it use `rounded-3xl` for main containers?
- [ ] Is the typography bold and tight for headings?
- [ ] Does it use the electric blue primary color?
- [ ] Are animations included for visibility changes?
- [ ] Is it fully dark-mode compatible?
