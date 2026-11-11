'use strict';
const toggle=document.querySelector('.menu-button');
const menu=document.querySelector('#menu');
function closeMenu(){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Menü megnyitása');menu.classList.remove('open');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Menü bezárása':'Menü megnyitása');menu.classList.toggle('open',open);});
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('click',event=>{if(!event.target.closest('.header'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});

const scene=document.querySelector('.surface-scene');
const sticky=document.querySelector('.surface-sticky');
const grid=document.querySelector('.surface-grid');
const phaseLabel=document.querySelector('#surface-phase');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=value=>value*value*(3-2*value);
const panels=[];
// Each front face contains the same full-size, object-fit photograph.
// Offsetting that image by the tile position preserves an undistorted panorama.
for(let row=0;row<3;row++){
 for(let col=0;col<4;col++){
  const panel=document.createElement('div');panel.className='surface-panel';panel.setAttribute('aria-hidden','true');
  const front=document.createElement('div');front.className='panel-face panel-front';
  const photo=document.createElement('img');photo.src='assets/room.jpg';photo.alt='';photo.width=1900;photo.height=2533;photo.draggable=false;
  photo.style.left=(-100*col)+'%';photo.style.top=(-100*row)+'%';front.appendChild(photo);
  const back=document.createElement('div');back.className='panel-face panel-back';
  const label=document.createElement('span');label.textContent=String(row*4+col+1).padStart(2,'0');
  const cross=document.createElement('span');cross.textContent='+';back.append(label,cross);
  panel.append(front,back);grid.appendChild(panel);
  panels.push({panel,row,col});
 }
}
grid.classList.add('ready');
let queued=false,visible=true;
function render(){
 queued=false;
 const rect=scene.getBoundingClientRect();
 const distance=scene.offsetHeight-sticky.offsetHeight;
 const progress=reduced.matches?1:clamp(-rect.top/Math.max(1,distance));
 sticky.style.setProperty('--surface',progress.toFixed(4));
 panels.forEach(({panel,row,col})=>{
  const delay=(col+row*.7)*.082;
  const local=smooth(clamp((progress-delay)/.51));
  const angle=180*(1-local);
  const lift=Math.sin(local*Math.PI)*38;
  panel.style.transform=`translateZ(${lift.toFixed(2)}px) rotateY(${angle.toFixed(2)}deg)`;
 });
 phaseLabel.textContent=progress<.27?'01 / ÚJ NÉZŐPONT':progress<.82?'02 / FELÜLETRŐL FELÜLETRE':'03 / ÚJ KARAKTER';
}
function queueRender(){if(!queued){queued=true;requestAnimationFrame(render);}}
if('IntersectionObserver'in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)queueRender();},{rootMargin:'120px'}).observe(scene);}
window.addEventListener('scroll',()=>{if(visible&&!reduced.matches)queueRender();},{passive:true});
window.addEventListener('resize',queueRender,{passive:true});
window.addEventListener('pageshow',queueRender);
if(reduced.addEventListener)reduced.addEventListener('change',queueRender);
render();
