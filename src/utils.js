// ============================================
// OVERLAY — NAV (light, desktop: below nav)
// ============================================
// Used only for desktop dropdown panels. On desktop the nav must remain
// accessible above it. CSS controls z-index and opacity per class.
export const overlayNav = document.createElement('div');
overlayNav.classList.add('overlay', 'overlay--nav');
document.body.appendChild(overlayNav);

// ============================================
// OVERLAY — DRAWER (dark, always above nav)
// ============================================
// Used for the mobile nav drawer and the content drawer. Covers everything
// including the nav to prevent interaction with it while open.
export const overlayDrawer = document.createElement('div');
overlayDrawer.classList.add('overlay', 'overlay--drawer');
document.body.appendChild(overlayDrawer);

// ============================================
// REF COUNTS
// ============================================
let navOverlayCount    = 0;
let drawerOverlayCount = 0;
let scrollCount        = 0;

// ============================================
// NAV OVERLAY
// ============================================
export function showNavOverlay() {
  navOverlayCount++;
  overlayNav.classList.add('is-visible');
}

export function hideNavOverlay() {
  navOverlayCount = Math.max(0, navOverlayCount - 1);
  if (navOverlayCount === 0) overlayNav.classList.remove('is-visible');
}

// ============================================
// DRAWER OVERLAY
// ============================================
export function showDrawerOverlay() {
  drawerOverlayCount++;
  overlayDrawer.classList.add('is-visible');
}

export function hideDrawerOverlay() {
  drawerOverlayCount = Math.max(0, drawerOverlayCount - 1);
  if (drawerOverlayCount === 0) overlayDrawer.classList.remove('is-visible');
}

// ============================================
// SCROLL LOCK
// ============================================
export function lockScroll() {
  scrollCount++;
  document.body.style.overflow = 'hidden';
}

export function unlockScroll() {
  scrollCount = Math.max(0, scrollCount - 1);
  if (scrollCount === 0) document.body.style.overflow = '';
}
