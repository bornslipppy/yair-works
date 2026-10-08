(function(){
'use strict';
var TYPES=[
  {key:'model',label:'Model'},
  {key:'vendor',label:'Provider'},
  {key:'atype',label:'Source'},
  {key:'people',label:'User'},
  {key:'unit',label:'Group'},
  {key:'keys',label:'Agent key'}
];
var STATUSES=[
  {key:'approaching',label:'Approaching'},
  {key:'atlimit',label:'At limit'},
  {key:'blocked',label:'Blocked'},
  {key:'pending',label:'Pending requests'},
  {key:'ontrack',label:'On track'},
  {key:'nolimit',label:'No limit set'},
  {key:'exceeded',label:'Exceeded'},
  {key:'expired',label:'Expired'}
];
function emptyBy(){var out={};TYPES.forEach(function(t){out[t.key]=[]});return out}
function cloneBy(src){var out={};TYPES.forEach(function(t){out[t.key]=(src[t.key]||[]).slice()});return out}
function sameList(a,b){return a.length===b.length&&a.slice().sort().every(function(x,i){return x===b.slice().sort()[i]})}
function init(){
  var D=window.__D,bar=document.querySelector('.view-gain .gnbar'),legacy=document.getElementById('gn-slice');
  if(!D||!bar||!legacy||document.getElementById('usage-filter-trigger'))return;
  var node=function(tag,text,cls){var e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
  var icon=function(){var s=node('span');s.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6"/></svg>';return s.firstChild};
  var checkboxMark=function(){var s=node('span',undefined,'accp-cb');s.innerHTML='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg>';return s};
  var committed=emptyBy(),statuses=[],draft=emptyBy(),draftStatuses=[];
  var openPanel=null;
  window.__usageFilter={filters:[],statuses:[]};

  // Use the same underline tab component as Access / Registry in Model access.
  var sourceButton=legacy.querySelector('[data-slice="source"]');
  sourceButton.dataset.slice='sources';sourceButton.textContent='Sources';
  legacy.querySelector('[data-slice="agent"]').remove();
  legacy.querySelector('[data-slice="people"]').textContent='Users';
  var breakdown=node('nav',undefined,'rotabs usage-breakdown-tabs');
  breakdown.setAttribute('role','tablist');breakdown.setAttribute('aria-label','Break down usage by');
  Array.from(legacy.querySelectorAll('[data-slice]:not([data-slice="sessions"])')).forEach(function(button){
    var tab=node('button',button.textContent.trim(),'cptab');tab.type='button';tab.setAttribute('role','tab');tab.dataset.slice=button.dataset.slice;
    var sync=function(){var selected=(window.__gainSlice||'unit')===button.dataset.slice;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1};
    tab.onclick=function(){button.click();sync()};button.addEventListener('click',function(){breakdown.querySelectorAll('[role="tab"]').forEach(function(other){other.setAttribute('aria-selected','false');other.tabIndex=-1});sync()});sync();breakdown.append(tab);
  });
  breakdown.addEventListener('keydown',function(e){
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    var tabs=Array.from(breakdown.querySelectorAll('[role="tab"]')),current=tabs.indexOf(document.activeElement),next=current;
    if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else next=(current+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    e.preventDefault();tabs[next].focus();tabs[next].click();
  });
  bar.before(breakdown);legacy.hidden=true;legacy.style.display='none';

  function trigger(id,label){
    var b=node('button',undefined,'hfb usage-filter-trigger');b.type='button';b.id=id;b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-expanded','false');
    b.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16l-6.5 7.6V19l-3 1.6v-8L4 5z"/></svg><span>'+label+'</span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    return b;
  }
  var filterTrigger=trigger('usage-filter-trigger','Filters');
  var statusTrigger=trigger('usage-status-trigger','Spend status');
  var clear=node('button','Clear','ovreset usage-filter-clear');clear.type='button';clear.hidden=true;
  var spacer=Array.from(bar.children).find(function(n){return n.tagName==='SPAN'&&n.style.flex==='1'});
  bar.insertBefore(filterTrigger,spacer||document.getElementById('gncus-dd'));
  bar.insertBefore(statusTrigger,spacer||document.getElementById('gncus-dd'));
  bar.insertBefore(clear,spacer||document.getElementById('gncus-dd'));

  var scope=node('section',undefined,'ovscope usage-applied-scope');scope.setAttribute('aria-label','Usage filters');scope.hidden=true;bar.after(scope);
  function selectedCount(src){return TYPES.reduce(function(n,t){return n+(src[t.key]||[]).length},0)}
  function categoryCount(src){return TYPES.filter(function(t){return (src[t.key]||[]).length}).length}
  function publish(){
    window.__usageFilter={filters:TYPES.filter(function(t){return committed[t.key].length}).map(function(t){return {dim:t.key,sel:committed[t.key].slice()}}),statuses:statuses.slice()};
    window.__drawUsage?.();renderScope();
  }
  function removeValue(key,value){
    if(key==='status')statuses=value===undefined?[]:statuses.filter(function(x){return x!==value});
    else committed[key]=value===undefined?[]:committed[key].filter(function(x){return x!==value});
    publish();
  }
  function rule(connector,label,values,key,status){
    var row=node('div',undefined,'ovscope-rule');row.setAttribute('role','group');row.setAttribute('aria-label',label+' filter');
    row.append(node('span',connector,'ovscope-connector'),node('span',label,'ovscope-category'),node('span','is any of','ovscope-operator'));
    var chips=node('div',undefined,'ovscope-values');
    values.forEach(function(value){
      var display=status?(STATUSES.find(function(x){return x.key===value})||{}).label:value;
      var chip=node('span',undefined,'ovscope-chip');chip.append(node('span',display));
      var remove=node('button');remove.type='button';remove.setAttribute('aria-label','Remove '+display+' from '+label.toLowerCase()+' filter');remove.append(icon());remove.onclick=function(){removeValue(key,value)};chip.append(remove);chips.append(chip);
    });
    var removeRule=node('button',undefined,'ovscope-remove-rule');removeRule.type='button';removeRule.setAttribute('aria-label','Remove '+label.toLowerCase()+' filter');removeRule.append(icon());removeRule.onclick=function(){removeValue(key)};
    row.append(chips,removeRule);(scope.querySelector('.ovscope-groups')||scope).append(row);
  }
  function renderScope(){
    scope.replaceChildren(node('div',undefined,'ovscope-groups'));var connector='Where';
    TYPES.forEach(function(t){if(committed[t.key].length){rule(connector,t.label,committed[t.key],t.key,false);connector='And'}});
    if(statuses.length)rule(connector,'Spend status',statuses,'status',true);
    var active=selectedCount(committed)+statuses.length>0;scope.hidden=!active;scope.toggleAttribute('data-filtered',active);clear.hidden=!active;
    var cats=categoryCount(committed);filterTrigger.querySelector('span').textContent=cats?'Filters · '+cats:'Filters';filterTrigger.toggleAttribute('data-on',!!cats);
    statusTrigger.querySelector('span').textContent=statuses.length?'Spend status · '+statuses.length:'Spend status';statusTrigger.toggleAttribute('data-on',!!statuses.length);
    filterTrigger.title=cats?'Categories combine with AND; values within a category combine with OR.':'Filter usage';
    statusTrigger.title=statuses.length?statuses.map(function(key){return STATUSES.find(function(s){return s.key===key}).label}).join(', '):'Filter by spend status';
  }
  clear.onclick=function(){committed=emptyBy();statuses=[];draft=emptyBy();draftStatuses=[];close();publish()};

  function shell(id,title,description){
    var panel=node('section',undefined,'usage-filter-panel');panel.id=id;panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label',title);panel.tabIndex=-1;
    var head=node('header');head.append(node('strong',title));
    if(description){var help=node('button','?','platform-copy-help');help.type='button';help.setAttribute('aria-label','How '+title.toLowerCase()+' works');var tip=node('span',description);tip.setAttribute('role','tooltip');help.append(tip);head.append(help)}
    panel.append(head);document.body.append(panel);return panel;
  }
  var attributePanel=shell('usage-filter-panel','Filter usage','Match every category (AND). Within a category, include any selected value (OR).');
  var filterBody=node('div',undefined,'usage-filter-body'),typeList=node('nav',undefined,'usage-filter-types'),valuePane=node('div',undefined,'usage-filter-values-pane');
  var itemTitle=node('strong',undefined,'usage-filter-item-title'),search=node('input');search.type='search';
  var allLabel=node('label',undefined,'usage-filter-all accp-allrow'),allBox=node('input'),allText=node('span','Select all');allBox.type='checkbox';allLabel.append(allBox,checkboxMark(),allText);
  var valueList=node('div',undefined,'usage-filter-list');valuePane.append(itemTitle,search,allLabel,valueList);filterBody.append(typeList,valuePane);attributePanel.append(filterBody);
  var filterFooter=node('footer'),filterClear=node('button','Clear all','accbtn'),filterCancel=node('button','Cancel','bgb'),filterApply=node('button','Apply filters','cta');[filterClear,filterCancel,filterApply].forEach(function(b){b.type='button'});filterFooter.append(filterClear,node('span',undefined,'usage-filter-footer-space'),filterCancel,filterApply);attributePanel.append(filterFooter);
  var currentType=TYPES[0];
  function itemsOf(type){var d=D.dims[type.key];return d?(d.full||d.cats):[]}
  function visibleItems(){var q=search.value.trim().toLowerCase();return itemsOf(currentType).filter(function(x){return !q||x.toLowerCase().includes(q)})}
  function renderTypes(){
    typeList.replaceChildren();TYPES.forEach(function(t){var b=node('button',undefined);b.type='button';b.setAttribute('aria-pressed',String(t===currentType));b.append(node('span',t.label),node('small',draft[t.key].length||''));b.onclick=function(){currentType=t;search.value='';renderFilter()};typeList.append(b)});
  }
  function renderFilter(){
    renderTypes();var values=visibleItems(),selected=draft[currentType.key];itemTitle.textContent=currentType.label+' · include any';search.placeholder='Search '+currentType.label.toLowerCase()+'…';search.setAttribute('aria-label','Search '+currentType.label.toLowerCase());valueList.replaceChildren();
    values.forEach(function(value){var label=node('label',undefined,'accp-item'),box=node('input');box.type='checkbox';box.checked=selected.includes(value);box.onchange=function(){var i=selected.indexOf(value);if(box.checked&&i<0)selected.push(value);if(!box.checked&&i>=0)selected.splice(i,1);renderFilter()};label.append(box,checkboxMark(),node('span',value));valueList.append(label)});
    if(!values.length)valueList.append(node('p','No matching '+currentType.label.toLowerCase()+'.','usage-filter-empty'));
    var n=values.filter(function(x){return selected.includes(x)}).length;allBox.checked=values.length>0&&n===values.length;allBox.indeterminate=n>0&&n<values.length;allBox.disabled=!values.length;allText.textContent=(search.value.trim()?'Select results':'Select all')+' ('+values.length+')';
    filterApply.disabled=TYPES.every(function(t){return sameList(draft[t.key],committed[t.key])});filterClear.disabled=!selectedCount(draft);
  }
  search.oninput=renderFilter;
  allBox.onchange=function(){var selected=draft[currentType.key];visibleItems().forEach(function(x){var i=selected.indexOf(x);if(allBox.checked&&i<0)selected.push(x);if(!allBox.checked&&i>=0)selected.splice(i,1)});renderFilter()};
  filterClear.onclick=function(){draft=emptyBy();renderFilter()};filterCancel.onclick=close;filterApply.onclick=function(){committed=cloneBy(draft);close();publish()};

  var statusPanel=shell('usage-status-panel','Filter by spend status','Include rows matching any selected status (OR).');
  var statusList=node('div',undefined,'usage-status-list');statusPanel.append(statusList);
  var statusFooter=node('footer'),statusClear=node('button','Clear all','accbtn'),statusCancel=node('button','Cancel','bgb'),statusApply=node('button','Apply status','cta');[statusClear,statusCancel,statusApply].forEach(function(b){b.type='button'});statusFooter.append(statusClear,node('span',undefined,'usage-filter-footer-space'),statusCancel,statusApply);statusPanel.append(statusFooter);
  function renderStatuses(){
    statusList.replaceChildren();STATUSES.forEach(function(status){var label=node('label',undefined,'accp-item'),box=node('input');box.type='checkbox';box.checked=draftStatuses.includes(status.key);box.onchange=function(){var i=draftStatuses.indexOf(status.key);if(box.checked&&i<0)draftStatuses.push(status.key);if(!box.checked&&i>=0)draftStatuses.splice(i,1);renderStatuses()};label.append(box,checkboxMark(),node('span',status.label));statusList.append(label)});
    statusApply.disabled=sameList(draftStatuses,statuses);statusClear.disabled=!draftStatuses.length;
  }
  statusClear.onclick=function(){draftStatuses=[];renderStatuses()};statusCancel.onclick=close;statusApply.onclick=function(){statuses=draftStatuses.slice();close();publish()};

  function position(panel,button){var r=button.getBoundingClientRect(),width=panel.offsetWidth||560,left=Math.max(8,Math.min(r.left,innerWidth-width-8)),below=innerHeight-r.bottom-16;panel.style.left=left+'px';panel.style.top=(below>260?r.bottom+8:Math.max(8,r.top-panel.offsetHeight-8))+'px';panel.style.maxHeight=Math.max(240,Math.min(620,innerHeight-24))+'px'}
  function open(panel,button){close();if(panel===attributePanel){draft=cloneBy(committed);currentType=TYPES.find(function(t){return draft[t.key].length})||TYPES[0];search.value='';renderFilter()}else{draftStatuses=statuses.slice();renderStatuses()}panel.hidden=false;openPanel={panel:panel,button:button};button.setAttribute('aria-expanded','true');position(panel,button);panel.focus()}
  function close(){if(!openPanel)return;openPanel.panel.hidden=true;openPanel.button.setAttribute('aria-expanded','false');openPanel=null}
  filterTrigger.onclick=function(e){e.stopPropagation();open(attributePanel,filterTrigger)};statusTrigger.onclick=function(e){e.stopPropagation();open(statusPanel,statusTrigger)};
  [attributePanel,statusPanel].forEach(function(panel){panel.onclick=function(e){e.stopPropagation()}});
  document.addEventListener('click',function(){close()});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&openPanel)close()});window.addEventListener('resize',function(){if(openPanel)position(openPanel.panel,openPanel.button)});

  // The existing alert calls to action now open the matching status view.
  var messages=document.querySelectorAll('.platform-usage-alert');
  function reviewSpendStatus(values){document.querySelector('[data-nav="gain"]')?.click();statuses=values;publish();statusTrigger.focus()}
  window.reviewUsageSpendStatus=reviewSpendStatus;
  if(messages[0]){messages[0].querySelector('.platform-usage-alert-message span:last-child').textContent='Limit issues';messages[0].querySelector('.platform-usage-alert-action').onclick=function(){reviewSpendStatus(['atlimit','blocked','exceeded'])}}
  if(messages[1]){messages[1].querySelector('.platform-usage-alert-message span:last-child').textContent='Pending requests';messages[1].querySelector('.platform-usage-alert-action').onclick=function(){reviewSpendStatus(['pending'])}}
  publish();
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',function(){setTimeout(init,30)}):setTimeout(init,30);
})();
