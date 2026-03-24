import { computePosition, flip, shift, offset } from '@floating-ui/dom';

export function init() {
  const triggers = document.querySelectorAll('a[href^="#footnote-"]');
  if (!triggers.length) return;

  // ============================================
  // POPOVER ELEMENT
  // ============================================
  const popover = document.createElement('div');
  popover.className = 'footnote-popover';
  popover.setAttribute('aria-hidden', 'true');
  popover.setAttribute('role', 'tooltip');
  document.body.appendChild(popover);

  let activeTrigger = null;

  // ============================================
  // CLOSE BUTTON
  // ============================================
  const closeBtn = document.createElement('button');
  closeBtn.className = 'footnote-popover__close';
  closeBtn.setAttribute('aria-label', 'Close footnote');
  closeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hidePopover();
  });

  function showPopover(trigger) {
    const num      = trigger.getAttribute('href').replace('#footnote-', '');
    const footnote = document.querySelector(`[data-footnote="${num}"]`);
    if (!footnote) return;

    popover.innerHTML = '';
    popover.appendChild(closeBtn);
    popover.appendChild(footnote.cloneNode(true));

    // Position first, then reveal — avoids flash of wrong position.
    // visibility:hidden keeps dimensions available for computePosition.
    computePosition(trigger, popover, {
      strategy:   'fixed',
      placement:  'bottom',
      middleware: [
        offset(8),
        flip(),
        shift({ padding: 16 }),
      ],
    }).then(({ x, y }) => {
      popover.style.left = `${x}px`;
      popover.style.top  = `${y}px`;
      popover.classList.add('is-visible');
      popover.setAttribute('aria-hidden', 'false');
    });

    if (activeTrigger) activeTrigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    activeTrigger = trigger;
  }

  function hidePopover() {
    popover.classList.remove('is-visible');
    popover.setAttribute('aria-hidden', 'true');
    if (activeTrigger) {
      activeTrigger.setAttribute('aria-expanded', 'false');
      activeTrigger = null;
    }
  }

  // ============================================
  // CLICKS — trigger toggles, outside click closes
  // ============================================
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('a[href^="#footnote-"]');

    if (trigger) {
      e.preventDefault();
      trigger === activeTrigger ? hidePopover() : showPopover(trigger);
      return;
    }

    if (activeTrigger && !popover.contains(e.target)) {
      hidePopover();
    }
  });

  // ============================================
  // ESCAPE KEY — close and return focus to trigger
  // ============================================
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !activeTrigger) return;
    const returnFocus = activeTrigger;
    hidePopover();
    returnFocus.focus();
  });
}
