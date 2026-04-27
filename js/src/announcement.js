const LS_KEY = 'announcement-closed';

let announcementEl   = null;
let announcementGone = false;

// ============================================
// HEIGHT — read by navigation.js for scroll threshold
// ============================================
export function getAnnouncementHeight() {
  if (announcementGone || !announcementEl) return 0;
  return announcementEl.offsetHeight;
}

// ============================================
// CSS VARIABLE — keeps --announcement-height in sync
// ============================================
function setHeightVar(px) {
  document.documentElement.style.setProperty('--announcement-height', `${px}px`);
}

// ============================================
// DISMISS — animate out, remove, persist to localStorage
// ============================================
function dismiss() {
  if (!announcementEl) return;

  announcementEl.style.height     = announcementEl.offsetHeight + 'px';
  announcementEl.style.overflow   = 'hidden';
  announcementEl.style.transition = 'height 0.3s ease, opacity 0.3s ease';

  requestAnimationFrame(() => {
    announcementEl.style.height  = '0';
    announcementEl.style.opacity = '0';
  });

  announcementEl.addEventListener('transitionend', () => {
    announcementEl.remove();
    setHeightVar(0);
  }, { once: true });

  announcementGone = true;

  const id = announcementEl.dataset.announcementId;
  if (id) localStorage.setItem(LS_KEY, id);
  document.documentElement.classList.add('announcement-dismissed');
}

// ============================================
// INIT
// ============================================
export function init() {
  announcementEl = document.querySelector('.announcement');
  if (!announcementEl) {
    announcementGone = true;
    return;
  }

  const id     = announcementEl.dataset.announcementId;
  const stored = localStorage.getItem(LS_KEY);

  if (id && stored === id) {
    // Same announcement — already dismissed, CSS is hiding it, just clean up
    announcementEl.remove();
    announcementEl   = null;
    announcementGone = true;
    return;
  }

  if (stored && id && stored !== id) {
    // New announcement — clear dismissed state so it shows
    document.documentElement.classList.remove('announcement-dismissed');
    localStorage.removeItem(LS_KEY);
  }

  setHeightVar(announcementEl.offsetHeight);

  const closeBtn = announcementEl.querySelector('.announcement-close');
  if (closeBtn) closeBtn.addEventListener('click', dismiss);
}
