---
name: animation
description: >-
  Use this skill to design and implement premium, micro-animations and smooth transition effects in CSS for TechQuest.
---

# Animation Skill

Use this skill to build subtle, premium micro-animations that make the TechQuest UI feel modern and interactive without being distracting.

## Guidelines
- **Restrained Motion**: Keep transitions clean and responsive. Avoid excessive movement, long delays, or complex keyframe chains that lag devices.
- **Respect Accessibility**: Always include alternate reduced-motion styling:
  ```css
  @media (prefers-reduced-motion: reduce) {
      * {
          animation-delay: 0s !important;
          animation-duration: 0s !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0s !important;
          scroll-behavior: auto !important;
      }
  }
  ```

## Target Animations
Implement visual transitions for:
- **Navigation & Page**: Smooth fade-in and slide transitions for page entry.
- **User Progression**: Animated XP fill gains and pop effects for badges.
- **User Controls**: Hover scaling and glow transitions on cards, buttons, inputs, and tabs.
- **Modals & Overlays**: Clean backdrop blurs and scale transitions on modal overlay opening and closing.

## References
- [Design Specification](../../../docs/DESIGN.md)
- [Product Requirement Document](../../../docs/PRD.md)
- [Integration Contract](../../../docs/INTEGRATION_CONTRACT.md)
