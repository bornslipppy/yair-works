(function(){
'use strict';
function init(){
 const P=window.PlatformUI,E=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
 document.getElementById('acc-save')?.remove();
 let toast=null,timer;
 P.accessToast=function(message,undo){
  clearTimeout(timer);
  toast?.remove();toast=E('div',undefined,'model-change-toast');toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');
  const icon=document.querySelector('.accsum-i svg')?.cloneNode(true);if(icon){icon.classList.add('model-toast-success');icon.setAttribute('aria-hidden','true');icon.querySelectorAll('path').forEach(path=>icon.append(path));toast.append(icon)}
  toast.append(E('span',message,'model-toast-message'));
  const by=document.getElementById('acc-by');if(by)by.textContent='Last changed by you, just now';
  if(undo){const button=E('button','Undo','model-toast-undo');button.type='button';button.onclick=()=>{undo();P.accessToast('Changes undone')};toast.append(button)}
  const close=E('button',undefined,'model-toast-dismiss');close.type='button';close.setAttribute('aria-label','Dismiss notification');const x=document.querySelector('#accm-close svg')?.cloneNode(true);if(x)close.append(x);else close.textContent='×';close.onclick=()=>{clearTimeout(timer);toast?.remove()};toast.append(close);document.body.append(toast);
  const current=toast,pause=()=>{if(current===toast)clearTimeout(timer)},resume=()=>{if(current!==toast||!current.isConnected)return;pause();if(!current.matches(':hover')&&!current.contains(document.activeElement))timer=setTimeout(()=>current.remove(),5000)};
  current.addEventListener('mouseenter',pause);current.addEventListener('mouseleave',resume);current.addEventListener('focusin',pause);current.addEventListener('focusout',()=>setTimeout(resume,0));resume();
 };
 // Capture only this action's models, rather than resetting unrelated settings.
 P.captureAccessUndo=function(ids){const before=ids.map(id=>({id,on:window.__accEnabled[id],rule:JSON.parse(JSON.stringify(window.__accRestrict[id]||null))}));return ()=>{before.forEach(item=>{window.__accEnabled[item.id]=item.on;window.__accRestrict[item.id]=item.rule;const row=[...document.querySelectorAll('.accrow')].find(r=>r.dataset.model===item.id);if(row){row.toggleAttribute('data-off',!item.on);const sw=row.querySelector('.accsw');sw.toggleAttribute('data-on',!!item.on);sw.setAttribute('aria-checked',String(!!item.on))}});P.refreshAccessRules();window.__accRail?.();window.__syncAccessSplit?.()}};
 P.confirmAccessBulk=function(action,apply){
  const ids=P.selectedAccessModels().slice();if(!ids.length)return;
  const configured=ids.filter(id=>window.__accRestrict[id]&&Object.values(window.__accRestrict[id]).some(side=>Object.values(side).some(values=>values.length))).length;
  const filtered=!!(window.__modelAccessFilters?.length||document.getElementById('acctb-q')?.value||document.querySelector('#platform-access-status button[data-on]')?.dataset.v!=='all');
  const d=E('dialog',undefined,'platform-confirm model-bulk-confirm');d.setAttribute('aria-labelledby','model-bulk-confirm-title');const title=E('h2','Apply changes to '+ids.length+(ids.length===1?' model?':' models?'));title.id='model-bulk-confirm-title';
  d.append(title,E('p',(filtered?'You selected these models from filtered results. ':'')+action),E('p',configured?configured+' selected models already have custom access rules. These changes may override part of their existing configuration.':'The changes apply to every selected model, not just the currently displayed provider.'));
  const details=E('details'),summary=E('summary','View selected models ('+ids.length+')');details.append(summary,E('p',ids.join(', ')));d.append(details);const foot=E('footer',undefined,'platform-actions'),cancel=E('button','Cancel','platform-button'),confirm=E('button','Apply changes','platform-button platform-primary');cancel.type=confirm.type='button';foot.append(cancel,confirm);d.append(foot);const opener=document.activeElement;const close=()=>{d.close();d.remove();if(opener?.isConnected)opener.focus()};cancel.onclick=close;d.addEventListener('cancel',e=>{e.preventDefault();close()});confirm.onclick=()=>{close();apply()};document.body.append(d);d.showModal();cancel.focus();
 };
 const applyRules=P.applyBulkAccess;P.applyBulkAccess=changes=>{const draft=JSON.parse(JSON.stringify(changes));P.confirmAccessBulk('Selected audiences will be added to Include or Exclude. If an audience is in the opposite rule, it will be moved. Other audiences are kept, and disabled models remain off.',()=>{const ids=P.selectedAccessModels(),undo=P.captureAccessUndo(ids);applyRules(draft);P.accessToast('Access rules updated for '+ids.length+' models',undo)})};
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(init,100)):setTimeout(init,100);
})();
