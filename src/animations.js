export function init() {
  initGreenText();
  // TODO: viewport entry animations (animate-fade-up, animate-scale-in) — Intersection Observer
  // TODO: marquee — infinite horizontal scroll, respect prefers-reduced-motion
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
