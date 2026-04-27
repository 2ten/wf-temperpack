import { init as initAnnouncement } from './announcement.js';
import { init as initNavigation   } from './navigation.js';
import { init as initDrawers      } from './drawers.js';
import { init as initInteractions } from './interactions.js';
import { init as initAnimations   } from './animations.js';
import { init as initSwipers      } from './swipers.js';
import { init as initForms        } from './forms.js';
import { init as initFootnotes    } from './footnotes.js';

document.addEventListener('DOMContentLoaded', function () {
  initAnnouncement();
  initNavigation();
  initDrawers();
  initInteractions();
  initAnimations();
  initSwipers();
  initForms();
  initFootnotes();

  // Add is-loaded to <html> once fonts are ready — triggers CSS hero animations.
  document.fonts.ready.then(() => {
    document.documentElement.classList.add('is-loaded');
  });
});
