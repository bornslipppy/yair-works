(function(){
'use strict';
const $=s=>document.querySelector(s),E=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node};
function init(){
 const P=window.PlatformUI;
 function shortenProviderSubtitles(){document.querySelectorAll('.accprov-s').forEach(label=>{const full=label.textContent.trim(),billing=full.split('·')[0].trim();if(['Wonderful','BYOK'].includes(billing)&&full!==billing){label.dataset.fullDescription=full;label.textContent=billing}})}
 shortenProviderSubtitles();new MutationObserver(shortenProviderSubtitles).observe($('#acc-view-split'),{childList:true,subtree:true});
 // Retire the Insights route and its entry points, not shared user profiles.
 document.querySelectorAll('[data-nav="ins"],label[for="nv-ins"],#nv-ins,[data-nav="ix"]').forEach(node=>node.remove());
 document.querySelectorAll('#accp .accp-step').forEach(node=>{if(/Item type/i.test(node.textContent))node.remove()});
 $('#ap-d')?.remove();$('#ap-b')?.remove();
 // Peer popups are mutually exclusive; their existing close handlers retain
 // responsibility for focus and unsaved filter selections.
 document.addEventListener('click',event=>{
  const timeframe=event.target.closest('#pgcus-trigger,#gncus-trigger');
  const filter=event.target.closest('#ovf-open,#usage-filter-trigger,#usage-status-trigger');
  if(timeframe){
   const usage=$('#usage-filter-panel'),status=$('#usage-status-panel');
   if((usage&&!usage.hidden)||(status&&!status.hidden)||$('#ovp')?.hasAttribute('data-open'))document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
   document.querySelectorAll('#pgcus-dd,#gncus-dd').forEach(node=>{if(!node.contains(timeframe))node.removeAttribute('data-open')});
  }
  if(filter)document.querySelectorAll('#pgcus-dd,#gncus-dd').forEach(node=>node.removeAttribute('data-open'));
 },true);
 const providers=new Map(); // Credentials remain in memory, never localStorage.
 function editProvider(row){
  const oldName=row?.querySelector('.accprov-t')?.textContent||'';
  const pane=row&&document.getElementById(row.dataset.prov);
  const originals=pane?[...pane.querySelectorAll('.accrow')].map(model=>model.dataset.model):[];
  const prior=row&&providers.get(row.dataset.prov);
  const rowParent=row?.parentElement,paneParent=pane?.parentElement,rowNext=row?.nextSibling,paneNext=pane?.nextSibling;
  const billing=row?(row.dataset.billing||(/BYOK/.test(row.querySelector('.accprov-s')?.textContent)?'BYOK':'Wonderful')):'BYOK';
  const logo=row?.querySelector('.accprov-b > span:first-child')?.cloneNode(true);
  const panel=P.panel(row?oldName:'Add provider',row?billing:'');
  if(logo){logo.classList.add('platform-editor-logo');panel.dialog.querySelector('header').prepend(logo)}
  panel.dialog.classList.add('platform-provider-editor');panel.footer.firstElementChild.textContent='Cancel';
  const nameLabel=E('label','Display name'),name=E('input');name.id='provider-display-name';name.value=oldName;nameLabel.htmlFor=name.id;panel.body.append(nameLabel,name);
  panel.body.append(E('h3','Model IDs'));const list=E('div',undefined,'provider-model-list');panel.body.append(list);
  const entries=[];
  function addEntry(value){
   const box=E('div',undefined,'provider-model-entry'),idLabel=E('label','Model ID'),id=E('input'),keyLabel=E('label','Key'),key=E('input'),remove=E('button','Remove','platform-button');
   id.value=value?.id||'';key.type='password';key.autocomplete='new-password';key.placeholder=value?'Existing key retained':'Enter model key';id.setAttribute('aria-label','Model ID');key.setAttribute('aria-label','Key for model');
   idLabel.append(id);keyLabel.append(key);remove.type='button';box.append(idLabel,keyLabel,remove);list.append(box);
   const entry={box,id,key,previous:value};entries.push(entry);remove.onclick=()=>{entries.splice(entries.indexOf(entry),1);box.remove()};
  }
  (prior?.models||originals.map(id=>({id,configured:true}))).forEach(addEntry);if(!entries.length)addEntry();
  const add=E('button','Add model','platform-button');add.type='button';add.onclick=()=>addEntry();panel.body.append(add);
  const save=E('button',row?'Save changes':'Add provider','platform-button platform-primary');panel.footer.append(save);
  save.onclick=()=>{
   P.clearErrors(panel.body);
   if(!name.value.trim()){P.fieldError(name,'Enter a display name.');return}
   if([...document.querySelectorAll('.accprov')].some(other=>other!==row&&other.querySelector('.accprov-t').textContent.toLowerCase()===name.value.trim().toLowerCase())){P.fieldError(name,'A provider already uses this display name.');return}
   if(!entries.length){P.fieldError(add,'Add at least one model.');return}
   const ids=new Set(),keys=new Set(),models=[];
   for(const entry of entries){
    const id=entry.id.value.trim(),key=entry.key.value.trim()||entry.previous?.key;
    if(!id||ids.has(id)){P.fieldError(entry.id,'Enter a unique model ID.');return}
    if([...document.querySelectorAll('.accrow')].some(model=>model.closest('.accpane')!==pane&&model.dataset.model===id)){P.fieldError(entry.id,'This model ID already belongs to another provider.');return}
    if(!key&&!entry.previous?.configured){P.fieldError(entry.key,'Enter a key for this model.');return}
    if(key&&keys.has(key)){P.fieldError(entry.key,'Use a different key for each model.');return}
    ids.add(id);if(key)keys.add(key);models.push({id,key,configured:!!entry.previous?.configured});
   }
   const availability={...window.__accEnabled},rules={...window.__accRestrict};
   const made=P.addProvider(name.value.trim(),models.map(model=>model.id));if(!made)return;
   made.row.dataset.billing=billing;made.row.querySelector('.accprov-s').textContent=billing;
   if(logo){const railLogo=logo.cloneNode(true);railLogo.classList.remove('platform-editor-logo');made.row.querySelector('.accprov-b > span:first-child').replaceWith(railLogo)}
   made.pane.querySelectorAll('.accrow').forEach(model=>{
    const id=model.dataset.model;if(originals.includes(id)){
     const on=availability[id]!==false;window.__accEnabled[id]=on;window.__accRestrict[id]=rules[id];model.toggleAttribute('data-off',!on);model.querySelector('.accsw').toggleAttribute('data-on',on);model.querySelector('.accsw').setAttribute('aria-checked',String(on));
    }
   });
   originals.filter(id=>!models.some(model=>model.id===id)).forEach(id=>{window.__accEnabled[id]=false;delete window.__accRestrict[id]});
   if(row){providers.delete(row.dataset.prov);row.remove();pane.remove()}
   providers.set(made.pane.id,{models});panel.close();
   made.row.querySelector('.accprov-b').click();window.__accRail?.();P.refreshAccessRules?.();P.enhanceModelAccessSplit?.();addProviderEditors();syncModelLabels();
   P.accessToast?.(row?'Provider changes saved':'Provider added',()=>{
    made.row.remove();made.pane.remove();providers.delete(made.pane.id);
    [...new Set([...originals,...models.map(m=>m.id)])].forEach(id=>{if(Object.hasOwn(availability,id))window.__accEnabled[id]=availability[id];else delete window.__accEnabled[id];if(Object.hasOwn(rules,id))window.__accRestrict[id]=rules[id];else delete window.__accRestrict[id]});
    if(row){rowParent.insertBefore(row,rowNext?.isConnected?rowNext:null);paneParent.insertBefore(pane,paneNext?.isConnected?paneNext:null);if(prior)providers.set(row.dataset.prov,prior);row.querySelector('.accprov-b').click()}
    P.refreshAccessRules?.();P.enhanceModelAccessSplit?.();addProviderEditors();syncModelLabels();window.__accRail?.();
   });
  };
  name.focus();
 }
 const providerMenu=E('div',undefined,'platform-provider-menu');providerMenu.id='provider-action-menu';providerMenu.setAttribute('role','menu');providerMenu.hidden=true;document.body.append(providerMenu);let menuTrigger=null;
 function closeProviderMenu(focus=false){providerMenu.hidden=true;menuTrigger?.setAttribute('aria-expanded','false');if(focus)menuTrigger?.focus()}
 function addProviderEditors(){document.querySelectorAll('.accprov').forEach(row=>{if(row.querySelector('.platform-provider-menu-trigger'))return;row.querySelector('.platform-provider-edit')?.remove();const trigger=E('button','⋮','platform-provider-menu-trigger');trigger.type='button';trigger.setAttribute('aria-label','Actions for '+row.querySelector('.accprov-t').textContent);trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-expanded','false');trigger.onclick=e=>{e.stopPropagation();const already=menuTrigger===trigger&&!providerMenu.hidden;closeProviderMenu();if(already)return;menuTrigger=trigger;providerMenu.replaceChildren();const edit=E('button','Edit');edit.type='button';edit.setAttribute('role','menuitem');edit.onclick=()=>{closeProviderMenu();editProvider(row)};providerMenu.append(edit);providerMenu.hidden=false;trigger.setAttribute('aria-expanded','true');const r=trigger.getBoundingClientRect();providerMenu.style.left=Math.min(innerWidth-170,r.right-160)+'px';providerMenu.style.top=Math.min(innerHeight-60,r.bottom+4)+'px';edit.focus()};row.append(trigger)})}
 addProviderEditors();
 document.addEventListener('click',e=>{if(!providerMenu.contains(e.target)&&!e.target.closest('.platform-provider-menu-trigger'))closeProviderMenu()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!providerMenu.hidden){e.preventDefault();closeProviderMenu(true)}});window.addEventListener('resize',()=>closeProviderMenu());document.addEventListener('scroll',()=>closeProviderMenu(),true);
 function syncModelLabels(){document.querySelectorAll('.accrow .accsw,.acctr .accsw').forEach(sw=>{let wrap=sw.parentElement;if(!wrap.classList.contains('platform-model-toggle')){wrap=E('span',undefined,'platform-model-toggle');sw.before(wrap);wrap.append(E('span',undefined,'platform-model-state'),sw)}const on=sw.getAttribute('aria-checked')==='true',label=wrap.querySelector('.platform-model-state'),text=on?'On':'Off';if(label.textContent!==text)label.textContent=text;sw.setAttribute('aria-label',(on?'Disable ':'Enable ')+sw.closest('[data-model]').dataset.model)})}
 function syncRegistryStatus(){document.querySelectorAll('.registry-provider .acreg').forEach(row=>{const status=row.querySelector('.platform-registry-status'),on=window.__accEnabled[row.dataset.model]!==false;if(!status)return;const text=on?'On':'Off';if(status.textContent!==text)status.textContent=text;status.classList.toggle('platform-registry-on',on);status.classList.toggle('platform-registry-off',!on)})}
 syncModelLabels();let labelsQueued=false;new MutationObserver(()=>{if(!labelsQueued){labelsQueued=true;requestAnimationFrame(()=>{labelsQueued=false;syncModelLabels();syncRegistryStatus()})}}).observe($('#acc-view-split'),{subtree:true,childList:true,attributes:true,attributeFilter:['aria-checked']});
 // Capture before the legacy provider drawer/connection handlers.
 document.addEventListener('click',event=>{
  if(event.target.closest('#acc-addprov')){event.preventDefault();event.stopImmediatePropagation();editProvider(null);return}
  const action=event.target.closest('.accdoti');
  if(action&&/^Edit/.test(action.textContent.trim())){event.preventDefault();event.stopImmediatePropagation();editProvider(action.closest('.accprov'))}
 },true);
 const priceStore='wonderful-registry-price-overrides-v1';let overrides={};try{overrides=JSON.parse(localStorage.getItem(priceStore))||{}}catch(_){}
 const registryHead=$('.view-mxr .acregg-h'),actionHead=E('span','Actions','platform-registry-actions');actionHead.dataset.platformColumnId='actions';actionHead.dataset.platformPinned='end';registryHead.firstElementChild.dataset.platformPinned='start';registryHead.append(actionHead);
 document.querySelectorAll('.registry-provider .acreg').forEach(row=>{
  const headers=[...document.querySelector('.view-mxr .acregg-h').children];
  const cellFor=(id,fallback)=>row.children[headers.findIndex(cell=>cell.dataset.platformColumnId===id)>=0?headers.findIndex(cell=>cell.dataset.platformColumnId===id):fallback];
  const modelCell=cellFor('model',0),model=row.dataset.model||modelCell.querySelector('.accname')?.textContent.trim()||modelCell.textContent.trim();
  row.dataset.model=model;
  cellFor('status',1).classList.add('platform-registry-status');
  const priceCells=[cellFor('input',7),cellFor('cached',8),cellFor('output',9)];
  priceCells.forEach((cell,i)=>cell.classList.add(['platform-registry-input','platform-registry-cached','platform-registry-output'][i]));
  const base=priceCells.map(cell=>Number(cell.textContent.replace(/[^0-9.]/g,''))||0);
  function paint(values){priceCells.forEach((cell,index)=>{cell.textContent='$'+values[index].toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:4});cell.title=overrides[model]?'Custom price override · per 1M tokens':'Provider price · per 1M tokens'})}
  if(overrides[model])paint(overrides[model]);
  modelCell.classList.add('platform-registry-name');const actionCell=E('span',undefined,'platform-registry-actions');row.append(actionCell);
  const edit=E('button','Edit','platform-button platform-registry-edit');edit.type='button';edit.setAttribute('aria-label','Edit prices for '+model);actionCell.append(edit);
  edit.onclick=event=>{
   event.stopPropagation();const panel=P.panel('Edit model prices',model);panel.dialog.classList.add('platform-price-editor');panel.footer.firstElementChild.textContent='Cancel';panel.body.append(E('p','Prices in USD per 1 million tokens.','platform-muted'));
   const inputs=['Input','Cached input','Output'].map((label,index)=>{const wrap=E('label',undefined,'platform-price-field'),caption=E('span',label),field=E('span',undefined,'platform-price-input'),prefix=E('span','$'),input=E('input');input.setAttribute('aria-label',label+' price');input.type='number';input.min='0';input.step='0.0001';input.value=(overrides[model]||base)[index];field.append(prefix,input);wrap.append(caption,field);panel.body.append(wrap);return input});
   const reset=E('button','Restore provider prices','platform-button'),save=E('button','Save prices','platform-button platform-primary');panel.footer.append(reset,save);
   const persist=()=>{try{localStorage.setItem(priceStore,JSON.stringify(overrides))}catch(_){}P.inheritKeyRates?.()};
   function undoPrice(){const previous=overrides[model]?.slice();return ()=>{if(previous)overrides[model]=previous;else delete overrides[model];paint(previous||base);persist()}}
   reset.onclick=()=>{const undo=undoPrice();delete overrides[model];paint(base);persist();panel.close();P.accessToast?.('Provider prices restored',undo)};
   save.onclick=()=>{P.clearErrors(panel.body);const values=inputs.map(input=>Number(input.value));const bad=inputs.findIndex((input,i)=>!input.value||!Number.isFinite(values[i])||values[i]<0);if(bad>=0){P.fieldError(inputs[bad],'Enter a price of zero or more.');return}const undo=undoPrice();overrides[model]=values;paint(values);persist();panel.close();P.accessToast?.('Model prices saved',undo)};
   inputs[0].focus();
  };
 });
 // The new Actions column must participate in the initial grid measurement.
 // Otherwise the legacy eleven-column template allocates it an oversized track.
 const registryTemplate='210px 64px 116px 88px 160px 86px 190px 90px 90px 90px 180px 80px';
 document.querySelectorAll('.view-mxr .acregg-h,.view-mxr .acreg').forEach(row=>{row.style.gridTemplateColumns=registryTemplate});
 syncRegistryStatus();
 initBulkPicker(P);
}
function initBulkPicker(P){
 const popup=E('section',undefined,'platform-bulk-access');popup.id='bulk-access-picker';popup.hidden=true;popup.tabIndex=-1;popup.setAttribute('role','dialog');popup.setAttribute('aria-label','Bulk include and exclude');document.body.append(popup);
 let opener=null,draft=null,side='include',type='team',query='';const scopes=P.accessScopes,labels={team:'Groups',person:'Users',agent:'Agents',key:'Keys'};
 const heading=E('header'),title=E('strong','Include / exclude'),count=E('span',undefined,'platform-muted');heading.append(title,count);
 const modes=E('div',undefined,'platform-bulk-modes');modes.setAttribute('role','tablist');const modeButtons={};['include','exclude'].forEach(value=>{const button=E('button',value==='include'?'Include':'Exclude');button.type='button';button.setAttribute('role','tab');button.onclick=()=>{side=value;render()};modeButtons[value]=button;modes.append(button)});
 const body=E('div',undefined,'accp-body'),categories=E('div',undefined,'accp-types'),items=E('div',undefined,'accp-items'),search=E('input'),allLabel=E('label',undefined,'accp-allrow'),all=E('input'),allText=E('span'),list=E('div',undefined,'accp-list');search.type='search';search.placeholder='Search';search.setAttribute('aria-label','Search audiences');all.type='checkbox';
 function mark(){const node=E('span',undefined,'accp-cb');node.innerHTML='<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3"><path d="M4 12l5 5L20 6"/></svg>';return node}
 allLabel.append(all,mark(),allText);items.append(search,allLabel,list);body.append(categories,items);
 const hint=E('p','Adds selections to every selected model. Other rules are kept; disabled models stay off.','platform-bulk-hint');
 const footer=E('footer'),cancel=E('button','Cancel','platform-button'),apply=E('button','Apply','platform-button platform-primary');cancel.type=apply.type='button';footer.append(cancel,apply);popup.append(heading,modes,body,hint,footer);
 function visible(){return scopes.find(scope=>scope.k===type).n.filter(value=>value.toLowerCase().includes(query.toLowerCase()))}
 function change(value,checked){const arr=draft[side][type],opposite=draft[side==='include'?'exclude':'include'][type];if(checked){if(!arr.includes(value))arr.push(value);const i=opposite.indexOf(value);if(i>=0)opposite.splice(i,1)}else{const i=arr.indexOf(value);if(i>=0)arr.splice(i,1)}}
 function render(){
  categories.replaceChildren();scopes.forEach(scope=>{const button=E('button',labels[scope.k],'accp-type');button.type='button';button.setAttribute('aria-pressed',String(type===scope.k));const n=draft[side][scope.k].length;if(n)button.append(E('span',String(n),'accp-type-n'));button.onclick=()=>{type=scope.k;query='';search.value='';render()};categories.append(button)});
  ['include','exclude'].forEach(value=>{modeButtons[value].setAttribute('aria-selected',String(value===side));modeButtons[value].textContent=(value==='include'?'Include':'Exclude')+' · '+Object.values(draft[value]).reduce((n,arr)=>n+arr.length,0)});
  list.replaceChildren();const values=visible(),selected=values.filter(value=>draft[side][type].includes(value)).length;all.checked=values.length>0&&selected===values.length;all.indeterminate=selected>0&&selected<values.length;all.disabled=!values.length;allText.textContent='Select all ('+values.length+')';
  values.forEach(value=>{const label=E('label',undefined,'accp-item'),checkbox=E('input');checkbox.type='checkbox';checkbox.checked=draft[side][type].includes(value);checkbox.onchange=()=>{change(value,checkbox.checked);render()};label.append(checkbox,mark(),E('span',value));list.append(label)});if(!values.length)list.append(E('p','No matching audiences.','platform-empty'));
  const total=['include','exclude'].reduce((n,key)=>n+Object.values(draft[key]).reduce((sum,arr)=>sum+arr.length,0),0);apply.disabled=!total;apply.textContent='Apply to '+P.selectedAccessModels().length+' models';
 }
 function close(){popup.hidden=true;opener?.setAttribute('aria-expanded','false');if(popup.contains(document.activeElement))opener?.focus()}
 function position(){if(popup.hidden)return;const r=opener.getBoundingClientRect();popup.style.left=Math.max(8,Math.min(r.left,innerWidth-popup.offsetWidth-8))+'px';popup.style.top=Math.min(r.bottom+8,Math.max(8,innerHeight-popup.offsetHeight-8))+'px'}
 P.openBulkAccess=button=>{if(!popup.hidden){close();return}opener=button;side='include';type='team';query='';search.value='';draft={include:{},exclude:{}};scopes.forEach(scope=>{draft.include[scope.k]=[];draft.exclude[scope.k]=[]});count.textContent=P.selectedAccessModels().length+' selected models';popup.hidden=false;button.setAttribute('aria-expanded','true');render();position();search.focus()};
 search.oninput=()=>{query=search.value;render()};all.onchange=()=>{visible().forEach(value=>change(value,all.checked));render()};cancel.onclick=close;apply.onclick=()=>{P.applyBulkAccess(draft);close()};
 document.addEventListener('click',event=>{if(!popup.hidden&&!event.composedPath().includes(popup)&&!opener?.contains(event.target))close()});document.addEventListener('keydown',event=>{if(!popup.hidden&&event.key==='Escape'){event.preventDefault();close()}});window.addEventListener('resize',position);document.addEventListener('scroll',event=>{if(!popup.hidden&&!popup.contains(event.target))position()},true);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(init)):setTimeout(init);
})();
