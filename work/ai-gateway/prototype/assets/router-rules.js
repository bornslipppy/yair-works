(function(){
'use strict';
const TASK_GROUPS={
 'Code':['Code generation','Debugging','Code review','SQL & database','Frontend & UI','DevOps & config','Shell execution','File I/O','Repo scanning'],
 'Agents':['Multi-step planning','Tool dispatch','Workflow execution','Web search','Memory extraction','DevOps'],
 'Data':['Data extraction','Data transformation','Classification','Summarization','Translation','Math'],
 'Writing & chat':['Content writing','Research & reports','Q&A & knowledge','Conversation','Customer support','Roleplay & fiction','Finance & trading','Security audit','Other']
};
// Demo endpoint compatibility, not a claim that credentials are connected.
const ENDPOINTS={'Anthropic':['Anthropic','AWS Bedrock','Google Vertex AI'],'OpenAI':['OpenAI','Azure OpenAI'],'Google Gemini':['Google Vertex AI'],'Meta':['AWS Bedrock','Wonderful'],'Microsoft':['Azure OpenAI','Wonderful']};
window.createRouterRules=function(ctx){
 const {root,catalog,E,B,field,select,checkboxEl,modelNode}=ctx;
 const state=()=>ctx.state(),model=id=>catalog.find(m=>m.id===id),providers=id=>ENDPOINTS[model(id)?.provider]||[model(id)?.provider].filter(Boolean);
 const enabled=m=>!m.disabled&&window.__accEnabled?.[m.name]!==false;
 const expandedRoutes=new WeakMap();
 function taskLabel(tasks){const groups=Object.entries(TASK_GROUPS).filter(([,items])=>items.some(t=>tasks.includes(t))).map(([name])=>name);return !tasks.length?'Choose task types':groups.length===1?groups[0]:groups.length===2?groups.join(' + '):tasks.length+' task types'}
 const family=id=>{const m=model(id);return m?.family||(/^Claude /.test(m?.name)?'Claude':/^GPT-/.test(m?.name)?'GPT':/^Gemini /.test(m?.name)?'Gemini':/^Llama /.test(m?.name)?'Llama':/^Phi-/.test(m?.name)?'Phi':m?.name)};
 const sourceModels=d=>d.startMatchMode==='family'?catalog.filter(m=>(d.families||[]).includes(family(m.id))).map(m=>m.id):(d.starts||[]);
 const matchesSource=(d,id)=>d.startMatchMode==='family'?(d.families||[]).includes(family(id)):!d.starts?.length||d.starts.includes(id);
 function familyPicker(parent,d,changed){
  const wrap=E('div','mr-family-options');wrap.setAttribute('role','group');wrap.setAttribute('aria-label','Starting model families');
  [...new Set(catalog.filter(enabled).map(m=>family(m.id)))].forEach(name=>{const row=E('label','mr-task-option'),box=checkboxEl((d.families||[]).includes(name));box.input.onchange=()=>{d.families=box.input.checked?[...(d.families||[]),name]:(d.families||[]).filter(v=>v!==name);d.starts=sourceModels(d);d.startProvider='any';d.strategy='custom';changed(true)};row.append(box.wrap,E('span','',name));wrap.append(row)});parent.append(wrap,E('p','mr-help','Applies to every model in the selected family, including models added later. Individual-model rules take precedence.'));
 }
 const provider=pair=>pair.provider||providers(pair.model)[0],signature=pair=>pair.model+'|'+provider(pair);
 const pairText=pair=>(model(pair.model)?.name||'Select model')+' · '+provider(pair);
 const primary=d=>({model:d.starts?.[0]||state().defaultPair.model,provider:d.startProvider&&d.startProvider!=='any'?d.startProvider:provider(state().defaultPair.model===(d.starts?.[0]||state().defaultPair.model)?state().defaultPair:{model:d.starts[0]})});
 function candidates(d){const start=primary(d),mode=d.strategy||'custom';return catalog.filter(enabled).flatMap(m=>providers(m.id).map(p=>({model:m.id,provider:p,effort:'default'}))).filter(pair=>(mode!=='provider'||pair.model===start.model)&&(mode!=='model'||pair.provider===start.provider)&&signature(pair)!==signature(start))}
 function normalizePair(pair){if(!providers(pair.model).includes(pair.provider))pair.provider=providers(pair.model)[0];return pair}
 function syncPool(d){d.pool=[...new Map((d.taskRules||[]).map(rule=>[signature(rule),{model:rule.model,provider:provider(rule),effort:rule.effort||'default'}])).values()]}
 function ensureTasks(d){if(d.mode!=='auto'||d.taskRules)return;const pool=d.pool||[];d.taskRules=Object.keys(TASK_GROUPS).map((group,i)=>Object.assign({id:'task-'+i,tasks:TASK_GROUPS[group].slice()},pool[i%pool.length]||{model:'sonnet',effort:'default'}));d.taskRules.forEach(normalizePair);syncPool(d)}
 function pairFields(parent,pair,changed,allowed){
  normalizePair(pair);const wrap=E('div','mr-pair-fields');parent.append(wrap);
  const available=allowed||catalog.filter(enabled).flatMap(m=>providers(m.id).map(p=>({model:m.id,provider:p})));
  const models=[...new Set(available.map(p=>p.model))];if(!models.includes(pair.model))models.unshift(pair.model);
  const modelSelect=select(models.map(id=>[id,model(id)?.name||id]),pair.model,id=>{pair.model=id;const options=available.filter(p=>p.model===id).map(p=>p.provider);if(!options.includes(pair.provider))pair.provider=options[0]||providers(id)[0];if(!model(id).efforts.includes(pair.effort))pair.effort='default';changed(true)});
  [...modelSelect.options].forEach(o=>o.disabled=!available.some(p=>p.model===o.value));field(wrap,'Model',modelSelect);
  const ps=[...new Set(available.filter(p=>p.model===pair.model).map(p=>p.provider))];if(!ps.includes(pair.provider))ps.unshift(pair.provider);
  const providerSelect=select(ps.map(p=>[p,p]),pair.provider,p=>{pair.provider=p;changed(true)});[...providerSelect.options].forEach(o=>o.disabled=!available.some(p=>p.model===pair.model&&p.provider===o.value));field(wrap,'Provider',providerSelect);
 }
 function sourceProvider(parent,d,changed){
  const models=sourceModels(d).length?sourceModels(d):[state().defaultPair.model];
  const common=providers(models[0]).filter(p=>models.every(id=>providers(id).includes(p)));
  const value=d.startProvider||'any';field(parent,'Starting provider',select([['any','Any compatible provider']].concat(common.map(p=>[p,p])),value,p=>{d.startProvider=p;changed(true)}));
 }
 function chainEditor(parent,d,changed){
  const modes=E('div','mr-failover-modes');parent.append(modes);
  [['provider','Same model · another provider'],['model','Another model · same provider'],['custom','Custom Model + Provider chain']].forEach(([id,label])=>{
   const button=B(label,()=>{d.strategy=id;if(id!=='custom'){if(d.starts?.length>1)d.starts=[d.starts[0]];if(d.starts?.length)d.startProvider=primary(d).provider;d.chain=candidates(d).slice(0,1)}changed(true)},'mr-choice');button.setAttribute('aria-pressed',String((d.strategy||'custom')===id));modes.append(button);
  });
  const start=primary(d);parent.append(E('p','mr-help','Starting pair: '+pairText(start)));
  d.chain.forEach((pair,i)=>{const card=E('section','mr-pair-card'),head=E('div','mr-pair-head');head.append(E('h4','','Failover '+(i+1)));
   const actions=E('div','mr-pair-actions');[['↑',i-1,'up'],['↓',i+1,'down']].forEach(([label,to,direction])=>{const b=B(label,()=>{const item=d.chain.splice(i,1)[0];d.chain.splice(to,0,item);changed(true)},'mr-icon');b.disabled=to<0||to>=d.chain.length;b.setAttribute('aria-label','Move failover '+(i+1)+' '+direction);actions.append(b)});
   const remove=B('×',()=>{d.chain.splice(i,1);changed(true)},'mr-icon');remove.setAttribute('aria-label','Remove failover '+(i+1));actions.append(remove);head.append(actions);card.append(head);
   pairFields(card,pair,changed,candidates(d));parent.append(card);
  });
  const unused=candidates(d).filter(p=>!d.chain.some(existing=>signature(p)===signature(existing)));
  const add=B('+ Add failover',()=>{d.chain.push(unused[0]);changed(true)},'mr-button');add.disabled=!unused.length;parent.append(add);
  parent.append(E('p','mr-help','Try each Model + Provider pair once, in order. Previously attempted pairs are skipped.'));
 }
 function taskPicker(rule,d,changed){
  const dialog=E('dialog','mr-task-picker');dialog.setAttribute('aria-label','Select task types');
  const head=E('div','mr-dialog-head');head.append(E('h2','','Select task types'));const dismiss=B('×',close,'mr-close');dismiss.setAttribute('aria-label','Close task types');head.append(dismiss);dialog.append(head);
  const body=E('div','mr-task-picker-body'),nav=E('div','mr-task-categories'),list=E('div','mr-task-options'),search=E('input','mr-search');search.type='search';search.placeholder='Search task types';search.setAttribute('aria-label','Search task types');
  const right=E('div','mr-task-right');right.append(search,list);body.append(nav,right);dialog.append(body);
  let group=Object.keys(TASK_GROUPS)[0],selected=new Set(rule.tasks||[]);const used=new Set(d.taskRules.filter(r=>r!==rule).flatMap(r=>r.tasks));
  const footer=E('div','mr-footer'),count=E('span','mr-muted');footer.append(count,B('Cancel',close,'mr-button'),B('Apply task types',()=>{rule.tasks=[...selected];close();changed(true)},'mr-button mr-primary'));dialog.append(footer);
  const opener=document.activeElement;function close(){dialog.close();dialog.remove();opener?.focus()}
  function check(label,values,category){const row=E('label','mr-task-option'),box=checkboxEl(values.length>0&&values.every(v=>selected.has(v)),!values.length);box.input.indeterminate=values.some(v=>selected.has(v))&&!values.every(v=>selected.has(v));box.input.onchange=()=>{values.forEach(v=>box.input.checked?selected.add(v):selected.delete(v));paint()};row.append(box.wrap,E('span','',label));if(category)row.classList.add('mr-task-select-group');return row}
  function paint(){nav.replaceChildren();Object.keys(TASK_GROUPS).forEach(name=>{const b=B('',()=>{group=name;search.value='';paint()},'mr-picker-type');b.setAttribute('aria-pressed',String(group===name));b.append(E('span','',name),E('span','mr-muted',TASK_GROUPS[name].filter(t=>selected.has(t)).length+'/'+TASK_GROUPS[name].length));nav.append(b)});
   list.replaceChildren();const q=search.value.toLowerCase().trim(),tasks=(q?Object.values(TASK_GROUPS).flat():TASK_GROUPS[group]).filter(t=>t.toLowerCase().includes(q)),available=tasks.filter(t=>!used.has(t));
   list.append(check(q?'Select all matches':'All '+group,available,true));tasks.forEach(task=>{const row=check(task,used.has(task)?[]:[task]);if(used.has(task))row.append(E('small','mr-muted','Already routed'));list.append(row)});if(!tasks.length)list.append(E('p','mr-empty','No matching task types.'));count.textContent=selected.size+' selected';
  }
  search.oninput=paint;dialog.addEventListener('cancel',e=>{e.preventDefault();close()});root.append(dialog);paint();dialog.showModal();search.focus();
 }
 function taskEditor(parent,d,changed){
  ensureTasks(d);const section=E('section','mr-section mr-task-rules'),sectionHead=E('div','mr-section-head');sectionHead.append(E('h3','','Task routes'),E('span','mr-muted',d.taskRules.length+' routes'));section.append(sectionHead);parent.append(section);
  if(!expandedRoutes.has(d))expandedRoutes.set(d,new Set(d.taskRules[0]?[d.taskRules[0].id]:[]));const expanded=expandedRoutes.get(d);
  d.taskRules.forEach((rule,i)=>{const card=E('details','mr-task-route'),summary=E('summary','mr-task-route-summary'),copy=E('span','mr-task-route-copy');copy.append(E('span','',taskLabel(rule.tasks)),E('span','mr-small mr-muted',rule.tasks.length+' task types'));const destination=E('span','mr-task-destination');destination.append(modelNode(rule.model),E('span','mr-small mr-muted',provider(rule)));summary.append(copy,destination,E('span','mr-disclosure','⌄'));card.append(summary);card.open=expanded.has(rule.id)||!rule.tasks.length;card.ontoggle=()=>{if(card.open)expanded.add(rule.id);else expanded.delete(rule.id)};const content=E('div','mr-task-route-content'),head=E('div','mr-pair-head');head.append(E('h4','','Route '+(i+1)),B('Remove',()=>{expanded.delete(rule.id);d.taskRules.splice(i,1);syncPool(d);changed(true)},'mr-link'));content.append(head);
   const taskButton=B(rule.tasks.length?rule.tasks.length+' task types selected':'Select task types',()=>taskPicker(rule,d,()=>{syncPool(d);changed(true)}),'mr-button mr-task-trigger');taskButton.setAttribute('aria-label','Select task types for route '+(i+1));card.append(taskButton);
   if(!model(rule.model)||!enabled(model(rule.model))){destination.append(E('span','mr-route-warning','Model unavailable'));card.open=true}
   content.append(taskButton);pairFields(content,rule,()=>{syncPool(d);changed(true)});card.append(content);section.append(card);
  });
  section.append(B('+ Add task route',()=>{d.taskRules.push({id:'task-'+Date.now(),tasks:[],model:catalog.find(enabled).id,effort:'default'});syncPool(d);changed(true)},'mr-button'));
  section.append(E('p','mr-help','Other tasks use the requested model or organisation default.'));
 }
 function validate(d){
  if(d.startMatchMode==='family'&&!d.families?.length)return 'Select at least one model family.';
  if(d.mode==='auto'){
   if(!d.taskRules?.length)return 'Add at least one task route.';const seen=new Set();
   for(const rule of d.taskRules){if(!rule.tasks.length)return 'Select at least one task type for every route.';for(const task of rule.tasks){if(seen.has(task))return 'A task type can route to only one model in this configuration.';seen.add(task)}if(!model(rule.model)||!enabled(model(rule.model))||!providers(rule.model).includes(provider(rule)))return 'Select an enabled Model + Provider pair.'}
  }
  if(d.mode==='custom'){
   const seen=new Set(),valid=candidates(d);for(const pair of d.chain){const sig=signature(pair);if(seen.has(sig))return 'Each Model + Provider pair can appear only once.';seen.add(sig);if(!valid.some(p=>signature(p)===sig))return 'Choose compatible failover pairs that differ from the starting pair and match the selected mode.'}
  }
  return null;
 }
 function canvas(){const host=root.querySelector('#rtc-groups');host.replaceChildren();host.classList.add('mr-failover-canvas');root.querySelector('#rtc-wires').replaceChildren();
  const configs=[{d:state().defaultFallback,title:'Organisation default',kind:'fallbackDefault'}].concat(state().rules.filter(r=>r.target==='org'&&r.starts.length).map(d=>({d,title:d.starts.map(id=>model(id)?.name).join(', '),kind:'fallbackRule'})));
  configs.forEach(({d,title,kind})=>{const section=E('section','mr-failover-section'),head=E('div','mr-pair-head');head.append(E('h3','',d.startMatchMode==='family'?d.families.join(', ')+' family':title),B('Edit failover',()=>ctx.openEditor(kind,d),'mr-button'));section.append(head);
   const flow=E('div','mr-pair-flow');const start=E('div','mr-pair-node');start.append(E('span','mr-muted',d.starts?.length?'Starting models':'Organisation starting pair'));(d.starts?.length?d.starts:[state().defaultPair.model]).forEach(id=>start.append(modelNode(id)));start.append(E('span','mr-small',d.starts?.length?(d.startProvider&&d.startProvider!=='any'?d.startProvider:'Any compatible provider'):primary(d).provider));flow.append(start);
   (d.mode==='none'?[]:d.chain).forEach((pair,i)=>{flow.append(E('span','mr-pair-arrow','→'));const node=E('div','mr-pair-node');node.append(E('span','mr-muted','Failover '+(i+1)),modelNode(pair.model),E('span','mr-small',provider(pair)));flow.append(node)});if(d.mode==='none')flow.append(E('span','mr-muted','Stop request'));section.append(flow);host.append(section);
  });
 }
 function resolveTask(key,task,requested){const config=ctx.resolveAuto(key),fallback=requested||state().defaultPair,rule=config.mode==='auto'&&(!requested||config.replace)?config.taskRules?.find(r=>r.tasks.includes(task)&&model(r.model)&&enabled(model(r.model))):null;return rule?{model:rule.model,provider:provider(rule),source:config.source}:Object.assign({},fallback,{provider:provider(fallback),source:requested?'Requested model':'Organisation default'})}
 function resolvePolicy(policy,start){const seen=new Set([signature(start)]);const chain=policy.mode==='none'?[]:policy.chain.map(pair=>Object.assign({},pair,policy.strategy==='provider'?{model:start.model}:policy.strategy==='model'?{provider:provider(start)}:{})).filter(pair=>{const sig=signature(pair);if(seen.has(sig)||!providers(pair.model).includes(provider(pair))||!model(pair.model)||!enabled(model(pair.model)))return false;seen.add(sig);return true});return Object.assign({},policy,{chain})}
 function terminology(){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(node.parentElement.closest('script,style'))continue;const before=node.nodeValue,after=before.replace(/Fallback/g,'Failover').replace(/fallback/g,'failover').replace(/Entity routing/g,'Auto router');if(before!==after)node.nodeValue=after}root.querySelectorAll('[aria-label],[title]').forEach(el=>['aria-label','title'].forEach(attr=>{const before=el.getAttribute(attr);if(before){const after=before.replace(/Fallback/g,'Failover').replace(/fallback/g,'failover');if(before!==after)el.setAttribute(attr,after)}}))}
 let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;terminology()})}).observe(root,{childList:true,subtree:true,characterData:true});terminology();
 const addRule=root.querySelector?.('#rtc-addgroup');if(addRule)addRule.lastChild.textContent='Add failover rule';
 return {taskLabel,family,sourceModels,matchesSource,familyPicker,providers,provider,pairText,normalizePair,ensureTasks,syncPool,sourceProvider,chainEditor,taskEditor,validate,canvas,resolveTask,resolvePolicy,signature};
};
})();
