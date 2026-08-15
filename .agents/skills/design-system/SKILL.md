---
name: design-system
description: >-
  Use this skill to maintain, update, and apply centralized CSS design tokens and reusable patterns across TechQuest.
---

# Design System Skill

Use this skill to prevent random one-off styling by enforcing centralized design tokens and reusable UI patterns in CSS.

## Centralized CSS Design Tokens
Ensure all styling references CSS variables defined in `:root` (in `css/style.css`):
- **Colors**: Dark theme backgrounds, accents (indigo/purple), text states (primary/secondary/muted), border boundaries.
- **Typography**: `Outfit` font, responsive typography scale, font-weights.
- **Spacing**: Consistent padding and margin scales (e.g., margins matching multi-step spacing).
- **Borders & Shadows**: Standardized `border-radius` and glowing ambient shadows (`box-shadow`).
- **Transitions**: Smooth easing functions (e.g., `cubic-bezier(0.4, 0, 0.2, 1)`).

## Reusable Patterns
Ensure consistent HTML/CSS implementation of the following:
- **Interactive**: Buttons, navigation links, and input forms.
- **Display**: Cards, chips, badges, and progress bars.
- **States**: Modals, empty states, and success/error feedbacks.

## References
- [Design Specification](../../../docs/DESIGN.md)
- [Product Requirement Document](../../../docs/PRD.md)
- [Integration Contract](../../../docs/INTEGRATION_CONTRACT.md)
