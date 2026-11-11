'use strict';
const toggle=document.querySelector('.menu-button'),menu=document.querySelector('#menu');
function closeMenu(){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Menü megnyitása');menu.classList.remove('open');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Menü bezárása':'Menü megnyitása');menu.classList.toggle('open',open);});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});

const ns='http://www.w3.org/2000/svg';
function tree(root,x,y,h,w){
 const points=[[x,y-h],[x-w*.21,y-h*.64],[x-w*.08,y-h*.64],[x-w*.34,y-h*.38],[x-w*.17,y-h*.38],[x-w*.48,y-h*.08],[x-w*.04,y-h*.08],[x-w*.04,y],[x+w*.04,y],[x+w*.04,y-h*.08],[x+w*.48,y-h*.08],[x+w*.17,y-h*.38],[x+w*.34,y-h*.38],[x+w*.08,y-h*.64],[x+w*.21,y-h*.64]];
 const shape=document.createElementNS(ns,'path');shape.setAttribute('d','M'+points.map(p=>p.join(' ')).join('L')+'Z');root.appendChild(shape);
}
// Fixed illustration, with separate depth planes rather than a zoomed photograph.
const distant=document.querySelector('#distant-trees');
for(let i=0;i<35;i++){const x=-30+i*44;tree(distant,x,430+Math.sin(i*.8)*30,50+(i%4)*12,35+(i%3)*6);}
const middle=document.querySelector('#middle-trees');
for(let i=0;i<27;i++){const x=-50+i*59;tree(middle,x,570+Math.sin(i*.65)*38,90+(i%4)*16,65+(i%3)*8);}
const left=document.querySelector('#left-trees'),right=document.querySelector('#right-trees');
[-60,50,150,250,355,450].forEach((x,i)=>tree(left,x,665+i*20,245+(i%3)*45,130+(i%2)*25));
[950,1045,1140,1240,1350,1460].forEach((x,i)=>tree(right,x,760-i*19,255+(i%3)*35,135+(i%2)*20));
const scene=document.querySelector('.dawn-scene'),sticky=document.querySelector('.dawn-sticky');
const sun=document.querySelector('.rising-sun'),halo=document.querySelector('.sun-halo');
const far=[document.querySelector('.far-hill'),distant],mid=[document.querySelector('.middle-hill'),middle];
const near=document.querySelector('.near-hill'),path=document.querySelector('.valley-path');
const foregroundLeft=document.querySelector('.foreground-left'),foregroundRight=document.querySelector('.foreground-right'),clouds=document.querySelector('.dawn-clouds');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=n=>n*n*(3-2*n);
let queued=false,visible=true;
function paint(){
 queued=false;
 const distance=scene.offsetHeight-sticky.offsetHeight;
 const p=reduced.matches?1:clamp(-scene.getBoundingClientRect().top/Math.max(1,distance));
 sticky.style.setProperty('--dawn',p.toFixed(4));
 const rise=smooth(clamp(p/.93));
 const opening=smooth(clamp((p-.05)/.9));
 sun.setAttribute('cy',(650-395*rise).toFixed(2));halo.setAttribute('cy',(650-395*rise).toFixed(2));
 far.forEach(el=>el.setAttribute('transform',`translate(0 ${(18*opening).toFixed(2)})`));
 mid.forEach(el=>el.setAttribute('transform',`translate(0 ${(53*opening).toFixed(2)})`));
 near.setAttribute('transform',`translate(0 ${(77*opening).toFixed(2)})`);
 path.setAttribute('transform',`translate(0 ${(53*opening).toFixed(2)})`);
 foregroundLeft.setAttribute('transform',`translate(${(-155*opening).toFixed(2)} ${(38*opening).toFixed(2)})`);
 foregroundRight.setAttribute('transform',`translate(${(155*opening).toFixed(2)} ${(38*opening).toFixed(2)})`);
 clouds.setAttribute('transform',`translate(${(-85*rise).toFixed(2)} 0)`);
}
function queuePaint(){if(!queued){queued=true;requestAnimationFrame(paint);}}
if('IntersectionObserver'in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)queuePaint();},{rootMargin:'120px'}).observe(scene);}
window.addEventListener('scroll',()=>{if(visible&&!reduced.matches)queuePaint();},{passive:true});
window.addEventListener('resize',queuePaint,{passive:true});window.addEventListener('pageshow',queuePaint);
if(reduced.addEventListener)reduced.addEventListener('change',queuePaint);
paint();
