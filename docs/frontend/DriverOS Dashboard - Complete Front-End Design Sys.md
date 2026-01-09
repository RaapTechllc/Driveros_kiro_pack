<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# DriverOS Dashboard - Complete Front-End Design System

**Ultra-Detailed Design Specification for AI Agent Implementation**

***

## 🎯 Design Philosophy \& Core Principles

This dashboard merges business intelligence with automotive metaphor (gears/drivers) to create an intuitive, action-oriented operations platform. It combines the visual polish of the Dribbble Task Management Dashboard with DriverOS's unique "business gear" methodology for tracking company health.[^1]

**Design Goals:**

1. **Clarity over complexity** - Dense information presented cleanly
2. **Action-oriented** - Every metric leads to actionable next steps
3. **Progressive disclosure** - Tour mode guides new users, power users see everything
4. **Theme flexibility** - 7 color palettes + light/dark modes
5. **Automotive metaphor** - Gears, signals, brakes create relatable business framework

***

## 📐 Layout Architecture

### Global Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ [Top Banner: Demo Mode / Tour Navigation]               │ ← Dismissible
├─────────────────────────────────────────────────────────┤
│ [App Header: Logo | Navigation | Theme | User]          │ ← Sticky
├──────────┬──────────────────────────────────────────────┤
│          │ [Business Gear Indicator]                    │
│ Sidebar  │ ┌──────────────────────────────────────────┐ │
│          │ │ [Weekly Accelerator Card]                │ │
│ (Fixed)  │ └──────────────────────────────────────────┘ │
│          │ ┌──────────────────────────────────────────┐ │
│          │ │ [Signal Board - 5 Engine Cards]          │ │
│          │ └──────────────────────────────────────────┘ │
│          │ ┌──────────────────────────────────────────┐ │
│          │ │ [Action Bay - Do Now / Do Next]          │ │
│          │ └──────────────────────────────────────────┘ │
│          │ ┌──────────────────────────────────────────┐ │
│          │ │ [Brakes - Risk Management]               │ │
│          │ └──────────────────────────────────────────┘ │
│          │ [Export & Tools Section]                    │
└──────────┴──────────────────────────────────────────────┘
```

**Responsive Breakpoints:**

- **Desktop (1440px+)**: Full sidebar, 2-column Action Bay, 3-column Signal Board where possible
- **Laptop (1024-1439px)**: Sidebar visible, single-column Action Bay, 2-column Signal Board
- **Tablet (768-1023px)**: Collapsible hamburger sidebar, single-column everything
- **Mobile (<768px)**: Bottom nav, stacked cards, simplified metrics

***

## 🎨 Visual Design System

### Color Palette Foundation

**Base Neutral Colors (Works with all themes):**

```css
--background-primary: #f8f9fa (light) / #0f1214 (dark)
--background-secondary: #ffffff (light) / #1a1d21 (dark)
--background-tertiary: #f1f3f5 (light) / #25292e (dark)

--text-primary: #1a1d21 (light) / #f8f9fa (dark)
--text-secondary: #6c757d (light) / #9ca3af (dark)
--text-muted: #adb5bd (light) / #6b7280 (dark)

--border: #e9ecef (light) / #374151 (dark)
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08)
--shadow-md: 0 4px 12px rgba(0,0,0,0.12)
--shadow-lg: 0 8px 24px rgba(0,0,0,0.15)
```


### Theme System (7 Palettes)

**1. Default - "Professional Green" (Current DriverOS)**

```css
--primary: #1a5a44
--primary-hover: #2d8a66
--primary-light: #e8f5f0
--accent: #e8e3a3 (pale yellow for highlights)
--success: #22c55e
--warning: #f59e0b
--danger: #ef4444
--info: #3b82f6
```

**2. Dusk - "Warm Amber"**

```css
--primary: #92734a
--primary-hover: #b08d5f
--accent: #d4c896
--success: #84cc16
--warning: #f97316
```

**3. Lime - "Energetic Purple"**

```css
--primary: #7c3aed
--primary-hover: #9333ea
--accent: #a855f7
--success: #10b981
--warning: #fbbf24
```

**4. Ocean - "Calm Blue"**

```css
--primary: #0c4a6e
--primary-hover: #0369a1
--accent: #3b82f6
--success: #14b8a6
--warning: #f59e0b
```

**5. Retro - "Nostalgic Orange"**

```css
--primary: #c2410c
--primary-hover: #ea580c
--accent: #f97316
--success: #65a30d
--warning: #eab308
```

**6. Neo - "Cyberpunk Pink"**

```css
--primary: #be185d
--primary-hover: #db2777
--accent: #ec4899
--success: #06b6d4
--warning: #f59e0b
```

**7. Forest - "Natural Green"**

```css
--primary: #166534
--primary-hover: #16a34a
--accent: #22c55e
--success: #84cc16
--warning: #f59e0b
```


### Typography System

**Font Stack:**

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Type Scale:**

```css
--text-xs: 0.75rem / 12px (line-height: 1rem)
--text-sm: 0.875rem / 14px (line-height: 1.25rem)
--text-base: 1rem / 16px (line-height: 1.5rem)
--text-lg: 1.125rem / 18px (line-height: 1.75rem)
--text-xl: 1.25rem / 20px (line-height: 1.75rem)
--text-2xl: 1.5rem / 24px (line-height: 2rem)
--text-3xl: 1.875rem / 30px (line-height: 2.25rem)
--text-4xl: 2.25rem / 36px (line-height: 2.5rem)
--text-5xl: 3rem / 48px (line-height: 1)
--text-6xl: 3.75rem / 60px (line-height: 1)

/* Font Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

**Usage Guidelines:**

- **Dashboard Title**: text-3xl, font-bold, text-primary
- **Section Headers**: text-xl, font-semibold, text-primary
- **Card Titles**: text-lg, font-semibold, text-primary
- **Body Text**: text-base, font-normal, text-secondary
- **Labels**: text-sm, font-medium, text-muted
- **Small Print**: text-xs, font-normal, text-muted


### Spacing System (8px Base Grid)

```css
--space-1: 0.25rem / 4px
--space-2: 0.5rem / 8px
--space-3: 0.75rem / 12px
--space-4: 1rem / 16px
--space-5: 1.25rem / 20px
--space-6: 1.5rem / 24px
--space-8: 2rem / 32px
--space-10: 2.5rem / 40px
--space-12: 3rem / 48px
--space-16: 4rem / 64px
--space-20: 5rem / 80px
```

**Component Spacing Rules:**

- Card padding: `--space-6` (24px)
- Section gaps: `--space-8` (32px)
- Card gaps: `--space-6` (24px)
- Button padding: `--space-4` horizontal, `--space-2` vertical
- List item padding: `--space-4` (16px)


### Border Radius System

```css
--radius-sm: 0.375rem / 6px (badges, tags)
--radius-md: 0.5rem / 8px (buttons, inputs)
--radius-lg: 0.75rem / 12px (cards, modals)
--radius-xl: 1rem / 16px (large cards)
--radius-2xl: 1.5rem / 24px (hero sections)
--radius-full: 9999px (circles, pills)
```


***

## 🧩 Component Library

### 1. Top Banner Components

#### Demo Mode Banner

**Purpose**: Non-intrusive notification that user is in demo/sample data mode

**Visual Design:**

```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Demo Mode Active • TechFlow Solutions Sample Data   │
│                                         [Exit Demo] ─→  │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**

- Height: 48px
- Background: Primary color with 90% opacity
- Text: White, text-sm, font-medium
- Icon: 🎯 emoji or target icon, --space-3 margin-right
- Dismiss button: Text button, white with hover:opacity-90
- Position: Top of viewport, sticky
- Animation: Slide down on mount, slide up on dismiss
- Z-index: 100 (above content, below modals)


#### Tour Navigation Banner

**Purpose**: Guide users through first-time setup or feature tour

**Visual Design:**

```
┌─────────────────────────────────────────────────────────┐
│ Business Gear                                           │
│ 1 of 5                                                  │
│ Your current business phase (1-5 scale) based on        │
│ engine performance                                      │
│                              [Skip Tour] [Next →]       │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**

- Height: Auto (min 120px)
- Background: --background-secondary with subtle gradient
- Border-bottom: 2px solid --primary
- Title: text-lg, font-semibold
- Step counter: text-sm, text-muted
- Description: text-base, text-secondary, max-width: 600px
- Buttons:
    - Skip Tour: Ghost button (text only), text-muted
    - Next: Primary button with arrow icon
- Padding: --space-6
- Show spotlight/highlight on target element below

***

### 2. Header Component

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] [Nav Items...]              [Theme] [Bells] [👤] │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**

- Height: 64px
- Background: --background-secondary
- Border-bottom: 1px solid --border
- Padding: 0 --space-8
- Sticky position at top (after demo banner)
- Box-shadow: --shadow-sm on scroll

**Logo Section:**

- Text: "DriverOS" or custom logo
- Font: text-xl, font-bold, --primary
- Include small gear icon (⚙️ or SVG)

**Navigation Items** (Optional, for multi-page apps):

- Links: Dashboard, Goals, Meetings, Team, Reports
- Text: text-sm, font-medium, text-secondary
- Hover: text-primary, smooth transition
- Active: text-primary, border-bottom 2px solid --primary

**Right Actions:**

- **Theme Selector**: Dropdown or modal trigger
    - Icon: Sun/Moon based on current mode
    - Shows appearance settings panel
- **Notifications Bell**:
    - Icon: Bell with optional badge count
    - Badge: Small red dot or number, position: absolute top-right
    - Opens notifications dropdown
- **User Menu**:
    - Avatar: 40px circle, user initials or photo
    - Name: text-sm, visible on desktop only
    - Dropdown: Settings, Profile, Logout

***

### 3. Sidebar Component (Optional for larger screens)

**Purpose**: Secondary navigation, quick filters, or contextual actions

**Layout:**

```
┌───────────┐
│ MENU      │
│           │
│ Dashboard │ ← Active (green left border)
│ Tasks     │
│ Calendar  │
│ Analytics │
│ Team      │
│           │
│ GENERAL   │
│           │
│ Settings  │
│ Help      │
│ Logout    │
└───────────┘
```

**Specifications:**

- Width: 240px (fixed on desktop)
- Background: --background-secondary
- Border-right: 1px solid --border
- Padding: --space-6 vertical, --space-4 horizontal

**Menu Items:**

- Height: 40px
- Icon: Left-aligned, 20px, --text-muted
- Text: text-sm, font-medium, --text-secondary
- Hover: Background --background-tertiary, smooth transition
- Active:
    - Background: --primary-light (light mode) or primary with 10% opacity (dark)
    - Text: --primary, font-semibold
    - Left border: 3px solid --primary

**Section Headers:**

- Text: text-xs, font-semibold, uppercase, letter-spacing: 0.05em
- Color: --text-muted
- Margin: --space-6 top, --space-3 bottom

***

### 4. Business Gear Indicator

**Purpose**: Visual metaphor for business health/stage (1-5 gear system)

**Visual Design:**

```
┌─────────────────────────────────────────────────────────┐
│                    DriverOS Dashboard                    │
│                                                          │
│              ╔═══════════════════════╗                  │
│              ║         3             ║  ← Large number   │
│              ║    Gear: Drive        ║  ← Gear label     │
│              ║   [████████░░] 100%   ║  ← Progress bar   │
│              ║     Complete          ║                   │
│              ╚═══════════════════════╝                  │
│                                                          │
│ Strong leadership and sales, but operations need        │
│ optimization                                            │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**

**Container:**

- Max-width: 800px, centered
- Margin-bottom: --space-8
- Text-align: center

**Gear Card:**

- Background: Gradient from --primary to slightly darker variant
- Border-radius: --radius-xl
- Padding: --space-8
- Box-shadow: --shadow-lg
- Color: White text

**Gear Number:**

- Font-size: text-6xl (60px)
- Font-weight: --font

<div align="center">⁂</div>

[^1]: https://dribbble.com/shots/25241984-Task-Management-Dashboard

