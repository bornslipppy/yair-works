(function(){
'use strict';
function init(){
 const api=window.SpendLimitLogsUI,original=document.getElementById('ovp'),toolbar=document.querySelector('.bal-log-toolbar');
 if(!api||!original||!toolbar||document.getElementById('spend-log-filter-trigger'))return;
 const E=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node};
 const empty=()=>({action:[],target:[],scope:[],actor:[]}),copy=value=>JSON.parse(JSON.stringify(value));
 const types=[['action','Activity types'],['target','Rule or setting'],['scope','Scope'],['actor','Changed by']];
 let committed=empty(),draft=empty(),current='action';
 const trigger=document.getElementById('ovf-open').cloneNode(true);trigger.id='spend-log-filter-trigger';trigger.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));trigger.removeAttribute('aria-controls');trigger.querySelector('.hfb-text').textContent='Filters';trigger.setAttribute('aria-expanded','false');toolbar.append(trigger);
 const clear=E('button','Clear','ovreset');clear.type='button';clear.id='spend-log-filter-clear';clear.hidden=true;toolbar.append(clear);
 const panel=original.cloneNode(true);panel.id='spend-log-filter-panel';panel.classList.add('platform-access-filter-popup','bal-log-filter-popup');panel.removeAttribute('data-open');panel.inert=true;panel.setAttribute('aria-label','Filter spend limit activity');
 panel.querySelectorAll('[id]').forEach(node=>node.id=node.id.replace(/^ovp/,'lf'));panel.querySelectorAll('[for]').forEach(node=>node.htmlFor=node.htmlFor.replace(/^ovp/,'lf'));panel.querySelectorAll('[aria-describedby]').forEach(node=>node.setAttribute('aria-describedby',node.getAttribute('aria-describedby').replace(/^ovp/,'lf')));
 panel.querySelector('.ovscope-header strong').textContent='Filter activity';panel.querySelector('.platform-copy-help [role=tooltip]').textContent='Match every selected category. Within a category, include any selected value.';document.body.append(panel);trigger.setAttribute('aria-controls',panel.id);
 const q=id=>panel.querySelector('#lf-'+id),list=q('list'),search=q('search'),all=q('all'),apply=q('apply');
 const applied=E('section',undefined,'ovscope bal-log-filter-scope');applied.hidden=true;toolbar.after(applied);
 const options=()=>api.options()[current]||[],visible=()=>options().filter(value=>value.name.toLowerCase().includes(search.value.toLowerCase()));
 const active=value=>types.filter(([key])=>value[key].length);
 function footer(){apply.disabled=JSON.stringify(draft)===JSON.stringify(committed);panel.querySelector('.accm-f button:first-child').disabled=!active(draft).length}
 function render(){
  q('typelist').replaceChildren();types.forEach(([key,label])=>{const button=E('button',undefined,'accp-type');button.type='button';button.setAttribute('aria-pressed',String(key===current));button.append(E('span',label),E('span',draft[key].length||'','accp-type-n'));button.onclick=()=>{current=key;search.value='';render()};q('typelist').append(button)});
  const label=types.find(type=>type[0]===current)[1];panel.querySelector('.ovscope-itemtitle').textContent=label+' · include any';q('ctrl').hidden=false;search.placeholder='Search '+label.toLowerCase();list.replaceChildren();
  const items=visible();items.forEach(item=>{const row=E('label',undefined,'accp-item'),box=E('input');box.type='checkbox';box.checked=draft[current].includes(item.id);box.onchange=()=>{draft[current]=box.checked?[...draft[current],item.id]:draft[current].filter(id=>id!==item.id);render()};row.append(box,original.querySelector('#ovp-all').nextElementSibling.cloneNode(true),E('span',item.name));list.append(row)});
  if(!items.length)list.append(E('p','No matches.','accp-empty'));
  const count=items.filter(item=>draft[current].includes(item.id)).length;all.checked=items.length>0&&count===items.length;all.indeterminate=count>0&&count<items.length;all.disabled=!items.length;q('alltext').textContent='Select all ('+items.length+')';footer();
 }
 function publish(){
  api.setFilters(copy(committed));const filters=active(committed);trigger.querySelector('.hfb-text').textContent=filters.length?'Filters · '+filters.length:'Filters';trigger.toggleAttribute('data-on',!!filters.length);clear.hidden=!filters.length;applied.hidden=!filters.length;applied.replaceChildren();
  const groups=E('div',undefined,'ovscope-groups');filters.forEach(([key,label],index)=>{const row=E('div',undefined,'ovscope-rule'),values=E('div',undefined,'ovscope-values');row.append(E('span',index?'And':'Where','ovscope-connector'),E('span',label,'ovscope-category'),E('span','is any of','ovscope-operator'));
   api.options()[key].filter(value=>committed[key].includes(value.id)).forEach(item=>{const chip=E('span',undefined,'ovscope-chip'),remove=E('button','×');remove.type='button';remove.setAttribute('aria-label','Remove '+item.name+' filter');remove.onclick=()=>{committed[key]=committed[key].filter(id=>id!==item.id);publish()};chip.append(E('span',item.name),remove);values.append(chip)});row.append(values);groups.append(row)});applied.append(groups);
 }
 function close(){panel.removeAttribute('data-open');panel.inert=true;trigger.setAttribute('aria-expanded','false');if(panel.contains(document.activeElement))trigger.focus()}
 function position(){if(!panel.hasAttribute('data-open'))return;const rect=trigger.getBoundingClientRect();panel.style.left=Math.max(8,Math.min(rect.left,innerWidth-panel.offsetWidth-8))+'px';panel.style.top=Math.max(8,Math.min(rect.bottom+8,innerHeight-panel.offsetHeight-8))+'px'}
 trigger.onclick=event=>{event.stopPropagation();if(panel.hasAttribute('data-open'))return close();draft=copy(committed);current='action';search.value='';render();panel.inert=false;panel.setAttribute('data-open','');trigger.setAttribute('aria-expanded','true');position();search.focus()};
 search.oninput=render;all.onchange=()=>{const ids=visible().map(value=>value.id);draft[current]=all.checked?[...new Set([...draft[current],...ids])]:draft[current].filter(id=>!ids.includes(id));render()};apply.onclick=()=>{committed=copy(draft);close();publish()};q('cancel').onclick=close;panel.querySelector('.accm-f button:first-child').onclick=()=>{draft=empty();render()};
 clear.onclick=()=>{committed=empty();close();publish()};
 document.addEventListener('spend-log-close-filters',close);document.addEventListener('click',event=>{if(!event.composedPath().includes(panel)&&!trigger.contains(event.target))close()});document.addEventListener('keydown',event=>{if(!panel.hasAttribute('data-open'))return;if(event.key==='Escape'){event.preventDefault();close()}if(event.key==='Tab'){const items=[...panel.querySelectorAll('button:not(:disabled),input:not(:disabled)')].filter(node=>node.getClientRects().length),first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});window.addEventListener('resize',position);document.addEventListener('scroll',event=>{if(!panel.contains(event.target))close()},true);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(init,80)):setTimeout(init,80);
})();
