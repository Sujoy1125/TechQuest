---
name: vanilla-js
description: Modular ES6+ vanilla JavaScript guidelines, architecture, and event delegation patterns for TechQuest.
---

# Vanilla JavaScript Architecture & Development Standards

This skill defines the architectural guidelines, module breakdown, and coding patterns for the TechQuest application using pure, modern Vanilla JavaScript (ES6+).

---

## Core Principles

1. **Pure ES6+ Modular Standard**:
   - Strictly no external frameworks, UI libraries, or runtime build dependencies (e.g., React, Vue, jQuery).
   - Use standard native ES modules (`import` / `export`) loaded via `<script type="module" src="js/app.js"></script>`.
   - Take full advantage of modern features: destructuring, async/await, optional chaining, template literals, and arrow functions.

2. **Strict Module Separation & Responsibilities**:
   Execution is strictly decoupled into dedicated modules inside the `js/` directory:
   - `js/data.js`: Mock dataset, initial quest/event definitions, badge metadata, and constant configurations.
   - `js/storage.js`: The sole data access layer and single interface for `window.localStorage` persistence and retrieval.
   - `js/events.js`: Event filtering, sorting, searching, tag processing, and event list querying logic.
   - `js/registration.js`: Event registration flows, form validation, ticket creation, and attendee management.
   - `js/gamification.js`: XP computation, level calculation, skill tree progress, and badge unlocks.
   - `js/recommendation.js`: "Next Best Quest" scoring engine and algorithmic recommendations.
   - `js/ui.js`: DOM rendering, component templates, modal management, toasts, visual themes, and UI updates.
   - `js/app.js`: Main bootstrap entry point, router/view coordinator, and global event listener dispatcher.

3. **Event Delegation Pattern**:
   - **Zero Inline Handlers**: Never use inline `onclick`, `onchange`, or `onsubmit` attributes in HTML markup.
   - Attach listeners to persistent parent containers (e.g., `#app`, `#main-content`, `document.body`) using `addEventListener`.
   - Inspect event targets using `e.target.closest('[data-action]')` or dataset attributes (e.g., `data-action="register"`, `data-event-id="123"`).
   - Ensure clean event bubbling and prevent redundant listener attachments during re-renders.

---

## Module Breakdown & Contracts

### `js/data.js`
- Contains immutable master lists of TechQuest events/quests, skill categories, and badge definitions.
- Exports initial state seeds and category taxonomies.

### `js/storage.js`
- Exposes typed helper functions (`getProfile()`, `saveProfile()`, `getRegistrations()`, etc.).
- Enforces safe serialization, error handling, and key isolation.

### `js/events.js`
- Pure query and transformation utilities for event data.
- Handles search keywords, tag filtering (e.g., frontend, backend, ai, security), and difficulty filtering (Beginner, Intermediate, Advanced).

### `js/registration.js`
- Handles registration state changes, validating user input (email format, required fields, prerequisites).
- Syncs with storage and emits or triggers gamification updates.

### `js/gamification.js`
- Calculates player XP, tracks skill level increments, checks badge conditions, and validates quest completion rules.

### `js/recommendation.js`
- Computes multi-factor weighted match scores for uncompleted events based on user skills, interests, and history.

### `js/ui.js`
- Pure or side-effect-contained render functions that return HTML strings or construct DOM elements.
- Manages view toggling, modal dialogs, notifications, and dynamic badge animations.

### `js/app.js`
- Orchestrates application initialization upon `DOMContentLoaded`.
- Initializes state from storage, mounts UI views, and registers top-level delegated event listeners.

---

## Event Delegation Implementation Example

```javascript
// js/app.js
import { handleRegisterClick, handleCompleteQuest } from './events.js';
import { showModal } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.querySelector('#app');

  appContainer.addEventListener('click', (event) => {
    const actionBtn = event.target.closest('[data-action]');
    if (!actionBtn) return;

    const action = actionBtn.dataset.action;
    const eventId = actionBtn.dataset.eventId;

    switch (action) {
      case 'register-event':
        handleRegisterClick(eventId);
        break;
      case 'complete-event':
        handleCompleteQuest(eventId);
        break;
      case 'view-details':
        showModal(eventId);
        break;
      default:
        break;
    }
  });
});
```
