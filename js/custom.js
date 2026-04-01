if (document.querySelector('.swiper-media')) {
  new Swiper('.swiper-media', {
    slidesPerView: 'auto',
    spaceBetween: 16,
    loop: false,
    centeredSlides: false,
    pagination: {
      el: ".swiper__pagination--media",
      type: "fraction",
    },
    navigation: {
      nextEl: ".swiper__next--media",
      prevEl: ".swiper__prev--media",
    },
  });
}

if (document.querySelector('.swiper-case-studies')) {
  new Swiper('.swiper-case-studies', {
    slidesPerView: 'auto',
    spaceBetween: 12,
    loop: false,
    centeredSlides: false,
    pagination: {
      el: ".swiper__pagination--case-studies",
      type: "fraction",
    },
    navigation: {
      nextEl: ".swiper__next--case-studies",
      prevEl: ".swiper__prev--case-studies",
    },
    breakpoints: {
      767: { spaceBetween: 16 },
      1800: { spaceBetween: 32 },
    }
  });
}

if (document.querySelector('.swiper-testimonials')) {
  new Swiper('.swiper-testimonials', {
    effect: 'creative',
    grabCursor: true,
    slidesPerView: 'auto',
    centeredSlides: true,
    loop: true,
    speed: 700,
    creativeEffect: {
      prev: {
        rotate: [0, 0, -15],
        opacity: 0,
        translate: [-100, 0, -200],
      },
      next: {
        rotate: [0, 0, 15],
        opacity: 0,
        translate: ['100%', '10%', 0],
      },
    },
    pagination: {
      el: ".swiper__pagination--testimonials",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper__next--testimonials",
      prevEl: ".swiper__prev--testimonials",
    },
  });
}

// custom widgets
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
    // Setup core accordion functionality
    this.setupAccordion();

    // Setup optional features
    if (this.hasAutoRotate) {
      this.setupAutoRotate();
    }

    if (this.hasImageSwap) {
      this.setupImageSwap();
    }

    // Initialize first item if specified
    if (this.firstOpen && this.triggers.length > 0) {
      this.activateItem(0);
    }
  }

  setupAccordion() {
    // Click and keyboard handlers for each trigger
    this.triggers.forEach((trigger, index) => {
      // Click handler
      trigger.addEventListener('click', () => {
        const isActive = this.currentIndex === index;
        this.activateItem(isActive ? -1 : index);

        // Permanently disable auto-rotate on manual interaction
        if (this.autoRotateEnabled) {
          this.disableAutoRotate();
        }
        
        // add class to indicate manual
		this.element.classList.add('autorotate-disabled');
      });

      // Keyboard handler
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const isActive = this.currentIndex === index;
          this.activateItem(isActive ? -1 : index);

          // Permanently disable auto-rotate on manual interaction
          if (this.autoRotateEnabled) {
            this.disableAutoRotate();
          }
        }
      });

      // Transition end handler for auto height
      const content = trigger.nextElementSibling;
      content.addEventListener('transitionend', () => {
        if (trigger.getAttribute('aria-expanded') === 'true') {
          content.style.height = 'auto';
        }
      });
    });
  }

  setupAutoRotate() {
    // Start auto-rotation
    this.startAutoRotate();
  }

  setupImageSwap() {
    // Find the image container
    this.imageContainer = this.element.querySelector('.image-container');
    if (!this.imageContainer) return;

    // Find all accordion item images
    const sourceImages = this.element.querySelectorAll('.accordion-item__image');
    if (!sourceImages.length) return;

    // Clone images into the container
    sourceImages.forEach((img, index) => {
      const clone = img.cloneNode(true);
      clone.classList.remove('accordion-item__image');
      this.imageContainer.appendChild(clone);
      this.images.push(clone);
    });

    // Activate first image by default
    if (this.images.length > 0) {
      this.images[0].classList.add('is-active');
    }
  }

  activateItem(index) {
    // Close all items
    this.triggers.forEach((trigger, i) => {
      const content = trigger.nextElementSibling;
      const item = trigger.closest('[data-trigger]').parentElement;
      const progressBar = item.querySelector('.showcase__progress');

      if (i === index) {
        // Open this item
        item.classList.add('is-active');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.height = '0px';
        requestAnimationFrame(() => {
          content.style.height = content.scrollHeight + 'px';
        });

        // Start progress bar animation if auto-rotate is enabled
        if (this.hasAutoRotate && progressBar && this.autoRotateEnabled) {
          this.startProgressAnimation(progressBar, this.autoRotateDuration);
        }
      } else {
        // Close other items
        item.classList.remove('is-active');
        trigger.setAttribute('aria-expanded', 'false');
        content.style.height = content.scrollHeight + 'px';
        requestAnimationFrame(() => {
          content.style.height = '0px';
        });

        // Reset progress bar
        if (this.hasAutoRotate && progressBar) {
          this.resetProgressBar(progressBar);
        }
      }
    });

    // Update current index
    this.currentIndex = index;

    // Handle image swap if enabled
    if (this.hasImageSwap) {
      this.updateActiveImage(index);
    }
  }

  updateActiveImage(index) {
    // Remove is-active from all images
    this.images.forEach((img) => {
      img.classList.remove('is-active');
    });

    // Add is-active to the image matching the active index
    if (index >= 0 && index < this.images.length) {
      this.images[index].classList.add('is-active');
    }
  }

  startProgressAnimation(progressBar, duration) {
    // Clear any existing progress animation for this bar
    if (this.progressIntervals.has(progressBar)) {
      clearInterval(this.progressIntervals.get(progressBar));
    }

    // Reset to 0
    progressBar.style.width = '0';

    // Animate from 0 to 100% over the duration
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      progressBar.style.width = progress + '%';

      if (progress >= 100) {
        clearInterval(interval);
        this.progressIntervals.delete(progressBar);
      }
    }, 16); // ~60fps

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
    // Only start if auto-rotate is still enabled
    if (!this.autoRotateEnabled) return;

    // Initialize first item if nothing open
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
    // Clear all progress intervals
    this.progressIntervals.forEach((interval) => clearInterval(interval));
    this.progressIntervals.clear();
  }

  disableAutoRotate() {
    this.autoRotateEnabled = false;
    this.stopAutoRotate();

    // Reset all progress bars
    this.triggers.forEach(trigger => {
      const item = trigger.closest('[data-trigger]').parentElement;
      const progressBar = item.querySelector('.showcase__progress');
      if (progressBar) {
        this.resetProgressBar(progressBar);
      }
    });
  }
}

// Initialize all accordions
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('[data-accordion]').forEach(el => new Accordion(el));
});

document.addEventListener('DOMContentLoaded', function() {
  const heroHeadings = document.querySelectorAll('h1[data-green-text]');
  
  if (!heroHeadings.length) return;
  
  heroHeadings.forEach(heading => {
    const greenText = heading.getAttribute('data-green-text');
    const fullText = heading.textContent;
    
    if (greenText && fullText.includes(greenText)) {
      // Replace green text with styled version
      const styledText = fullText.replace(
        greenText,
        `<br><span class="text--green-dark">${greenText}</span>`
      );
      heading.innerHTML = styledText;
    }
  });
});


(function () {
  'use strict';

  // ============================================
  // CONFIG
  // ============================================
  const MOUSE_LEAVE_DELAY  = 300;
  const MOBILE_BREAKPOINT  = 991;

  // ============================================
  // ELEMENTS
  // ============================================
  const header      = document.querySelector('.header');
  const headerFixed = document.querySelector('.header-fixed');
  const navItems    = document.querySelectorAll('.main-nav__item--dropdown, .main-nav__item--mega');
  const triggers    = document.querySelectorAll('.main-nav__trigger');
  const hamburger   = document.querySelector('.hamburger');
  const drawer      = document.querySelector('.mobile-nav-drawer');
  const mobileItems = document.querySelectorAll('.mobile-nav__item:has(.mobile-nav-panel)');
  const mobileTriggers = document.querySelectorAll('.mobile-nav__trigger');

  if (!header) return;

  // ============================================
  // OVERLAY
  // ============================================
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');
  document.body.appendChild(overlay);

  function showOverlay() {
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function hideOverlay() {
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', function () {
    closeAll();
    closeDrawer();
    hideOverlay();
    if (window.closeContentDrawer) window.closeContentDrawer(); // content drawer
  });


  // ============================================
  // SCROLL BEHAVIOUR
  // ============================================
  function onScroll() {
    const currentScrollY = window.scrollY;
    const headerHeight   = headerFixed.offsetHeight;
    headerFixed.classList.toggle('is-scrolled', currentScrollY > headerHeight);
  }

  window.addEventListener('scroll', onScroll, { passive: true });


  // ============================================
  // DESKTOP PANEL OPEN / CLOSE
  // ============================================
  function openItem(item) {
    navItems.forEach(function (other) {
      if (other !== item) closeItem(other);
    });
    item.classList.add('is-open');
    const trigger = item.querySelector('.main-nav__trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    headerFixed.classList.add('has-open-panel');
    showOverlay();
  }

  function closeItem(item) {
    item.classList.remove('is-open');
    const trigger = item.querySelector('.main-nav__trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    const anyOpen = [...navItems].some(i => i.classList.contains('is-open'));
    if (!anyOpen) {
      headerFixed.classList.remove('has-open-panel');
      hideOverlay();
    }
  }

  function closeAll() {
    navItems.forEach(function (item) { closeItem(item); });
  }

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }


  // ============================================
  // DESKTOP TRIGGER CLICKS
  // ============================================
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      if (isMobile()) return;
      const item   = trigger.closest('.main-nav__item');
      const isOpen = item.classList.contains('is-open');
      isOpen ? closeItem(item) : openItem(item);
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });


  // ============================================
  // MOUSE LEAVE WITH DELAY (desktop only)
  // ============================================
  let mouseLeaveTimer = null;

  navItems.forEach(function (item) {
    item.addEventListener('mouseleave', function () {
      if (isMobile()) return;
      mouseLeaveTimer = setTimeout(function () {
        closeItem(item);
      }, MOUSE_LEAVE_DELAY);
    });

    item.addEventListener('mouseenter', function () {
      if (isMobile()) return;
      clearTimeout(mouseLeaveTimer);
    });
  });


  // ============================================
  // CLICK OUTSIDE (desktop)
  // ============================================
  document.addEventListener('click', function (e) {
    if (!isMobile() && !header.contains(e.target)) {
      closeAll();
    }
  });


  // ============================================
  // MOBILE DRAWER
  // ============================================
  function openDrawer() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    showOverlay();
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    closeMobilePanels();
    hideOverlay();
  }

  if (hamburger && drawer) {
    hamburger.addEventListener('click', function () {
      drawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
    });

    hamburger.addEventListener('keydown', function (e) {
      if (e.key === ' ') {
        e.preventDefault();
        hamburger.click();
      }
    });
  }
  const drawerClose = document.querySelector('.mobile-nav-close');
  if (drawerClose) {
    drawerClose.addEventListener('click', function () {
      closeDrawer();
    });

    drawerClose.addEventListener('keydown', function (e) {
      if (e.key === ' ') {
        e.preventDefault();
        drawerClose.click();
      }
    });
  }

  // ============================================
  // MOBILE ACCORDION
  // ============================================
  function closeMobilePanels() {
    mobileItems.forEach(function (item) {
      item.classList.remove('is-open');
      const trigger = item.querySelector('.mobile-nav__trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  mobileTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const item   = trigger.closest('.mobile-nav__item');
      const isOpen = item.classList.contains('is-open');

      // Close other open items
      mobileItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove('is-open');
          const otherTrigger = other.querySelector('.mobile-nav__trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });


  // ============================================
  // ESCAPE KEY
  // ============================================
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAll();
      closeDrawer();
      hideOverlay();
      if (window.closeContentDrawer) window.closeContentDrawer();
      const openTrigger = header.querySelector('.main-nav__trigger[aria-expanded="true"]');
      if (openTrigger) openTrigger.focus();
    }
  });


  // ============================================
  // RESIZE
  // ============================================
  window.addEventListener('resize', function () {
    if (!isMobile()) {
      closeDrawer();
      closeAll();
      hideOverlay();
    }
  });

}());
  
  
(function () {
  'use strict';

  // ============================================
  // ELEMENTS
  // ============================================
  const drawer     = document.createElement('div');
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
  // CACHE
  // ============================================
  const drawerCache = {};

  // ============================================
  // OPEN / CLOSE
  // ============================================
  function openDrawer() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    // showOverlay();
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    // hideOverlay();
    document.body.style.overflow = '';
  }

  // ============================================
  // RENDER
  // ============================================
  function setLoading() {
    console.log('setLoading');
    drawerBody.classList.add('is-loading');
    drawerBody.innerHTML = '<div class="drawer__loader"></div>';
  }

  function renderContent(content) {
    drawerBody.classList.remove('is-loading');
    drawerBody.innerHTML = '';
    drawerBody.appendChild(content.cloneNode(true));
    drawerBody.scrollTop = 0;
  }

  function renderError() {
    drawerBody.classList.remove('is-loading');
    drawerBody.innerHTML = '<p>Content could not be loaded.</p>';
  }

  // ============================================
  // FETCH
  // ============================================
  function fetchDrawerContent(url) {
    if (drawerCache[url]) {
      renderContent(drawerCache[url]);
      openDrawer();
      return;
    }

    setLoading();
    openDrawer();

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('Network response was not ok');
        return r.text();
      })
      .then(function (html) {
        const doc     = new DOMParser().parseFromString(html, 'text/html');
        const content = doc.querySelector('.drawer-content');
        if (!content) throw new Error('.drawer-content not found');
        drawerCache[url] = content;
        renderContent(content);
      })
      .catch(function () {
        renderError();
      });
  }

  // ============================================
  // TRIGGER — event delegation
  // ============================================
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-drawer="true"]');
    if (!trigger) return;
    e.preventDefault();
    fetchDrawerContent(trigger.href);
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

}());