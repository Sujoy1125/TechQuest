/**
 * TechQuest - Events Management & Query Engine
 * Module: js/events.js
 * 
 * Handles event catalog retrieval, live text search, category/difficulty filtering,
 * and multi-criteria sorting.
 */

import { EVENTS_DATA } from './data.js';
import { isEventSaved, isRegistered, isEventCompleted } from './storage.js';

/**
 * Retrieve the full master catalog of tech events.
 * @returns {Array<Object>}
 */
export function getAllEvents() {
  return [...EVENTS_DATA];
}

/**
 * Retrieve a single event by its unique ID.
 * @param {string|number} eventId
 * @returns {Object|null}
 */
export function getEventById(eventId) {
  return EVENTS_DATA.find(e => String(e.id) === String(eventId)) || null;
}

/**
 * Filter event list based on search keyword, category, difficulty, domain, and tab filter.
 * 
 * @param {Array<Object>} [events] - Array of events to filter (defaults to all events)
 * @param {Object} filters
 * @param {string} [filters.query] - Search term matching title, description, tags, or location
 * @param {string} [filters.category] - Category filter ('All' or specific category)
 * @param {string} [filters.difficulty] - Difficulty filter ('All', 'Beginner', 'Intermediate', 'Advanced')
 * @param {string} [filters.skillDomain] - Skill domain filter ('All', 'frontend', 'ai', etc.)
 * @param {string} [filters.filterType] - View type filter ('all', 'saved', 'registered', 'completed')
 * @returns {Array<Object>} Filtered events array
 */
export function filterEvents(events = EVENTS_DATA, filters = {}) {
  const {
    query = '',
    category = 'All',
    difficulty = 'All',
    skillDomain = 'All',
    filterType = 'all'
  } = filters;

  const cleanQuery = query.trim().toLowerCase();

  return events.filter(event => {
    // 1. Text Search (title, description, tags, location, category)
    if (cleanQuery) {
      const matchTitle = event.title.toLowerCase().includes(cleanQuery);
      const matchDesc = event.description.toLowerCase().includes(cleanQuery);
      const matchLocation = event.location.toLowerCase().includes(cleanQuery);
      const matchCategory = event.category.toLowerCase().includes(cleanQuery);
      const matchTags = Array.isArray(event.tags) && event.tags.some(t => t.toLowerCase().includes(cleanQuery));

      if (!matchTitle && !matchDesc && !matchLocation && !matchCategory && !matchTags) {
        return false;
      }
    }

    // 2. Category Filter
    if (category && category !== 'All' && event.category !== category) {
      return false;
    }

    // 3. Difficulty Filter
    if (difficulty && difficulty !== 'All' && event.difficulty !== difficulty) {
      return false;
    }

    // 4. Skill Domain Filter
    if (skillDomain && skillDomain !== 'All' && event.skillDomain !== skillDomain) {
      return false;
    }

    // 5. Filter Type (Tab status: Saved, Registered, Completed)
    if (filterType === 'saved' && !isEventSaved(event.id)) {
      return false;
    }
    if (filterType === 'registered' && !isRegistered(event.id)) {
      return false;
    }
    if (filterType === 'completed' && !isEventCompleted(event.id)) {
      return false;
    }

    return true;
  });
}

/**
 * Sort array of events by selected criteria.
 * 
 * @param {Array<Object>} events - Events to sort
 * @param {string} sortBy - Criteria ('date-asc', 'date-desc', 'xp-desc', 'xp-asc', 'title-asc', 'popular')
 * @returns {Array<Object>} New sorted array
 */
export function sortEvents(events, sortBy = 'date-asc') {
  const sorted = [...events];

  switch (sortBy) {
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    case 'xp-desc':
      return sorted.sort((a, b) => (Number(b.xpReward) || 0) - (Number(a.xpReward) || 0));

    case 'xp-asc':
      return sorted.sort((a, b) => (Number(a.xpReward) || 0) - (Number(b.xpReward) || 0));

    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));

    case 'popular':
      // Fewer seats remaining indicates higher popularity
      return sorted.sort((a, b) => (Number(a.seatsLeft) || 0) - (Number(b.seatsLeft) || 0));

    default:
      return sorted;
  }
}

/**
 * Compute summary statistics for event lists.
 * @param {Array<Object>} [events]
 * @returns {{ totalEvents: number, totalXp: number, categoryCounts: Object.<string, number>, domainCounts: Object.<string, number> }}
 */
export function getEventStats(events = EVENTS_DATA) {
  const totalEvents = events.length;
  let totalXp = 0;
  const categoryCounts = {};
  const domainCounts = {};

  events.forEach(event => {
    totalXp += Number(event.xpReward) || 0;
    categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
    domainCounts[event.skillDomain] = (domainCounts[event.skillDomain] || 0) + 1;
  });

  return {
    totalEvents,
    totalXp,
    categoryCounts,
    domainCounts
  };
}
