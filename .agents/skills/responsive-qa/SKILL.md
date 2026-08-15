---
name: responsive-qa
description: >-
  Use this skill to test, debug, and verify the responsiveness and layout integrity of TechQuest across mobile, tablet, and desktop viewports.
---

# Responsive QA Skill

Use this skill to verify layout behavior across different display form factors. Prefer actual browser inspection and page rendering checks over source-code assumptions.

## Target Viewports
Test layouts explicitly at the following widths:
- **Mobile**: `375px`, `390px`, `414px`
- **Tablet**: `768px`, `1024px`
- **Desktop**: `1280px`, `1440px`

## Quality Checklist
Verify the following elements are free of layout bugs:
- **Horizontal Overflow**: No horizontal scroll bars on viewport body.
- **Layout Integrity**: No clipped content, overlapping text, or broken CSS grids/flexbox items.
- **Navigation & Headers**: Clean mobile navigation wrapping or hamburger transition.
- **Hero & CTA**: Call-to-action buttons should be easily tappable on mobile devices with adequate sizing.
- **Components**: Cards, form inputs, and overlay modals must size appropriately inside their parents.
- **Tablet/Desktop Widths**: Keep content lines readable by maintaining container maximum widths.

## References
- [Design Specification](../../../docs/DESIGN.md)
- [Product Requirement Document](../../../docs/PRD.md)
- [Integration Contract](../../../docs/INTEGRATION_CONTRACT.md)
