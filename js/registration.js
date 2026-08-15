/**
 * TechQuest - Registration Management Module
 * Module: js/registration.js
 * 
 * Handles client-side form validation, unique ticket generation (TQ-2026-XXXX),
 * duplicate registration prevention, and attendee ticket management.
 */

import { EVENTS_DATA } from './data.js';
import {
  getRegistrations,
  saveRegistrations,
  addRegistration,
  isRegistered
} from './storage.js';

/**
 * Generate a unique registration ticket ID formatted strictly as TQ-2026-XXXX.
 * @returns {string} e.g. "TQ-2026-8A3F"
 */
export function generateTicketId() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomHex = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomHex += characters[randomIndex];
  }
  return `TQ-2026-${randomHex}`;
}

/**
 * Validates registration form inputs.
 * 
 * @param {Object} formData
 * @param {string} formData.fullName - Attendee's full name
 * @param {string} formData.email - Attendee's email address
 * @param {string} formData.role - Attendee's professional role / track
 * @returns {{ isValid: boolean, errors: Object.<string, string> }}
 */
export function validateRegistrationForm(formData = {}) {
  const errors = {};
  const fullName = (formData.fullName || '').trim();
  const email = (formData.email || '').trim();
  const role = (formData.role || '').trim();

  // 1. Full Name validation
  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters long.';
  } else if (!/^[a-zA-Z\s.'-]+$/.test(fullName)) {
    errors.fullName = 'Full name contains invalid characters.';
  }

  // 2. Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  // 3. Role validation
  if (!role) {
    errors.role = 'Please select or enter your developer role.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Register an attendee for an event.
 * Validates form, checks for duplicate registration, generates ticket ID, and stores record.
 * 
 * @param {string|number} eventId - Target event ID
 * @param {Object} formData - Form input values
 * @param {string} formData.fullName
 * @param {string} formData.email
 * @param {string} formData.role
 * @param {string} [formData.experience]
 * @returns {{ success: boolean, registration?: Object, errors?: Object.<string, string>, message?: string }}
 */
export function registerForEvent(eventId, formData = {}) {
  const event = EVENTS_DATA.find(e => String(e.id) === String(eventId));
  if (!event) {
    return {
      success: false,
      message: `Event with ID "${eventId}" does not exist.`
    };
  }

  // 1. Duplicate registration check
  if (isRegistered(eventId)) {
    return {
      success: false,
      message: `You are already registered for "${event.title}".`
    };
  }

  // 2. Form validation
  const validation = validateRegistrationForm(formData);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
      message: 'Please resolve the highlighted validation errors.'
    };
  }

  // 3. Generate unique ticket ID
  const ticketId = generateTicketId();

  // 4. Construct registration record
  const registrationRecord = {
    ticketId,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    eventLocation: event.location,
    eventCategory: event.category,
    xpReward: event.xpReward,
    skillDomain: event.skillDomain,
    attendeeName: formData.fullName.trim(),
    attendeeEmail: formData.email.trim().toLowerCase(),
    attendeeRole: formData.role.trim(),
    experience: formData.experience || 'Intermediate',
    registeredAt: new Date().toISOString(),
    status: 'Confirmed'
  };

  // 5. Save to storage
  addRegistration(registrationRecord);

  return {
    success: true,
    registration: registrationRecord,
    message: `Successfully registered for "${event.title}"! Ticket ID: ${ticketId}`
  };
}

/**
 * Cancel an existing registration.
 * @param {string|number} eventId
 * @returns {{ success: boolean, message: string }}
 */
export function cancelRegistration(eventId) {
  const registrations = getRegistrations();
  const index = registrations.findIndex(r => String(r.eventId) === String(eventId));

  if (index === -1) {
    return {
      success: false,
      message: 'Registration record not found.'
    };
  }

  const removed = registrations.splice(index, 1)[0];
  saveRegistrations(registrations);

  return {
    success: true,
    message: `Registration for "${removed.eventTitle}" was cancelled.`
  };
}

/**
 * Retrieve ticket registration details for a specific event.
 * @param {string|number} eventId
 * @returns {Object|null}
 */
export function getRegistrationByEventId(eventId) {
  const registrations = getRegistrations();
  return registrations.find(r => String(r.eventId) === String(eventId)) || null;
}
