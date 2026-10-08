(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.BudgetUsageCharts=api;
})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
  function distribution(records,valueOf=r=>r.spend){
    const sorted=records.filter(r=>Number.isFinite(valueOf(r))&&valueOf(r)>=0).slice().sort((a,b)=>valueOf(a)-valueOf(b));
    if(!sorted.length)return null;
    const quantile=p=>{const i=(sorted.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return valueOf(sorted[lo])+(valueOf(sorted[hi])-valueOf(sorted[lo]))*(i-lo)};
    const q1=quantile(.25),median=quantile(.5),q3=quantile(.75),iqr=q3-q1;
    const inside=sorted.filter(r=>valueOf(r)>=q1-1.5*iqr&&valueOf(r)<=q3+1.5*iqr);
    return {sorted,count:sorted.length,min:valueOf(sorted[0]),max:valueOf(sorted.at(-1)),q1,median,q3,low:valueOf(inside[0]),high:valueOf(inside.at(-1)),outliers:sorted.filter(r=>!inside.includes(r))};
  }
  function utilization(users){
    const unique=[...new Map(users.map(user=>[user.id,user])).values()];
    const eligible=unique.filter(user=>Number.isFinite(user.spend)&&user.spend>=0&&Number.isFinite(user.limit)&&user.limit>0).map(user=>({...user,usage:user.spend/user.limit*100}));
    return {stats:distribution(eligible,user=>user.usage),excluded:unique.filter(user=>!eligible.some(record=>record.id===user.id))};
  }
  function budget(users){
    const unique=[...new Map(users.map(user=>[user.id,user])).values()];
    return {count:unique.length,measured:unique.filter(u=>Number.isFinite(u.spend)).length,
      spend:unique.reduce((sum,u)=>sum+(Number.isFinite(u.spend)?u.spend:0),0),
      allocated:unique.reduce((sum,u)=>sum+(u.limit===null?0:u.limit),0),unlimited:unique.filter(u=>u.limit===null).length};
  }
  function waffle(users){
    const {stats,excluded}=utilization(users),buckets=[
      {key:'low',label:'under 60%',count:0,cells:0,users:[]},
      {key:'mid',label:'60%–100%',count:0,cells:0,users:[]},
      {key:'high',label:'above the limit',count:0,cells:0,users:[]}
    ];
    if(!stats)return {count:0,buckets,excluded};
    stats.sorted.forEach(user=>{const bucket=user.usage<60?buckets[0]:user.usage<=100?buckets[1]:buckets[2];bucket.users.push(user);bucket.count++;bucket.cells++});
    return {count:stats.count,buckets,excluded};
  }
  function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node}
  function help(text){
    const mark=element('button','qm gnd-metric-help','?');mark.type='button';mark.setAttribute('aria-label','About this chart');
    mark.append(element('span','qp',text));return mark;
  }
  function header(card,title,detail,explanation){
    const head=element('div','gnd-viz-heading'),name=element('div','gnd-viz-title');
    name.append(element('h3','',title),help(explanation));head.append(name,element('span','gnd-viz-period',detail));card.append(head);
  }
  function metric(host,label,value){const item=element('div','gnd-viz-metric');item.append(element('span','',label),element('strong','',value));host.append(item)}
  function render(host,data){
    host.replaceChildren();
    const group=data.kind==='unit',source=data.kind==='source'||data.kind==='agent';
    const measured=data.users.filter(user=>Number.isFinite(user.spend)),totals=budget(measured);
    const usage=element('section','gnd-viz-card');usage.dataset.chart='budget';
    header(usage,group?'Member budgets':'Budget usage',(data.demo?'Demo · ':'')+data.period,source
      ?'Month-to-date spend across all activity. This source has no direct budget; the organisation spend limit applies.'
      :(data.demo?'Sample August spending from the Spend Limits demo cohort, compared with current effective monthly limits. These amounts are separate from the Usage Breakdown table’s sample totals. ':'Month-to-date spend across all activity, independent of table filters, compared with current effective monthly limits. ')
      +'Temporary rules take priority. Each user is counted once. Both spend and allocation exclude users with missing usage; coverage is shown below.');
    const metrics=element('div','gnd-viz-metrics');usage.append(metrics);
    const noUsers=!source&&!totals.count;
    const used=source?data.spend:totals.spend;
    metric(metrics,group?'All member spend':'Spent',used===null||noUsers?'—':money(used));
    metric(metrics,'Allocated',source?'No direct budget':noUsers?'—':totals.unlimited?'No limit':money(totals.allocated));
    if(group&&data.users.length)usage.append(element('div','gnd-viz-coverage',totals.count===data.users.length?totals.count+' users':totals.count+' of '+data.users.length+' users with usage'));
    if(source||noUsers||totals.unlimited){
      const message=source?'Uses organisation budget':noUsers?(data.users.length?'No recorded usage':group?'No users mapped to this group':'No budget mapping available'):totals.unlimited+' user'+(totals.unlimited===1?'':'s')+' with no limit';
      usage.append(element('div','gnd-viz-status',message));
    }else{
      const scale=Math.max(used,totals.allocated,1),over=Math.max(0,used-totals.allocated);
      const track=element('div','gnd-viz-track');track.setAttribute('role','img');track.setAttribute('aria-label',money(used)+' spent of '+money(totals.allocated)+' allocated'+(over?', '+money(over)+' over budget':''));
      const fill=element('i','gnd-viz-spent'),excess=element('i','gnd-viz-over');
      fill.style.width=(Math.min(used,totals.allocated)/scale*100)+'%';excess.style.width=(over/scale*100)+'%';track.append(fill,excess);track.dataset.over=String(over>0);
      if(over){const mark=element('i','gnd-viz-limit');mark.style.left=(totals.allocated/scale*100)+'%';track.append(mark)}
      usage.append(track);
      const labels=element('div','gnd-viz-foot');
      labels.append(element('span','',totals.allocated>0?Math.round(used/totals.allocated*100)+'% used':used>0?'No budget available':'0% used'),element('span',over?'gnd-viz-over-label':'',money(over||Math.max(0,totals.allocated-used))+(over?' over budget':' remaining')));
      usage.append(labels);
    }
    host.append(usage);
    if(data.kind==='unit')renderWaffle(host,data.users);
  }
  function renderWaffle(host,users){
    const data=waffle(users),card=element('section','gnd-viz-card gnd-waffle-card');card.dataset.chart='distribution';
    header(card,'Per-user budget usage',data.count+' user'+(data.count===1?'':'s'),
      'Each box represents one user. Colors show each user’s month-to-date spend against their current effective monthly limit: below 60%, between 60% and 100%, or above the limit. Legend counts are the actual users for this entity.');
    host.append(card);
    if(!data.count){card.append(element('div','gnd-viz-status','No comparable budgets'));return}
    const grid=element('div','gnd-waffle-grid');grid.setAttribute('role','img');grid.setAttribute('aria-label',data.buckets.map(bucket=>bucket.count+' '+bucket.label).join(', '));
    data.buckets.forEach(bucket=>bucket.users.forEach(user=>{const cell=element('i','gnd-waffle-cell '+bucket.key);cell.setAttribute('aria-hidden','true');cell.title=(user.name||'User')+' · '+Math.round(user.usage)+'% used';grid.append(cell)}));
    card.append(grid);
    const legend=element('div','gnd-waffle-legend');
    data.buckets.forEach(bucket=>{const item=element('span','');item.append(element('i',bucket.key),element('strong','',String(bucket.count)),document.createTextNode(' '+bucket.label));legend.append(item)});card.append(legend);
    if(data.excluded.length){const details=element('details','gnd-viz-excluded');details.append(element('summary','',data.excluded.length+' user'+(data.excluded.length===1?'':'s')+' without comparable budgets'));data.excluded.forEach(user=>{const row=element('div','gnd-tooltip-pair');row.append(element('span','',user.name),element('strong','',user.limit===null?'No limit':user.limit===0?'Zero limit':'No usage'));details.append(row)});card.append(details)}
  }
  return {distribution,utilization,budget,waffle,render};
});
