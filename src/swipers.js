// Swiper is loaded via CDN in Webflow — it is a global, not imported.

export function init() {
  if (document.querySelector('.swiper-media')) {
    new Swiper('.swiper-media', {
      slidesPerView: 'auto',
      spaceBetween: 16,
      loop: false,
      centeredSlides: false,
      pagination: {
        el: '.swiper__pagination--media',
        type: 'fraction',
      },
      navigation: {
        nextEl: '.swiper__next--media',
        prevEl: '.swiper__prev--media',
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
        el: '.swiper__pagination--case-studies',
        type: 'fraction',
      },
      navigation: {
        nextEl: '.swiper__next--case-studies',
        prevEl: '.swiper__prev--case-studies',
      },
      breakpoints: {
        767:  { spaceBetween: 16 },
        1800: { spaceBetween: 32 },
      },
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
          rotate:    [0, 0, -15],
          opacity:   0,
          translate: [-100, 0, -200],
        },
        next: {
          rotate:    [0, 0, 15],
          opacity:   0,
          translate: ['100%', '10%', 0],
        },
      },
      pagination: {
        el: '.swiper__pagination--testimonials',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper__next--testimonials',
        prevEl: '.swiper__prev--testimonials',
      },
    });
  }
}
