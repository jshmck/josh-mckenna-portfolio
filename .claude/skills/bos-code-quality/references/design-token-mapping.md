# BOS Design Token Mapping Reference

> Complete mapping of semantic tokens to their usage contexts.

---

## Background Tokens

| Token       | CSS Variable       | Usage                    | Light Value        | Dark Value         |
| ----------- | ------------------ | ------------------------ | ------------------ | ------------------ |
| Primary     | `--bg-primary`     | Main page background     | Vanilla (#FFFAEE)  | Charcoal (#191919) |
| Secondary   | `--bg-secondary`   | Elevated surfaces, cards | #F5F0E6            | #2A2A2A            |
| Tertiary    | `--bg-tertiary`    | Inputs, nested surfaces  | #EDE8DE            | #333333            |
| Quaternary  | `--bg-quaternary`  | Deep nesting             | #E5E0D6            | #3D3D3D            |
| Overlay     | `--bg-overlay`     | Modal backdrops          | rgba(25,25,25,0.5) | rgba(0,0,0,0.7)    |
| Brand Solid | `--bg-brand-solid` | Primary CTAs             | Aperol (#FE5102)   | Aperol (#FE5102)   |

### Background Usage Patterns

Use Style 2 (mapped classes) for IntelliSense support:

```tsx
// Page background
<main className="bg-bg-primary">

// Card/panel (elevated surface)
<div className="bg-bg-secondary">

// Form input
<input className="bg-bg-tertiary">

// Modal overlay
<div className="bg-bg-overlay">

// Primary button
<Button className="bg-brand-solid">
```

---

## Foreground (Text) Tokens

| Token         | CSS Variable         | Usage                    | Light Value        | Dark Value        |
| ------------- | -------------------- | ------------------------ | ------------------ | ----------------- |
| Primary       | `--fg-primary`       | Main text, headings      | Charcoal (#191919) | Vanilla (#FFFAEE) |
| Secondary     | `--fg-secondary`     | Secondary text, labels   | #4A4A4A            | #B0B0B0           |
| Tertiary      | `--fg-tertiary`      | Muted text, placeholders | #767676            | #808080           |
| Brand Primary | `--fg-brand-primary` | Accent text, links       | Aperol (#FE5102)   | Aperol (#FE5102)  |

### Text Usage Patterns

Use Style 2 (mapped classes) for IntelliSense support:

```tsx
// Headings, important text
<h1 className="text-fg-primary">

// Labels, secondary info
<label className="text-fg-secondary">

// Placeholders, captions
<span className="text-fg-tertiary">

// Links, accent text
<a className="text-fg-brand-primary">
```

---

## Border Tokens

| Token     | CSS Variable         | Usage           | Light Value | Dark Value |
| --------- | -------------------- | --------------- | ----------- | ---------- |
| Primary   | `--border-primary`   | Default borders | #D4CFC5     | #404040    |
| Secondary | `--border-secondary` | Subtle dividers | #E5E0D6     | #333333    |

### Border Usage Patterns

> **⚠️ Opacity Warning:** Tailwind's opacity modifier (`/30`, `/50`) does NOT work with bracket notation CSS variables.
> `border-[var(--border-primary)]/30` fails silently. Use mapped classes: `border-border-primary/30` works correctly.
> See [Opacity Pattern Guide](../../../reference/design-system.md#opacity-pattern-guide) for complete guidance.

```tsx
// Subtle border (containers, cards)
<div className="border border-border-secondary">

// Prominent border (hover states, interactive elements)
<div className="hover:border-border-primary">

// Focus state (ring, not border)
<input className="focus:ring-2 focus:ring-brand">

// Divider
<hr className="border-border-tertiary">
```

---

## State Colors

### Semantic Status Colors

| State   | Token Pattern | Light Value   | Dark Value    |
| ------- | ------------- | ------------- | ------------- |
| Success | `--success-*` | Emerald scale | Emerald scale |
| Warning | `--warning-*` | Amber scale   | Amber scale   |
| Error   | `--error-*`   | Red scale     | Red scale     |
| Info    | `--info-*`    | Blue scale    | Blue scale    |

### Status Usage Patterns

```tsx
// Success badge
<span className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">

// Warning alert
<div className="bg-amber-500/10 text-amber-600 border-amber-500/20">

// Error message
<p className="text-red-500">

// Info tooltip
<div className="bg-blue-500/10 text-blue-500">
```

---

## Common Patterns Quick Reference

### Card Pattern

```tsx
className={cn(
  "bg-bg-secondary",
  "border border-border-secondary",
  "rounded-xl",
  "hover:bg-bg-secondary-hover",
  "hover:border-border-primary",
  "transition-colors duration-150"
)}
```

### Button Primary

```tsx
className={cn(
  "bg-brand-solid",
  "text-white",
  "hover:bg-brand-solid_hover",
  "focus:ring-2 focus:ring-brand",
  "disabled:opacity-50"
)}
```

### Button Secondary

```tsx
className={cn(
  "bg-transparent",
  "border border-border-primary",
  "text-fg-primary",
  "hover:bg-bg-secondary-hover",
  "focus:ring-2 focus:ring-brand"
)}
```

### Input Field

```tsx
className={cn(
  "bg-bg-tertiary",
  "border border-border-secondary",
  "text-fg-primary",
  "placeholder:text-fg-placeholder",
  "hover:border-border-primary",
  "focus:border-border-primary",
  "focus:ring-1 focus:ring-brand"
)}
```

### List Item

```tsx
className={cn(
  "text-fg-primary",
  "hover:bg-bg-secondary-hover",
  "focus:bg-bg-secondary-hover",
  "data-[selected]:bg-bg-tertiary"
)}
```

### Icon Button

```tsx
className={cn(
  "p-2 rounded-lg",
  "text-fg-tertiary",
  "hover:text-fg-primary",
  "hover:bg-bg-secondary-hover",
  "focus:ring-2 focus:ring-brand"
)}
```

---

## Migration Guide: Common Replacements

When reviewing code, use this mapping. **Use Style 2 (mapped classes) for cleaner IntelliSense:**

| Hardcoded         | Replace With (Style 2)                        |
| ----------------- | --------------------------------------------- |
| `bg-white`        | `bg-bg-primary` or `bg-bg-secondary`          |
| `bg-black`        | `bg-bg-primary` (dark mode)                   |
| `bg-gray-50`      | `bg-bg-secondary`                             |
| `bg-gray-100`     | `bg-bg-tertiary`                              |
| `bg-gray-200`     | `bg-bg-quaternary`                            |
| `text-black`      | `text-fg-primary`                             |
| `text-white`      | Context dependent - usually `text-fg-primary` |
| `text-gray-500`   | `text-fg-secondary`                           |
| `text-gray-400`   | `text-fg-tertiary`                            |
| `text-gray-900`   | `text-fg-primary`                             |
| `border-gray-200` | `border-border-secondary` (subtle)            |
| `border-gray-300` | `border-border-primary` (prominent)           |
| `bg-blue-500`     | `bg-brand-solid` (if CTA)                     |
| `text-blue-500`   | `text-fg-brand-primary` (if accent)           |

> **⚠️ Opacity Warning:** Never use `bg-[var(--token)]/50` — opacity modifiers don't work with CSS variables in bracket notation.
> Use mapped classes instead: `bg-bg-secondary/50` works correctly. See [Opacity Pattern Guide](../../../reference/design-system.md#opacity-pattern-guide).

---

## Animation Tokens

| Animation | Duration | Easing      | Usage                 |
| --------- | -------- | ----------- | --------------------- |
| Micro     | 150ms    | ease-out    | Hover states, toggles |
| UI        | 200ms    | ease-out    | Panel transitions     |
| Page      | 300ms    | ease-in-out | Route changes         |
| Emphasis  | 500ms    | spring      | Attention-grabbing    |

```tsx
// Micro interaction
className="transition-colors duration-150"

// UI transition
className="transition-all duration-200"

// Framer Motion page
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
```

---

## Spacing Reference

| Token   | Value | Usage                        |
| ------- | ----- | ---------------------------- |
| `p-1`   | 4px   | Tight padding (badges)       |
| `p-2`   | 8px   | Small padding (icon buttons) |
| `p-3`   | 12px  | Medium padding (list items)  |
| `p-4`   | 16px  | Standard padding (cards)     |
| `p-6`   | 24px  | Generous padding (panels)    |
| `gap-1` | 4px   | Tight gap (badge groups)     |
| `gap-2` | 8px   | Small gap (button groups)    |
| `gap-4` | 16px  | Standard gap (form fields)   |

---

## Border Radius Reference

| Token          | Value  | Usage               |
| -------------- | ------ | ------------------- |
| `rounded`      | 4px    | Small elements      |
| `rounded-md`   | 6px    | Buttons, inputs     |
| `rounded-lg`   | 8px    | Cards, panels       |
| `rounded-xl`   | 12px   | Large cards, modals |
| `rounded-2xl`  | 16px   | Feature cards       |
| `rounded-full` | 9999px | Badges, avatars     |
