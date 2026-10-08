(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SpendRuleEngine=api})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const unique=values=>[...new Set(values||[])].sort();
  function scopeKey(scope){return JSON.stringify([unique(scope.groupIds),unique(scope.memberIds)])}
  function matches(rule,person){const ids=[person.group,...(person.groups||[])];return (rule.scope.memberIds||[]).includes(person.id)||(rule.scope.groupIds||[]).some(id=>ids.includes(id))}
  function active(rule,now=Date.now()){return !rule.archived&&!rule.expired&&(!rule.temporary||rule.temporary.expiresAt>now)}
  function policyAt(policy,now=Date.now()){while(policy&&policy.temporary&&policy.temporary.expiresAt<=now&&policy.temporary.previous)policy=policy.temporary.previous;return policy}
  function signature(rule){return JSON.stringify([rule.name||'',rule.monthly,rule.actions,scopeKey(rule.scope||{}),rule.temporary||null])}
  function covered(rule,people){return [...new Map(people.filter(p=>matches(rule,p)).map(p=>[p.id,p])).values()]}
  function resolve(rules,person,defaultPolicy,mode,now=Date.now()){
    let candidates=Object.values(rules).filter(r=>active(r,now)&&matches(r,person));
    const temporary=candidates.filter(r=>r.temporary);
    if(temporary.length)candidates=temporary;
    candidates.sort((a,b)=>{
        const x=a.monthly===null?Infinity:a.monthly,y=b.monthly===null?Infinity:b.monthly;
        if(x!==y)return mode==='lower'?(x<y?-1:1):(x>y?-1:1);
        return 0; // Stable sort preserves saved table order, independent of display sorting.
      });
    const winner=candidates[0];
    return winner?{policy:winner,kind:'rule',target:winner.id,source:winner.name}:{policy:policyAt(defaultPolicy,now),kind:'default',target:null,source:'Default per-user limit'};
  }
  function duplicate(rules,candidate){if(candidate.temporary)return null;return Object.values(rules).find(r=>r.id!==candidate.id&&active(r)&&!r.temporary&&scopeKey(r.scope)===scopeKey(candidate.scope))||null}
  function impact(rules,candidate,people,defaultPolicy,mode,now=Date.now()){
    const old=rules[candidate.id],next={...rules,[candidate.id]:candidate};
    return people.filter(p=>matches(candidate,p)||(old&&matches(old,p))).map(person=>{
      const before=resolve(rules,person,defaultPolicy,mode,now),after=resolve(next,person,defaultPolicy,mode,now);
      return {person,before,after,removed:!matches(candidate,person),amountChanged:before.policy.monthly!==after.policy.monthly,actionsChanged:JSON.stringify(before.policy.actions)!==JSON.stringify(after.policy.actions)};
    });
  }
  function conflicts(rules){const groups=new Map();Object.values(rules).filter(r=>active(r)&&!r.temporary).forEach(r=>{const key=scopeKey(r.scope);groups.set(key,[...(groups.get(key)||[]),r])});return [...groups.values()].filter(list=>list.length>1)}
  function migrate(state,groups){
    if(state.rules&&state.rulesVersion>=4)return false;
    if(!state.rules){state.rules={};
    for(const kind of ['groups','members'])for(const [target,old] of Object.entries(state[kind]||{})){
      const group=groups.find(g=>g.id===target),scope=kind==='members'?{groupIds:[],memberIds:[target]}:group&&group.custom?{groupIds:unique(group.groupIds),memberIds:unique(group.memberIds)}:{groupIds:[target],memberIds:[]};
      const name=old.name||(group&&group.name)||target;
      function insert(policy,suffix){if(!policy)return;const r=clone(policy);r.id='legacy-'+kind+'-'+target+suffix;r.name=policy.name||name;r.scope=clone(scope);r.createdAt=policy.createdAt||0;if(r.temporary){delete r.temporary.previous;r.temporary.source='Temporary exception'}state.rules[r.id]=r}
      if(old.temporary){insert(old.temporary.previous,'');insert(old,'-temporary')}else insert(old,'');
    }
    }else Object.values(state.rules).forEach(r=>{if(r.id.startsWith('legacy-')&&r.createdAt<1000000000000)r.createdAt=0});
    Object.values(state.rules).forEach(r=>{delete r.priorityNeedsReview});
    state.rulesVersion=4;return true;
  }
  function expire(rules,now=Date.now()){let changed=false;for(const rule of Object.values(rules)){if(!rule.expired&&rule.temporary&&rule.temporary.expiresAt<=now){rule.expired=true;rule.expiredAt=rule.temporary.expiresAt;changed=true}}return changed}
  return {scopeKey,matches,active,covered,resolve,duplicate,migrate,expire,policyAt,signature,impact,conflicts};
});
