# Design System & UI/UX Guidelines

## 1. Visual Aesthetics & Design System

The application features a modern, clean, high-trust healthcare aesthetic tailored for health data calculation and clarity.

### Color Palette (HSL & Hex)
* **Primary Accent (Vibrant Orange):** `#f97316` / `hsl(24, 95%, 53%)` — Used for primary calculation call-to-action buttons, active toggles, and emphasis highlights.
* **Secondary Brand Blue:** `#3b82f6` / `hsl(217, 91%, 60%)` — Used for trust badges, medical reviewer credentials, and secondary links.
* **Neutral Slate Backgrounds:** `#f8fafc` / `#f1f5f9` — Clean, soft card containers.
* **Dark Text Slate:** `#0f172a` / `#334155` — High contrast, readable body typography.

---

## 2. Component Design & Layout Specs

### Calculator Card Layout
* **Border Radius:** `16px` (`rounded-2xl`).
* **Shadow:** Soft drop shadow (`box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05)`).
* **Inputs:** 16px min font size (`text-lg`) to prevent automatic iOS zoom on mobile text focus.

### Header & Navigation Bar
* Sticky navigation header with backdrop blur (`backdrop-filter: blur(12px)`).
* Brand logo badge featuring gradient background (`linear-gradient(135deg, #3b82f6, #8b5cf6, #f97316)`).

---

## 3. Responsive Breakpoints

* **Mobile (portrait):** `< 640px` — Single column card layout, full-width inputs, collapsible drawer menu.
* **Tablet:** `640px – 1024px` — 2-column grid for calculator metrics.
* **Desktop:** `> 1024px` — Max container width `1300px`, side-by-side calculation cards and explanatory clinical content.
