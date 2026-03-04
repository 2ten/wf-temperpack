class Accordion {
  constructor(element) {
    this.element = element;
    this.triggers = element.querySelectorAll('[data-trigger]');
    this.currentIndex = -1;

    // Feature flags
    this.hasAutoRotate = element.hasAttribute('data-auto-rotate');
    this.hasImageSwap = element.getAttribute('data-image-swap') === 'true';
    this.firstOpen = element.getAttribute('data-first-open') === 'true';

    // Auto-rotate state
    this.autoRotateInterval = null;
    this.autoRotateEnabled = this.hasAutoRotate;
    this.autoRotateDuration = this.hasAutoRotate ? parseInt(element.getAttribute('data-auto-rotate')) : 0;
    this.progressIntervals = new Map();

    // Image swap state
    this.images = [];
    this.imageContainer = null;

    this.init();
  }

  init() {
    this.setupAccordion();

    if (this.hasAutoRotate) {
      this.setupAutoRotate();
    }

    if (this.hasImageSwap) {
      this.setupImageSwap();
    }

    if (this.firstOpen && this.triggers.length > 0) {
      this.activateItem(0);
    }
  }

  setupAccordion() {
    this.triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => {
        const isActive = this.currentIndex === index;
        this.activateItem(isActive ? -1 : index);

        if (this.autoRotateEnabled) {
          this.disableAutoRotate();
        }

        this.element.classList.add('autorotate-disabled');
      });

      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const isActive = this.currentIndex === index;
          this.activateItem(isActive ? -1 : index);

          if (this.autoRotateEnabled) {
            this.disableAutoRotate();
          }
        }
      });

      const content = trigger.nextElementSibling;
      content.addEventListener('transitionend', () => {
        if (trigger.getAttribute('aria-expanded') === 'true') {
          content.style.height = 'auto';
        }
      });
    });
  }

  setupAutoRotate() {
    this.startAutoRotate();
  }

  setupImageSwap() {
    const section = this.element.closest('section');
    if (!section) return;
    this.imageContainer = section.querySelector('.image-container');
    if (!this.imageContainer) return;

    const sourceImages = this.element.querySelectorAll('.accordion__gallery-image');
    if (!sourceImages.length) return;

    sourceImages.forEach((img) => {
      const clone = img.cloneNode(true);
      this.imageContainer.appendChild(clone);
      this.images.push(clone);
    });

    if (this.images.length > 0) {
      this.images[0].classList.add('is-active');
    }
  }

  activateItem(index) {
    this.triggers.forEach((trigger, i) => {
      const content = trigger.nextElementSibling;
      const item = trigger.closest('[data-trigger]').parentElement;
      const progressBar = item.querySelector('.showcase__progress');

      if (i === index) {
        item.classList.add('is-active');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.height = '0px';
        requestAnimationFrame(() => {
          content.style.height = content.scrollHeight + 'px';
        });

        if (this.hasAutoRotate && progressBar && this.autoRotateEnabled) {
          this.startProgressAnimation(progressBar, this.autoRotateDuration);
        }
      } else {
        item.classList.remove('is-active');
        trigger.setAttribute('aria-expanded', 'false');
        content.style.height = content.scrollHeight + 'px';
        requestAnimationFrame(() => {
          content.style.height = '0px';
        });

        if (this.hasAutoRotate && progressBar) {
          this.resetProgressBar(progressBar);
        }
      }
    });

    this.currentIndex = index;

    if (this.hasImageSwap) {
      this.updateActiveImage(index);
    }
  }

  updateActiveImage(index) {
    this.images.forEach((img) => {
      img.classList.remove('is-active');
    });

    if (index >= 0 && index < this.images.length) {
      this.images[index].classList.add('is-active');
    }
  }

  startProgressAnimation(progressBar, duration) {
    if (this.progressIntervals.has(progressBar)) {
      clearInterval(this.progressIntervals.get(progressBar));
    }

    progressBar.style.width = '0';

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      progressBar.style.width = progress + '%';

      if (progress >= 100) {
        clearInterval(interval);
        this.progressIntervals.delete(progressBar);
      }
    }, 16);

    this.progressIntervals.set(progressBar, interval);
  }

  resetProgressBar(progressBar) {
    if (this.progressIntervals.has(progressBar)) {
      clearInterval(this.progressIntervals.get(progressBar));
      this.progressIntervals.delete(progressBar);
    }
    progressBar.style.width = '0';
  }

  startAutoRotate() {
    if (!this.autoRotateEnabled) return;

    if (this.currentIndex === -1) {
      this.activateItem(0);
    }

    this.autoRotateInterval = setInterval(() => {
      const nextIndex = (this.currentIndex + 1) % this.triggers.length;
      this.activateItem(nextIndex);
    }, this.autoRotateDuration);
  }

  stopAutoRotate() {
    clearInterval(this.autoRotateInterval);
    this.progressIntervals.forEach((interval) => clearInterval(interval));
    this.progressIntervals.clear();
  }

  disableAutoRotate() {
    this.autoRotateEnabled = false;
    this.stopAutoRotate();

    this.triggers.forEach(trigger => {
      const item = trigger.closest('[data-trigger]').parentElement;
      const progressBar = item.querySelector('.showcase__progress');
      if (progressBar) {
        this.resetProgressBar(progressBar);
      }
    });
  }
}

export function init() {
  document.querySelectorAll('[data-accordion]').forEach(el => new Accordion(el));
}
