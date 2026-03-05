import { showDrawerOverlay, hideDrawerOverlay, lockScroll, unlockScroll } from './utils.js';

// ============================================
// HUBSPOT CONFIG
// ============================================
const HS_PORTAL_ID = '44622623';
const HS_REGION    = 'na1';

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
  // RENDER — static content
  // ============================================
  function renderContent(content) {
    drawerBody.innerHTML = '';
    drawerBody.appendChild(content.cloneNode(true));
    drawerBody.scrollTop = 0;
  }

  // ============================================
  // RENDER — HubSpot form
  // ============================================
  function renderForm(card) {
    drawerBody.innerHTML = '';

    const formId      = card.dataset.hsFormId;
    const leadsource  = card.dataset.hsLeadsource;
    const content     = card.querySelector('[data-drawer-content]');

    if (!formId || typeof hbspt === 'undefined') return false;

    // Render static content (h3, intro text, etc.) above the form if present.
    if (content) {
      drawerBody.appendChild(content.cloneNode(true));
    }

    const target = document.createElement('div');
    target.id = 'hs-form-target';
    drawerBody.appendChild(target);

    hbspt.forms.create({
      portalId: HS_PORTAL_ID,
      region:   HS_REGION,
      formId,
      target:   '#hs-form-target',
      onFormReady: function ($form) {
        if (!leadsource) return;
        const field = $form.find('input[name="leadsource"]');
        if (field.length) field.val(leadsource).trigger('change');
      },
    });

    drawerBody.scrollTop = 0;
    return true;
  }

  // ============================================
  // TRIGGER — event delegation
  // ============================================
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-drawer="true"]');
    if (!trigger) return;
    e.preventDefault();

    const card = trigger.closest('[data-drawer-card]');
    if (!card) return;

    if (card.dataset.hsFormId) {
      if (!renderForm(card)) return;
    } else {
      const content = card.querySelector('[data-drawer-content]');
      if (!content) return;
      renderContent(content);
    }

    openDrawer();
  });

  // <a role="button"> does not fire click on Space natively — handle explicitly.
  document.addEventListener('keydown', function (e) {
    if (e.key !== ' ') return;
    const trigger = document.activeElement.closest('[data-drawer="true"]');
    if (!trigger) return;
    e.preventDefault();
    trigger.click();
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
