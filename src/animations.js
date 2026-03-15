import SplitType from 'split-type';

export function init() {
  initGreenText();
  initSplitHeadlines();  // must run after initGreenText — green text rewrites innerHTML first
  initHeroFadeUp();
  initMarquee();
  initSectionAnimations();
  initImageAnimations();
}

// ============================================
// HERO — masked headline (SplitType line reveal)
// Triggered by html.is-loaded via CSS.
// ============================================
function initSplitHeadlines() {
  const headings = document.querySelectorAll('[data-animate-mask]');
  if (!headings.length) return;

  // Skip split entirely — heading stays as plain text, is-loaded reveals it.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // NOTE: headings with data-green-text have their innerHTML rewritten before
  // this runs. SplitType interaction with the injected <span> needs revisiting.
  headings.forEach(heading => {
    const split = new SplitType(heading, { types: 'lines, words' });

    // Each .line is the overflow:hidden mask. All words in a line share the
    // same delay so they animate as a unit, one line after another.
    split.lines.forEach((line, i) => {
      line.style.overflow = 'hidden';
      line.querySelectorAll('.word').forEach(word => {
        word.style.setProperty('--delay', `${i * 0.08}s`);
      });
    });
  });
}

// ============================================
// HERO — fade up elements
// Sets --delay from attribute value. CSS html.is-loaded triggers animation.
// ============================================
function initHeroFadeUp() {
  const elements = document.querySelectorAll('[data-animate-fadeup]');
  if (!elements.length) return;

  elements.forEach(el => {
    const delay = parseFloat(el.dataset.animateFadeup);
    if (delay) el.style.setProperty('--delay', `${delay}s`);
  });
}

// ============================================
// SECTIONS — intersection observer
// One observer per section. CSS handles all child animations off is-visible.
// ============================================
function initSectionAnimations() {
  const sections = document.querySelectorAll('[data-animate]');
  if (!sections.length) return;

  // Reduced motion — show all sections immediately, no animation.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sections.forEach(s => s.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); // one-time, stays visible
    });
  }, { threshold: 0, rootMargin: `0px 0px ${getIOOffset()} 0px` });

  sections.forEach(section => observer.observe(section));
}

// ============================================
// IMAGES — intersection observer + lazy load check
// Waits for img.complete before adding is-visible to avoid animating empty boxes.
// ============================================
function initImageAnimations() {
  const wrappers = document.querySelectorAll('[class*="img-wrap"]');
  if (!wrappers.length) return;

  // Reduced motion — show all images immediately.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    wrappers.forEach(w => w.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const img = entry.target.querySelector('img');

      if (!img || img.complete) {
        entry.target.classList.add('is-visible');
      } else {
        // Image not yet loaded — wait for it then animate.
        img.addEventListener('load', () => {
          entry.target.classList.add('is-visible');
        }, { once: true });
      }
    });
  }, { threshold: 0, rootMargin: `0px 0px ${getIOOffset()} 0px` });

  wrappers.forEach(wrapper => observer.observe(wrapper));
}

// Reads --animate-io-offset from CSS so the value is breakpoint-aware.
// Define in :root and override in media queries — no JS changes needed.
function getIOOffset() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--animate-io-offset')
    .trim() || '-80px';
}

// ============================================
// MARQUEE — infinite horizontal scroll
// ============================================
function initMarquee() {
  const marquees = document.querySelectorAll('.marquee');
  if (!marquees.length) return;

  // Skip cloning and animation entirely — no duplicate items left in the DOM.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  marquees.forEach(marquee => {
    // Clone the original set of items and append them immediately after.
    // CSS then animates translateX(0) → translateX(-50%), which equals exactly
    // one full pass of the original content before looping seamlessly.
    const originalItems = Array.from(marquee.children);
    originalItems.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      marquee.appendChild(clone);
    });

    marquee.classList.add('is-animating');

    // Slow down on hover using WAAPI playbackRate — avoids the position jump
    // that a CSS animation-duration change would cause.
    marquee.addEventListener('mouseenter', () => {
      const anim = marquee.getAnimations()[0];
      if (anim) anim.playbackRate = 0.25;
    });

    marquee.addEventListener('mouseleave', () => {
      const anim = marquee.getAnimations()[0];
      if (anim) anim.playbackRate = 1;
    });
  });
}

// ============================================
// GREEN TEXT — wraps data-green-text value in a coloured span
// ============================================
function initGreenText() {
  const heroHeadings = document.querySelectorAll('h1[data-green-text]');
  if (!heroHeadings.length) return;

  heroHeadings.forEach(heading => {
    const greenText = heading.getAttribute('data-green-text');
    const fullText  = heading.textContent;

    if (greenText && fullText.includes(greenText)) {
      const styledText = fullText.replace(
        greenText,
        `<br><span class="text--green-dark">${greenText}</span>`
      );
      heading.innerHTML = styledText;
    }
  });
}
