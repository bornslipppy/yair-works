/* Configuration and policy helpers only. Model selection/failure detection are
   supplied by a routing service; this prototype never executes LLM requests. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ModelRouterEngine=api;})(typeof window==='object'?window:this,function(){
  const clone=value=>JSON.parse(JSON.stringify(value));
  function initial(){return {version:1,auto:{enabled:false,defaultModel:'Claude Sonnet 5',defaultEffort:'medium',userChoice:'optional'},chains:[{id:'sonnet-chain',startingModel:'Claude Sonnet 5',backups:['GPT-5.1','Gemini 3 Pro']},{id:'opus-chain',startingModel:'Claude Opus 5',backups:['Claude Sonnet 5','Claude Haiku 4.5']}]};}
  function validateAuto(auto,available,efforts){
    if(typeof auto.enabled!=='boolean')return 'Choose whether Auto routing is enabled.';
    if(!auto.enabled)return null;
    if(!['optional','required'].includes(auto.userChoice))return 'Choose how users access Auto routing.';
    if(!auto.defaultModel)return null;
    if(!available.includes(auto.defaultModel))return 'Select a model enabled in Model access.';
    if(!efforts?.includes(auto.defaultEffort))return 'Select an effort level supported by the default model.';
    return null;
  }
  function validateChain(chain,chains,available){
    if(!available.includes(chain.startingModel))return 'Select a starting model enabled in Model access.';
    if(chains.some(item=>item.id!==chain.id&&item.startingModel===chain.startingModel))return 'This starting model already has a chain. Edit that chain instead.';
    if(!Array.isArray(chain.backups)||chain.backups.length<1||chain.backups.length>4)return 'Add between one and four backup models.';
    if(chain.backups.some(model=>!available.includes(model)))return 'Select an enabled model for every backup.';
    if(new Set([chain.startingModel,...chain.backups]).size!==chain.backups.length+1)return 'Each model can appear only once, including the starting model.';
    return null;
  }
  function decode(raw){
    try{const s=JSON.parse(raw);if(s?.version!==1||typeof s.auto?.enabled!=='boolean'||typeof s.auto.defaultModel!=='string'||!['optional','required'].includes(s.auto.userChoice)||!Array.isArray(s.chains))return null;
      const ids=new Set(),starts=new Set();
      for(const c of s.chains){if(typeof c.id!=='string'||typeof c.startingModel!=='string'||ids.has(c.id)||starts.has(c.startingModel)||!Array.isArray(c.backups)||c.backups.length<1||c.backups.length>4||c.backups.some(m=>typeof m!=='string')||new Set([c.startingModel,...c.backups]).size!==c.backups.length+1)return null;ids.add(c.id);starts.add(c.startingModel);}
      return {version:1,auto:{enabled:s.auto.enabled,defaultModel:s.auto.defaultModel,defaultEffort:typeof s.auto.defaultEffort==='string'?s.auto.defaultEffort:'default',userChoice:s.auto.userChoice},chains:s.chains.map(c=>({id:c.id,startingModel:c.startingModel,backups:c.backups.slice()}))};
    }catch{return null;}
  }
  function resolveStart(state,{requestedModel=null,useAuto=false,selectedModel=null,allowedModels=[],session=null}={}){
    const allowed=new Set(allowedModels);
    if(session?.model){return allowed.has(session.model)?{model:session.model,source:'session'}:{model:null,error:'Session model is no longer available.'};}
    const auto=state.auto.enabled&&(state.auto.userChoice==='required'||useAuto);
    const model=auto?(selectedModel||state.auto.defaultModel):requestedModel;
    if(!model)return {model:null,error:auto?'Auto routing could not determine a model and no default route is configured.':'Select a model in the client.'};
    if(!allowed.has(model))return {model:null,error:'Model is not available to this user.'};
    const result={model,source:auto?(selectedModel?'auto':'auto-default'):'requested'};
    if(auto&&!selectedModel)result.effort=state.auto.defaultEffort;
    return result;
  }
  function nextBackup(state,{startingModel,attempted=[],allowedModels=[]}){
    const chain=state.chains.find(c=>c.startingModel===startingModel);
    return chain?.backups.find(model=>allowedModels.includes(model)&&!attempted.includes(model)&&model!==startingModel)||null;
  }
  function rememberSuccess(session,startingModel,model){return {...session,startingModel,model};}
  return {initial,clone,decode,validateAuto,validateChain,resolveStart,nextBackup,rememberSuccess};
});
