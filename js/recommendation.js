/**
 * TechQuest - "Next Best Quest" Recommendation Engine
 * Module: js/recommendation.js
 * 
 * Implements multi-factor weighted scoring to recommend the optimal uncompleted quest:
 * - Lowest Skill Area (40%)
 * - Declared Interests (25%)
 * - Difficulty Fit (15%)
 * - Category Diversity (10%)
 * - Popularity / Demand (10%)
 */

import { EVENTS_DATA, SKILL_DOMAINS } from './data.js';
import { getProfile, getCompletedEvents } from './storage.js';
import { calculateLevel } from './gamification.js';

/**
 * Calculate skill gap score (0 - 100) based on user's skill points in the event's domain.
 * Lower skill points = higher growth opportunity = higher score.
 * @param {Object} profile
 * @param {Object} event
 * @returns {number}
 */
export function calculateSkillGapScore(profile, event) {
  const skills = profile?.skills || {};
  const domain = event.skillDomain || 'frontend';
  const domainSkill = Math.max(0, Math.min(100, Number(skills[domain]) || 0));

  // Inversely proportional to skill level: 0 skill = 100 score, 100 skill = 10 score
  return Math.round(100 - (domainSkill * 0.9));
}

/**
 * Calculate interest match score (0 - 100).
 * Matches declared interests against event skill domain and tags.
 * @param {Object} profile
 * @param {Object} event
 * @returns {number}
 */
export function calculateInterestScore(profile, event) {
  const userInterests = (profile?.interests || []).map(i => String(i).toLowerCase());
  if (userInterests.length === 0) return 60; // Neutral baseline

  const domain = (event.skillDomain || '').toLowerCase();
  const tags = (event.tags || []).map(t => String(t).toLowerCase());

  let matchScore = 20;

  // Exact domain match
  if (userInterests.includes(domain)) {
    matchScore = 100;
  } else if (tags.some(tag => userInterests.includes(tag))) {
    matchScore = 80;
  } else if (userInterests.some(i => event.title.toLowerCase().includes(i) || event.description.toLowerCase().includes(i))) {
    matchScore = 60;
  }

  return matchScore;
}

/**
 * Calculate difficulty fit score (0 - 100) based on user level.
 * @param {Object} profile
 * @param {Object} event
 * @returns {number}
 */
export function calculateDifficultyScore(profile, event) {
  const userLevel = profile?.level || calculateLevel(profile?.xp || 0);
  const difficulty = event.difficulty || 'Beginner';

  if (userLevel <= 2) {
    if (difficulty === 'Beginner') return 100;
    if (difficulty === 'Intermediate') return 65;
    return 30; // Advanced
  } else if (userLevel <= 4) {
    if (difficulty === 'Intermediate') return 100;
    if (difficulty === 'Beginner') return 70;
    return 70; // Advanced
  } else {
    // Level 5+
    if (difficulty === 'Advanced') return 100;
    if (difficulty === 'Intermediate') return 75;
    return 40; // Beginner
  }
}

/**
 * Calculate category diversity score (0 - 100).
 * Rewards exploring event categories the user has not completed yet.
 * @param {Object} profile
 * @param {Object} event
 * @param {Array<string|number>} completedIds
 * @param {Array<Object>} allEvents
 * @returns {number}
 */
export function calculateDiversityScore(profile, event, completedIds = [], allEvents = EVENTS_DATA) {
  const completedEvents = allEvents.filter(e => completedIds.includes(e.id));
  const completedCategories = completedEvents.map(e => e.category);
  const categoryCount = completedCategories.filter(c => c === event.category).length;

  if (categoryCount === 0) return 100; // Brand new category
  if (categoryCount === 1) return 60;
  return 30; // Already completed multiple in this category
}

/**
 * Calculate popularity / demand score (0 - 100).
 * Fewer seats remaining indicates higher community demand.
 * @param {Object} event
 * @returns {number}
 */
export function calculatePopularityScore(event) {
  const seatsLeft = Math.max(0, Number(event.seatsLeft) || 50);
  // Normalize against standard capacity of 120 seats
  const demand = Math.round((1 - Math.min(1, seatsLeft / 120)) * 100);
  return Math.max(20, Math.min(100, demand));
}

/**
 * Generate an explainable, contextual reason string for why this quest was recommended.
 * @param {Object} context
 * @returns {string}
 */
export function generateReason({
  skillGapScore,
  interestScore,
  difficultyScore,
  diversityScore,
  popularityScore,
  event,
  profile
}) {
  const domain = (event.skillDomain || 'technology').toUpperCase();
  const difficulty = event.difficulty || 'Beginner';
  const category = event.category || 'Quest';

  if (skillGapScore >= 80 && interestScore >= 80) {
    return `Prime growth target: strengthens your highest-potential skill area in ${domain} (+${event.xpReward} XP) while directly matching your declared interests.`;
  }

  if (skillGapScore >= 85) {
    return `Optimal skill booster: focuses on your biggest growth opportunity in ${domain} with high-yield XP reward.`;
  }

  if (interestScore >= 80) {
    return `Directly aligned with your passionate interest in ${domain} and tailored for your current level.`;
  }

  if (diversityScore === 100) {
    return `Expands your horizons: Conquer your first ${category} challenge and unlock versatile cross-domain skills.`;
  }

  if (popularityScore >= 75) {
    return `High demand: Fast-filling ${category} with only ${event.seatsLeft} seats left, perfectly paced for ${difficulty} developers.`;
  }

  return `Balanced next milestone: provides an ideal ${difficulty} challenge in ${domain} with ${event.xpReward} XP.`;
}

/**
 * Compute the "Next Best Quest" for a user.
 * 
 * @param {Object} [customProfile] - Optional user profile (defaults to stored profile)
 * @param {Array<Object>} [customEvents] - Optional event catalog (defaults to EVENTS_DATA)
 * @param {Array<string|number>} [customCompletedIds] - Optional completed IDs list (defaults to stored completed events)
 * @returns {{ event: Object|null, matchPercentage: number, reason: string }}
 */
export function getNextBestQuest(customProfile = null, customEvents = null, customCompletedIds = null) {
  const profile = customProfile || getProfile();
  const allEvents = customEvents || EVENTS_DATA;
  const completedIds = customCompletedIds || getCompletedEvents();

  // Filter for uncompleted events
  const uncompleted = allEvents.filter(e => !completedIds.includes(e.id));

  if (uncompleted.length === 0) {
    return {
      event: null,
      matchPercentage: 100,
      reason: "Legendary achievement! You have conquered all available quests in the catalog."
    };
  }

  const scoredQuests = uncompleted.map(event => {
    const skillGap = calculateSkillGapScore(profile, event);
    const interest = calculateInterestScore(profile, event);
    const difficulty = calculateDifficultyScore(profile, event);
    const diversity = calculateDiversityScore(profile, event, completedIds, allEvents);
    const popularity = calculatePopularityScore(event);

    // Weighted composite score (0 - 100)
    const compositeScore = (
      (0.40 * skillGap) +
      (0.25 * interest) +
      (0.15 * difficulty) +
      (0.10 * diversity) +
      (0.10 * popularity)
    );

    const matchPercentage = Math.round(compositeScore);
    const reason = generateReason({
      skillGapScore: skillGap,
      interestScore: interest,
      difficultyScore: difficulty,
      diversityScore: diversity,
      popularityScore: popularity,
      event,
      profile
    });

    return {
      event,
      matchPercentage,
      reason,
      _debugScores: { skillGap, interest, difficulty, diversity, popularity, compositeScore }
    };
  });

  // Sort descending by match score
  scoredQuests.sort((a, b) => b.matchPercentage - a.matchPercentage);

  const bestMatch = scoredQuests[0];

  return {
    event: bestMatch.event,
    matchPercentage: bestMatch.matchPercentage,
    reason: bestMatch.reason
  };
}
