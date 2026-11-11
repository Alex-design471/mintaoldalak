'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Menü megnyitása');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Menü megnyitása' : 'Menü bezárása');
  navigation.classList.toggle('is-open', !expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeMenu();
});

// The scroll position drives each structural part along its own assembly path.
// One animation frame per scroll update; no perpetual background animation.
const scene = document.querySelector('.assembly');
const stage = document.querySelector('.assembly-sticky');
const stageLabel = document.querySelector('#assembly-stage');
const parts = Array.from(document.querySelectorAll('.piece')).map(element => ({
  element,
  x: Number(element.dataset.x), y: Number(element.dataset.y),
  rotation: Number(element.dataset.rotate),
  start: Number(element.dataset.start), end: Number(element.dataset.end)
}));
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = value => Math.max(0, Math.min(1, value));
const smoothstep = value => value * value * (3 - 2 * value);
let pendingFrame = false;
let sceneVisible = false;
function renderScene() {
  pendingFrame = false;
  const rect = scene.getBoundingClientRect();
  const distance = scene.offsetHeight - stage.offsetHeight;
  const progress = motionPreference.matches ? 1 : clamp(-rect.top / Math.max(1, distance));
  stage.style.setProperty('--progress', progress.toFixed(4));
  parts.forEach(part => {
    const remaining = 1 - smoothstep(clamp((progress - part.start) / (part.end - part.start)));
    part.element.setAttribute('transform', `translate(${(part.x * remaining).toFixed(2)} ${(part.y * remaining).toFixed(2)}) rotate(${(part.rotation * remaining).toFixed(2)} 480 340)`);
  });
  stageLabel.textContent = progress < .32 ? '01 — AZ ELEMEK' : progress < .76 ? '02 — AZ ILLESZKEDÉS' : '03 — AZ EGÉSZ';
}
function queueFrame() {
  if (!pendingFrame) {
    pendingFrame = true;
    requestAnimationFrame(renderScene);
  }
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    sceneVisible = entries[0].isIntersecting;
    if (sceneVisible) queueFrame();
  }, { rootMargin: '200px' });
  observer.observe(scene);
} else sceneVisible = true;
window.addEventListener('scroll', () => {
  if (sceneVisible && !motionPreference.matches) queueFrame();
}, { passive: true });
window.addEventListener('resize', queueFrame, { passive: true });
if (motionPreference.addEventListener) motionPreference.addEventListener('change', queueFrame);
window.addEventListener('pageshow', queueFrame);
renderScene();
