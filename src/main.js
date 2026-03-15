import { init as initNavigation   } from './navigation.js';
import { init as initDrawers      } from './drawers.js';
import { init as initInteractions } from './interactions.js';
import { init as initAnimations   } from './animations.js';
import { init as initSwipers      } from './swipers.js';

document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  initDrawers();
  initInteractions();
  initAnimations();
  initSwipers();

  // Add is-loaded to <html> once fonts are ready — triggers CSS hero animations.
  document.fonts.ready.then(() => {
    document.documentElement.classList.add('is-loaded');
  });
});
