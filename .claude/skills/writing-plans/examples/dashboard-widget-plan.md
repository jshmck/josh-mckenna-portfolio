# Example Plan: Dashboard Stats Widget

> This is a complete example of a writing-plans skill output for a BOS component.

---

# Implementation Plan: Dashboard Stats Widget

**Goal**: Create a reusable stats widget for the BOS dashboard showing key metrics with BOS styling
**Architecture**: React component with React Aria, Framer Motion animations, semantic tokens
**Tech Stack**: Next.js 16+, React 19, TypeScript strict, Tailwind CSS, React Aria
**Design System**: BOS (Charcoal/Vanilla/Aperol palette, semantic tokens)
**Created**: 2026-01-12

---

## Design System Checklist

- [x] Uses semantic CSS variables (`--bg-secondary`, `--fg-primary`, etc.)
- [x] Borders follow 40% opacity pattern
- [x] Brand color (Aperol) reserved for trend indicators only
- [x] Card pattern matches BOS standard
- [x] Warm neutrals throughout

---

## Component Specification

```tsx
interface StatsWidgetProps {
  title: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
  icon?: React.ReactNode;
  className?: string;
}
```

**Visual Design**:

```
┌─────────────────────────────────┐
│  📊 Total Users                 │  ← Title (fg-secondary)
│                                 │
│  12,847                         │  ← Value (fg-primary, large)
│  ↑ 12.5% from last month        │  ← Trend (Aperol if up, fg-tertiary if down)
└─────────────────────────────────┘
    ↑ Card pattern: bg-bg-secondary, border-border-secondary
```

---

## Tasks

### Task 1: Create component file and types

**File**: `components/dashboard/StatsWidget.tsx`
**Time**: ~3 minutes
**Design Tokens**: N/A (types only)

**Steps**:

1. Create file with TypeScript interface
2. Export empty component shell
3. Verify file compiles

**Code**:

```tsx
// components/dashboard/StatsWidget.tsx
import { cn } from '@/lib/utils';

export interface StatsWidgetProps {
  title: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatsWidget({ title, value, trend, icon, className }: StatsWidgetProps) {
  return null; // Implement in next task
}
```

**Commit**: `feat(dashboard): add StatsWidget component types`

---

### Task 2: Write failing test for basic render

**File**: `components/dashboard/__tests__/StatsWidget.test.tsx`
**Time**: ~3 minutes

**Steps**:

1. Write test for component render
2. Run test, verify it fails (RED)

**Code**:

```tsx
// components/dashboard/__tests__/StatsWidget.test.tsx
import { render, screen } from '@testing-library/react';
import { StatsWidget } from '../StatsWidget';

describe('StatsWidget', () => {
  it('renders title and value', () => {
    render(<StatsWidget title="Total Users" value={12847} />);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('12,847')).toBeInTheDocument();
  });

  it('applies BOS card pattern classes', () => {
    const { container } = render(<StatsWidget title="Test" value={100} />);

    const card = container.firstChild;
    expect(card).toHaveClass('bg-bg-secondary');
    expect(card).toHaveClass('border-border-primary');
  });
});
```

**Expected Output**:

```
FAIL  components/dashboard/__tests__/StatsWidget.test.tsx
  StatsWidget
    ✕ renders title and value (8ms)
    ✕ applies BOS card pattern classes (3ms)
```

**Commit**: `test(dashboard): add StatsWidget render tests`

---

### Task 3: Implement basic component structure

**File**: `components/dashboard/StatsWidget.tsx`
**Time**: ~5 minutes
**Design Tokens**:

- Background: `bg-bg-secondary`
- Border: `border-border-secondary`
- Title text: `text-fg-secondary`
- Value text: `text-fg-primary`

**Steps**:

1. Implement component with BOS tokens
2. Run tests, verify they pass (GREEN)

**Code**:

```tsx
export function StatsWidget({ title, value, trend, icon, className }: StatsWidgetProps) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div
      className={cn(
        // BOS Card Pattern
        'bg-bg-secondary',
        'border border-border-secondary',
        'rounded-xl p-6',
        // Hover state
        'hover:bg-bg-secondary-hover',
        'hover:border-border-primary',
        'transition-colors duration-150',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-fg-tertiary">{icon}</span>}
        <h3 className="text-sm font-medium text-fg-secondary">{title}</h3>
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-fg-primary">{formattedValue}</p>

      {/* Trend (implement in next task) */}
    </div>
  );
}
```

**Expected Output**:

```
PASS  components/dashboard/__tests__/StatsWidget.test.tsx
  StatsWidget
    ✓ renders title and value (12ms)
    ✓ applies BOS card pattern classes (4ms)
```

**Commit**: `feat(dashboard): implement StatsWidget base component`

---

### Task 4: Add trend indicator with brand color

**File**: `components/dashboard/StatsWidget.tsx`
**Time**: ~4 minutes
**Design Tokens**:

- Up trend: `text-fg-brand-primary` (Aperol)
- Down trend: `text-fg-tertiary`
- Neutral: `text-fg-secondary`

**Steps**:

1. Write failing test for trend display
2. Implement trend indicator
3. Verify tests pass

**Test Code**:

```tsx
it('displays upward trend with brand color', () => {
  render(
    <StatsWidget title="Revenue" value="$45,000" trend={{ direction: 'up', percentage: 12.5 }} />
  );

  const trendElement = screen.getByText(/12.5%/);
  expect(trendElement).toHaveClass('text-fg-brand-primary');
});

it('displays downward trend with muted color', () => {
  render(<StatsWidget title="Churn" value="2.3%" trend={{ direction: 'down', percentage: 5 }} />);

  const trendElement = screen.getByText(/5%/);
  expect(trendElement).toHaveClass('text-fg-tertiary');
});
```

**Implementation**:

```tsx
{
  trend && (
    <div
      className={cn(
        'flex items-center gap-1 mt-2 text-sm',
        trend.direction === 'up' && 'text-fg-brand-primary',
        trend.direction === 'down' && 'text-fg-tertiary',
        trend.direction === 'neutral' && 'text-fg-secondary'
      )}
    >
      {trend.direction === 'up' && <ArrowUpIcon className="w-4 h-4" />}
      {trend.direction === 'down' && <ArrowDownIcon className="w-4 h-4" />}
      <span>{trend.percentage}% from last month</span>
    </div>
  );
}
```

**Commit**: `feat(dashboard): add trend indicator to StatsWidget`

---

### Task 5: Add entrance animation

**File**: `components/dashboard/StatsWidget.tsx`
**Time**: ~3 minutes
**Animation**: Framer Motion fade + slide up

**Steps**:

1. Add Framer Motion wrapper
2. Verify animation works visually
3. Ensure no layout shift

**Code**:

```tsx
import { motion } from 'framer-motion';

export function StatsWidget({ ... }: StatsWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        // ... existing classes
      )}
    >
      {/* ... content */}
    </motion.div>
  );
}
```

**Commit**: `feat(dashboard): add entrance animation to StatsWidget`

---

### Task 6: Export from index and document

**Files**:

- `components/dashboard/index.ts`
- `components/dashboard/StatsWidget.tsx` (add JSDoc)

**Time**: ~2 minutes

**Code**:

```tsx
// components/dashboard/index.ts
export { StatsWidget } from './StatsWidget';
export type { StatsWidgetProps } from './StatsWidget';

// Add JSDoc to component
/**
 * Stats widget displaying a metric with optional trend indicator.
 * Uses BOS card pattern with semantic tokens.
 *
 * @example
 * <StatsWidget
 *   title="Total Users"
 *   value={12847}
 *   trend={{ direction: 'up', percentage: 12.5 }}
 *   icon={<UsersIcon />}
 * />
 */
export function StatsWidget({ ... }: StatsWidgetProps) {
```

**Commit**: `docs(dashboard): add StatsWidget exports and documentation`

---

## Verification Checklist

Before marking complete:

- [ ] All 6 tasks committed
- [ ] Tests pass: `npm test components/dashboard`
- [ ] Build succeeds: `npm run build`
- [ ] No hardcoded colors in component
- [ ] BOS card pattern verified visually
- [ ] Brand color only used for upward trend

---

## Execution Handoff

**Recommended**: Use subagent-driven-development to execute tasks 1-6 in parallel batches.

```
Batch 1 (parallel): Tasks 1, 2 (no dependencies)
Batch 2 (sequential): Task 3 (depends on 1, 2)
Batch 3 (parallel): Tasks 4, 5 (independent features)
Batch 4 (sequential): Task 6 (depends on all)
```
