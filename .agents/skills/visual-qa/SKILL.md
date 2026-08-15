---
name: visual-qa
description: >-
  Use this skill to visually inspect the rendered UI of TechQuest and diagnose visual layout, typography, or styling flaws.
---

# Visual QA Skill

Use this skill to perform visual testing on TechQuest, looking for rendering issues or alignment bugs.

## Render Audit Process
1. Run local preview/server to host files.
2. Inspect pages (Home, Explore, Passport, My Events) on desktop, tablet, and mobile.
3. Review the following visual elements:
   - **Typography**: Font sizes, weights, line-heights, and readability.
   - **Spacing & Alignment**: Flexbox/grid layouts, alignment of headers and text columns.
   - **Navigation & Hero**: Header spacing, backdrop filters, and call-to-actions.
   - **Interactive Elements**: Hover states, visual feedback of cards, inputs, and modals.
   - **User Progression UI**: Passport panels, achievement badges, and XP progress bars.
   - **Special States**: Dark mode consistency and empty state illustrations.

## Output Requirement
Identify and report the **5 highest-impact visual problems**, categorized by:
- Component/Area
- Visual bug description
- Suggested CSS fix

## References
- [Design Specification](../../../docs/DESIGN.md)
- [Product Requirement Document](../../../docs/PRD.md)
- [Integration Contract](../../../docs/INTEGRATION_CONTRACT.md)
