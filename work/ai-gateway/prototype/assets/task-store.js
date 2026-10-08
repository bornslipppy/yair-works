/* Usage-generated demo sessions have identities, not title-only links. Keeping
   their snapshots in session storage makes detail URLs survive a tab reload. */
(function(root,factory){if(typeof module==='object')module.exports=factory;else{let storage;try{storage=root.sessionStorage;}catch{}root.TaskStore=factory(storage);}})(typeof window==='object'?window:this,function(storage){
  const key='gateway.usage-task-snapshots.v1', records=[];
  function persist(){try{storage?.setItem(key,JSON.stringify(records.filter(task=>task.usageRecord)));}catch{}}
  function upsert(task){const old=records.find(item=>item.id===task.id);if(old)Object.assign(old,task);else records.push(task);return old||task;}
  try{const saved=JSON.parse(storage?.getItem(key)||'[]');if(Array.isArray(saved))saved.filter(task=>task&&task.usageRecord&&typeof task.id==='string'&&typeof task.developer==='string'&&Number.isFinite(task.cost)&&task.tokens).forEach(upsert);}catch{}
  function registerUsage(task,context){
    const identity=[context.user,context.period,context.kind,task.name].map(encodeURIComponent).join('~');
    const id='usage-'+identity, total=Math.max(0,Math.round(Number(task.tokens)||Number(task.spend)*1200));
    const input=Math.round(total*.52),cached=Math.round(total*.29);
    const model=task.model||(task.models&&task.models[0]&&(task.models[0].name||task.models[0].model))||'Unknown model';
    const elapsed=task.ago?parseInt(task.ago,10)*60:60;
    const lastAt=(context.endedAt||Date.now())-elapsed*60000;
    const record=upsert({id,slug:id,usageRecord:true,title:task.name,developer:context.user,group:context.group||'Unattributed',period:context.period,
      model,provider:/Claude/.test(model)?'Anthropic':/GPT/.test(model)?'OpenAI':/Gemini/.test(model)?'Google':/Mistral/.test(model)?'Mistral AI':/Hebrew/.test(model)?'Wonderful':'Unknown',
      source:'Wonderful Code',status:'Done',cost:Number(task.spend),lastAt,lastMin:Math.max(0,(Date.now()-lastAt)/60000),
      turns:task.calls||1,tokens:{total,input,cached,output:total-input-cached},repo:'https://github.com/wonderfulcx/wonderful-ai-gateway-mock.git',branch:'—'});
    persist();return record;
  }
  return {records,seed(tasks){tasks.forEach(upsert);return records;},registerUsage};
});
