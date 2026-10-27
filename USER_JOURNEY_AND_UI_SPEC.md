# auto-rig-web // Professional UI/UX & User Journey Specification

Minimalistic, high-performance interface architecture designed for zero friction.


## Design System Standards
- Palette: Zinc/Slate dark base (#090d16 / #02050b)
- Contrast: Minimum 7:1 WCAG AAA on all text
- Accent: Subtle monochrome with targeted cyan/emerald telemetry accents


## Keyboard Navigation & Shortcuts
- `[H]` or `[Esc]`: Toggle HUD and Controls visibility
- `[Space]`: Pause / Resume simulation passes
- `[R]`: Reset camera view to default orientation
- `[1-5]`: Quick preset profile selector
- Full ARIA landmarks across all dynamic panels


## First-Run User Journey
1. Zero-dependency launch: Open `examples/index.html` in Chrome/Edge/Brave
2. Real-time GPU capability detection activates automatically
3. Pre-baked interactive presets enable immediate inspection without configuration


## Real-Time Frame Telemetry
- Target: 16.6ms frame budget (60 FPS locked)
- Low-overhead requestAnimationFrame timestamp delta tracking
- Visual rolling history buffer (120 frames) with min/max/p99 latency indicators

