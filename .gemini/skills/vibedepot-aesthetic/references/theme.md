# VibeDepot Design Reference

## Visual Principles

- **Industrial Minimalism**: Clean, neutral foundations with high-contrast functional elements.
- **Deep Elevation**: Use of large `rounded-3xl` corners for primary containers (Cards, Modals) and subtle `shadow-xl` to create depth.
- **Vibrant Functional Color**: 
  - **Primary**: Bold Electric Blue (`hsl(221.2 83.2% 53.3%)`) for key actions.
  - **Success**: Emerald for positive states.
  - **Warning**: Amber for alerts/updates.
- **Typography as Structure**:
  - Headings: `font-black tracking-tight` for high impact.
  - Metadata: `font-mono uppercase tracking-widest` for technical details.
  - Body: `font-medium leading-relaxed` for readability.

## CSS Tokens

### Light Theme
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem; /* Standard */
  --radius-xl: 1.5rem; /* VibeDepot Custom */
}
```

### Dark Theme
```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --border: 217.2 32.6% 17.5%;
}
```

## Component Patterns

### The "VibeCard"
```tsx
<Card className="rounded-3xl border border-border bg-card hover:shadow-lg transition-all duration-300">
  <CardHeader>
    <h3 className="text-xl font-black tracking-tight">Title</h3>
  </CardHeader>
</Card>
```

### High-Contrast Badges
```tsx
<Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex gap-1.5 py-1 px-3">
  <Sparkles className="size-3.5 fill-primary" />
  Featured
</Badge>
```

### Motion
- **Page Transitions**: `animate-in fade-in duration-700`
- **Component Entrances**: `animate-in slide-in-from-bottom-4 duration-500`
- **Interactive Feedback**: `hover:scale-105 active:scale-95 transition-transform`
