/**
 * TechQuest - CodeForge Judge Automated QA Audit Suite
 * 
 * Verifies:
 * 1. Zero Console Errors
 * 2. Storage Persistence & Safe Fallbacks
 * 3. Form Validation & Ticket ID Generation
 * 4. Gamification Lifecycle: Register -> Complete -> Gain XP -> Level Up -> Unlocks Badges
 * 5. Duplicate Completion Prevention
 * 6. "Next Best Quest" Multi-factor Recommendation Engine
 * 7. Search, Filtering, and Sorting Integrity
 */

import { EVENTS_DATA, BADGE_DEFINITIONS } from './js/data.js';
import * as storage from './js/storage_v2.js';
import * as gamification from './js/gamification.js';
import * as recommendation from './js/recommendation.js';
import * as eventsModule from './js/events.js';
import * as regModule from './js/registration.js';

// Console Error Interceptor
const consoleErrors = [];
const originalError = console.error;
console.error = (...args) => {
  consoleErrors.push(args);
  originalError.apply(console, args);
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[QA FAILURE] ${message}`);
  }
}

async function runFullQAAudit() {
  console.log('====================================================');
  console.log('  TECHQUEST CODEFORGE JUDGE AUTOMATED QA AUDIT');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // TEST GATE 1: Storage Layer & Persistence
  // ----------------------------------------------------
  console.log('▶ [Gate 1] Testing Storage Initialization & Persistence...');
  storage.resetAllData();
  
  const initialProfile = storage.getProfile();
  assert(initialProfile.xp === 0, 'Initial XP must be 0');
  assert(initialProfile.level === 1, 'Initial Level must be 1');
  assert(Array.isArray(initialProfile.badges), 'Badges must be an array');
  assert(typeof initialProfile.skills === 'object', 'Skills must be an object');

  // Test Profile Save & Update
  storage.updateProfile({ name: 'Code Hero', role: 'Staff Architect' });
  const updatedProfile = storage.getProfile();
  assert(updatedProfile.name === 'Code Hero', 'Profile update name persistence failed');
  assert(updatedProfile.role === 'Staff Architect', 'Profile update role persistence failed');

  // Test Theme Persistence
  storage.saveTheme('light');
  assert(storage.getTheme() === 'light', 'Theme persistence failed');
  storage.saveTheme('dark');
  assert(storage.getTheme() === 'dark', 'Theme dark toggle persistence failed');

  // Test Fallback Resilience
  assert(storage.getStorageItem('non_existent_key', 42) === 42, 'Fallback value failed for missing key');
  console.log('✔ [Gate 1] Storage persistence & fallbacks passed.\n');

  // ----------------------------------------------------
  // TEST GATE 2: Form Validation & Registration
  // ----------------------------------------------------
  console.log('▶ [Gate 2] Testing Form Validation & Ticket Generation...');

  // Blank Form Validation
  const blankValidation = regModule.validateRegistrationForm({});
  assert(!blankValidation.isValid, 'Blank form must be invalid');
  assert(!!blankValidation.errors.fullName, 'Full name required error missing');
  assert(!!blankValidation.errors.email, 'Email required error missing');
  assert(!!blankValidation.errors.role, 'Role required error missing');

  // Invalid Email Validation
  const badEmailValidation = regModule.validateRegistrationForm({
    fullName: 'Ada Lovelace',
    email: 'not-an-email',
    role: 'Backend Developer'
  });
  assert(!badEmailValidation.isValid, 'Invalid email must fail validation');
  assert(badEmailValidation.errors.email.includes('valid email'), 'Email format error missing');

  // Valid Registration
  const event1 = EVENTS_DATA[0];
  const regResult = regModule.registerForEvent(event1.id, {
    fullName: 'Ada Lovelace',
    email: 'ada@lovelace.dev',
    role: 'Backend Developer',
    experience: 'Advanced'
  });
  assert(regResult.success, 'Valid registration failed');
  assert(regResult.registration.eventId === event1.id, 'Registered event ID mismatch');
  assert(/^TQ-2026-[A-Z0-9]{4}$/.test(regResult.registration.ticketId), `Ticket format invalid: ${regResult.registration.ticketId}`);
  assert(storage.isRegistered(event1.id), 'Registration status not reflected in storage');

  // Duplicate Registration Prevention
  const dupRegResult = regModule.registerForEvent(event1.id, {
    fullName: 'Ada Lovelace',
    email: 'ada@lovelace.dev',
    role: 'Backend Developer'
  });
  assert(!dupRegResult.success, 'Duplicate registration was not blocked!');
  console.log(`✔ [Gate 2] Form validation, Ticket ${regResult.registration.ticketId}, and duplicate prevention passed.\n`);

  // ----------------------------------------------------
  // TEST GATE 3: Gamification Lifecycle & Quest Completion
  // ----------------------------------------------------
  console.log('▶ [Gate 3] Testing Quest Completion, XP Award, and Level Formulas...');

  assert(!storage.isEventCompleted(event1.id), 'Event 1 should initially not be completed');
  const initialXp = gamification.getUserXp();
  assert(initialXp === 0, 'Starting XP should be 0');

  // Complete Event 1 (450 XP)
  const completeOutcome1 = gamification.completeEvent(event1.id);
  assert(completeOutcome1.success, 'Completion failed');
  assert(completeOutcome1.xpGained === event1.xpReward, `Expected ${event1.xpReward} XP, got ${completeOutcome1.xpGained}`);
  assert(gamification.getUserXp() === event1.xpReward, `User XP not updated in storage. Current: ${gamification.getUserXp()}`);
  assert(storage.isEventCompleted(event1.id), 'Event not marked as completed in storage');
  assert(completeOutcome1.newLevel === 1, '450 XP should remain Level 1 (Level = floor(450/500)+1 = 1)');
  
  // Verify Skill Increment
  const skillsAfter1 = gamification.getSkillLevels();
  assert((skillsAfter1[event1.skillDomain] || 0) > 0, `Skill domain ${event1.skillDomain} was not incremented`);
  assert(skillsAfter1[event1.skillDomain] <= 100, 'Skill points must be capped at 100');

  // Verify Badges
  const activeBadges1 = gamification.getActiveBadges();
  assert(activeBadges1.some(b => b.id === 'first-quest'), 'First Quest Complete badge was not awarded');
  assert(activeBadges1.some(b => b.id === 'hackathon-veteran'), 'Hackathon Veteran badge was not awarded');

  // TEST DUPLICATE COMPLETION PREVENTION
  console.log('▶ Testing strict duplicate completion prevention for Event 1...');
  let duplicateBlocked = false;
  try {
    gamification.completeEvent(event1.id);
  } catch (err) {
    duplicateBlocked = true;
  }
  assert(duplicateBlocked, 'Duplicate quest completion must throw an error and block double XP awards!');
  assert(gamification.getUserXp() === event1.xpReward, 'XP must not change after blocked duplicate completion attempt');

  // Complete Event 2 to trigger Level Up (350 XP -> Total 800 XP -> Level 2)
  const event2 = EVENTS_DATA[1];
  const completeOutcome2 = gamification.completeEvent(event2.id);
  assert(gamification.getUserXp() === 800, `Expected 800 XP, got ${gamification.getUserXp()}`);
  assert(completeOutcome2.newLevel === 2, `Expected Level 2, got ${completeOutcome2.newLevel}`);
  assert(completeOutcome2.leveledUp === true, 'leveledUp flag should be true');

  // Complete Event 3 (400 XP -> Total 1200 XP -> Level 3)
  const event3 = EVENTS_DATA[2];
  const completeOutcome3 = gamification.completeEvent(event3.id);
  assert(gamification.getUserXp() === 1200, `Expected 1200 XP, got ${gamification.getUserXp()}`);
  assert(completeOutcome3.newLevel === 3, `Expected Level 3, got ${completeOutcome3.newLevel}`);
  assert(gamification.getActiveBadges().some(b => b.id === 'xp-titan'), 'XP Titan badge should be awarded at Level 3');

  console.log('✔ [Gate 3] Quest completion, duplicate protection, XP calculations, and level ups passed.\n');

  // ----------------------------------------------------
  // TEST GATE 4: "Next Best Quest" Recommendation Engine
  // ----------------------------------------------------
  console.log('▶ [Gate 4] Testing Next Best Quest Algorithm & Reasoning...');

  const recommendationResult = recommendation.getNextBestQuest();
  assert(recommendationResult.event !== null, 'Recommendation must return a quest');
  assert(![event1.id, event2.id, event3.id].includes(recommendationResult.event.id), 'Recommendation must exclude completed quests');
  assert(recommendationResult.matchPercentage >= 0 && recommendationResult.matchPercentage <= 100, `Match percentage out of range: ${recommendationResult.matchPercentage}`);
  assert(typeof recommendationResult.reason === 'string' && recommendationResult.reason.length > 10, 'Explainable reason missing or invalid');

  console.log(`✔ [Gate 4] Recommended: "${recommendationResult.event.title}" (${recommendationResult.matchPercentage}% match). Reason: "${recommendationResult.reason}"\n`);

  // ----------------------------------------------------
  // TEST GATE 5: Catalog Searching, Filtering & Sorting
  // ----------------------------------------------------
  console.log('▶ [Gate 5] Testing Search, Filter & Sort Matrices...');

  const allEvents = eventsModule.getAllEvents();
  assert(allEvents.length === 12, 'Catalog must contain 12 events');

  // Text search
  const ctfResults = eventsModule.filterEvents(allEvents, { query: 'CTF' });
  assert(ctfResults.length === 1 && ctfResults[0].id === 'event-5', 'Search query "CTF" failed');

  // Category filter
  const bootcamps = eventsModule.filterEvents(allEvents, { category: 'Bootcamp' });
  assert(bootcamps.length === 3, `Expected 3 bootcamps, got ${bootcamps.length}`);

  // Tab filter: completed
  const completedFilter = eventsModule.filterEvents(allEvents, { filterType: 'completed' });
  assert(completedFilter.length === 3, `Expected 3 completed events, got ${completedFilter.length}`);

  // Sorting
  const sortedXp = eventsModule.sortEvents(allEvents, 'xp-desc');
  assert(sortedXp[0].xpReward >= sortedXp[sortedXp.length - 1].xpReward, 'XP descending sort failed');

  const sortedDate = eventsModule.sortEvents(allEvents, 'date-asc');
  assert(new Date(sortedDate[0].date) <= new Date(sortedDate[sortedDate.length - 1].date), 'Date ascending sort failed');

  console.log('✔ [Gate 5] Search, multi-criteria filters, and sorting verified.\n');

  // ----------------------------------------------------
  // TEST GATE 6: Console Error Monitoring
  // ----------------------------------------------------
  console.log('▶ [Gate 6] Checking Console Error Logs...');
  if (consoleErrors.length > 0) {
    console.error('Console errors logged during execution:', consoleErrors);
    throw new Error(`[QA FAILURE] ${consoleErrors.length} unhandled console errors detected.`);
  }
  console.log('✔ [Gate 6] ZERO console errors detected during entire test run.\n');

  console.log('====================================================');
  console.log('  ALL QA AUDIT GATES PASSED WITH 100% SUCCESS!       ');
  console.log('====================================================');
}

runFullQAAudit().catch(err => {
  console.error('\n❌ QA AUDIT FAILED:', err.message);
  process.exit(1);
});
