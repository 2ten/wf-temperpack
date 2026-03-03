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
});
