'use strict';
const toggle = document.querySelector('.menu-button');
const menu = document.querySelector('#menu');
function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Menü megnyitása');
  menu.classList.remove('open');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
  menu.classList.toggle('open', open);
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    closeMenu(); toggle.focus();
  }
});

const scene = document.querySelector('.bloom-scene');
const sticky = document.querySelector('.bloom-sticky');
const petalsRoot = document.querySelector('#petals');
const stamensRoot = document.querySelector('#stamens');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const ns = 'http://www.w3.org/2000/svg';
const clamp = n => Math.max(0, Math.min(1, n));
const smooth = n => n * n * (3 - 2 * n);
function svg(tag, attributes, parent) {
  const node = document.createElementNS(ns, tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  parent.appendChild(node); return node;
}
// Three overlapping whorls morph from a narrow bud to an open botanical flower.
// Each petal changes curvature, width, length and orientation along its own phase.
const petalData = [];
const colors = [ ['#b56c82','#c58294','#b76b80','#d08c9a'], ['#daa0ac','#edb6bb','#d894a4'], ['#f2c4c3','#e7afb8','#f6d0ca'] ];
for (let layer = 0; layer < 3; layer++) {
  const count = [11,9,7][layer];
  const group = svg('g', {}, petalsRoot);
  for (let index = 0; index < count; index++) {
    const node = svg('g', {}, group);
    const shape = svg('path', { fill: colors[layer][index % colors[layer].length], stroke: '#803c59', 'stroke-width': '.75', 'stroke-opacity': '.55' }, node);
    const vein = svg('path', { fill: 'none', stroke: '#f7d2cd', 'stroke-width': '.8', opacity: '.33' }, node);
    petalData.push({ node, shape, vein, layer, index, count, angle: index * 360 / count + layer * 22, length: [210,160,109][layer] + Math.sin(index * 2) * 11 });
  }
}
const dots=[];
for (let i=0;i<30;i++) {
  const angle=i*2.399963;
  const radius=4+Math.sqrt(i)*4;
  dots.push(svg('circle',{cx:350+Math.cos(angle)*radius,cy:335+Math.sin(angle)*radius,r:1.4+(i%3)*.4,fill:i%2?'#e8c796':'#c9a46b'},stamensRoot));
}
const stem = document.querySelector('.stem');
const leaves = Array.from(document.querySelectorAll('.leaf'));
let queued=false;
let visible=true;
function paint() {
  queued=false;
  const rect=scene.getBoundingClientRect();
  const distance=scene.offsetHeight-sticky.offsetHeight;
  const progress=reduced.matches?1:clamp(-rect.top/Math.max(distance,1));
  sticky.style.setProperty('--bloom',progress.toFixed(4));
  petalData.forEach(petal=>{
    const delay=petal.layer*.12+(petal.index%3)*.018;
    const phase=smooth(clamp((progress-delay)/(.74-delay*.3)));
    const width=7+phase*[86,70,48][petal.layer];
    const length=105+(petal.length-105)*phase;
    const angle=(petal.index-petal.count/2)*2*(1-phase)+petal.angle*phase;
    const originY=335+50*(1-phase);
    petal.node.setAttribute('transform',`translate(350 ${originY.toFixed(2)}) rotate(${angle.toFixed(2)})`);
    petal.shape.setAttribute('d',`M0 15 C${-width} -12 ${-width*1.18} ${-length*.67} ${-width*.35} ${-length*.92} C${-width*.1} ${-length*1.07} ${width*.44} ${-length*1.06} ${width*.72} ${-length*.76} C${width*1.18} ${-length*.4} ${width*.7} ${-length*.03} 0 15Z`);
    petal.vein.setAttribute('d',`M0 8 C${width*.19} ${-length*.29} ${-width*.16} ${-length*.58} 0 ${-length*.84}`);
  });
  const leafPhase=smooth(clamp((progress-.08)/.65));
  leaves.forEach((leaf,i)=>leaf.setAttribute('transform',`translate(350 550) rotate(${(1-leafPhase)*(i?40:-40)}) scale(${.15+.85*leafPhase}) translate(-350 -550)`));
  stem.style.strokeDasharray='1';
  stem.style.strokeDashoffset=String(.28*(1-leafPhase));
  stamensRoot.setAttribute('transform',`translate(350 335) scale(${.04+.96*smooth(clamp((progress-.5)/.42))}) translate(-350 -335)`);
}
function queuePaint(){if(!queued){queued=true;requestAnimationFrame(paint);}}
if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)queuePaint();},{rootMargin:'100px'}).observe(scene);
}
window.addEventListener('scroll',()=>{if(visible&&!reduced.matches)queuePaint();},{passive:true});
window.addEventListener('resize',queuePaint,{passive:true});
window.addEventListener('pageshow',queuePaint);
if(reduced.addEventListener)reduced.addEventListener('change',queuePaint);
paint();
