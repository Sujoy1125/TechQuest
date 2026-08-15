---
name: codeforge-judge
description: QA testing, automated evaluation, state persistence verification, and console error monitoring guidelines for TechQuest.
---

# CodeForge Judge & QA Testing Protocols

This skill outlines the quality assurance standards, functional verification test cases, error-free console constraints, and state persistence evaluations for TechQuest.

---

## 1. Core QA Pillars

All implementations must satisfy these three quality gates before passing evaluation:

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

## 2. Verification Checklist Matrix

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

---

## 3. Automated & Manual Test Scripts

### Console Error Monitor Setup
```javascript
// Test harness to assert zero console errors
const consoleErrors = [];
const originalError = console.error;
console.error = (...args) => {
  consoleErrors.push(args);
  originalError.apply(console, args);
};

export function assertZeroConsoleErrors() {
  if (consoleErrors.length > 0) {
    console.warn(`[CodeForge Judge] Failed: ${consoleErrors.length} console errors detected!`, consoleErrors);
    return false;
  }
  return true;
}
```

### State Persistence Test Suite
```javascript
export function runStatePersistenceTest(storageModule) {
  const testProfile = { name: "Test Hero", xp: 650, level: 2, badges: ["first-quest"], skills: {} };
  storageModule.saveProfile(testProfile);
  const loaded = storageModule.getProfile();
  
  console.assert(loaded.name === testProfile.name, "Profile name persistence failed");
  console.assert(loaded.xp === testProfile.xp, "Profile XP persistence failed");
  console.assert(loaded.level === testProfile.level, "Profile Level persistence failed");
}
```
