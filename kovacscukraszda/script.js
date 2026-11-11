'use strict';
const toggle=document.querySelector('.menu-button');
const menu=document.querySelector('#menu');
function closeMenu(){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Menü megnyitása');menu.classList.remove('open');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Menü bezárása':'Menü megnyitása');menu.classList.toggle('open',open);});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});

// The photograph becomes eight cake-like sectors. Each follows a staggered
// radial path while the composition rotates gently around the uncovered message.
const ns='http://www.w3.org/2000/svg';
const defs=document.querySelector('#slice-defs');
const piecesRoot=document.querySelector('#slice-pieces');
const scene=document.querySelector('.slice-scene');
const sticky=document.querySelector('.slice-sticky');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>x*x*(3-2*x);
function svg(tag,attributes,parent){const el=document.createElementNS(ns,tag);Object.entries(attributes).forEach(([k,v])=>el.setAttribute(k,v));parent.appendChild(el);return el;}
const pieces=[];
const cx=500,cy=400,radius=285;
for(let i=0;i<8;i++){
  const start=i*Math.PI/4-Math.PI/2;
  const end=start+Math.PI/4;
  const x1=cx+Math.cos(start)*radius,y1=cy+Math.sin(start)*radius;
  const x2=cx+Math.cos(end)*radius,y2=cy+Math.sin(end)*radius;
  const path=`M${cx} ${cy}L${x1} ${y1}A${radius} ${radius} 0 0 1 ${x2} ${y2}Z`;
  const clip=svg('clipPath',{id:'sector-'+i},defs);
  svg('path',{d:path},clip);
  const group=svg('g',{},piecesRoot);
  svg('image',{href:'assets/hero.jpg',x:cx-radius,y:cy-radius,width:radius*2,height:radius*2,preserveAspectRatio:'xMidYMid slice','clip-path':`url(#sector-${i})`},group);
  svg('path',{d:path,fill:'none',stroke:'#ead6b6','stroke-width':1.1,'stroke-opacity':'.8'},group);
  pieces.push({group,angle:(start+end)/2,index:i});
}
let queued=false,visible=true;
function render(){
 queued=false;
 const rect=scene.getBoundingClientRect();
 const distance=scene.offsetHeight-sticky.offsetHeight;
 const progress=reduced.matches?1:clamp(-rect.top/Math.max(1,distance));
 sticky.style.setProperty('--slice',progress.toFixed(4));
 sticky.style.setProperty('--reveal',smooth(clamp((progress-.15)/.55)).toFixed(4));
 pieces.forEach(piece=>{
  const phase=smooth(clamp((progress-.03-(piece.index%3)*.025)/.78));
  const travel=phase*650;
  const x=Math.cos(piece.angle)*travel;
  const y=Math.sin(piece.angle)*travel;
  const rotation=phase*(piece.index%2?9:-9);
  piece.group.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotation.toFixed(2)} ${cx} ${cy})`);
 });
}
function queueRender(){if(!queued){queued=true;requestAnimationFrame(render);}}
if('IntersectionObserver' in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)queueRender();},{rootMargin:'120px'}).observe(scene);}
window.addEventListener('scroll',()=>{if(visible&&!reduced.matches)queueRender();},{passive:true});
window.addEventListener('resize',queueRender,{passive:true});
window.addEventListener('pageshow',queueRender);
if(reduced.addEventListener)reduced.addEventListener('change',queueRender);
render();
