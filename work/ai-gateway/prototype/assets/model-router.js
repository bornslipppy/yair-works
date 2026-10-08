/* Simplified organisation-only Model Router. */
(()=>{
  'use strict';
  function init(){
    const root=document.getElementById('model-router'),P=window.PlatformUI,R=window.ModelRouterEngine;
    if(!root||!P||!R)return;
    const key='wonderful-model-router-v1';
    const effortMap={
      'Claude Sonnet 5':['default','low','medium','high'],'Claude Opus 5':['default','low','medium','high'],
      'Claude Haiku 4.5':['default'],'Claude Fable 5.1':['default','low','medium'],
      'GPT-6 Astra':['default','low','medium','high'],'GPT-5.6 Sol':['default','low','medium','high'],
      'GPT-5.1':['default','low','medium','high'],'GPT-5.1 mini':['default','low'],
      'Gemini 3 Pro':['default','medium','high'],'Llama 4 Maverick':['default','medium']
    };
    let state=R.initial(),storageWarning='';
    try{const saved=localStorage.getItem(key);if(saved){const parsed=R.decode(saved);if(parsed)state=parsed;else storageWarning='Saved routing settings could not be loaded. Review the defaults before saving.';}}catch{storageWarning='Browser storage is unavailable. Changes cannot be saved.';}
    const $=s=>root.querySelector(s);
    const E=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
    const button=(label,fn,cls='bgb')=>{const b=E('button',label,cls);b.type='button';b.onclick=fn;return b;};
    const available=()=>Object.keys(window.__accEnabled||{}).filter(name=>window.__accEnabled[name]!==false).sort((a,b)=>a.localeCompare(b));
    const effortsFor=name=>effortMap[name]||['default'];
    const effortLabel=value=>value==='default'?'Provider default':value.charAt(0).toUpperCase()+value.slice(1);
    const mark=name=>{
      const n=E('span',undefined,'smr-model'),icon=E('span',undefined,'smr-model-icon');icon.setAttribute('aria-hidden','true');
      if(window.__gmark)icon.innerHTML=window.__gmark('model',name);
      if(!icon.firstElementChild){const source=document.querySelector('.acreg[data-model="'+CSS.escape(name)+'"] .acregm > span[title]');if(source)icon.append(source.cloneNode(true));}
      if(icon.firstElementChild)n.append(icon);n.append(E('span',name||'—'));return n;
    };
    const help=(label,text)=>{const b=button('?',()=>{},'qm');b.setAttribute('aria-label',label);b.append(E('span',text,'qp'));return b;};
    function save(next){try{localStorage.setItem(key,JSON.stringify(next));state=next;storageWarning='';render();document.dispatchEvent(new Event('model-router-change'));return true;}catch{return false;}}

    root.innerHTML='<header class="pghd smr-heading"><h1>Model router</h1></header><p class="smr-storage" role="alert" hidden></p><section class="smr-auto-section" aria-labelledby="smr-auto-title"><div class="smr-section-heading"><h2 id="smr-auto-title">Auto routing</h2><button type="button" class="bgb" id="smr-edit-auto">Edit auto routing</button></div><div id="smr-auto-summary" class="smr-metrics" aria-label="Auto routing summary"></div></section><section class="smr-chains" aria-labelledby="smr-chain-title"><div class="smr-section-heading"><h2 id="smr-chain-title">Failover chains</h2><button type="button" class="bgb bgb-p" id="smr-create-chain">+ Create chain</button></div><div class="smr-search-row"><label class="bgq"><input type="search" id="smr-search" placeholder="Search starting models…" aria-label="Search starting models"></label></div><div class="smr-table-scroll"><table class="platform-data-table smr-table" data-table-key="model-router-chains-v2" data-table-fit="" aria-label="Failover chains"><thead><tr><th scope="col">Starting model</th><th scope="col">Failover 1</th><th scope="col">Failover 2</th><th scope="col">Failover 3</th><th scope="col">Failover 4</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead><tbody id="smr-chain-rows"></tbody></table></div></section>';
    $('.smr-heading').append(help('About Model router','Configure organisation-wide Auto routing and model failover. Auto routing uses the models available to each user in Model access.'));
    $('#smr-chain-title').append(help('About failover chains','Backups are tried in order after a failure. After failover succeeds, the session stays on the backup model. Model access still applies.'));

    function badge(text,tone='neutral'){
      return E('span',text,'smr-badge is-'+tone);
    }
    function metric(label,value,content,tooltip){
      const card=E('article',undefined,'card smr-metric'),labelRow=E('div',undefined,'smr-metric-label-row'),body=E('div',undefined,'smr-metric-value');
      labelRow.append(E('span',label,'smr-metric-label'));if(tooltip)labelRow.append(help('About '+label,tooltip));
      if(content)body.append(content);else body.textContent=value;card.append(labelRow,body);return card;
    }
    function render(){
      const warn=$('.smr-storage');warn.hidden=!storageWarning;warn.textContent=storageWarning;
      const host=$('#smr-auto-summary');host.replaceChildren();
      const status=E('div',undefined,'smr-badge-row');status.append(badge(state.auto.enabled?'On':'Off',state.auto.enabled?'success':'neutral'));if(state.auto.enabled)status.append(badge(state.auto.userChoice==='required'?'Enforced':'Optional',state.auto.userChoice==='required'?'danger':'success'));
      host.append(metric('Auto routing status',null,status));
      if(state.auto.enabled&&state.auto.defaultModel){
        const content=E('div',undefined,'smr-model-chip'),separator=E('span',undefined,'smr-chip-separator');separator.setAttribute('aria-hidden','true');content.append(mark(state.auto.defaultModel),separator,E('span',effortLabel(state.auto.defaultEffort||'default'),'smr-effort-caption'));
        host.append(metric('Default model and effort',null,content,'Used when a route cannot be determined.'));
      }else host.append(metric('Default model and effort',state.auto.enabled?'Not set':'Not applicable',null,'Used when a route cannot be determined.'));
      renderChains();
    }
    function renderChains(){
      const host=$('#smr-chain-rows'),query=$('#smr-search').value.trim().toLowerCase(),enabled=available();host.replaceChildren();
      state.chains.filter(c=>c.startingModel.toLowerCase().includes(query)).forEach(chain=>{
        const tr=E('tr'),models=[chain.startingModel,...chain.backups],unavailable=models.some(name=>!enabled.includes(name));
        const start=E('td');start.append(mark(chain.startingModel));tr.append(start);
        for(let i=0;i<4;i++){const td=E('td');if(chain.backups[i])td.append(mark(chain.backups[i]));else td.append(E('span','—','smr-dash'));tr.append(td);}
        const status=E('td');status.append(E('span',unavailable?'Model unavailable':'Ready','smr-status-badge '+(unavailable?'is-danger':'is-ready')));tr.append(status);
        const actions=E('td'),tools=E('div',undefined,'smr-row-actions');
        const edit=button('Edit',()=>editChain(chain));edit.setAttribute('aria-label','Edit failover for '+chain.startingModel);
        const remove=button('Delete',()=>deleteChain(chain));remove.setAttribute('aria-label','Delete failover for '+chain.startingModel);
        tools.append(edit,remove);actions.append(tools);tr.append(actions);host.append(tr);
      });
      if(!host.children.length){const tr=E('tr'),td=E('td',query?'No starting models match your search.':'No failover chains yet. Create a chain to add backup models.','smr-empty');td.colSpan=7;tr.append(td);host.append(tr);}
      P.enhanceResizableTables?.();
      requestAnimationFrame(()=>requestAnimationFrame(protectUtilityColumns));
      document.fonts?.ready.then(protectUtilityColumns);
    }
    function protectUtilityColumns(){
      const table=$('.smr-table'),cols=[...table.querySelectorAll('colgroup[data-platform-columns] col')];if(cols.length!==7)return;
      const widths=cols.map((col,index)=>Math.max(64,Math.round(parseFloat(col.style.width)||table.rows[0]?.cells[index]?.getBoundingClientRect().width||96))),floors={5:180,6:148};let needed=0;
      Object.entries(floors).forEach(([index,min])=>{index=Number(index);if(widths[index]<min){needed+=min-widths[index];widths[index]=min;}});
      const donors=[0,1,2,3,4];while(needed>0&&donors.some(index=>widths[index]>100)){for(const index of donors){if(!needed)break;if(widths[index]>100){widths[index]--;needed--;}}}
      cols.forEach((col,index)=>{col.style.width=widths[index]+'px';});table.style.width=Math.max(table.parentElement.clientWidth,widths.reduce((sum,width)=>sum+width,0))+'px';
    }
    function panel(title,dirty){const p=P.panel(title,'',()=>!dirty());p.dialog.classList.add('smr-drawer');p.footer.firstElementChild.textContent='Cancel';p.body.classList.add('smr-form');p.error=E('p','','smr-error');p.error.setAttribute('role','alert');p.error.hidden=true;p.body.append(p.error);return p;}
    function error(p,text){p.error.textContent=text;p.error.hidden=!text;if(text)p.error.scrollIntoView({block:'nearest'});}
    function field(parent,label,control,note,tooltip){const wrap=E('div',undefined,'bgfield'),lab=E('label');lab.append(E('span',label));if(tooltip)lab.append(help('About '+label,tooltip));if(control.id)lab.htmlFor=control.id;wrap.append(lab,control);if(note)wrap.append(E('p',note,'smr-muted'));parent.append(wrap);return wrap;}
    function modelSelector(value,onSelect,excluded=[],placeholder='Select model'){
      const b=button('',()=>picker(b,value,excluded,name=>{value=name;paint();onSelect(name);}), 'bgb smr-selector');
      function paint(){b.replaceChildren(value?mark(value):E('span',placeholder,'smr-muted'));b.append(E('span','⌄','smr-chevron'));b.setAttribute('aria-label',value?'Selected model: '+value:placeholder);}b.setValue=next=>{value=next||'';paint();};paint();return b;
    }
    function positionPopover(popover,trigger){
      const r=trigger.getBoundingClientRect(),gap=8,below=Math.max(0,innerHeight-r.bottom-gap*2),above=Math.max(0,r.top-gap*2);
      const useBelow=below>=260||below>=above,space=Math.max(160,useBelow?below:above);
      popover.style.maxHeight=Math.min(440,space,innerHeight-16)+'px';
      const width=popover.offsetWidth,height=popover.offsetHeight;
      popover.style.left=Math.max(gap,Math.min(r.left,innerWidth-width-gap))+'px';
      popover.style.top=Math.max(gap,Math.min(useBelow?r.bottom+gap:r.top-height-gap,innerHeight-height-gap))+'px';
    }
    function dismissOnBackdrop(popover,close){popover.addEventListener('click',event=>{if(event.target!==popover)return;const r=popover.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();});popover.oncancel=event=>{event.preventDefault();close();};}
    function picker(trigger,value,excluded,onSelect){
      const p=E('dialog',undefined,'usage-filter-panel smr-model-picker'),head=E('header'),body=E('div',undefined,'usage-filter-body'),types=E('nav',undefined,'usage-filter-types'),pane=E('div',undefined,'usage-filter-values-pane'),title=E('strong','Model · select one','usage-filter-item-title'),search=E('input'),list=E('div',undefined,'usage-filter-list'),footer=E('footer'),cancel=button('Cancel',close,'bgb'),apply=button('Apply model',applySelection,'cta');
      let selected=value||'';p.setAttribute('aria-label','Select model');head.append(E('strong','Select model'),help('About model selection','Only models enabled in Model access are available.'));const type=button('Model',()=>{},'');type.setAttribute('aria-pressed','true');types.append(type);search.type='search';search.placeholder='Search model';search.setAttribute('aria-label','Search model');pane.append(title,search,list);body.append(types,pane);footer.append(E('span',undefined,'usage-filter-footer-space'),cancel,apply);p.append(head,body,footer);document.body.append(p);p.showModal();positionPopover(p,trigger);
      function close(){if(p.open)p.close();p.remove();(document.getElementById(trigger.id)||trigger).focus({preventScroll:true});}
      function applySelection(){if(!selected)return;onSelect(selected);close();}
      function paint(){const names=available().filter(name=>name.toLowerCase().includes(search.value.trim().toLowerCase()));list.replaceChildren();names.forEach(name=>{const label=E('label',undefined,'smr-picker-item'),input=E('input'),check=E('span',undefined,'smr-picker-check'),copy=E('span',undefined,'smr-picker-model');check.innerHTML='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg>';input.type='radio';input.name='smr-model-choice';input.value=name;input.checked=name===selected;input.disabled=excluded.includes(name);input.onchange=()=>{selected=name;apply.disabled=false;};copy.append(mark(name));label.append(input,check,copy);if(input.disabled)label.append(E('span','Already used','smr-muted'));list.append(label)});if(!names.length)list.append(E('p','No enabled models found. Update Model access to make models available.','usage-filter-empty'));apply.disabled=!selected||excluded.includes(selected);}
      search.oninput=()=>{paint();list.scrollTop=0;};dismissOnBackdrop(p,close);paint();positionPopover(p,trigger);search.focus({preventScroll:true});
    }
    function effortSelector(draft){
      const trigger=button('',open,'bgb smr-effort-trigger');trigger.id='smr-default-effort';
      function paint(){const supported=effortsFor(draft.defaultModel);if(draft.defaultModel&&!supported.includes(draft.defaultEffort))draft.defaultEffort=supported[0];trigger.replaceChildren(E('span',draft.defaultModel?effortLabel(draft.defaultEffort):'Choose a default model first',draft.defaultModel?'':'smr-muted'),E('span','⌄','smr-chevron'));trigger.disabled=!draft.defaultModel;trigger.setAttribute('aria-label',draft.defaultModel?'Default effort: '+effortLabel(draft.defaultEffort):'Choose a default model before selecting effort');}
      function open(){if(!draft.defaultModel)return;const supported=effortsFor(draft.defaultModel),p=E('dialog',undefined,'smr-effort-popover'),head=E('header'),body=E('div',undefined,'smr-effort-popover-body'),slider=E('div',undefined,'smr-effort-slider'),top=E('div',undefined,'smr-effort-slider-head'),value=E('output',undefined,'smr-effort-value'),input=E('input'),labels=E('div',undefined,'smr-effort-labels'),footer=E('footer'),cancel=button('Cancel',close,'bgb'),apply=button('Apply effort',applySelection,'bgb bgb-p');let selected=supported.includes(draft.defaultEffort)?draft.defaultEffort:supported[0];input.type='range';input.min='0';input.max=String(Math.max(0,supported.length-1));input.step='1';input.setAttribute('aria-label','Default effort level');head.append(E('strong','Default effort level'));top.append(E('span','Effort'),value);slider.append(top,input,labels);body.append(slider);footer.append(cancel,apply);p.append(head,body,footer);document.body.append(p);p.showModal();positionPopover(p,trigger);
        function draw(){const index=Math.max(0,supported.indexOf(selected));input.value=String(index);input.setAttribute('aria-valuetext',effortLabel(selected));input.disabled=supported.length<2;input.style.setProperty('--p',(supported.length<2?0:index/(supported.length-1)*100)+'%');value.textContent=effortLabel(selected);labels.replaceChildren(...supported.map((item,i)=>{const b=button(effortLabel(item),()=>{selected=item;draw();},'smr-effort-tick');b.toggleAttribute('data-on',i===index);return b;}));}
        function close(){if(p.open)p.close();p.remove();trigger.focus({preventScroll:true});}
        function applySelection(){draft.defaultEffort=selected;paint();close();}
        input.oninput=()=>{selected=supported[Number(input.value)]||supported[0];draw();};dismissOnBackdrop(p,close);draw();positionPopover(p,trigger);input.focus({preventScroll:true});
      }
      paint();return {control:trigger,paint};
    }
    function editAuto(){
      const draft=R.clone(state.auto);if(!draft.defaultEffort)draft.defaultEffort='default';const before=JSON.stringify(draft),p=panel('Auto routing',()=>JSON.stringify(draft)!==before);
      const toggleCard=E('section',undefined,'smr-setting-card'),toggle=E('input');toggle.type='checkbox';toggle.id='smr-enabled';toggle.checked=draft.enabled;toggle.setAttribute('role','switch');
      const toggleRow=E('label',undefined,'smr-toggle-row');toggleRow.htmlFor=toggle.id;const copy=E('span');copy.append(E('strong','Use Auto routing'),E('span','Automatically choose the best available model for each request.','smr-muted'));toggleRow.append(copy,toggle);toggleCard.append(toggleRow);
      const access=E('p',undefined,'smr-toggle-support');access.append(document.createTextNode('Auto routing only uses models available in Model access. '));access.append(button('Manage Model access',()=>{if(JSON.stringify(draft)!==before)P.discard(()=>{p.close();window.GatewayShell.navigate({product:'gateway',page:'acc'});});else{p.close();window.GatewayShell.navigate({product:'gateway',page:'acc'});}},'smr-text-button'));toggleCard.append(access);p.body.append(toggleCard);
      const settings=E('div',undefined,'smr-auto-settings');p.body.append(settings);
      const accessSection=E('section',undefined,'smr-form-section');accessSection.append(E('h3','End-user access'),E('p','Choose whether Auto routing is offered as a choice or enforced as the only routing mode.','smr-muted'));
      const choices=E('fieldset',undefined,'smr-choices');choices.append(E('legend','How should users access Auto routing?','sr-only'));
      [['optional','Offer Auto routing as an option','Users can choose Auto or select a specific model.'],['required','Enforce Auto routing','Auto is the only option; users cannot select a specific model.']].forEach(([value,label,note])=>{const input=E('input');input.type='radio';input.name='smr-user-choice';input.value=value;input.checked=draft.userChoice===value;input.onchange=()=>{draft.userChoice=value;error(p,'');};const row=E('label',undefined,'smr-choice'),indicator=E('span',undefined,'smr-choice-indicator'),text=E('span');indicator.innerHTML='<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';text.append(E('strong',label),E('span',note,'smr-muted'));row.append(input,indicator,text);choices.append(row);});accessSection.append(choices);settings.append(accessSection);
      let useDefault=Boolean(draft.defaultModel),rememberedModel=draft.defaultModel,rememberedEffort=draft.defaultEffort;
      const defaults=E('section',undefined,'smr-form-section'),defaultTitle=E('label',undefined,'smr-toggle-row'),defaultToggle=E('input');defaultToggle.type='checkbox';defaultToggle.id='smr-use-default';defaultToggle.checked=useDefault;defaultToggle.setAttribute('role','switch');defaultTitle.htmlFor=defaultToggle.id;defaultTitle.append(E('strong','Use default route'),defaultToggle);defaults.append(defaultTitle);
      const explanation=E('div',undefined,'smr-explanation');explanation.append(E('strong','Fallback for unresolved prompts'),E('p','If Auto routing cannot confidently determine a model, it can use this optional fallback. Turn this off to leave Auto routing without a default model.'));defaults.append(explanation);
      const controls=E('div',undefined,'smr-default-controls');defaults.append(controls);const effort=effortSelector(draft),selector=modelSelector(draft.defaultModel,name=>{draft.defaultModel=name;effort.paint();syncDefault();error(p,'');},[],'Select model');selector.id='smr-default-model';field(controls,'Default model',selector);const effortField=field(controls,'Default effort level',effort.control,null,'Available effort levels depend on the selected model.');function syncDefault(){controls.hidden=!useDefault;effort.paint();effortField.hidden=!draft.defaultModel;}defaultToggle.onchange=()=>{useDefault=defaultToggle.checked;if(useDefault){draft.defaultModel=rememberedModel||'';draft.defaultEffort=rememberedEffort||'default';}else{rememberedModel=draft.defaultModel;rememberedEffort=draft.defaultEffort;draft.defaultModel='';draft.defaultEffort='default';}selector.setValue(draft.defaultModel);syncDefault();error(p,'');};syncDefault();settings.append(defaults);
      toggle.onchange=()=>{draft.enabled=toggle.checked;settings.hidden=!draft.enabled;error(p,'');};settings.hidden=!draft.enabled;
      p.footer.append(button('Save changes',()=>{const issue=draft.enabled&&useDefault&&!draft.defaultModel?'Choose a default model or turn off Use default route.':R.validateAuto(draft,available(),effortsFor(draft.defaultModel));if(issue){error(p,issue);return;}const next=R.clone(state);next.auto=draft;if(!save(next)){error(p,'Could not save to browser storage. Your changes are still here; try again.');return;}p.close();P.toast('Auto routing updated.');},'bgb bgb-p'));
    }
    function editChain(existing){
      const draft=existing?R.clone(existing):{id:crypto.randomUUID(),startingModel:'',backups:['']},before=JSON.stringify(draft),p=panel(existing?'Edit chain':'Create chain',()=>JSON.stringify(draft)!==before);
      p.body.append(E('p','Models are tried from top to bottom. Each successful failover becomes sticky for the rest of the session.','smr-muted'));
      const canvas=E('section',undefined,'smr-chain-canvas'),nodes=E('div',undefined,'smr-chain-nodes');let dragIndex=null;canvas.append(nodes);p.body.append(canvas);
      function moveBackup(from,to){if(!Number.isInteger(from)||!Number.isInteger(to)||from===to||from<0||to<0||from>=draft.backups.length||to>=draft.backups.length)return;const [moved]=draft.backups.splice(from,1);draft.backups.splice(to,0,moved);renderNodes();error(p,'');}
      function renderNodes(){
        nodes.replaceChildren();const startNode=E('article',undefined,'smr-chain-node is-start'),startHead=E('div',undefined,'smr-node-heading');startHead.append(E('span','Starting model','smr-node-label'));startNode.append(startHead);
        const start=modelSelector(draft.startingModel,name=>{draft.startingModel=name;renderNodes();error(p,'');},[...state.chains.filter(c=>c.id!==draft.id).map(c=>c.startingModel),...draft.backups.filter(Boolean)]);start.id='smr-starting-model';startNode.append(start);nodes.append(startNode);
        draft.backups.forEach((name,index)=>{
          const node=E('article',undefined,'smr-chain-node'),head=E('div',undefined,'smr-node-heading');head.append(E('span','Failover '+(index+1),'smr-node-label'));const actions=E('div',undefined,'smr-order-actions');
          const handle=button('',()=>{},'smr-drag-handle'),dots=E('span',undefined,'smr-drag-dots'),remove=button('×',()=>{draft.backups.splice(index,1);renderNodes();},'bgtool');handle.append(dots);handle.draggable=true;handle.setAttribute('aria-label','Drag to reorder failover '+(index+1));handle.title='Drag to reorder';handle.ondragstart=event=>{dragIndex=index;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',String(index));const ghost=node.cloneNode(true),rect=node.getBoundingClientRect();ghost.classList.add('smr-drag-ghost');ghost.style.width=rect.width+'px';document.body.append(ghost);event.dataTransfer.setDragImage(ghost,Math.min(40,rect.width/2),24);setTimeout(()=>ghost.remove());node.classList.add('is-dragging');};handle.ondragend=()=>{dragIndex=null;nodes.querySelectorAll('.is-dragging,.is-drop-target').forEach(item=>item.classList.remove('is-dragging','is-drop-target'));};handle.onkeydown=event=>{if(event.key==='ArrowUp'&&index>0){event.preventDefault();moveBackup(index,index-1);}if(event.key==='ArrowDown'&&index<draft.backups.length-1){event.preventDefault();moveBackup(index,index+1);}};remove.setAttribute('aria-label','Remove failover '+(index+1));actions.append(handle,remove);head.append(actions);node.append(head);
          node.ondragover=event=>{if(dragIndex===null||dragIndex===index)return;event.preventDefault();event.dataTransfer.dropEffect='move';node.classList.add('is-drop-target');};node.ondragleave=()=>node.classList.remove('is-drop-target');node.ondrop=event=>{event.preventDefault();const from=dragIndex;dragIndex=null;moveBackup(from,index);};
          const select=modelSelector(name,value=>{draft.backups[index]=value;renderNodes();error(p,'');},[draft.startingModel,...draft.backups.filter((_,i)=>i!==index)].filter(Boolean));select.id='smr-backup-'+index;node.append(select);nodes.append(node);
        });
        const add=button('+ Add backup model',()=>{draft.backups.push('');renderNodes();error(p,'');},'bgb smr-add-node');add.disabled=draft.backups.length>=4;nodes.append(add);
      }
      renderNodes();p.footer.append(button('Save changes',()=>{const issue=R.validateChain(draft,state.chains,available());if(issue){error(p,issue);return;}const next=R.clone(state),index=next.chains.findIndex(c=>c.id===draft.id);if(index<0)next.chains.push(draft);else next.chains[index]=draft;if(!save(next)){error(p,'Could not save to browser storage. Your changes are still here; try again.');return;}p.close();P.toast('Failover chain saved.');},'bgb bgb-p'));
    }
    function deleteChain(chain){const p=P.panel('Delete failover chain','');p.dialog.classList.add('smr-confirm');p.body.append(E('p','Delete the backup sequence for '+chain.startingModel+'?'));p.footer.firstElementChild.textContent='Cancel';p.footer.append(button('Delete chain',()=>{const next=R.clone(state);next.chains=next.chains.filter(c=>c.id!==chain.id);if(!save(next)){p.body.append(E('p','Could not save this change. Try again.','smr-error'));return;}p.close();P.toast('Failover chain deleted.');},'bgb bgb-p'));}
    $('#smr-edit-auto').onclick=editAuto;$('#smr-create-chain').onclick=()=>editChain();$('#smr-search').oninput=renderChains;document.getElementById('nv-rou')?.addEventListener('change',()=>{if(document.getElementById('nv-rou').checked)render();});window.ModelRouterUI={getState:()=>R.clone(state),resolveStart:input=>R.resolveStart(state,input),nextBackup:input=>R.nextBackup(state,input)};render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init));else setTimeout(init);
})();
