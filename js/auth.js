/**
 * TechQuest - Auth Module (frontend demo)
 * File: js/auth.js
 * Exposes registerUser, loginUser, logoutUser, getCurrentUser, isLoggedIn
 */

import {
  createUser,
  findUserByEmail,
  authenticateUser,
  setCurrentUserSession,
  getCurrentUser,
  isLoggedIn as storageIsLoggedIn,
  getUsers
} from './storage_v2.js';

/**
 * Basic form validation for registration
 */
function validateRegistrationInput({ name, email, college, password, confirmPassword, interests }) {
  const errors = {};
  if (!name || String(name).trim().length < 2) errors.name = 'Please enter your full name.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) errors.email = 'Please enter a valid email address.';
  if (!college || String(college).trim().length < 2) errors.college = 'Please enter your college.';
  if (!password || String(password).length < 6) errors.password = 'Password must be at least 6 characters.';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  if (!interests || !Array.isArray(interests) || interests.length === 0) errors.interests = 'Select at least one interest.';
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateLoginInput({ email, password }) {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalized = (email || '').trim();

  if (!normalized) {
    errors.email = 'Email is required.';
  } else if (!emailRegex.test(normalized)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

async function hashPassword(password) {
  // Simple client-side SHA-256 hashing using Web Crypto
  try {
    const enc = new TextEncoder();
    const data = enc.encode(password || '');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Fallback: use btoa salted string (not secure but better than plain if subtle unavailable)
    return btoa('tq_salt:' + (password || ''));
  }
}

export async function registerUser({ name, email, college, password, confirmPassword, interests }) {
  const input = { name, email, college, password, confirmPassword, interests };
  const validation = validateRegistrationInput(input);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  // Prevent duplicate email
  if (findUserByEmail(email)) {
    return { success: false, errors: { email: 'An account with this email already exists.' } };
  }

  try {
    const hashed = await hashPassword(password);
    const newUser = createUser({ name, email, college, password: hashed, interests });
    // create session
    setCurrentUserSession(newUser.id);
    return { success: true, user: newUser };
  } catch (err) {
    return { success: false, errors: { general: err.message || 'Registration failed' } };
  }
}

export async function loginUser({ email, password }) {
  const validation = validateLoginInput({ email, password });
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  const normalized = (email || '').trim().toLowerCase();
  const hashed = await hashPassword(password);
  const user = authenticateUser(normalized, hashed);
  if (!user) {
    return {
      success: false,
      errors: {
        general: 'Invalid email or password.'
      }
    };
  }

  setCurrentUserSession(user.id);
  return { success: true, user };
}

export function logoutUser() {
  // Clears current session
  setCurrentUserSession(null);
}

export function getCurrentUserInfo() {
  return getCurrentUser();
}

export function isLoggedIn() {
  return storageIsLoggedIn();
}

// Small utility for UI pages to learn available interests (optional)
export function listAllUsers() {
  return getUsers();
}
