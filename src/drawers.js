import { showDrawerOverlay, hideDrawerOverlay, lockScroll, unlockScroll } from './utils.js';

export function init() {
  // ============================================
  // ELEMENTS
  // ============================================
  const drawer = document.createElement('div');
  drawer.className = 'drawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = `
    <div class="drawer__header">
      <a class="drawer__close" role="button" tabindex="0" aria-label="Close drawer">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </a>
    </div>
    <div class="drawer__body"></div>
  `;
  document.body.appendChild(drawer);

  const drawerBody  = drawer.querySelector('.drawer__body');
  const drawerClose = drawer.querySelector('.drawer__close');

  // ============================================
  // CACHE
  // ============================================
  const drawerCache = {};

  // ============================================
  // OPEN / CLOSE
  // ============================================
  function openDrawer() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    showDrawerOverlay();
    lockScroll();
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    hideDrawerOverlay();
    unlockScroll();
  }

  // ============================================
  // RENDER
  // ============================================
  function setLoading() {
    drawerBody.classList.add('is-loading');
    drawerBody.innerHTML = '<div class="drawer__loader"></div>';
  }

  function renderContent(content) {
    drawerBody.classList.remove('is-loading');
    drawerBody.innerHTML = '';
    drawerBody.appendChild(content.cloneNode(true));
    drawerBody.scrollTop = 0;
  }

  function renderError() {
    drawerBody.classList.remove('is-loading');
    drawerBody.innerHTML = '<p>Content could not be loaded.</p>';
  }

  // ============================================
  // FETCH
  // ============================================
  function fetchDrawerContent(url) {
    if (drawerCache[url]) {
      renderContent(drawerCache[url]);
      openDrawer();
      return;
    }

    setLoading();
    openDrawer();

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('Network response was not ok');
        return r.text();
      })
      .then(function (html) {
        const doc     = new DOMParser().parseFromString(html, 'text/html');
        const content = doc.querySelector('.drawer-content');
        if (!content) throw new Error('.drawer-content not found');
        drawerCache[url] = content;
        renderContent(content);
      })
      .catch(function () {
        renderError();
      });
  }

  // ============================================
  // TRIGGER — event delegation
  // ============================================
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-drawer="true"]');
    if (!trigger) return;
    e.preventDefault();
    fetchDrawerContent(trigger.href);
  });

  // ============================================
  // CLOSE BUTTON
  // ============================================
  drawerClose.addEventListener('click', closeDrawer);

  drawerClose.addEventListener('keydown', function (e) {
    if (e.key === ' ') {
      e.preventDefault();
      closeDrawer();
    }
  });

  // ============================================
  // ESCAPE KEY
  // ============================================
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  // ============================================
  // EXPOSE FOR OVERLAY CLICK
  // ============================================
  window.closeContentDrawer = closeDrawer;
}
