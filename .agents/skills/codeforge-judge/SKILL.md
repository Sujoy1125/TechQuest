---
name: codeforge-judge
description: >-
  Use this skill to audit the TechQuest codebase against CodeForge WebSprint 2026 judging rubrics and generate scoring estimates.
---

# CodeForge Judge Skill

Use this skill to review the current implementation against the CodeForge WebSprint 2026 rules and judging metrics.

## Judging Criteria & Scorecard
Evaluate the project and fill out this template:

```text
CODEFORGE SCORECARD

Functionality: __/35
UI/UX: __/25
Responsiveness: __/15
Code Quality: __/10
Creativity: __/15
TOTAL: __/100
```

## Person 1 Review Focus areas
Pay close attention to:
- **UI/UX (25 pts)**: Visual hierarchy, dark mode quality, accessibility contrast, transitions.
- **Responsiveness (15 pts)**: Layout rendering on target viewport widths (375px-1440px).
- **Creativity (15 pts)**: Implementation of the custom feature sequence:
  `EVENT → SKILLS → XP → BADGES → NEXT BEST QUEST`
- **Mandatory Requirements Checklist**:
  - Home Page (Hero, Highlights, CTA)
  - Event Listing (Minimum 6 events, title, date, tag, details, register CTA)
  - Search & Filters (Name search, category filter)
  - Registration Form (Validated input fields: name, email, college, event selector)

## Post-Evaluation Output
Following the scorecard evaluation, list the **highest-impact improvements** needed to maximize points.

## References
- [Product Requirement Document](../../../docs/PRD.md)
- [Design Specification](../../../docs/DESIGN.md)
- [Integration Contract](../../../docs/INTEGRATION_CONTRACT.md)
