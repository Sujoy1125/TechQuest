/**
 * TechQuest - Storage Layer (v2) — Multi-user LocalStorage Model
 * New file: js/storage_v2.js
 *
 * Responsibilities:
 * - Multi-user storage model using keys: techquest_users, techquest_session
 * - Backwards-compatible exported API that mirrors original js/storage.js
 * - One-time migration from legacy single-user keys into the new model
 */

export const STORAGE_KEYS = Object.freeze({
  USERS: 'techquest_users',
  SESSION: 'techquest_session',
  // keep legacy keys names for migration lookup
  LEGACY_PROFILE: 'techquest_profile',
  LEGACY_SAVED: 'techquest_saved_events',
  LEGACY_REGISTRATIONS: 'techquest_registrations',
  LEGACY_COMPLETED: 'techquest_completed_events',
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

// Public profile to use when no user is logged in (prevents showing Alex to everyone)
const PUBLIC_PROFILE = Object.freeze({
  name: 'Guest Explorer',
  email: '',
  role: 'Guest',
  avatar: '👤',
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
  interests: [],
  badges: []
});

// In-memory fallback store
const memoryFallbackStore = new Map();

function isLocalStorageAvailable() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = '__tq_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function getStorageItem(key, fallbackValue) {
  try {
    if (isLocalStorageAvailable()) {
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallbackValue;
      return JSON.parse(raw);
    }
    if (memoryFallbackStore.has(key)) return JSON.parse(memoryFallbackStore.get(key));
    return fallbackValue;
  } catch (err) {
    console.warn(`[TechQuest Storage v2] Failed to read key "${key}":`, err);
    return fallbackValue;
  }
}

function setStorageItem(key, value) {
  try {
    const serialized = JSON.stringify(value);
    if (isLocalStorageAvailable()) window.localStorage.setItem(key, serialized);
    memoryFallbackStore.set(key, serialized);
    return true;
  } catch (err) {
    console.error(`[TechQuest Storage v2] Failed to write key "${key}":`, err);
    return false;
  }
}

function removeStorageItem(key) {
  try {
    if (isLocalStorageAvailable()) window.localStorage.removeItem(key);
    memoryFallbackStore.delete(key);
    return true;
  } catch (err) {
    console.error(`[TechQuest Storage v2] Failed to remove key "${key}":`, err);
    return false;
  }
}

// -----------------------------
// User & Session Utilities
// -----------------------------

function generateId(prefix = 'u') {
  return `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 0xffff).toString(16)}`;
}

export function getUsers() {
  return getStorageItem(STORAGE_KEYS.USERS, []);
}

export function saveUsers(users) {
  return setStorageItem(STORAGE_KEYS.USERS, Array.isArray(users) ? users : []);
}

export function getSession() {
  return getStorageItem(STORAGE_KEYS.SESSION, null);
}

export function saveSession(sessionObj) {
  return setStorageItem(STORAGE_KEYS.SESSION, sessionObj);
}

export function clearSession() {
  return removeStorageItem(STORAGE_KEYS.SESSION);
}

export function createUser(userInput = {}) {
  const users = getUsers();
  const email = (userInput.email || '').trim().toLowerCase();
  if (!email) throw new Error('Email required');
  if (users.some(u => (u.email || '').toLowerCase() === email)) {
    throw new Error('Email already exists');
  }

  const now = new Date().toISOString();
  const user = {
    id: generateId('u'),
    name: userInput.name || 'Unnamed',
    email,
    college: userInput.college || '',
    password: userInput.password || '', // frontend demo storage; not secure
    avatar: userInput.avatar || '🚀',
    xp: Number(userInput.xp) || 0,
    level: Number(userInput.level) || 1,
    skills: userInput.skills || {...DEFAULT_PROFILE.skills},
    badges: userInput.badges || [],
    interests: Array.isArray(userInput.interests) ? userInput.interests : (userInput.interests ? [userInput.interests] : []),
    createdAt: now,
    savedEvents: Array.isArray(userInput.savedEvents) ? userInput.savedEvents : [],
    completedEvents: Array.isArray(userInput.completedEvents) ? userInput.completedEvents : []
  };

  users.push(user);
  saveUsers(users);
  return user;
}

export function findUserByEmail(email) {
  if (!email) return null;
  const users = getUsers();
  return users.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase()) || null;
}

export function getUserById(id) {
  if (!id) return null;
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}

export function updateUser(user) {
  if (!user || !user.id) return null;
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx === -1) return null;
  users[idx] = {...users[idx], ...user};
  saveUsers(users);
  return users[idx];
}

export function setCurrentUserSession(userId) {
  if (!userId) return saveSession(null);
  const session = { userId, loggedInAt: new Date().toISOString() };
  return saveSession(session);
}

export function getCurrentUserId() {
  const session = getSession();
  return session?.userId || null;
}

export function getCurrentUser() {
  const id = getCurrentUserId();
  if (!id) return null;
  return getUserById(id);
}

export function isLoggedIn() {
  return Boolean(getCurrentUserId());
}

// -----------------------------
// Legacy Migration
// -----------------------------

function migrateLegacyOnce() {
  try {
    const legacyProfile = getStorageItem(STORAGE_KEYS.LEGACY_PROFILE, null);
    if (!legacyProfile) return; // nothing to migrate

    // Avoid multiple migrations: check if users already exist
    const existingUsers = getUsers();
    if (existingUsers.length > 0) return;

    // Build new user from legacy profile
    const uid = generateId('u');
    const newUser = {
      id: uid,
      name: legacyProfile.name || DEFAULT_PROFILE.name,
      email: legacyProfile.email || `demo+${uid}@local`,
      college: legacyProfile.college || '',
      password: '',
      avatar: legacyProfile.avatar || DEFAULT_PROFILE.avatar,
      xp: Number(legacyProfile.xp) || 0,
      level: Number(legacyProfile.level) || 1,
      skills: legacyProfile.skills || DEFAULT_PROFILE.skills,
      badges: legacyProfile.badges || [],
      interests: legacyProfile.interests || DEFAULT_PROFILE.interests,
      createdAt: new Date().toISOString(),
      savedEvents: getStorageItem(STORAGE_KEYS.LEGACY_SAVED, []),
      completedEvents: getStorageItem(STORAGE_KEYS.LEGACY_COMPLETED, [])
    };

    // Migrate registrations: attach userId to each legacy registration
    const legacyRegs = getStorageItem(STORAGE_KEYS.LEGACY_REGISTRATIONS, []);
    const migratedRegs = Array.isArray(legacyRegs) ? legacyRegs.map(r => ({...r, userId: uid})) : [];

    // Persist migrated data
    saveUsers([newUser]);
    // overwrite old registrations key with migrated regs
    setStorageItem(STORAGE_KEYS.LEGACY_REGISTRATIONS, migratedRegs);

    // Create session for demo user
    saveSession({userId: uid, migratedAt: new Date().toISOString()});

    // Remove legacy profile and arrays (keep registrations under same key but now with userId)
    removeStorageItem(STORAGE_KEYS.LEGACY_PROFILE);
    removeStorageItem(STORAGE_KEYS.LEGACY_SAVED);
    removeStorageItem(STORAGE_KEYS.LEGACY_COMPLETED);

    console.log('[TechQuest Storage v2] Migrated legacy single-user profile into multi-user model.');
  } catch (err) {
    console.warn('[TechQuest Storage v2] Migration failed or skipped:', err);
  }
}

// Run migration immediately when module loads
migrateLegacyOnce();

// -----------------------------
// Public API (Backward-compatible wrappers)
// -----------------------------

// Profile management
export function getProfile() {
  const user = getCurrentUser();
  if (user) {
    return {
      ...DEFAULT_PROFILE,
      ...user,
      skills: {...DEFAULT_PROFILE.skills, ...(user.skills || {})},
      interests: user.interests || [...DEFAULT_PROFILE.interests],
      badges: user.badges || []
    };
  }
  // Not logged in — return a neutral public profile to avoid leaking Alex
  return {...PUBLIC_PROFILE};
}

export function saveProfile(profile) {
  const currentId = getCurrentUserId();
  if (!currentId) {
    // If no user session, create a demo user and persist profile
    const created = createUser(profile);
    saveSession({userId: created.id, createdAt: new Date().toISOString()});
    return true;
  }
  const user = getUserById(currentId);
  const updated = {...user, ...profile, skills: {...user.skills, ...(profile.skills || {})}};
  updateUser(updated);
  return true;
}

export function updateProfile(partial) {
  const currentId = getCurrentUserId();
  if (!currentId) {
    return saveProfile(partial);
  }
  const user = getUserById(currentId);
  const updated = {
    ...user,
    ...partial,
    skills: {...user.skills, ...(partial.skills || {})}
  };
  updateUser(updated);
  return updated;
}

// Saved events (per-user)
export function getSavedEvents() {
  const user = getCurrentUser();
  return user ? (Array.isArray(user.savedEvents) ? user.savedEvents : []) : [];
}

export function saveSavedEvents(eventIds) {
  const currentId = getCurrentUserId();
  if (!currentId) return false;
  const user = getUserById(currentId);
  user.savedEvents = Array.isArray(eventIds) ? eventIds : [];
  updateUser(user);
  return true;
}

export function isEventSaved(eventId) {
  const saved = getSavedEvents();
  return saved.includes(eventId);
}

export function toggleSavedEvent(eventId) {
  const currentId = getCurrentUserId();
  if (!currentId) return false;
  const user = getUserById(currentId);
  if (!user.savedEvents) user.savedEvents = [];
  const idx = user.savedEvents.indexOf(eventId);
  let nowSaved = false;
  if (idx >= 0) {
    user.savedEvents.splice(idx, 1);
    nowSaved = false;
  } else {
    user.savedEvents.push(eventId);
    nowSaved = true;
  }
  updateUser(user);
  return nowSaved;
}

// Registrations (global array but userId-scoped in reads/writes)
export function getRegistrations() {
  const allRegs = getStorageItem(STORAGE_KEYS.LEGACY_REGISTRATIONS, []);
  const uid = getCurrentUserId();
  if (!uid) return [];
  return allRegs.filter(r => String(r.userId) === String(uid));
}

export function saveRegistrations(registrations) {
  const allRegs = getStorageItem(STORAGE_KEYS.LEGACY_REGISTRATIONS, []);
  const uid = getCurrentUserId();
  if (!uid) return false;
  // Remove existing regs for user
  const filtered = allRegs.filter(r => String(r.userId) !== String(uid));
  // Ensure incoming regs have userId
  const incoming = Array.isArray(registrations) ? registrations.map(r => ({...r, userId: uid})) : [];
  const combined = filtered.concat(incoming);
  return setStorageItem(STORAGE_KEYS.LEGACY_REGISTRATIONS, combined);
}

export function isRegistered(eventId) {
  const regs = getRegistrations();
  return regs.some(r => String(r.eventId) === String(eventId));
}

export function addRegistration(registrationRecord) {
  const allRegs = getStorageItem(STORAGE_KEYS.LEGACY_REGISTRATIONS, []);
  const uid = getCurrentUserId();
  if (!uid) throw new Error('User must be logged in to register for events.');
  const exists = allRegs.some(r => String(r.eventId) === String(registrationRecord.eventId) && String(r.userId) === String(uid));
  if (!exists) {
    const record = {
      ...registrationRecord,
      userId: uid,
      registeredAt: registrationRecord.registeredAt || new Date().toISOString()
    };
    allRegs.push(record);
    setStorageItem(STORAGE_KEYS.LEGACY_REGISTRATIONS, allRegs);
  }
  return allRegs.filter(r => String(r.userId) === String(uid));
}

// Completed events (per-user)
export function getCompletedEvents() {
  const user = getCurrentUser();
  return user ? (Array.isArray(user.completedEvents) ? user.completedEvents : []) : [];
}

export function saveCompletedEvents(completedIds) {
  const uid = getCurrentUserId();
  if (!uid) return false;
  const user = getUserById(uid);
  user.completedEvents = Array.isArray(completedIds) ? completedIds : [];
  updateUser(user);
  return true;
}

export function isEventCompleted(eventId) {
  const completed = getCompletedEvents();
  return completed.includes(eventId);
}

export function addCompletedEvent(eventId) {
  const uid = getCurrentUserId();
  if (!uid) throw new Error('User must be logged in to complete events.');
  const user = getUserById(uid);
  if (!user.completedEvents) user.completedEvents = [];
  if (user.completedEvents.includes(eventId)) return false;
  user.completedEvents.push(eventId);
  updateUser(user);
  return true;
}

// Theme
export function getTheme() {
  return getStorageItem(STORAGE_KEYS.THEME, 'dark');
}

export function saveTheme(theme) {
  const safeTheme = theme === 'light' ? 'light' : 'dark';
  return setStorageItem(STORAGE_KEYS.THEME, safeTheme);
}

// Reset utility (clear new keys and reinitialize)
export function resetAllData() {
  // Remove session but keep users array (so accounts persist) — but the legacy reset behaviour reset everything
  removeStorageItem(STORAGE_KEYS.LEGACY_REGISTRATIONS);
  removeStorageItem(STORAGE_KEYS.USERS);
  removeStorageItem(STORAGE_KEYS.SESSION);
  removeStorageItem(STORAGE_KEYS.THEME);
  memoryFallbackStore.clear();
  // Recreate default demo profile as in legacy file (for QA convenience)
  // Create one default user from DEFAULT_PROFILE
  const demo = createUser(DEFAULT_PROFILE);
  saveSession({userId: demo.id, createdAt: new Date().toISOString()});
}

// Small helper for auth flows
export function authenticateUser(email, password) {
  const user = findUserByEmail(email);
  if (!user) return null;
  if ((user.password || '') === (password || '')) return user;
  return null;
}

export function logoutCurrentUser() {
  clearSession();
}

// Exported for backwards-compatibility: keep function names as original storage.js provided
// (getProfile, saveProfile, updateProfile, getSavedEvents, saveSavedEvents, isEventSaved, toggleSavedEvent,
//  getRegistrations, saveRegistrations, isRegistered, addRegistration, getCompletedEvents, saveCompletedEvents,
//  isEventCompleted, addCompletedEvent, getTheme, saveTheme, resetAllData)

// Export low-level helpers for compatibility/test uses
export { getStorageItem, setStorageItem, removeStorageItem };

// Additional exports available for auth.js

export default {
  STORAGE_KEYS,
  DEFAULT_PROFILE
};
