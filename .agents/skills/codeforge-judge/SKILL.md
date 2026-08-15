---
name: codeforge-judge
description: >-
  Use this skill to audit the TechQuest codebase against CodeForge WebSprint 2026 judging rubrics, run QA test protocols, and generate scoring estimates.
---

# CodeForge Judge & QA Testing Protocols

Use this skill to review the current implementation against the CodeForge WebSprint 2026 rules, judging metrics, and functional QA test cases.

---

## 1. Scorecard and Judging Criteria

Evaluate the project against the official CodeForge Scorecard:

```text
CODEFORGE SCORECARD

Functionality: __/35
UI/UX: __/25
Responsiveness: __/15
Code Quality: __/10
Creativity: __/15
TOTAL: __/100
```

### Evaluation Focus Areas for Person 1
- **UI/UX (25 pts)**: Visual hierarchy, dark mode quality, accessibility contrast, transitions, and professional look.
- **Responsiveness (15 pts)**: Layout rendering on target viewport widths (375px-1440px).
- **Creativity (15 pts)**: Visual implementation of the custom feature sequence:
  `EVENT → SKILLS → XP → BADGES → NEXT BEST QUEST`
- **Mandatory Requirements Checklist**:
  - Home Page (Hero, Highlights, CTA)
  - Event Listing (Minimum 6 events, title, date, tag, details, register CTA)
  - Search & Filters (Name search, category filter)
  - Registration Form (Validated input fields: name, email, college, event selector)

---

## 2. Core QA Pillars

All implementations must satisfy these three quality gates:

1. **State Persistence Verification**:
   - Refreshing or reopening the browser must preserve all state seamlessly via `js/storage.js`.
   - Modifying user profile, registering for quests, completing quests, toggling bookmarks, or changing themes must immediately reflect in storage.
   - Corrupted or cleared localStorage must fall back gracefully to default state without app crashes.

2. **Strict Form Validation**:
   - Event registration forms must perform client-side validation:
     - Required field checks (Full Name, Email, Role/Experience).
     - Valid email format validation regex.
     - Confirmation of prerequisites (if event requires specific skill level or completed prerequisite quest).
   - Validation errors must display accessible, inline visual feedback.
   - Form submission must prevent default browser refresh (`e.preventDefault()`).

3. **Event Handling & Error-Free Console**:
   - Zero unhandled exceptions, rejected promises, or console errors during all user interactions.
   - Dynamic buttons, modals, dropdowns, and search inputs must function reliably using delegated event handlers.
   - Ensure clean event bubbling without duplicate event executions or memory leaks.

---

## 3. Verification Checklist Matrix

| Area | Test Scenario | Acceptance Criteria |
| :--- | :--- | :--- |
| **Storage** | Page Refresh Persistence | XP, registrations, completed quests, and theme persist across browser reload. |
| **Storage** | Fallback Resilience | Invalid JSON in localStorage triggers try/catch and falls back to default state safely. |
| **Gamification** | Level Up Calculation | XP $\ge 500$ advances Level to 2; progress bar renders correctly. |
| **Gamification** | Duplicate Prevention | Attempting to complete already-completed event displays warning and denies duplicate XP. |
| **Registration** | Input Validation | Invalid emails or blank required inputs show inline errors and block submission. |
| **Registration** | Ticket Generation | Successful registration adds unique ticket ID and updates registration store. |
| **Recommendation**| Next Best Quest | Algorithm returns highest-scoring uncompleted quest with a descriptive reason string. |
| **UI & UX** | Zero Console Errors | Browser console remains clean across all tab switches, modal opens, and interactions. |
| **UI & UX** | Event Delegation | All dynamic cards, modal triggers, and actions fire accurately via delegated root listeners. |

## References
- [Product Requirement Document](../../../docs/PRD.md)
- [Design Specification](../../../docs/DESIGN.md)
- [Integration Contract](../../../docs/INTEGRATION_CONTRACT.md)
