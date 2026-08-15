---
name: integration-qa
description: >-
  Use this skill to verify that the HTML DOM selectors match the expectations of Person 2's JavaScript files and the Integration Contract.
---

# Integration QA Skill

Use this skill to audit HTML file markup against the javascript integration contract, ensuring no selectors are broken.

## Core Rules
- **HTML is an API**: The DOM structure (specifically IDs, classes, and structure tags) serves as the API surface for Person 2's JavaScript application logic.
- **No Silent Renaming**: Never rename IDs or target classes used in Javascript selector queries without alignment.

## Verification Checklist
Confirm that you detect and resolve:
- **Identifier Mismatches**: Missing, renamed, or duplicate `id` tags in HTML.
- **Selector Failures**: Obsolete or broken selector queries in JS.
- **Missing Elements**: DOM nodes, forms, inputs, buttons, or wrapper containers that the JS expects to query but are missing in the HTML markup.
- **Null Reference Prevention**: Ensure selectors do not return `null`, causing application crashes.

## References
- [Integration Contract](../../../docs/INTEGRATION_CONTRACT.md)
- [Product Requirement Document](../../../docs/PRD.md)
- [Design Specification](../../../docs/DESIGN.md)
