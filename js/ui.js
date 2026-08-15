/**
 * TechQuest - UI Rendering, DOM Components & Notification Engine
 * Module: js/ui.js
 * 
 * Strict Vanilla JavaScript UI rendering layer using delegated data attributes (data-action),
 * dynamic modal management, accessible notifications, and reactive gamification HUD updates.
 */

import { isEventSaved, isRegistered, isEventCompleted, getRegistrations, getCompletedEvents } from './storage.js';
import { getLevelProgress } from './gamification.js';
import { BADGE_DEFINITIONS } from './data.js';
import { getAllEvents } from './events.js';

/**
 * Format date string into human-friendly representation.
 * @param {string} dateString e.g. "2026-09-12"
 * @returns {string} e.g. "Sep 12, 2026"
 */
export function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Return appropriate color/style class for difficulty badge.
 * @param {string} difficulty
 * @returns {string}
 */
export function getDifficultyBadgeClass(difficulty) {
  switch (difficulty) {
    case 'Beginner':
      return 'badge-beginner';
    case 'Intermediate':
      return 'badge-intermediate';
    case 'Advanced':
      return 'badge-advanced';
    default:
      return 'badge-neutral';
  }
}

/**
 * Render a single TechQuest event card HTML template.
 * Strictly uses data-* attributes for event delegation instead of inline handlers.
 * 
 * @param {Object} event - Event definition object
 * @returns {string} HTML string
 */
export function renderEventCard(event) {
  const saved = isEventSaved(event.id);
  const registered = isRegistered(event.id);
  const completed = isEventCompleted(event.id);

  const tagsHtml = (event.tags || [])
    .map(tag => `<span class="tag-pill">#${tag}</span>`)
    .join('');

  const difficultyClass = getDifficultyBadgeClass(event.difficulty);

  // Status badges
  let statusBadgeHtml = '';
  if (completed) {
    statusBadgeHtml = `<span class="status-badge status-completed"><span class="badge-icon">✓</span> Completed</span>`;
  } else if (registered) {
    statusBadgeHtml = `<span class="status-badge status-registered"><span class="badge-icon">🎟️</span> Registered</span>`;
  }

  // Action Buttons
  let primaryActionBtn = '';
  if (completed) {
    primaryActionBtn = `
      <button class="btn btn-completed" disabled aria-disabled="true" data-event-id="${event.id}">
        <span class="btn-icon">✓</span> Quest Cleared (+${event.xpReward} XP)
      </button>
    `;
  } else if (registered) {
    primaryActionBtn = `
      <button class="btn btn-success" data-action="complete-quest" data-event-id="${event.id}">
        <span class="btn-icon">⚡</span> Complete Quest
      </button>
      <button class="btn btn-secondary btn-sm" data-action="view-ticket" data-event-id="${event.id}">
        <span class="btn-icon">🎟️</span> View Ticket
      </button>
    `;
  } else {
    primaryActionBtn = `
      <button class="btn btn-primary" data-action="open-register" data-event-id="${event.id}">
        <span class="btn-icon">✨</span> Register Now
      </button>
    `;
  }

  const bookmarkIcon = saved ? '★' : '☆';
  const bookmarkLabel = saved ? 'Remove Bookmark' : 'Bookmark Quest';
  const bookmarkClass = saved ? 'btn-icon-active' : '';

  return `
    <article class="event-card ${completed ? 'card-completed' : ''}" data-event-id="${event.id}" data-category="${event.category}" data-domain="${event.skillDomain}">
      <div class="card-header">
        <div class="header-badges">
          <span class="badge badge-category">${event.category}</span>
          <span class="badge ${difficultyClass}">${event.difficulty}</span>
          ${statusBadgeHtml}
        </div>
        <button class="btn-icon-only btn-bookmark ${bookmarkClass}" data-action="toggle-save" data-event-id="${event.id}" title="${bookmarkLabel}" aria-label="${bookmarkLabel}">
          ${bookmarkIcon}
        </button>
      </div>

      <div class="card-body">
        <h3 class="card-title" data-action="view-details" data-event-id="${event.id}">${event.title}</h3>
        <p class="card-description">${event.description}</p>
        
        <div class="card-meta">
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <span>${formatDate(event.date)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">📍</span>
            <span>${event.location}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">👥</span>
            <span>${event.seatsLeft} seats left</span>
          </div>
        </div>

        <div class="card-tags">
          ${tagsHtml}
        </div>
      </div>

      <div class="card-footer">
        <div class="xp-reward-badge">
          <span class="xp-star">⭐</span>
          <span class="xp-val">+${event.xpReward} XP</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-ghost btn-sm" data-action="view-details" data-event-id="${event.id}">
            Details
          </button>
          ${primaryActionBtn}
        </div>
      </div>
    </article>
  `;
}

/**
 * Render a list of event cards inside a target container.
 * @param {Array<Object>} events
 * @param {HTMLElement} container
 */
export function renderEventsList(events, container) {
  if (!container) return;

  if (!events || events.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No Quests Found</h3>
        <p>No matching tech events found. Try adjusting your search query or filter selection.</p>
        <button class="btn btn-secondary btn-sm" data-action="clear-filters">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = events.map(event => renderEventCard(event)).join('');
}

/**
 * Render the featured "Next Best Quest" hero card banner.
 * @param {{ event: Object|null, matchPercentage: number, reason: string }} recommendation
 * @param {HTMLElement} container
 */
export function renderHeroRecommendation(recommendation, container) {
  if (!container) return;

  if (!recommendation || !recommendation.event) {
    container.innerHTML = `
      <div class="hero-card hero-completed">
        <div class="hero-content">
          <div class="hero-pill">🏆 Catalog Conquered</div>
          <h2 class="hero-title">All Quests Completed!</h2>
          <p class="hero-reason">${recommendation?.reason || 'You have conquered every quest in TechQuest. Great job!'}</p>
        </div>
      </div>
    `;
    return;
  }

  const { event, matchPercentage, reason } = recommendation;
  const isRegisteredForQuest = isRegistered(event.id);
  const isCompleted = isEventCompleted(event.id);

  let heroActionBtn = '';
  if (isCompleted) {
    heroActionBtn = `<button class="btn btn-completed" disabled>✓ Completed (+${event.xpReward} XP)</button>`;
  } else if (isRegisteredForQuest) {
    heroActionBtn = `
      <button class="btn btn-success btn-lg" data-action="complete-quest" data-event-id="${event.id}">
        ⚡ Complete Quest Now
      </button>
    `;
  } else {
    heroActionBtn = `
      <button class="btn btn-primary btn-lg" data-action="open-register" data-event-id="${event.id}">
        🚀 Accept Quest (${event.xpReward} XP)
      </button>
    `;
  }

  container.innerHTML = `
    <div class="hero-recommendation-card" data-event-id="${event.id}">
      <div class="hero-accent-bar"></div>
      <div class="hero-body">
        <div class="hero-header">
          <div class="hero-badge-group">
            <span class="hero-pill">🎯 Recommended Next Quest</span>
            <span class="match-score-pill"><span class="match-pulse"></span> ${matchPercentage}% Match</span>
          </div>
          <span class="badge ${getDifficultyBadgeClass(event.difficulty)}">${event.difficulty}</span>
        </div>

        <h2 class="hero-title" data-action="view-details" data-event-id="${event.id}">${event.title}</h2>
        <p class="hero-reason"><span class="reason-icon">💡</span> ${reason}</p>

        <div class="hero-meta">
          <div class="meta-item"><span>📅</span> ${formatDate(event.date)}</div>
          <div class="meta-item"><span>📍</span> ${event.location}</div>
          <div class="meta-item"><span>🏷️</span> ${event.category}</div>
          <div class="meta-item"><span>⭐</span> +${event.xpReward} XP</div>
        </div>

        <div class="hero-actions">
          ${heroActionBtn}
          <button class="btn btn-ghost" data-action="view-details" data-event-id="${event.id}">
            Quest Details
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Update the user XP, level, progress bar, badges, and skill matrix in the DOM.
 * @param {Object} profile - User profile object
 */
export function updateUserStatsDOM(profile) {
  if (!profile) return;

  const xp = Number(profile.xp) || 0;
  const progress = getLevelProgress(xp);

  // 1. Level & XP Indicators
  const levelPill = document.querySelector('#user-level-pill');
  if (levelPill) levelPill.textContent = `Level ${progress.currentLevel}`;

  const levelNumber = document.querySelector('#user-level-number');
  if (levelNumber) levelNumber.textContent = String(progress.currentLevel);

  const xpTotal = document.querySelector('#user-xp-total');
  if (xpTotal) xpTotal.textContent = `${xp.toLocaleString()} XP`;

  const xpProgressText = document.querySelector('#xp-progress-text');
  if (xpProgressText) {
    xpProgressText.textContent = `${progress.xpInCurrentLevel} / 500 XP (${progress.xpToNextLevel} XP to Level ${progress.currentLevel + 1})`;
  }

  const progressBar = document.querySelector('#xp-progress-bar-fill');
  if (progressBar) {
    progressBar.style.width = `${progress.progressPercent}%`;
    progressBar.setAttribute('aria-valuenow', String(progress.progressPercent));
  }

  // 2. Profile Details
  const userName = document.querySelector('#profile-user-name');
  if (userName) userName.textContent = profile.name || 'Tech Explorer';

  const userRole = document.querySelector('#profile-user-role');
  if (userRole) userRole.textContent = profile.role || 'Full Stack Explorer';

  const userAvatar = document.querySelector('#profile-user-avatar');
  if (userAvatar) userAvatar.textContent = profile.avatar || '🚀';

  // 3. Render Badges & Skills
  const badgesContainer = document.querySelector('#badges-list-container');
  if (badgesContainer) {
    renderBadgesGrid(profile.badges || [], badgesContainer);
  }

  const skillsContainer = document.querySelector('#skills-matrix-container');
  if (skillsContainer) {
    renderSkillsGrid(profile.skills || {}, skillsContainer);
  }

  // 4. Standalone Passport Page Updates
  const levelVal = document.querySelector('#passport-level-val');
  if (levelVal) levelVal.textContent = `Level ${progress.currentLevel}`;

  const xpVal = document.querySelector('#passport-xp-val');
  if (xpVal) xpVal.textContent = `${xp.toLocaleString()} XP`;

  const completedIds = getCompletedEvents();
  const allEvents = getAllEvents();
  const questsVal = document.querySelector('#passport-quests-val');
  if (questsVal) questsVal.textContent = `${completedIds.length} / ${allEvents.length}`;

  const ticketsContainer = document.querySelector('#passport-tickets-list');
  if (ticketsContainer) {
    const registrations = getRegistrations();
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
    ticketsContainer.innerHTML = ticketsHtml;
  }
}

/**
 * Render Badges showcase grid.
 * @param {Array<string>} userBadgeIds
 * @param {HTMLElement} container
 */
export function renderBadgesGrid(userBadgeIds = [], container) {
  if (!container) return;

  container.innerHTML = BADGE_DEFINITIONS.map(badge => {
    const isUnlocked = userBadgeIds.includes(badge.id);
    return `
      <div class="badge-item ${isUnlocked ? 'badge-unlocked' : 'badge-locked'}" title="${badge.name}: ${badge.description}">
        <div class="badge-icon-box">
          <span class="badge-emoji">${badge.icon}</span>
          ${isUnlocked ? '<span class="badge-unlocked-dot"></span>' : '<span class="badge-lock-icon">🔒</span>'}
        </div>
        <div class="badge-meta">
          <span class="badge-name">${badge.name}</span>
          <span class="badge-tier">${badge.tier}</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render Skill Bars grid.
 * @param {Object.<string, number>} skills
 * @param {HTMLElement} container
 */
export function renderSkillsGrid(skills = {}, container) {
  if (!container) return;

  const domainLabels = {
    frontend: { label: 'Frontend', icon: '🎨' },
    backend: { label: 'Backend', icon: '🛡️' },
    ai: { label: 'AI & Data', icon: '🤖' },
    cloud: { label: 'Cloud & DevOps', icon: '☁️' },
    cybersecurity: { label: 'Cybersecurity', icon: '🔒' },
    mobile: { label: 'Mobile Dev', icon: '📱' }
  };

  const domains = Object.keys(domainLabels);

  container.innerHTML = domains.map(domain => {
    const pts = Math.min(100, Math.max(0, Number(skills[domain]) || 0));
    const meta = domainLabels[domain];

    return `
      <div class="skill-row" data-domain="${domain}">
        <div class="skill-label-group">
          <span class="skill-name">${meta.icon} ${meta.label}</span>
          <span class="skill-pts">${pts} / 100 PTS</span>
        </div>
        <div class="skill-progress-track">
          <div class="skill-progress-fill" style="width: ${pts}%" aria-valuenow="${pts}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// Modal Dialog System
// ==========================================

let activeModalEscapeHandler = null;
let activeModalFocusHandler = null;
let lastFocusedElement = null;

/**
 * Open a generic modal dialog.
 * @param {string} title
 * @param {string} bodyHtml
 * @param {string} [footerHtml]
 */
export function openModal(title, bodyHtml, footerHtml = '') {
  let modalOverlay = document.querySelector('#tq-modal-overlay');

  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'tq-modal-overlay';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  // Save last focused element to restore focus when modal closes
  lastFocusedElement = document.activeElement;

  modalOverlay.innerHTML = `
    <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
      <header class="modal-header">
        <h3 id="modal-heading" class="modal-title">${title}</h3>
        <button class="btn-close-modal" data-action="close-modal" aria-label="Close dialog">✕</button>
      </header>
      <div class="modal-body">
        ${bodyHtml}
      </div>
      ${footerHtml ? `<footer class="modal-footer">${footerHtml}</footer>` : ''}
    </div>
  `;

  modalOverlay.classList.add('modal-visible');
  document.body.classList.add('modal-open');

  // Hide main app content from screen readers while modal is open
  const appRoot = document.querySelector('#app');
  if (appRoot) appRoot.setAttribute('aria-hidden', 'true');

  // Backdrop click listener
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  };

  // ESC key listener
  if (activeModalEscapeHandler) {
    document.removeEventListener('keydown', activeModalEscapeHandler);
  }
  activeModalEscapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  document.addEventListener('keydown', activeModalEscapeHandler);

  // Focus trap: keep Tab/Shift-Tab within the modal
  const modalDialog = modalOverlay.querySelector('.modal-dialog');
  if (modalDialog) {
    // Find all focusable elements inside modal
    const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [contenteditable], [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(modalDialog.querySelectorAll(focusableSelectors)).filter(el => el.offsetParent !== null);

    // Focus the first focusable element, or the dialog itself as fallback
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      modalDialog.setAttribute('tabindex', '-1');
      modalDialog.focus();
    }

    // Remove previous handler if any
    if (activeModalFocusHandler) {
      document.removeEventListener('keydown', activeModalFocusHandler);
      activeModalFocusHandler = null;
    }

    activeModalFocusHandler = (e) => {
      if (e.key !== 'Tab') return;
      const focusableNow = Array.from(modalDialog.querySelectorAll(focusableSelectors)).filter(el => el.offsetParent !== null);
      if (focusableNow.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusableNow[0];
      const last = focusableNow[focusableNow.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === first || document.activeElement === modalDialog) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', activeModalFocusHandler);
  }
}

/**
 * Close any active modal.
 */
export function closeModal() {
  const modalOverlay = document.querySelector('#tq-modal-overlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('modal-visible');
    // Clear modal content to remove interactive elements from DOM
    // (keeps overlay element for template reuse)
    setTimeout(() => {
      if (modalOverlay) modalOverlay.innerHTML = '';
    }, 220);
  }
  document.body.classList.remove('modal-open');

  // Restore application root to screen readers
  const appRoot = document.querySelector('#app');
  if (appRoot) appRoot.removeAttribute('aria-hidden');

  // Remove handlers
  if (activeModalEscapeHandler) {
    document.removeEventListener('keydown', activeModalEscapeHandler);
    activeModalEscapeHandler = null;
  }

  if (activeModalFocusHandler) {
    document.removeEventListener('keydown', activeModalFocusHandler);
    activeModalFocusHandler = null;
  }

  // Restore focus to previous element if still in document
  try {
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  } catch (err) {
    // ignore
  }
  lastFocusedElement = null;
}

/**
 * Open Event Registration Form Modal.
 * @param {Object} event
 * @param {Object} [profile]
 */
export function openRegistrationModal(event, profile = {}) {
  const bodyHtml = `
    <form id="registration-form" class="registration-form" data-event-id="${event.id}">
      <div class="event-summary-box">
        <div class="summary-title">${event.title}</div>
        <div class="summary-meta">
          <span>📅 ${formatDate(event.date)}</span>
          <span>📍 ${event.location}</span>
          <span>⭐ +${event.xpReward} XP</span>
        </div>
      </div>

      <div class="form-group">
        <label for="reg-fullname" class="form-label">Full Name <span class="req">*</span></label>
        <input type="text" id="reg-fullname" name="fullName" class="form-input" value="${profile.name || ''}" placeholder="Jane Doe" required>
        <div class="form-error" id="error-fullName"></div>
      </div>

      <div class="form-group">
        <label for="reg-email" class="form-label">Email Address <span class="req">*</span></label>
        <input type="email" id="reg-email" name="email" class="form-input" value="${profile.email || ''}" placeholder="jane@domain.com" required>
        <div class="form-error" id="error-email"></div>
      </div>

      <div class="form-group">
        <label for="reg-role" class="form-label">Developer Role / Track <span class="req">*</span></label>
        <select id="reg-role" name="role" class="form-select" required>
          <option value="Frontend Developer" ${profile.role?.includes('Frontend') ? 'selected' : ''}>Frontend Developer</option>
          <option value="Backend Developer" ${profile.role?.includes('Backend') ? 'selected' : ''}>Backend Developer</option>
          <option value="Full Stack Engineer" ${!profile.role || profile.role?.includes('Full Stack') ? 'selected' : ''}>Full Stack Engineer</option>
          <option value="AI / ML Engineer" ${profile.role?.includes('AI') ? 'selected' : ''}>AI / ML Engineer</option>
          <option value="DevOps & Cloud Engineer" ${profile.role?.includes('Cloud') ? 'selected' : ''}>DevOps & Cloud Engineer</option>
          <option value="Cybersecurity Analyst" ${profile.role?.includes('Security') ? 'selected' : ''}>Cybersecurity Analyst</option>
          <option value="Student / Hobbyist">Student / Hobbyist</option>
        </select>
        <div class="form-error" id="error-role"></div>
      </div>

      <div class="form-group">
        <label for="reg-experience" class="form-label">Experience Tier</label>
        <select id="reg-experience" name="experience" class="form-select">
          <option value="Beginner">Beginner (< 1 year)</option>
          <option value="Intermediate" selected>Intermediate (1 - 3 years)</option>
          <option value="Advanced">Advanced (3+ years)</option>
        </select>
      </div>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-ghost" data-action="close-modal">Cancel</button>
    <button class="btn btn-primary" data-action="submit-registration" data-event-id="${event.id}">Confirm Registration</button>
  `;

  openModal(`Register: ${event.title}`, bodyHtml, footerHtml);
}

/**
 * Open Confirmed Ticket Pass Modal.
 * @param {Object} registration
 */
export function openTicketModal(registration) {
  const bodyHtml = `
    <div class="ticket-pass">
      <div class="ticket-top">
        <div class="ticket-brand">TECHQUEST PASS</div>
        <div class="ticket-badge">CONFIRMED</div>
      </div>
      <div class="ticket-title">${registration.eventTitle}</div>
      <div class="ticket-id-display">${registration.ticketId}</div>

      <div class="ticket-grid">
        <div class="ticket-item">
          <span class="t-label">ATTENDEE</span>
          <span class="t-val">${registration.attendeeName}</span>
        </div>
        <div class="ticket-item">
          <span class="t-label">ROLE</span>
          <span class="t-val">${registration.attendeeRole}</span>
        </div>
        <div class="ticket-item">
          <span class="t-label">DATE</span>
          <span class="t-val">${formatDate(registration.eventDate)}</span>
        </div>
        <div class="ticket-item">
          <span class="t-label">XP REWARD</span>
          <span class="t-val">+${registration.xpReward} XP</span>
        </div>
      </div>

      <div class="ticket-barcode">
        <div class="barcode-lines"></div>
        <span class="barcode-text">${registration.ticketId}</span>
      </div>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-primary" data-action="close-modal">Done</button>
  `;

  openModal('Your Quest Ticket', bodyHtml, footerHtml);
}

/**
 * Open Event Details Modal.
 * @param {Object} event
 */
export function openEventDetailsModal(event) {
  const saved = isEventSaved(event.id);
  const registered = isRegistered(event.id);
  const completed = isEventCompleted(event.id);

  const tagsHtml = (event.tags || [])
    .map(tag => `<span class="tag-pill">#${tag}</span>`)
    .join('');

  const bodyHtml = `
    <div class="event-details-view">
      <div class="details-badges">
        <span class="badge badge-category">${event.category}</span>
        <span class="badge ${getDifficultyBadgeClass(event.difficulty)}">${event.difficulty}</span>
        <span class="badge badge-domain">Domain: ${event.skillDomain.toUpperCase()}</span>
      </div>

      <p class="details-desc">${event.description}</p>

      <div class="details-grid">
        <div class="details-box">
          <span class="d-icon">📅</span>
          <div class="d-text">
            <strong>Date & Time</strong>
            <span>${formatDate(event.date)}</span>
          </div>
        </div>
        <div class="details-box">
          <span class="d-icon">📍</span>
          <div class="d-text">
            <strong>Location</strong>
            <span>${event.location}</span>
          </div>
        </div>
        <div class="details-box">
          <span class="d-icon">⭐</span>
          <div class="d-text">
            <strong>XP Bounty</strong>
            <span>+${event.xpReward} XP</span>
          </div>
        </div>
        <div class="details-box">
          <span class="d-icon">👥</span>
          <div class="d-text">
            <strong>Availability</strong>
            <span>${event.seatsLeft} seats remaining</span>
          </div>
        </div>
      </div>

      <div class="details-tags-section">
        <strong>Skill Tags</strong>
        <div class="card-tags">${tagsHtml}</div>
      </div>
    </div>
  `;

  let actionButtons = '';
  if (completed) {
    actionButtons = `<button class="btn btn-completed" disabled>✓ Quest Completed</button>`;
  } else if (registered) {
    actionButtons = `
      <button class="btn btn-success" data-action="complete-quest" data-event-id="${event.id}">Complete Quest</button>
      <button class="btn btn-secondary" data-action="view-ticket" data-event-id="${event.id}">View Ticket</button>
    `;
  } else {
    actionButtons = `
      <button class="btn btn-primary" data-action="open-register" data-event-id="${event.id}">Register for Event</button>
    `;
  }

  const footerHtml = `
    <button class="btn btn-ghost" data-action="close-modal">Close</button>
    ${actionButtons}
  `;

  openModal(event.title, bodyHtml, footerHtml);
}

// ==========================================
// Toast Notification Engine
// ==========================================

/**
 * Trigger a modern floating toast notification.
 * 
 * @param {string} message - Text or HTML message
 * @param {'success'|'error'|'info'|'warning'|'level-up'|'badge'} [type='info']
 * @param {number} [duration=3500] - Duration in milliseconds
 */
export function showToast(message, type = 'info', duration = 3500) {
  let toastContainer = document.querySelector('#tq-toast-container');

  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'tq-toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠️',
    'level-up': '🎉',
    badge: '🎖️'
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || 'ℹ'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-dismiss" aria-label="Dismiss">✕</button>
  `;

  toastContainer.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('toast-active');
  });

  const dismiss = () => {
    toast.classList.remove('toast-active');
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 300);
  };

  toast.querySelector('.toast-dismiss')?.addEventListener('click', dismiss);

  if (duration > 0) {
    setTimeout(dismiss, duration);
  }
}
