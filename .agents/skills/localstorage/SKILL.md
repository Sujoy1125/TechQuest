---
name: localstorage
description: LocalStorage persistence guidelines, strict key management, and safe JSON serialization policies for TechQuest.
---

# LocalStorage State Management & Persistence Guidelines

This skill defines the storage architecture, key contracts, error handling, and safe access patterns for managing persistent state in TechQuest.

---

## Core Rules

1. **Single Point of Contact (`js/storage.js`)**:
   - `js/storage.js` is the **ONLY** module permitted to access, read, write, or clear `window.localStorage`.
   - Direct calls to `localStorage.getItem`, `localStorage.setItem`, `localStorage.removeItem`, or `localStorage.clear` anywhere else in the codebase are strictly forbidden.
   - All other modules must import and invoke exported helper methods from `js/storage.js`.

2. **Safe Serialization with Try/Catch Fallbacks**:
   - All `JSON.parse` and `JSON.stringify` operations, as well as `localStorage` reads/writes, must be wrapped in `try/catch` blocks.
   - Handle quota exceed errors, private browsing restrictions, and malformed JSON payloads gracefully without crashing the app.
   - Always return safe default fallback structures (e.g., empty array `[]`, empty object `{}`, or default profile) if reads fail or keys do not exist.

3. **Strict Storage Key Management**:
   Only the following 5 predefined storage keys are permitted:
   - `techquest_profile`: User profile data (name, email, role, avatar, XP, level, skills, unlocked badges).
   - `techquest_saved_events`: Array of bookmarked event/quest IDs (`string[]` or `number[]`).
   - `techquest_registrations`: Array of registered event records (registration timestamp, ticket ID, event details).
   - `techquest_completed_events`: Array of completed event IDs (`string[]` or `number[]`) preventing duplicate quest credit.
   - `techquest_theme`: User interface theme preference (`"dark"` | `"light"` | `"system"`).

---

## Standard Storage Key Schema

| Key Name | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `techquest_profile` | `Object` | Initial Profile Object | User profile, XP, skill matrix, and unlocked badge IDs |
| `techquest_saved_events` | `Array<string\|number>` | `[]` | List of bookmarked event IDs |
| `techquest_registrations` | `Array<Object>` | `[]` | List of active event registration records |
| `techquest_completed_events` | `Array<string\|number>` | `[]` | List of successfully completed event IDs |
| `techquest_theme` | `string` | `"dark"` | Active visual theme identifier |

---

## Implementation Template (`js/storage.js`)

```javascript
// js/storage.js

export const STORAGE_KEYS = Object.freeze({
  PROFILE: 'techquest_profile',
  SAVED_EVENTS: 'techquest_saved_events',
  REGISTRATIONS: 'techquest_registrations',
  COMPLETED_EVENTS: 'techquest_completed_events',
  THEME: 'techquest_theme'
});

const DEFAULT_PROFILE = Object.freeze({
  name: 'Tech Explorer',
  email: 'explorer@techquest.dev',
  role: 'Developer',
  xp: 0,
  level: 1,
  skills: {},
  badges: []
});

/**
 * Safe read from localStorage with fallback
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function getStorageItem(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[Storage] Failed to read key "${key}":`, err);
    return fallback;
  }
}

/**
 * Safe write to localStorage
 * @param {string} key
 * @param {any} value
 * @returns {boolean}
 */
export function setStorageItem(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[Storage] Failed to write key "${key}":`, err);
    return false;
  }
}

// Domain-Specific Accessors
export const getProfile = () => getStorageItem(STORAGE_KEYS.PROFILE, { ...DEFAULT_PROFILE });
export const saveProfile = (profile) => setStorageItem(STORAGE_KEYS.PROFILE, profile);

export const getSavedEvents = () => getStorageItem(STORAGE_KEYS.SAVED_EVENTS, []);
export const saveSavedEvents = (events) => setStorageItem(STORAGE_KEYS.SAVED_EVENTS, events);

export const getRegistrations = () => getStorageItem(STORAGE_KEYS.REGISTRATIONS, []);
export const saveRegistrations = (registrations) => setStorageItem(STORAGE_KEYS.REGISTRATIONS, registrations);

export const getCompletedEvents = () => getStorageItem(STORAGE_KEYS.COMPLETED_EVENTS, []);
export const saveCompletedEvents = (completed) => setStorageItem(STORAGE_KEYS.COMPLETED_EVENTS, completed);

export const getTheme = () => getStorageItem(STORAGE_KEYS.THEME, 'dark');
export const saveTheme = (theme) => setStorageItem(STORAGE_KEYS.THEME, theme);
```
