import SplitType from 'split-type';

export function init() {
  initGreenText();
  initSplitHeadlines(); // must run after initGreenText — green text rewrites innerHTML first
  initMarquee();
  // TODO: viewport entry animations (animate-fade-up, animate-scale-in) — Intersection Observer
}

function initSplitHeadlines() {
  const headings = document.querySelectorAll('[data-mask-animation]');
  if (!headings.length) return;

  // Respect prefers-reduced-motion — skip split and animation entirely.
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
