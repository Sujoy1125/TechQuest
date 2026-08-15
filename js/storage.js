// Thin compatibility wrapper re-exporting the new multi-user storage implementation
// Keeps the original module path js/storage.js working for external docs and agents.

export * from './storage_v2.js';
export { default } from './storage_v2.js';


export const STORAGE_KEYS = Object.freeze({
  PROFILE: 'techquest_profile',
  SAVED_EVENTS: 'techquest_saved_events',
  REGISTRATIONS: 'techquest_registrations',
  COMPLETED_EVENTS: 'techquest_completed_events',
  THEME: 'techquest_theme'
});

export const DEFAULT_PROFILE = Object.freeze({
  name: 'Alex Rivera',
  email: 'alex.rivera@techquest.dev',
  role: 'Full Stack Explorer',
  avatar: '🚀',
  xp: 0,
  level: 1,
  skills: {
    frontend: 0,
    backend: 0,
    ai: 0,
    cloud: 0,
    cybersecurity: 0,
    mobile: 0
  },
  interests: ['frontend', 'ai'],
  badges: []
});

// In-memory fallback for environments where window.localStorage is not accessible
const memoryFallbackStore = new Map();

/**
 * Check if localStorage is supported and available.
 * @returns {boolean}
 */
function isLocalStorageAvailable() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__tq_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely retrieve and parse a value from window.localStorage.
 * @template T
 * @param {string} key - The localStorage key name
 * @param {T} fallbackValue - Fallback value if missing or invalid
 * @returns {T}
 */
export function getStorageItem(key, fallbackValue) {
  try {
    if (isLocalStorageAvailable()) {
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw === undefined) {
        return fallbackValue;
      }
      return JSON.parse(raw);
    }
    // Fallback to in-memory store
    if (memoryFallbackStore.has(key)) {
      return JSON.parse(memoryFallbackStore.get(key));
    }
    return fallbackValue;
  } catch (error) {
    console.warn(`[TechQuest Storage] Failed to read/parse key "${key}":`, error);
    return fallbackValue;
  }
}

/**
 * Safely serialize and store a value into window.localStorage.
 * @param {string} key - The localStorage key name
 * @param {any} value - The data value to store
 * @returns {boolean} True if write succeeded, false otherwise
 */
export function setStorageItem(key, value) {
  try {
    const serialized = JSON.stringify(value);
    if (isLocalStorageAvailable()) {
      window.localStorage.setItem(key, serialized);
    }
    memoryFallbackStore.set(key, serialized);
    return true;
  } catch (error) {
    console.error(`[TechQuest Storage] Failed to write key "${key}":`, error);
    return false;
  }
}

/**
 * Safely remove an item from window.localStorage.
 * @param {string} key
 * @returns {boolean}
 */
export function removeStorageItem(key) {
  try {
    if (isLocalStorageAvailable()) {
      window.localStorage.removeItem(key);
    }
    memoryFallbackStore.delete(key);
    return true;
  } catch (error) {
    console.error(`[TechQuest Storage] Failed to remove key "${key}":`, error);
    return false;
  }
}

// ==========================================
// 1. Profile Management
// ==========================================

/**
 * Retrieve user profile from storage.
 * @returns {typeof DEFAULT_PROFILE}
 */
export function getProfile() {
  const profile = getStorageItem(STORAGE_KEYS.PROFILE, null);
  if (!profile) {
    const initial = JSON.parse(JSON.stringify(DEFAULT_PROFILE));
    saveProfile(initial);
    return initial;
  }
  return {
    ...DEFAULT_PROFILE,
    ...profile,
    skills: {
      ...DEFAULT_PROFILE.skills,
      ...(profile.skills || {})
    },
    interests: profile.interests || [...DEFAULT_PROFILE.interests],
    badges: profile.badges || []
  };
}

/**
 * Overwrite user profile in storage.
 * @param {Object} profile
 * @returns {boolean}
 */
export function saveProfile(profile) {
  return setStorageItem(STORAGE_KEYS.PROFILE, profile);
}

/**
 * Partially update existing profile fields.
 * @param {Object} partial
 * @returns {Object} Updated profile object
 */
export function updateProfile(partial) {
  const current = getProfile();
  const updated = {
    ...current,
    ...partial,
    skills: {
      ...current.skills,
      ...(partial.skills || {})
    }
  };
  saveProfile(updated);
  return updated;
}

// ==========================================
// 2. Saved / Bookmarked Events
// ==========================================

/**
 * Retrieve array of saved event IDs.
 * @returns {Array<string|number>}
 */
export function getSavedEvents() {
  return getStorageItem(STORAGE_KEYS.SAVED_EVENTS, []);
}

/**
 * Save array of bookmarked event IDs.
 * @param {Array<string|number>} eventIds
 * @returns {boolean}
 */
export function saveSavedEvents(eventIds) {
  const safeArray = Array.isArray(eventIds) ? eventIds : [];
  return setStorageItem(STORAGE_KEYS.SAVED_EVENTS, safeArray);
}

/**
 * Check if a specific event ID is bookmarked.
 * @param {string|number} eventId
 * @returns {boolean}
 */
export function isEventSaved(eventId) {
  const saved = getSavedEvents();
  return saved.includes(eventId);
}

/**
 * Toggle saved status for an event ID.
 * @param {string|number} eventId
 * @returns {boolean} New saved state (true if now saved, false if removed)
 */
export function toggleSavedEvent(eventId) {
  const saved = getSavedEvents();
  const index = saved.indexOf(eventId);
  let isSavedNow = false;

  if (index >= 0) {
    saved.splice(index, 1);
    isSavedNow = false;
  } else {
    saved.push(eventId);
    isSavedNow = true;
  }

  saveSavedEvents(saved);
  return isSavedNow;
}

// ==========================================
// 3. Registered Events
// ==========================================

/**
 * Retrieve registered event records.
 * @returns {Array<Object>}
 */
export function getRegistrations() {
  return getStorageItem(STORAGE_KEYS.REGISTRATIONS, []);
}

/**
 * Save registered event records.
 * @param {Array<Object>} registrations
 * @returns {boolean}
 */
export function saveRegistrations(registrations) {
  const safeArray = Array.isArray(registrations) ? registrations : [];
  return setStorageItem(STORAGE_KEYS.REGISTRATIONS, safeArray);
}

/**
 * Check if user is registered for an event ID.
 * @param {string|number} eventId
 * @returns {boolean}
 */
export function isRegistered(eventId) {
  const registrations = getRegistrations();
  return registrations.some(r => r.eventId === eventId);
}

/**
 * Add a new registration record.
 * @param {Object} registrationRecord
 * @returns {Array<Object>} Updated registrations list
 */
export function addRegistration(registrationRecord) {
  const registrations = getRegistrations();
  const exists = registrations.some(r => r.eventId === registrationRecord.eventId);
  if (!exists) {
    registrations.push({
      ...registrationRecord,
      registeredAt: registrationRecord.registeredAt || new Date().toISOString()
    });
    saveRegistrations(registrations);
  }
  return registrations;
}

// ==========================================
// 4. Completed Events
// ==========================================

/**
 * Retrieve list of completed event IDs.
 * @returns {Array<string|number>}
 */
export function getCompletedEvents() {
  return getStorageItem(STORAGE_KEYS.COMPLETED_EVENTS, []);
}

/**
 * Save list of completed event IDs.
 * @param {Array<string|number>} completedIds
 * @returns {boolean}
 */
export function saveCompletedEvents(completedIds) {
  const safeArray = Array.isArray(completedIds) ? completedIds : [];
  return setStorageItem(STORAGE_KEYS.COMPLETED_EVENTS, safeArray);
}

/**
 * Check if an event ID is already completed.
 * @param {string|number} eventId
 * @returns {boolean}
 */
export function isEventCompleted(eventId) {
  const completed = getCompletedEvents();
  return completed.includes(eventId);
}

/**
 * Mark an event as completed.
 * @param {string|number} eventId
 * @returns {boolean} True if newly added, false if was already completed
 */
export function addCompletedEvent(eventId) {
  const completed = getCompletedEvents();
  if (completed.includes(eventId)) {
    return false;
  }
  completed.push(eventId);
  saveCompletedEvents(completed);
  return true;
}

// ==========================================
// 5. Theme Preference
// ==========================================

/**
 * Retrieve user UI theme preference ('dark' | 'light' | 'system').
 * @returns {string}
 */
export function getTheme() {
  return getStorageItem(STORAGE_KEYS.THEME, 'dark');
}

/**
 * Save user UI theme preference.
 * @param {string} theme
 * @returns {boolean}
 */
export function saveTheme(theme) {
  const safeTheme = theme === 'light' ? 'light' : 'dark';
  return setStorageItem(STORAGE_KEYS.THEME, safeTheme);
}

// ==========================================
// 6. Global Reset Utility (QA / Testing)
// ==========================================

/**
 * Clear all TechQuest storage entries and reset to defaults.
 */
export function resetAllData() {
  Object.values(STORAGE_KEYS).forEach(key => removeStorageItem(key));
  memoryFallbackStore.clear();
  saveProfile(JSON.parse(JSON.stringify(DEFAULT_PROFILE)));
}
