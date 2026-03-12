(function () {
  // ============================================
  // PILL HOVER — links pills to captions and images via matching data attribute values.
  // Desktop: activates on mouseenter. Mobile (hover: none): activates on click.
  // Default: all hidden. Last activated state holds — no reset on leave.
  // ============================================
  const pills = document.querySelectorAll('[data-pill]');
  if (!pills.length) return;

  const eventType = window.matchMedia('(hover: hover)').matches ? 'mouseenter' : 'click';

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
  }

  pills.forEach(pill => {
    pill.addEventListener(eventType, () => activate(pill.dataset.pill));
  });
})();
