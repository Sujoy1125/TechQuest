/**
 * TechQuest - Application Controller & Bootstrap Layer
 * Module: js/app.js
 * 
 * Orchestrates application lifecycle upon DOMContentLoaded.
 * Binds global delegated event listeners, coordinates state management,
 * handles filtering/search, registration flow, quest completion, and dynamic HUD updates.
 */

import { EVENTS_DATA, BADGE_DEFINITIONS } from './data.js';
import {
  getProfile,
  getSavedEvents,
  toggleSavedEvent,
  getRegistrations,
  getCompletedEvents,
  getTheme,
  saveTheme,
  resetAllData,
  isRegistered,
  isEventCompleted
} from './storage.js';
import { getAllEvents, getEventById, filterEvents, sortEvents } from './events.js';
import { registerForEvent, getRegistrationByEventId } from './registration.js';
import {
  completeEvent,
  getUserXp,
  getUserLevel,
  getActiveBadges,
  getLevelProgress
} from './gamification.js';
import { getNextBestQuest } from './recommendation.js';
import {
  renderEventsList,
  renderHeroRecommendation,
  updateUserStatsDOM,
  openModal,
  closeModal,
  openRegistrationModal,
  openTicketModal,
  openEventDetailsModal,
  showToast,
  formatDate
} from './ui.js';

// Application State
const state = {
  currentTab: 'all', // 'all' | 'saved' | 'registered' | 'completed'
  searchQuery: '',
  category: 'All',
  domain: 'All',
  difficulty: 'All',
  sortBy: 'date-asc'
};

// ==========================================
// 1. Initialization & Render Pipeline
// ==========================================

/**
 * Initialize application upon DOMContentLoaded.
 */
export function initApp() {
  // 1. Apply persisted theme
  initTheme();

  // 2. Attach global delegated event listener to #app
  setupEventDelegation();

  // 3. Attach input listeners for search and selects
  setupToolbarListeners();

  // 4. Set page-specific default state tab
  initTabForPage();

  // 5. Initial render of HUD, Hero Recommendation, and Catalog
  refreshAll();

  // 6. Smooth transition animations on page load
  const mainContent = document.querySelector('main');
  if (mainContent) {
    mainContent.classList.add('animate-fade-in');
  }

  console.log('[TechQuest] Application initialized successfully with Pure Vanilla ES6+ JS.');
}

/**
 * Apply user's saved theme preference.
 */
function initTheme() {
  const currentTheme = getTheme();
  document.documentElement.setAttribute('data-theme', currentTheme);
}

/**
 * Checks what page we are on and overrides currentTab state.
 */
function initTabForPage() {
  const pathname = window.location.pathname;
  if (pathname.includes('my-events.html')) {
    // Default tab for my-events page is 'registered' or 'saved'
    state.currentTab = 'registered';
    
    // Update active visual tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const isActive = btn.dataset.tab === 'registered';
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });
  } else {
    state.currentTab = 'all';
  }
}

/**
 * Perform a full reactive UI refresh across all views.
 */
export function refreshAll() {
  const profile = getProfile();
  const allEvents = getAllEvents();
  const savedIds = getSavedEvents();
  const registrations = getRegistrations();
  const completedIds = getCompletedEvents();

  // 1. Update Navigation HUD & Profile
  updateUserStatsDOM(profile);

  const badgeCountEl = document.querySelector('#nav-badge-count');
  if (badgeCountEl) {
    badgeCountEl.textContent = String((profile.badges || []).length);
  }

  // 2. Update Tab Badges Counts
  const countAll = document.querySelector('#count-all');
  if (countAll) countAll.textContent = String(allEvents.length);

  const countSaved = document.querySelector('#count-saved');
  if (countSaved) countSaved.textContent = String(savedIds.length);

  const countReg = document.querySelector('#count-registered');
  if (countReg) countReg.textContent = String(registrations.length);

  const countCompleted = document.querySelector('#count-completed');
  if (countCompleted) countCompleted.textContent = String(completedIds.length);

  // 3. Render Hero Recommendation
  const heroContainer = document.querySelector('#hero-recommendation-container');
  if (heroContainer) {
    const recommendation = getNextBestQuest(profile, allEvents, completedIds);
    renderHeroRecommendation(recommendation, heroContainer);
  }

  // 4. Render Filtered & Sorted Catalog Grid
  renderCatalog();
}

/**
 * Filters, sorts, and renders the event cards grid.
 */
export function renderCatalog() {
  const allEvents = getAllEvents();

  const filtered = filterEvents(allEvents, {
    query: state.searchQuery,
    category: state.category,
    difficulty: state.difficulty,
    skillDomain: state.domain,
    filterType: state.currentTab
  });

  const sorted = sortEvents(filtered, state.sortBy);
  const eventsGrid = document.querySelector('#events-grid');
  renderEventsList(sorted, eventsGrid);

  // Update active filter pills UI
  renderActiveFilterPills();
}

/**
 * Render active filter tags bar if any filter is active.
 */
function renderActiveFilterPills() {
  const bar = document.querySelector('#active-filters-bar');
  const pillsContainer = document.querySelector('#active-pills-list');
  if (!bar || !pillsContainer) return;

  const activePills = [];

  if (state.searchQuery) {
    activePills.push(`Search: "${state.searchQuery}"`);
  }
  if (state.category !== 'All') {
    activePills.push(`Format: ${state.category}`);
  }
  if (state.domain !== 'All') {
    activePills.push(`Domain: ${state.domain.toUpperCase()}`);
  }
  if (state.difficulty !== 'All') {
    activePills.push(`Level: ${state.difficulty}`);
  }
  if (state.currentTab !== 'all') {
    activePills.push(`View: ${state.currentTab.toUpperCase()}`);
  }

  if (activePills.length > 0) {
    pillsContainer.innerHTML = activePills
      .map(pill => `<span class="tag-pill">${pill}</span>`)
      .join('');
    bar.classList.remove('hidden');
  } else {
    bar.classList.add('hidden');
    pillsContainer.innerHTML = '';
  }
}

// ==========================================
// 2. Toolbar & Input Event Listeners
// ==========================================

function setupToolbarListeners() {
  const searchInput = document.querySelector('#search-input');
  const searchClearBtn = document.querySelector('#search-clear-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (searchClearBtn) {
        if (state.searchQuery.length > 0) {
          searchClearBtn.classList.remove('hidden');
        } else {
          searchClearBtn.classList.add('hidden');
        }
      }
      renderCatalog();
    });
  }

  const filterCategory = document.querySelector('#filter-category');
  if (filterCategory) {
    filterCategory.addEventListener('change', (e) => {
      state.category = e.target.value;
      renderCatalog();
    });
  }

  const filterDomain = document.querySelector('#filter-domain');
  if (filterDomain) {
    filterDomain.addEventListener('change', (e) => {
      state.domain = e.target.value;
      renderCatalog();
    });
  }

  const filterDifficulty = document.querySelector('#filter-difficulty');
  if (filterDifficulty) {
    filterDifficulty.addEventListener('change', (e) => {
      state.difficulty = e.target.value;
      renderCatalog();
    });
  }

  const sortBySelect = document.querySelector('#sort-by');
  if (sortBySelect) {
    sortBySelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderCatalog();
    });
  }
}

// ==========================================
// 3. Centralized Event Delegation Handler
// ==========================================

function setupEventDelegation() {
  const root = document.querySelector('#app') || document.body;

  root.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const action = actionEl.dataset.action;
    const eventId = actionEl.dataset.eventId;

    switch (action) {
      // --- Tab Switching ---
      case 'change-tab': {
        const tabKey = actionEl.dataset.tab;
        if (!tabKey) return;

        state.currentTab = tabKey;
        document.querySelectorAll('.tab-btn').forEach(btn => {
          const isActive = btn.dataset.tab === tabKey;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-selected', String(isActive));
        });
        renderCatalog();
        break;
      }

      // --- Clear Search & Filters ---
      case 'clear-search': {
        state.searchQuery = '';
        const searchInput = document.querySelector('#search-input');
        if (searchInput) searchInput.value = '';
        const clearBtn = document.querySelector('#search-clear-btn');
        if (clearBtn) clearBtn.classList.add('hidden');
        renderCatalog();
        break;
      }

      case 'clear-filters': {
        state.searchQuery = '';
        state.category = 'All';
        state.domain = 'All';
        state.difficulty = 'All';
        state.currentTab = 'all';

        const searchInput = document.querySelector('#search-input');
        if (searchInput) searchInput.value = '';
        const catSelect = document.querySelector('#filter-category');
        if (catSelect) catSelect.value = 'All';
        const domSelect = document.querySelector('#filter-domain');
        if (domSelect) domSelect.value = 'All';
        const diffSelect = document.querySelector('#filter-difficulty');
        if (diffSelect) diffSelect.value = 'All';

        document.querySelectorAll('.tab-btn').forEach(btn => {
          const isActive = btn.dataset.tab === 'all';
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-selected', String(isActive));
        });

        renderCatalog();
        showToast('All search and filter criteria reset.', 'info');
        break;
      }

      // --- Bookmark / Save Event ---
      case 'toggle-save': {
        if (!eventId) return;
        const isSaved = toggleSavedEvent(eventId);
        const eventItem = getEventById(eventId);
        const title = eventItem ? eventItem.title : 'Quest';

        if (isSaved) {
          showToast(`★ Saved "${title}" to your bookmarks!`, 'info');
        } else {
          showToast(`Removed "${title}" from bookmarks.`, 'info');
        }
        refreshAll();
        break;
      }

      // --- Open Registration Modal ---
      case 'open-register': {
        if (!eventId) return;
        const targetEvent = getEventById(eventId);
        if (!targetEvent) return;

        if (isRegistered(eventId)) {
          showToast('You are already registered for this event.', 'warning');
          return;
        }

        const profile = getProfile();
        openRegistrationModal(targetEvent, profile);
        break;
      }

      // --- Submit Registration Form ---
      case 'submit-registration': {
        if (!eventId) return;
        const form = document.querySelector('#registration-form');
        if (!form) return;

        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(el => { el.textContent = ''; });

        const formData = {
          fullName: form.querySelector('[name="fullName"]')?.value || '',
          email: form.querySelector('[name="email"]')?.value || '',
          role: form.querySelector('[name="role"]')?.value || '',
          experience: form.querySelector('[name="experience"]')?.value || 'Intermediate'
        };

        const result = registerForEvent(eventId, formData);

        if (!result.success) {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, msg]) => {
              const errEl = document.querySelector(`#error-${field}`);
              if (errEl) errEl.textContent = msg;
            });
          }
          showToast(result.message || 'Please correct the form errors.', 'error');
          return;
        }

        // Success!
        closeModal();
        showToast(`🎉 Registration Confirmed! Ticket ${result.registration.ticketId} issued.`, 'success');
        refreshAll();

        // Display Ticket
        setTimeout(() => {
          openTicketModal(result.registration);
        }, 350);
        break;
      }

      // --- View Ticket ---
      case 'view-ticket': {
        if (!eventId) return;
        const reg = getRegistrationByEventId(eventId);
        if (reg) {
          openTicketModal(reg);
        } else {
          showToast('No active ticket found for this quest.', 'warning');
        }
        break;
      }

      // --- View Details Modal ---
      case 'view-details': {
        if (!eventId) return;
        const targetEvent = getEventById(eventId);
        if (targetEvent) {
          openEventDetailsModal(targetEvent);
        }
        break;
      }

      // --- Complete Quest Workflow ---
      case 'complete-quest': {
        if (!eventId) return;

        if (isEventCompleted(eventId)) {
          showToast('This quest has already been completed.', 'warning');
          return;
        }

        try {
          const outcome = completeEvent(eventId);
          closeModal();

          // Live toast for XP gain
          showToast(`⚡ Quest Conquered! +${outcome.xpGained} XP awarded to your profile.`, 'success');

          // Check Level Up trigger
          if (outcome.leveledUp) {
            setTimeout(() => {
              showToast(`🎉 LEVEL UP! You reached Developer Level ${outcome.newLevel}!`, 'level-up', 5000);
            }, 600);
          }

          // Check Badge Unlocks
          if (outcome.newlyUnlockedBadges && outcome.newlyUnlockedBadges.length > 0) {
            outcome.newlyUnlockedBadges.forEach((badge, idx) => {
              setTimeout(() => {
                showToast(`🎖️ New Badge Unlocked: "${badge.name}" (${badge.tier})!`, 'badge', 5000);
              }, 1200 + (idx * 800));
            });
          }

          // Reactive live refresh
          refreshAll();
        } catch (err) {
          showToast(err.message, 'error');
        }
        break;
      }

      // --- Open Tech Passport ---
      case 'open-passport': {
        openPassportModal();
        break;
      }

      // --- Toggle Theme ---
      case 'toggle-theme': {
        const currentTheme = getTheme();
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        saveTheme(nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
        showToast(`Theme switched to ${nextTheme} mode.`, 'info', 2000);
        break;
      }

      // --- Close Modal ---
      case 'close-modal': {
        closeModal();
        break;
      }

      // --- Navigate Home ---
      case 'navigate-home': {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      }

      // --- Reset All Progress (QA) ---
      case 'reset-progress': {
        const confirmReset = window.confirm('Are you sure you want to reset all XP, completed quests, registrations, and badges?');
        if (confirmReset) {
          resetAllData();
          closeModal();
          refreshAll();
          showToast('All developer progress has been reset to defaults.', 'warning');
        }
        break;
      }

      default:
        break;
    }
  });
}

/**
 * Render and open the Tech Passport modal view.
 */
function openPassportModal() {
  const profile = getProfile();
  const registrations = getRegistrations();
  const completedIds = getCompletedEvents();
  const allEvents = getAllEvents();
  const levelProgress = getLevelProgress(profile.xp || 0);

  // Tickets list HTML
  let ticketsHtml = '';
  if (registrations.length === 0) {
    ticketsHtml = `<p class="empty-hint">No active registrations. Explore quests and register to claim tickets!</p>`;
  } else {
    ticketsHtml = registrations.map(reg => `
      <div class="ticket-row-item">
        <div>
          <strong>${reg.eventTitle}</strong>
          <div class="text-dim" style="font-size:0.75rem;">${formatDate(reg.eventDate)} • ${reg.ticketId}</div>
        </div>
        <button class="btn btn-secondary btn-sm" data-action="view-ticket" data-event-id="${reg.eventId}">
          View Ticket
        </button>
      </div>
    `).join('');
  }

  const template = document.querySelector('#passport-modal-content');
  if (!template) return;

  const clone = template.cloneNode(true);
  clone.classList.remove('hidden');

  // Populate dynamic fields
  const levelVal = clone.querySelector('#passport-level-val');
  if (levelVal) levelVal.textContent = `Level ${levelProgress.currentLevel}`;

  const xpVal = clone.querySelector('#passport-xp-val');
  if (xpVal) xpVal.textContent = `${(profile.xp || 0).toLocaleString()} XP`;

  const questsVal = clone.querySelector('#passport-quests-val');
  if (questsVal) questsVal.textContent = `${completedIds.length} / ${allEvents.length}`;

  const ticketsContainer = clone.querySelector('#passport-tickets-list');
  if (ticketsContainer) ticketsContainer.innerHTML = ticketsHtml;

  openModal('Tech Passport & Developer Identity', clone.innerHTML, `
    <button class="btn btn-primary" data-action="close-modal">Done</button>
  `);

  // Render skills and badges in the open modal
  const modalSkills = document.querySelector('.modal-dialog #skills-matrix-container');
  if (modalSkills) {
    import('./ui.js').then(ui => ui.renderSkillsGrid(profile.skills || {}, modalSkills));
  }

  const modalBadges = document.querySelector('.modal-dialog #badges-list-container');
  if (modalBadges) {
    import('./ui.js').then(ui => ui.renderBadgesGrid(profile.badges || [], modalBadges));
  }
}

// Bootstrap upon DOMContentLoaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
