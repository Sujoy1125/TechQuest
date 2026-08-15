/**
 * TechQuest - Gamification Engine
 * Module: js/gamification.js
 * 
 * Manages user XP progression, level calculations, skill point growth,
 * badge unlock evaluations, and quest completion lifecycle.
 */

import { EVENTS_DATA, BADGE_DEFINITIONS, SKILL_DOMAINS } from './data.js';
import {
  getProfile,
  saveProfile,
  getCompletedEvents,
  addCompletedEvent,
  isEventCompleted
} from './storage.js';

/**
 * Calculates user level from total accumulated XP.
 * Formula: Math.floor(xp / 500) + 1
 * @param {number} xp - Accumulated XP points
 * @returns {number} Level (1-indexed)
 */
export function calculateLevel(xp) {
  const safeXp = Math.max(0, Number(xp) || 0);
  return Math.floor(safeXp / 500) + 1;
}

/**
 * Computes level progress details for UI progress bars.
 * @param {number} xp
 * @returns {{ currentLevel: number, xpInCurrentLevel: number, xpToNextLevel: number, progressPercent: number }}
 */
export function getLevelProgress(xp) {
  const safeXp = Math.max(0, Number(xp) || 0);
  const currentLevel = calculateLevel(safeXp);
  const xpInCurrentLevel = safeXp % 500;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / 500) * 100));
  const xpToNextLevel = 500 - xpInCurrentLevel;

  return {
    currentLevel,
    xpInCurrentLevel,
    xpToNextLevel,
    progressPercent
  };
}

/**
 * Evaluate and return all newly unlocked badges for a given profile and completed event list.
 * @param {Object} profile
 * @param {Array<string|number>} completedIds
 * @returns {Array<Object>} List of badge definition objects that were unlocked
 */
export function evaluateBadges(profile, completedIds) {
  const completedEvents = EVENTS_DATA.filter(e => completedIds.includes(e.id));
  const newlyUnlocked = [];
  const currentBadges = Array.isArray(profile.badges) ? [...profile.badges] : [];

  const badgeRules = [
    {
      id: 'first-quest',
      condition: () => completedEvents.length >= 1
    },
    {
      id: 'hackathon-veteran',
      condition: () => completedEvents.some(e => e.category === 'Hackathon')
    },
    {
      id: 'ai-pioneer',
      condition: () => (profile.skills?.ai || 0) >= 30 || completedEvents.some(e => e.skillDomain === 'ai')
    },
    {
      id: 'frontend-artisan',
      condition: () => (profile.skills?.frontend || 0) >= 30 || completedEvents.some(e => e.skillDomain === 'frontend')
    },
    {
      id: 'backend-architect',
      condition: () => (profile.skills?.backend || 0) >= 30 || completedEvents.some(e => e.skillDomain === 'backend')
    },
    {
      id: 'cloud-navigator',
      condition: () => (profile.skills?.cloud || 0) >= 30 || completedEvents.some(e => e.skillDomain === 'cloud')
    },
    {
      id: 'security-sentinel',
      condition: () => (profile.skills?.cybersecurity || 0) >= 30 || completedEvents.some(e => e.skillDomain === 'cybersecurity')
    },
    {
      id: 'quest-master',
      condition: () => completedEvents.length >= 5
    },
    {
      id: 'xp-titan',
      condition: () => (profile.xp || 0) >= 1000 || profile.level >= 3
    }
  ];

  badgeRules.forEach(rule => {
    if (!currentBadges.includes(rule.id) && rule.condition()) {
      currentBadges.push(rule.id);
      const badgeDef = BADGE_DEFINITIONS.find(b => b.id === rule.id) || {
        id: rule.id,
        name: rule.id.replace(/-/g, ' ').toUpperCase(),
        description: 'Unlocked a milestone badge!',
        icon: '🎖️',
        tier: 'Bronze'
      };
      newlyUnlocked.push(badgeDef);
    }
  });

  profile.badges = currentBadges;
  return newlyUnlocked;
}

/**
 * Handle full event completion workflow:
 * 1. Validate that the event has not been completed already.
 * 2. Add event ID to completed list in storage.
 * 3. Award xpReward and recalculate level.
 * 4. Increment domain skill points (capped at 100).
 * 5. Evaluate and award unlockable badges.
 * 6. Persist updated profile.
 * 
 * @param {string|number} eventId - ID of event being completed
 * @returns {{ success: boolean, event: Object, xpGained: number, newLevel: number, leveledUp: boolean, newlyUnlockedBadges: Array<Object>, updatedProfile: Object }}
 */
export function completeEvent(eventId) {
  if (isEventCompleted(eventId)) {
    throw new Error(`Event "${eventId}" has already been completed.`);
  }

  const event = EVENTS_DATA.find(e => e.id === eventId);
  if (!event) {
    throw new Error(`Event with ID "${eventId}" not found in catalog.`);
  }

  // 1. Mark event as completed in storage
  addCompletedEvent(eventId);
  const completedIds = getCompletedEvents();

  // 2. Load current profile
  const profile = getProfile();
  const previousLevel = profile.level || calculateLevel(profile.xp || 0);

  // 3. Award XP & calculate level
  const xpReward = Number(event.xpReward) || 100;
  const newXp = (Number(profile.xp) || 0) + xpReward;
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > previousLevel;

  profile.xp = newXp;
  profile.level = newLevel;

  // 4. Increment domain skill points (capped at 100)
  if (!profile.skills) {
    profile.skills = {};
  }
  const domain = event.skillDomain || 'frontend';
  const currentSkillPoints = Number(profile.skills[domain]) || 0;
  // Calculate increment based on event difficulty/XP (e.g., 20 - 35 points per completed quest)
  const skillIncrement = Math.max(15, Math.round(xpReward / 15));
  const newSkillPoints = Math.min(100, currentSkillPoints + skillIncrement);
  profile.skills[domain] = newSkillPoints;

  // 5. Evaluate unlockable badges
  const newlyUnlockedBadges = evaluateBadges(profile, completedIds);

  // 6. Save updated profile
  saveProfile(profile);

  return {
    success: true,
    event,
    xpGained: xpReward,
    newLevel,
    leveledUp,
    newlyUnlockedBadges,
    updatedProfile: profile
  };
}

// ==========================================
// Getters
// ==========================================

/**
 * Retrieve total XP of the current user.
 * @returns {number}
 */
export function getUserXp() {
  const profile = getProfile();
  return Number(profile.xp) || 0;
}

/**
 * Retrieve current user level.
 * @returns {number}
 */
export function getUserLevel() {
  const profile = getProfile();
  return Number(profile.level) || calculateLevel(profile.xp || 0);
}

/**
 * Retrieve active badges unlocked by the user.
 * @returns {Array<Object>} List of unlocked badge objects with full metadata
 */
export function getActiveBadges() {
  const profile = getProfile();
  const badgeIds = Array.isArray(profile.badges) ? profile.badges : [];
  return BADGE_DEFINITIONS.filter(badge => badgeIds.includes(badge.id));
}

/**
 * Retrieve current domain skill levels (0 - 100).
 * @returns {Object.<string, number>}
 */
export function getSkillLevels() {
  const profile = getProfile();
  const defaultSkills = {
    frontend: 0,
    backend: 0,
    ai: 0,
    cloud: 0,
    cybersecurity: 0,
    mobile: 0
  };

  return {
    ...defaultSkills,
    ...(profile.skills || {})
  };
}
