---
name: accessibility
description: >-
  Use this skill to audit and implement accessibility (A11y) standards in TechQuest, including semantic HTML structure and keyboard navigation.
---

# Accessibility Skill

Use this skill to make the application accessible and compliant with modern web standards.

## Accessibility Requirements
- **Semantic HTML**: Use proper tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) instead of nested divs where appropriate.
- **Heading Hierarchy**: Maintain a structured heading order (one `<h1>` per page, sequential `<h2>`, `<h3>` tags).
- **Forms & Inputs**: Pair every form element with a label, use clear placeholder attributes, and support accessible error states.
- **Keyboard Navigation**: Check tab indices and provide clear visual focus indicators (`outline` states on focus).
- **Modals**: Ensure screen readers notice opened modals. Provide an Escape key listener to close modals immediately.
- **Buttons**: Provide accessible names or `aria-label` tags for icon-only buttons.
- **Contrast**: Ensure text color choices satisfy WCAG AA/AAA compliance thresholds against dark backing.
- **Media**: Add meaningful `alt` text to images and illustrations.
- **Touch Targets**: Keep interactive elements at a minimum size of 44x44px for touch interfaces.
- **Motion Options**: Support `prefers-reduced-motion` media queries.

## References
- [Design Specification](../../../docs/DESIGN.md)
- [Product Requirement Document](../../../docs/PRD.md)
- [Integration Contract](../../../docs/INTEGRATION_CONTRACT.md)
