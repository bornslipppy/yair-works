(function(){
'use strict';
let owner=null,bubble=null,oldDescription=null;
function close(){if(owner){if(oldDescription===null)owner.removeAttribute('aria-describedby');else owner.setAttribute('aria-describedby',oldDescription)}bubble?.remove();bubble=null;owner=null}
function show(mark){
 const copy=mark.querySelector('.qp');if(!copy?.textContent.trim())return;
 if(owner===mark)return;close();owner=mark;oldDescription=mark.getAttribute('aria-describedby');mark.dataset.platformHelp='';
 bubble=document.createElement('div');bubble.className='platform-help-tooltip';bubble.id='platform-help-tooltip';bubble.setAttribute('role','tooltip');bubble.textContent=copy.textContent.trim();
 (mark.closest('dialog[open]')||document.body).append(bubble);
 // The top layer avoids clipping by resizable cells, cards and drawer scrollports.
 if(bubble.showPopover){bubble.setAttribute('popover','manual');bubble.showPopover()}
 mark.setAttribute('aria-describedby',bubble.id);const r=mark.getBoundingClientRect(),b=bubble.getBoundingClientRect();bubble.style.left=Math.max(12,Math.min(innerWidth-b.width-12,r.left))+'px';bubble.style.top=Math.max(12,r.bottom+b.height+10>innerHeight?r.top-b.height-8:r.bottom+8)+'px';
}
document.addEventListener('pointerover',e=>{const mark=e.target.closest?.('.qm');if(mark)show(mark);else if(owner&&!owner.contains(document.activeElement))close()});
document.addEventListener('focusin',e=>{const mark=e.target.closest?.('.qm');if(mark)show(mark);else close()});
document.addEventListener('click',e=>{const mark=e.target.closest?.('.qm');if(mark){e.preventDefault();e.stopImmediatePropagation();show(mark)}else close()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')close();if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('.qm')){e.preventDefault();e.stopImmediatePropagation();show(e.target)}},true);
document.addEventListener('scroll',close,true);window.addEventListener('resize',close);
})();
