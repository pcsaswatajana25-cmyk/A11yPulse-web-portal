/**
 * A11yPulse — Inclusive Tech & Design Information Portal
 * Accessible Interactive Components (WAI-ARIA 1.2 Authoring Practices Guide)
 * Features:
 *  1. Roving Tabindex & Arrow-Key Navigation for Category Tabs
 *  2. Live Region Announcements (aria-live="polite") for Search & Filtering
 *  3. Accessible Accordion Controls (aria-expanded, aria-controls)
 *  4. Accessible Modal Dialog with Focus Trap, Escape Dismissal & Focus Restoration
 *  5. Accessible Form Validation with aria-invalid, aria-describedby & role="alert"
 *  6. Visual UX Preferences (Theme Switcher, Text Scaling, Reduced Motion)
 */

(function () {
  'use strict';

  const ARTICLES = [
    {
      id: 'art-semantic-landmarks',
      title: 'Replacing "Div Soup" with HTML5 Landmarks for Screen Reader Efficiency',
      category: 'semantics',
      categoryLabel: 'Semantic HTML',
      readTime: '6 min read',
      date: '2026-11-10',
      wcagCriterion: 'WCAG 1.3.1 Info and Relationships (Level A) & 2.4.1 Bypass Blocks (Level A)',
      wcagUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships',
      summary: 'Screen reader users rely on rotor landmark lists (<header>, <nav>, <main>, <aside>, <footer>) to jump directly to page sections without tabbing through dozens of links.',
      keyTakeaway: 'Replacing generic <div class="nav"> containers with labeled <nav aria-label="Primary"> landmarks reduced screen reader navigation keystrokes by 74% during audit testing.'
    },
    {
      id: 'art-roving-tabindex',
      title: 'Mastering Keyboard Navigation: Roving Tabindex & WAI-ARIA Tablists',
      category: 'keyboard',
      categoryLabel: 'Keyboard UX',
      readTime: '8 min read',
      date: '2026-11-08',
      wcagCriterion: 'WCAG 2.1.1 Keyboard (Level A) & 2.4.3 Focus Order (Level A)',
      wcagUrl: 'https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/',
      summary: 'Interactive widgets built with non-focusable <div> elements lock out keyboard and switch-device users. Learn how WAI-ARIA tablists pair single-tab-stop roving tabindex with Arrow, Home, and End keys.',
      keyTakeaway: 'Only the active tab holds tabindex="0" while inactive tabs use tabindex="-1", allowing users to bypass the entire tab bar with a single Tab keystroke.'
    },
    {
      id: 'art-contrast-focus',
      title: 'Designing High-Contrast Palettes and Unmistakable Focus Indicators',
      category: 'contrast',
      categoryLabel: 'Contrast & Visuals',
      readTime: '5 min read',
      date: '2026-11-05',
      wcagCriterion: 'WCAG 1.4.3 Contrast Minimum (Level AA) & 2.4.7 Focus Visible (Level AA)',
      wcagUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum',
      summary: 'Low-contrast gray text (#999999 on white yields only 2.85:1) fails WCAG 1.4.3 and causes eye strain. Pairing 7.5:1 muted text with dual-ring :focus-visible outlines ensures clarity across lighting conditions.',
      keyTakeaway: 'Upgrading body text to #0F172A (17.8:1) and secondary metadata to #475569 (7.5:1) achieves full WCAG AAA text contrast compliance.'
    },
    {
      id: 'art-live-regions',
      title: 'Announcing Dynamic State Changes with ARIA Live Regions and Accessible Forms',
      category: 'aria',
      categoryLabel: 'WAI-ARIA & Forms',
      readTime: '7 min read',
      date: '2026-11-02',
      wcagCriterion: 'WCAG 4.1.3 Status Messages (Level AA) & 3.3.1 Error Identification (Level A)',
      wcagUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/status-messages',
      summary: 'When search filters update results or form validation fails asynchronously, sighted users see visual changes immediately while screen reader users hear silence unless aria-live or role="alert" is wired properly.',
      keyTakeaway: 'Binding input errors via aria-describedby and aria-invalid="true" ensures assistive technologies read the exact remediation hint upon focus.'
    },
    {
      id: 'art-modal-focus-trap',
      title: 'Building Accessible Modal Dialogs Without Background Focus Leaks',
      category: 'keyboard',
      categoryLabel: 'Keyboard UX',
      readTime: '6 min read',
      date: '2026-10-29',
      wcagCriterion: 'WCAG 2.1.2 No Keyboard Trap (Level A) & WAI-ARIA Dialog Pattern',
      wcagUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
      summary: 'When a modal dialog opens, keyboard focus must move inside the dialog, cycle strictly within its focusable controls on Tab/Shift+Tab, close on Escape, and return cleanly to the invoking trigger button.',
      keyTakeaway: 'Implementing a deterministic focus ring loop prevents keyboard users from getting lost behind a dimmed backdrop overlay.'
    },
    {
      id: 'art-target-size-motion',
      title: 'WCAG 2.2 Target Size Minimums and Respecting prefers-reduced-motion',
      category: 'contrast',
      categoryLabel: 'Contrast & Visuals',
      readTime: '5 min read',
      date: '2026-10-24',
      wcagCriterion: 'WCAG 2.5.8 Target Size Minimum (Level AA) & 2.3.3 Animation from Interactions',
      wcagUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum',
      summary: 'Users with motor tremors or vestibular disorders struggle with tightly packed 16px icons and parallax transitions. Enforcing >=36px hit targets and honoring reduced-motion preferences creates a calm, accurate interface.',
      keyTakeaway: 'All interactive controls in A11yPulse maintain at least 36x36px to 44x44px hit areas with 8px minimum clearance.'
    }
  ];

  // Application State
  const state = {
    activeCategory: 'all',
    searchQuery: '',
    theme: 'light',
    fontScale: 'normal',
    reducedMotion: false,
    bookmarkedIds: new Set(['art-semantic-landmarks']),
    lastFocusedElement: null
  };

  // DOM Elements
  const announcePolite = document.getElementById('a11y-announcer-polite');
  const articlesContainer = document.getElementById('articles-list');
  const resultsCountText = document.getElementById('results-count-text');
  const searchInput = document.getElementById('portal-search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const tabButtons = Array.from(document.querySelectorAll('[role="tab"]'));

  /**
   * Announces a status message to screen readers via polite live region
   */
  function announce(message) {
    if (!announcePolite) return;
    announcePolite.textContent = '';
    window.setTimeout(function () {
      announcePolite.textContent = message;
    }, 40);
  }

  /**
   * Renders filtered articles into the #articles-tabpanel region
   */
  function renderArticles(shouldAnnounce) {
    if (!articlesContainer) return;

    const query = state.searchQuery.trim().toLowerCase();
    const filtered = ARTICLES.filter(function (art) {
      const matchesCat = state.activeCategory === 'all' || art.category === state.activeCategory;
      const matchesQuery = !query ||
        art.title.toLowerCase().includes(query) ||
        art.summary.toLowerCase().includes(query) ||
        art.wcagCriterion.toLowerCase().includes(query) ||
        art.categoryLabel.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });

    const countMsg = 'Showing ' + filtered.length + ' of ' + ARTICLES.length + ' accessibility guides' +
      (state.activeCategory !== 'all' ? ' in category "' + state.activeCategory + '"' : '') +
      (query ? ' matching "' + state.searchQuery.trim() + '"' : '') + '.';

    if (resultsCountText) {
      resultsCountText.textContent = countMsg;
    }
    if (shouldAnnounce) {
      announce(countMsg);
    }

    if (filtered.length === 0) {
      articlesContainer.innerHTML =
        '<div class="section-card" role="status">' +
          '<h3 class="article-title">No matching accessibility guides found</h3>' +
          '<p class="article-excerpt">Try clearing your search query or selecting the "All Topics" category tab.</p>' +
          '<button type="button" class="btn-secondary" id="reset-filters-inline-btn">Reset All Filters</button>' +
        '</div>';
      const resetInline = document.getElementById('reset-filters-inline-btn');
      if (resetInline) {
        resetInline.addEventListener('click', function () {
          state.searchQuery = '';
          if (searchInput) searchInput.value = '';
          selectCategoryTab(tabButtons[0], true);
        });
      }
      return;
    }

    articlesContainer.innerHTML = filtered.map(function (art) {
      const isSaved = state.bookmarkedIds.has(art.id);
      return (
        '<article class="article-card" aria-labelledby="title-' + art.id + '">' +
          '<div class="article-meta">' +
            '<span class="badge">' + art.categoryLabel + '</span>' +
            '<time datetime="' + art.date + '">' + art.date + '</time>' +
            '<span aria-hidden="true">•</span>' +
            '<span>' + art.readTime + '</span>' +
          '</div>' +
          '<h3 class="article-title" id="title-' + art.id + '">' +
            '<a href="' + art.wcagUrl + '" target="_blank" rel="noopener noreferrer">' +
              art.title +
              '<span class="sr-only"> (opens official W3C specification in a new tab)</span>' +
            '</a>' +
          '</h3>' +
          '<p class="article-excerpt">' + art.summary + '</p>' +
          '<p class="article-excerpt"><strong>Audit Outcome:</strong> ' + art.keyTakeaway + '</p>' +
          '<div class="article-footer">' +
            '<span class="form-hint" style="margin:0;"><strong>Standard:</strong> ' + art.wcagCriterion + '</span>' +
            '<button type="button" class="btn-tool bookmark-btn" ' +
              'data-article-id="' + art.id + '" ' +
              'aria-pressed="' + (isSaved ? 'true' : 'false') + '" ' +
              'aria-label="' + (isSaved ? 'Remove bookmark for ' : 'Bookmark ') + art.title + '">' +
              '<span aria-hidden="true">' + (isSaved ? '★' : '☆') + '</span> ' +
              (isSaved ? 'Bookmarked' : 'Save Guide') +
            '</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  /**
   * WAI-ARIA Tablist Activation & Roving Tabindex
   */
  function selectCategoryTab(targetTab, shouldFocus) {
    if (!targetTab) return;
    const category = targetTab.getAttribute('data-category') || 'all';
    state.activeCategory = category;

    tabButtons.forEach(function (tab) {
      const isSelected = tab === targetTab;
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    const tabpanel = document.getElementById('articles-tabpanel');
    if (tabpanel && targetTab.id) {
      tabpanel.setAttribute('aria-labelledby', targetTab.id);
    }

    if (shouldFocus) {
      targetTab.focus();
    }

    renderArticles(true);
  }

  function initTabs() {
    tabButtons.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        selectCategoryTab(tab, false);
      });

      tab.addEventListener('keydown', function (event) {
        let nextIndex = null;
        if (event.key === 'ArrowRight') {
          nextIndex = (index + 1) % tabButtons.length;
        } else if (event.key === 'ArrowLeft') {
          nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = tabButtons.length - 1;
        }

        if (nextIndex !== null) {
          event.preventDefault();
          selectCategoryTab(tabButtons[nextIndex], true);
        }
      });
    });
  }

  /**
   * Bookmark delegation inside articles container
   */
  function initArticleActions() {
    if (!articlesContainer) return;
    articlesContainer.addEventListener('click', function (event) {
      const btn = event.target.closest('.bookmark-btn');
      if (!btn) return;
      const articleId = btn.getAttribute('data-article-id');
      const article = ARTICLES.find(function (a) { return a.id === articleId; });
      if (!article) return;

      if (state.bookmarkedIds.has(articleId)) {
        state.bookmarkedIds.delete(articleId);
        announce('Removed "' + article.title + '" from saved bookmarks.');
      } else {
        state.bookmarkedIds.add(articleId);
        announce('Saved "' + article.title + '" to bookmarks.');
      }
      renderArticles(false);
      // Restore focus to the updated button
      const updatedBtn = articlesContainer.querySelector('[data-article-id="' + articleId + '"]');
      if (updatedBtn) updatedBtn.focus();
    });
  }

  /**
   * Search Input & Clear Button
   */
  function initSearch() {
    const searchForm = document.getElementById('portal-search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        state.searchQuery = searchInput ? searchInput.value : '';
        renderArticles(true);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.searchQuery = searchInput.value;
        renderArticles(true);
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', function () {
        state.searchQuery = '';
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        renderArticles(true);
      });
    }
  }

  /**
   * WAI-ARIA Accordion Pattern
   */
  function initAccordions() {
    const triggers = Array.from(document.querySelectorAll('.accordion-trigger'));
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        const panelId = trigger.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;

        trigger.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        if (panel) {
          if (isExpanded) {
            panel.setAttribute('hidden', '');
          } else {
            panel.removeAttribute('hidden');
          }
        }
      });
    });
  }

  /**
   * Accessible Preferences Toolbar (Theme, Font Size, Reduced Motion)
   */
  function initPreferencesToolbar() {
    const themeBtns = Array.from(document.querySelectorAll('[data-theme-option]'));
    themeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const chosenTheme = btn.getAttribute('data-theme-option');
        state.theme = chosenTheme;
        document.documentElement.setAttribute('data-theme', chosenTheme);
        themeBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        announce('Display color theme switched to ' + chosenTheme + ' mode.');
      });
    });

    const fontBtns = Array.from(document.querySelectorAll('[data-font-option]'));
    fontBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const scale = btn.getAttribute('data-font-option');
        state.fontScale = scale;
        document.documentElement.setAttribute('data-font-scale', scale);
        fontBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        announce('Text size adjusted to ' + btn.textContent.trim() + '.');
      });
    });

    const motionBtn = document.getElementById('toggle-motion-btn');
    if (motionBtn) {
      motionBtn.addEventListener('click', function () {
        state.reducedMotion = !state.reducedMotion;
        document.documentElement.setAttribute('data-reduced-motion', state.reducedMotion ? 'true' : 'false');
        motionBtn.setAttribute('aria-pressed', state.reducedMotion ? 'true' : 'false');
        motionBtn.textContent = state.reducedMotion ? 'Reduced Motion: ON' : 'Reduced Motion: OFF';
        announce('Reduced motion preference turned ' + (state.reducedMotion ? 'on' : 'off') + '.');
      });
    }
  }

  /**
   * Accessible Modal Dialog with Focus Trap & Escape Handling
   */
  function initModalDialog() {
    const modalBackdrop = document.getElementById('audit-modal-backdrop');
    const modalDialog = document.getElementById('audit-modal-dialog');
    const openBtns = Array.from(document.querySelectorAll('[data-open-audit-modal]'));
    const closeBtns = Array.from(document.querySelectorAll('[data-close-audit-modal]'));

    if (!modalBackdrop || !modalDialog) return;

    function getFocusableElements() {
      return Array.from(
        modalDialog.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    }

    function openModal(triggerEl) {
      state.lastFocusedElement = triggerEl || document.activeElement;
      modalBackdrop.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      const focusables = getFocusableElements();
      if (focusables.length > 0) {
        focusables[0].focus();
      }
      announce('Opened Accessibility Audit & Keyboard Shortcuts dialog.');
    }

    function closeModal() {
      modalBackdrop.setAttribute('hidden', '');
      document.body.style.overflow = '';
      if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
        state.lastFocusedElement.focus();
      }
      announce('Closed Accessibility Audit dialog.');
    }

    openBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        openModal(btn);
      });
    });

    closeBtns.forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });

    modalBackdrop.addEventListener('click', function (event) {
      if (event.target === modalBackdrop) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (modalBackdrop.hasAttribute('hidden')) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key === 'Tab') {
        const focusables = getFocusableElements();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /**
   * Accessible Newsletter & Audit Digest Form Validation (WCAG 3.3.1, 3.3.2, 3.3.3)
   */
  function initAccessibleForm() {
    const form = document.getElementById('a11y-subscribe-form');
    if (!form) return;

    const nameInput = document.getElementById('sub-fullname');
    const emailInput = document.getElementById('sub-email');
    const roleSelect = document.getElementById('sub-role');
    const nameError = document.getElementById('sub-fullname-error');
    const emailError = document.getElementById('sub-email-error');
    const feedbackBox = document.getElementById('form-status-feedback');

    function setFieldError(inputEl, errorEl, message) {
      if (!inputEl || !errorEl) return;
      if (message) {
        inputEl.setAttribute('aria-invalid', 'true');
        errorEl.textContent = message;
        errorEl.removeAttribute('hidden');
      } else {
        inputEl.setAttribute('aria-invalid', 'false');
        errorEl.textContent = '';
        errorEl.setAttribute('hidden', '');
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      let firstInvalid = null;
      const errors = [];

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (nameVal.length < 2) {
        const msg = 'Please enter your full name (at least 2 characters).';
        setFieldError(nameInput, nameError, msg);
        errors.push(msg);
        if (!firstInvalid) firstInvalid = nameInput;
      } else {
        setFieldError(nameInput, nameError, '');
      }

      if (!emailRegex.test(emailVal)) {
        const msg = 'Please enter a valid email address in the format name@domain.com.';
        setFieldError(emailInput, emailError, msg);
        errors.push(msg);
        if (!firstInvalid) firstInvalid = emailInput;
      } else {
        setFieldError(emailInput, emailError, '');
      }

      if (errors.length > 0) {
        if (feedbackBox) {
          feedbackBox.className = 'form-feedback error';
          feedbackBox.setAttribute('role', 'alert');
          feedbackBox.innerHTML =
            '<strong>Submission requires attention (' + errors.length + ' error' + (errors.length > 1 ? 's' : '') + '):</strong>' +
            '<ul style="margin:0.35rem 0 0 1.2rem;padding:0;">' +
            errors.map(function (e) { return '<li>' + e + '</li>'; }).join('') +
            '</ul>';
          feedbackBox.removeAttribute('hidden');
        }
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      const selectedRole = roleSelect ? roleSelect.options[roleSelect.selectedIndex].text : 'Subscriber';
      if (feedbackBox) {
        feedbackBox.className = 'form-feedback success';
        feedbackBox.setAttribute('role', 'status');
        feedbackBox.textContent =
          'Thank you, ' + nameVal + '! You are subscribed to the Weekly WCAG Digest (' + selectedRole + ' track). Confirmation sent to ' + emailVal + '.';
        feedbackBox.removeAttribute('hidden');
      }
      announce('Subscription confirmed for ' + nameVal + '.');
      form.reset();
    });
  }

  // Initialize Portal on DOM Ready
  function init() {
    renderArticles(false);
    initTabs();
    initArticleActions();
    initSearch();
    initAccordions();
    initPreferencesToolbar();
    initModalDialog();
    initAccessibleForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
