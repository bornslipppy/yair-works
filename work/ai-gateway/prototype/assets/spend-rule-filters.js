(function(){
'use strict';
function init(){
 const api=window.SpendRulesUI,original=document.getElementById('ovp'),toolbar=document.querySelector('.bal-toolbar');if(!api||!original||!toolbar)return;
 const E=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
 const empty=()=>({group:[],user:[],budget:null}),copy=x=>JSON.parse(JSON.stringify(x));let committed=empty(),draft=empty(),current='group';
 const types=[['group','Group'],['user','User'],['budget','Monthly budget']],money=n=>'$'+n.toLocaleString('en-US');
 toolbar.querySelector('.bal-summary-note')?.remove();
 const trigger=document.getElementById('ovf-open').cloneNode(true);trigger.id='rules-filter-trigger';trigger.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));trigger.querySelector('.hfb-text').textContent='Filters';trigger.setAttribute('aria-expanded','false');toolbar.append(trigger);
 const clear=E('button','Clear','ovreset');clear.type='button';clear.hidden=true;toolbar.append(clear);
 const panel=original.cloneNode(true);panel.id='rules-filter-panel';panel.classList.add('platform-access-filter-popup');panel.removeAttribute('data-open');panel.inert=true;panel.setAttribute('aria-label','Filter spend limit rules');
 panel.querySelectorAll('[id]').forEach(n=>n.id=n.id.replace(/^ovp/,'rf'));panel.querySelectorAll('[for]').forEach(n=>n.htmlFor=n.htmlFor.replace(/^ovp/,'rf'));panel.querySelectorAll('[aria-describedby]').forEach(n=>n.setAttribute('aria-describedby',n.getAttribute('aria-describedby').replace(/^ovp/,'rf')));
 panel.querySelector('.ovscope-header strong').textContent='Filter rules';panel.querySelector('.platform-copy-help [role=tooltip]').textContent='Match every category. Within Group or User, match any selection. Monthly budget is the per-user limit multiplied by users currently enforced by the rule.';document.body.append(panel);trigger.setAttribute('aria-controls',panel.id);
 const q=id=>panel.querySelector('#rf-'+id),list=q('list'),search=q('search'),all=q('all'),apply=q('apply');
 const scope=E('section',undefined,'ovscope rules-filter-scope');scope.hidden=true;toolbar.after(scope);
 const trash=()=>{const holder=E('span');holder.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6"/></svg>';return holder.firstChild};
 const options=()=>api.options()[current]||[],visible=()=>options().filter(v=>v.name.toLowerCase().includes(search.value.toLowerCase()));
 const active=x=>types.filter(([key])=>key==='budget'?!!x.budget:x[key].length);
 function footer(){apply.disabled=JSON.stringify(draft)===JSON.stringify(committed);panel.querySelector('.accm-f button:first-child').disabled=!active(draft).length}
 function render(){
  q('typelist').replaceChildren();types.forEach(([key,name])=>{const button=E('button',undefined,'accp-type');button.type='button';button.setAttribute('aria-pressed',String(key===current));button.append(E('span',name),E('span',key==='budget'?(draft.budget?'1':''):draft[key].length||'','accp-type-n'));button.onclick=()=>{current=key;search.value='';render()};q('typelist').append(button)});
  panel.querySelector('.ovscope-itemtitle').textContent=types.find(t=>t[0]===current)[1]+(current==='budget'?'':' · include any');q('ctrl').hidden=current==='budget';list.replaceChildren();
  if(current==='budget'){
   const max=Math.ceil(api.options().maxBudget/1000)*1000,bounds=draft.budget||[0,max];
   list.append(E('p','Per-user limit × users currently enforced by the rule. Unlimited rules are excluded when a range is applied.','rules-budget-note'));
   ['Minimum','Maximum'].forEach((label,index)=>{const row=E('label',undefined,'rules-budget-control'),caption=E('span',label),value=E('output',money(bounds[index])),slider=E('input');slider.type='range';slider.min='0';slider.max=String(max);slider.step='100';slider.value=bounds[index];slider.setAttribute('aria-label',label+' monthly budget');slider.setAttribute('aria-valuetext',money(bounds[index]));row.append(caption,value,slider);list.append(row);slider.oninput=()=>{let range=draft.budget?draft.budget.slice():bounds.slice();range[index]=Number(slider.value);if(index===0)range[0]=Math.min(range[0],range[1]);else range[1]=Math.max(range[1],range[0]);draft.budget=range;slider.value=range[index];value.textContent=money(range[index]);slider.setAttribute('aria-valuetext',value.textContent);footer()}});
   const reset=E('button','Any budget','ovreset');reset.type='button';reset.onclick=()=>{draft.budget=null;render()};list.append(reset);
  }else{
   search.placeholder='Search '+types.find(t=>t[0]===current)[1].toLowerCase();const items=visible();items.forEach(item=>{const label=E('label',undefined,'accp-item'),box=E('input');box.type='checkbox';box.checked=draft[current].includes(item.id);box.onchange=()=>{draft[current]=box.checked?[...draft[current],item.id]:draft[current].filter(id=>id!==item.id);render()};label.append(box,original.querySelector('#ovp-all').nextElementSibling.cloneNode(true),E('span',item.name));list.append(label)});
   if(!items.length)list.append(E('p','No matches.','accp-empty'));const count=items.filter(v=>draft[current].includes(v.id)).length;all.checked=items.length>0&&count===items.length;all.indeterminate=count>0&&count<items.length;all.disabled=!items.length;q('alltext').textContent='Select all ('+items.length+')';
  }
  footer();
 }
 function publish(){
  api.setFilters(copy(committed));const filters=active(committed);trigger.querySelector('.hfb-text').textContent=filters.length?'Filters · '+filters.length:'Filters';trigger.toggleAttribute('data-on',!!filters.length);clear.hidden=!filters.length;scope.hidden=!filters.length;scope.toggleAttribute('data-filtered',!!filters.length);scope.replaceChildren();
  const groups=E('div',undefined,'ovscope-groups');filters.forEach(([key,label],index)=>{const row=E('div',undefined,'ovscope-rule'),values=E('div',undefined,'ovscope-values');row.append(E('span',index?'And':'Where','ovscope-connector'),E('span',label,'ovscope-category'),E('span',key==='budget'?'is between':'is any of','ovscope-operator'));
   const entries=key==='budget'?[{id:'range',name:money(committed.budget[0])+'–'+money(committed.budget[1])}]:api.options()[key].filter(v=>committed[key].includes(v.id));entries.forEach(item=>{const chip=E('span',undefined,'ovscope-chip'),remove=E('button');remove.type='button';remove.setAttribute('aria-label','Remove '+item.name+' filter');remove.append(trash());remove.onclick=()=>{if(key==='budget')committed.budget=null;else committed[key]=committed[key].filter(id=>id!==item.id);publish()};chip.append(E('span',item.name),remove);values.append(chip)});const removeRule=E('button',undefined,'ovscope-remove-rule');removeRule.type='button';removeRule.setAttribute('aria-label','Remove '+label.toLowerCase()+' filter');removeRule.append(trash());removeRule.onclick=()=>{if(key==='budget')committed.budget=null;else committed[key]=[];publish()};row.append(values,removeRule);groups.append(row)});scope.append(groups);
 }
 function close(){panel.removeAttribute('data-open');panel.inert=true;trigger.setAttribute('aria-expanded','false');if(panel.contains(document.activeElement))trigger.focus()}
 function position(){if(!panel.hasAttribute('data-open'))return;const r=trigger.getBoundingClientRect();panel.style.left=Math.max(8,Math.min(r.left,innerWidth-panel.offsetWidth-8))+'px';panel.style.top=Math.max(8,Math.min(r.bottom+8,innerHeight-panel.offsetHeight-8))+'px'}
 trigger.onclick=e=>{e.stopPropagation();if(panel.hasAttribute('data-open'))return close();draft=copy(committed);current='group';search.value='';render();panel.inert=false;panel.setAttribute('data-open','');trigger.setAttribute('aria-expanded','true');position();search.focus()};
 search.oninput=render;all.onchange=()=>{const ids=visible().map(v=>v.id);draft[current]=all.checked?[...new Set([...draft[current],...ids])]:draft[current].filter(id=>!ids.includes(id));render()};apply.onclick=()=>{committed=copy(draft);close();publish()};q('cancel').onclick=close;panel.querySelector('.accm-f button:first-child').onclick=()=>{draft=empty();render()};
 window.clearSpendRuleFilters=clear.onclick=()=>{committed=empty();close();publish()};
 document.addEventListener('click',e=>{if(!e.composedPath().includes(panel)&&!trigger.contains(e.target))close()});document.addEventListener('keydown',e=>{if(!panel.hasAttribute('data-open'))return;if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const items=[...panel.querySelectorAll('button:not(:disabled),input:not(:disabled)')].filter(n=>n.getClientRects().length),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});window.addEventListener('resize',position);document.addEventListener('scroll',e=>{if(!panel.contains(e.target))close()},true);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(init,80)):setTimeout(init,80);
})();
