import {
  overlayNav,
  overlayDrawer,
  showNavOverlay,
  hideNavOverlay,
  showDrawerOverlay,
  hideDrawerOverlay,
  lockScroll,
  unlockScroll,
} from './utils.js';

const MOUSE_LEAVE_DELAY = 300;
const MOBILE_BREAKPOINT = 991;

export function init() {
  // ============================================
  // ELEMENTS
  // ============================================
  const header         = document.querySelector('.header');
  const headerFixed    = document.querySelector('.header-fixed');
  const navItems       = document.querySelectorAll('.main-nav__item--dropdown, .main-nav__item--mega');
  const triggers       = document.querySelectorAll('.main-nav__trigger');
  const hamburger      = document.querySelector('.hamburger');
  const drawer         = document.querySelector('.mobile-nav-drawer');
  const mobileItems    = document.querySelectorAll('.mobile-nav__item:has(.mobile-nav-panel)');
  const mobileTriggers = document.querySelectorAll('.mobile-nav__trigger');
  const searchBtn      = document.querySelector('.search-btn');
  const headerSearch   = document.querySelector('.header-search');

  if (!header) return;

  // ============================================
  // OVERLAY CLICKS
  // ============================================

  // Light overlay (desktop nav): closes dropdown panels only.
  overlayNav.addEventListener('click', function () {
    closeAll();
    hideNavOverlay();
    unlockScroll();
  });

  // Dark overlay (mobile nav / content drawer): closes mobile nav and content drawer.
  overlayDrawer.addEventListener('click', function () {
    closeDrawer();
    hideDrawerOverlay();
    unlockScroll();
    if (window.closeContentDrawer) window.closeContentDrawer();
  });

  // ============================================
  // SCROLL BEHAVIOUR
  // ============================================
  function onScroll() {
    const currentScrollY = window.scrollY;
    const headerHeight   = headerFixed.offsetHeight;
    headerFixed.classList.toggle('is-scrolled', currentScrollY > headerHeight);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ============================================
  // DESKTOP PANEL OPEN / CLOSE
  // ============================================
  function openItem(item) {
    navItems.forEach(function (other) {
      if (other !== item) closeItem(other);
    });
    item.classList.add('is-open');
    const trigger = item.querySelector('.main-nav__trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    headerFixed.classList.add('has-open-panel');
    showNavOverlay();
    lockScroll();
  }

  function closeItem(item) {
    item.classList.remove('is-open');
    const trigger = item.querySelector('.main-nav__trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    const anyOpen = [...navItems].some(i => i.classList.contains('is-open'));
    if (!anyOpen) {
      headerFixed.classList.remove('has-open-panel');
      hideNavOverlay();
      unlockScroll();
    }
  }

  function closeAll() {
    navItems.forEach(function (item) { closeItem(item); });
  }

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  // ============================================
  // DESKTOP TRIGGER CLICKS
  // ============================================
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      if (isMobile()) return;
      const item   = trigger.closest('.main-nav__item');
      const isOpen = item.classList.contains('is-open');
      isOpen ? closeItem(item) : openItem(item);
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });

  // ============================================
  // MOUSE LEAVE WITH DELAY (desktop only)
  // ============================================
  let mouseLeaveTimer = null;

  navItems.forEach(function (item) {
    item.addEventListener('mouseleave', function () {
      if (isMobile()) return;
      mouseLeaveTimer = setTimeout(function () {
        closeItem(item);
      }, MOUSE_LEAVE_DELAY);
    });

    item.addEventListener('mouseenter', function () {
      if (isMobile()) return;
      clearTimeout(mouseLeaveTimer);
    });
  });

  // ============================================
  // CLICK OUTSIDE (desktop)
  // ============================================
  document.addEventListener('click', function (e) {
    if (!isMobile() && !header.contains(e.target)) {
      closeAll();
    }
  });

  // ============================================
  // MOBILE DRAWER
  // ============================================
  function openDrawer() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    showDrawerOverlay();
    lockScroll();
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    closeMobilePanels();
    hideDrawerOverlay();
    unlockScroll();
  }

  if (hamburger && drawer) {
    hamburger.addEventListener('click', function () {
      drawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
    });

    hamburger.addEventListener('keydown', function (e) {
      if (e.key === ' ') {
        e.preventDefault();
        hamburger.click();
      }
    });
  }

  const drawerClose = document.querySelector('.mobile-nav-close');
  if (drawerClose) {
    drawerClose.addEventListener('click', function () {
      closeDrawer();
    });

    drawerClose.addEventListener('keydown', function (e) {
      if (e.key === ' ') {
        e.preventDefault();
        drawerClose.click();
      }
    });
  }

  // ============================================
  // MOBILE ACCORDION
  // ============================================
  function closeMobilePanels() {
    mobileItems.forEach(function (item) {
      item.classList.remove('is-open');
      const trigger = item.querySelector('.mobile-nav__trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  mobileTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const item   = trigger.closest('.mobile-nav__item');
      const isOpen = item.classList.contains('is-open');

      mobileItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove('is-open');
          const otherTrigger = other.querySelector('.mobile-nav__trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });

  // ============================================
  // SEARCH
  // ============================================
  function openSearch() {
    if (!headerSearch) return;
    headerSearch.classList.add('is-open');
    headerSearch.setAttribute('aria-hidden', 'false');
    searchBtn.setAttribute('aria-expanded', 'true');
    const input = headerSearch.querySelector('input');
    if (input) input.focus();
  }

  function closeSearch() {
    if (!headerSearch) return;
    headerSearch.classList.remove('is-open');
    headerSearch.setAttribute('aria-hidden', 'true');
    if (searchBtn) searchBtn.setAttribute('aria-expanded', 'false');
  }

  if (searchBtn && headerSearch) {
    searchBtn.addEventListener('click', function () {
      headerSearch.classList.contains('is-open') ? closeSearch() : openSearch();
    });
  }

  const searchClose = document.querySelector('.search-close');
  if (searchClose) {
    searchClose.addEventListener('click', closeSearch);
  }

  // Close search on click outside the header.
  document.addEventListener('click', function (e) {
    if (headerSearch && headerSearch.classList.contains('is-open') && !header.contains(e.target)) {
      closeSearch();
    }
  });

  // ============================================
  // ESCAPE KEY
  // ============================================
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAll();
      closeDrawer();
      closeSearch();
      hideNavOverlay();
      hideDrawerOverlay();
      unlockScroll();
      if (window.closeContentDrawer) window.closeContentDrawer();
      const openTrigger = header.querySelector('.main-nav__trigger[aria-expanded="true"]');
      if (openTrigger) openTrigger.focus();
    }
  });

  // ============================================
  // RESIZE
  // ============================================
  window.addEventListener('resize', function () {
    if (!isMobile()) {
      closeDrawer();
      closeAll();
      hideNavOverlay();
      hideDrawerOverlay();
      unlockScroll();
    }
  });
}
