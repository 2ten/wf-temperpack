(function () {
  // ============================================
  // PILL HOVER — links pills to captions and images via matching data attribute values.
  // Desktop: activates on mouseenter. Mobile (hover: none): activates on click.
  // Default: all hidden. Last activated state holds — no reset on leave.
  // ============================================
  const pills = document.querySelectorAll('[data-pill]');
  if (!pills.length) return;

  const isHoverDevice = window.matchMedia('(hover: hover)').matches;
  const eventType     = isHoverDevice ? 'mouseenter' : 'click';

  // Elements that fade out when a pill is active.
  const fadeEls = [
    ...document.querySelectorAll('.hero-home__header, .hero-home__with, .hero-hint--center'),
  ];

  function activate(id) {
    pills.forEach(p =>
      p.classList.toggle('is-active', p.dataset.pill === id)
    );
    document.querySelectorAll('[data-caption]').forEach(el =>
      el.classList.toggle('is-active', el.dataset.caption === id)
    );
    document.querySelectorAll('[data-image]').forEach(el =>
      el.classList.toggle('is-active', el.dataset.image === id)
    );
    fadeEls.forEach(el => el.classList.add('is-faded'));
  }

  function deactivate() {
    fadeEls.forEach(el => el.classList.remove('is-faded'));
    pills.forEach(p => p.classList.remove('is-active'));
    document.querySelectorAll('[data-caption]').forEach(el => el.classList.remove('is-active'));
    document.querySelectorAll('[data-image]').forEach(el => el.classList.remove('is-active'));
  }

  pills.forEach(pill => {
    pill.addEventListener(eventType, () => activate(pill.dataset.pill));
    if (isHoverDevice) {
      pill.addEventListener('mouseleave', deactivate);
    }
  });
})();
