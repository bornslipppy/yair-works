(function(){'use strict';
  var page=document.getElementById('tasks-page');
  if(!page)return;
  var $=function(selector,root){return (root||document).querySelector(selector)};
  var $$=function(selector,root){return Array.prototype.slice.call((root||document).querySelectorAll(selector))};
  var esc=function(value){return String(value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})};
  var slug=function(value){return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')};
  var initials=function(value){return value.split(/\s+/).map(function(part){return part[0]}).join('').slice(0,2).toUpperCase()};
  var money=function(value){return '$'+value.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})};
  var shortMoney=function(value){return value===0?'—':money(value)};
  var now=new Date();

  var titles=[
    'Fix login redirect bug','Update onboarding flow copy','Investigate API rate limit spike',
    'Refactor billing webhook handler','Add retry logic to sync job','Improve dashboard load time',
    'Write integration tests for export','Clean up unused feature flags','Optimize image upload pipeline',
    'Draft quarterly planning doc','Review pull request: auth middleware','Debug flaky CI test',
    'Migrate legacy config format','Tune search relevance ranking','Set up staging environment alerts',
    'Fix flaky checkout test','Refactor billing service','Bound Go lint concurrency',
    'Add retry to webhook sender','Migrate auth to new SDK','Investigate memory leak in worker',
    'Review PR #4021','Update Terraform for staging','Draft Q3 pricing analysis',
    'Add rate limiting to API','Summarize support ticket backlog','Port date parser to Go',
    'Triage failing CI suite','Draft incident postmortem','Optimize slow Postgres query',
    'Sync design tokens to code','Generate API client from OpenAPI spec','Bump dependency majors',
    'Backfill missing analytics events','Review security findings'
  ];
  var developers=['Maya Levin','Liam Chen','Priya Raman','Tomas Vidal','Sana Malik','Elin Bergström','Marco Rinaldi','Yuki Tanaka'];
  var developerGroups={'Maya Levin':'Product Eng','Liam Chen':'Product Eng','Priya Raman':'Data & Analytics','Tomas Vidal':'Clinical Ops','Sana Malik':'Customer Ops','Elin Bergström':'Corporate','Marco Rinaldi':'Finance','Yuki Tanaka':'Quality & Safety'};
  var models=['Claude Sonnet 5','GPT-6 Astra','Claude Opus 5','Gemini 3 Pro','GPT-5.1','Claude Haiku 4.5'];
  var providers={'Claude Sonnet 5':'Anthropic','Claude Opus 5':'Anthropic','Claude Haiku 4.5':'Anthropic','GPT-6 Astra':'OpenAI','GPT-5.1':'OpenAI','Gemini 3 Pro':'Google'};
  var sources=['Wonderful Code','API','Web','Slack'];
  var statuses=['Done','Running','Done','Idle','Failed','Done'];
  var tasks=titles.map(function(title,index){
    var developer=developers[(index*3+2)%developers.length],model=models[(index*5+1)%models.length];
    var total=18400+(index*7919)%126000,input=Math.round(total*.52),cached=Math.round(total*.29),output=total-input-cached;
    return {id:'task-'+(index+1),title:title,slug:slug(title),developer:developer,group:developerGroups[developer],model:model,provider:providers[model],source:sources[(index*7+1)%sources.length],status:statuses[(index*5+2)%statuses.length],cost:index%9===0?0:+(4.75+((index*187)%9600)/37).toFixed(2),lastMin:index<4?[18,74,190,510][index]:(index*317)%(60*24*72)+720,turns:4+(index*7)%18,tokens:{total:total,input:input,cached:cached,output:output},repo:'https://github.com/wonderfulcx/wonderful-ai-gateway-mock.git',branch:'task/'+slug(title).slice(0,32)};
  });
  tasks=window.TaskStore.seed(tasks);
  window.__tasksData=tasks;

  var state={query:'',time:'all',from:null,to:null,page:1,pageSize:10,filters:{status:new Set(),developer:new Set(),group:new Set(),model:new Set(),provider:new Set(),source:new Set()}};
  var draft=null,activeType='status',lastFilterTrigger=null;
  var definitions=[
    {id:'status',label:'Status',value:function(task){return task.status}},
    {id:'developer',label:'User',value:function(task){return task.developer}},
    {id:'group',label:'Group',value:function(task){return task.group}},
    {id:'model',label:'Model',value:function(task){return task.model}},
    {id:'provider',label:'Provider',value:function(task){return task.provider}},
    {id:'source',label:'Source',value:function(task){return task.source}}
  ];
  definitions.forEach(function(def){def.options=Array.from(new Set(tasks.map(def.value))).sort(function(a,b){return a.localeCompare(b)})});
  var rowsHost=$('#tasks-rows'),empty=$('#tasks-empty'),pages=$('#tasks-pages');
  var filterTrigger=$('#tasks-filter-trigger'),filterPopover=$('#tasks-filter-popover'),filterTypes=$('#tasks-filter-types'),filterList=$('#tasks-filter-list'),filterSearch=$('#tasks-filter-search'),filterAll=$('#tasks-filter-all'),filterAllLabel=$('#tasks-filter-all-label');
  var timeWrap=$('#tasks-time-dd'),timeTrigger=$('#tasks-time-trigger'),timeMenu=$('#tasks-time-menu'),timePresets=$('#tasks-time-presets'),customRange=$('#tasks-custom-range');
  document.body.appendChild(filterPopover);

  function ago(min){
    if(min<60)return Math.max(1,Math.round(min))+'m ago';
    if(min<1440)return Math.round(min/60)+'h ago';
    return Math.round(min/1440)+'d ago';
  }
  function dateFor(task){return new Date(now.getTime()-task.lastMin*60000)}
  function modelMark(model){return model.indexOf('Claude')===0?'A':model.indexOf('GPT')===0?'O':'G'}
  function selectedCount(source){return definitions.reduce(function(total,def){return total+source[def.id].size},0)}
  function cloneFilters(source){var out={};definitions.forEach(function(def){out[def.id]=new Set(source[def.id])});return out}
  function activeRows(){
    var query=state.query.trim().toLowerCase();
    var output=tasks.filter(function(task){
      if(query&&[task.title,task.developer,task.group,task.model,task.provider,task.source,task.status].join(' ').toLowerCase().indexOf(query)<0)return false;
      var minutes=task.lastMin;
      if(state.time==='today'&&minutes>1440)return false;
      if(state.time==='7d'&&minutes>10080)return false;
      if(state.time==='30d'&&minutes>43200)return false;
      if(state.time==='mtd'&&dateFor(task).getMonth()!==now.getMonth())return false;
      if(state.time==='custom'){
        var date=dateFor(task),from=state.from?new Date(state.from+'T00:00:00'):null,to=state.to?new Date(state.to+'T23:59:59'):null;
        if(from&&date<from||to&&date>to)return false;
      }
      return definitions.every(function(def){return !state.filters[def.id].size||state.filters[def.id].has(def.value(task))});
    });
    output.sort(function(a,b){return a.lastMin-b.lastMin});
    return output;
  }
  function taskRow(task){
    return '<tr class="platform-table-row" data-task-slug="'+task.slug+'">'
      +'<td class="platform-table-data-cell platform-column-cell"><div data-task-cell><span class="tasks-task-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 9 1.5 1.5L12 8M14 9h3M8 15h9"/></svg></span><span class="tasks-task-copy"><a class="tasks-task-link" href="#task/'+task.slug+'">'+esc(task.title)+'</a><small class="tasks-task-source">'+esc(task.source)+'</small></span></div></td>'
      +'<td class="platform-table-data-cell platform-column-cell"><span class="tasks-person"><span class="tasks-avatar">'+initials(task.developer)+'</span><span class="tasks-person-copy">'+esc(task.developer)+'<small>'+esc(task.group)+'</small></span></span></td>'
      +'<td class="platform-table-data-cell platform-column-cell"><span class="tasks-model"><span class="tasks-model-mark">'+modelMark(task.model)+'</span><span>'+esc(task.model)+'</span></span></td>'
      +'<td class="platform-table-data-cell platform-column-cell tasks-num" data-sort-value="'+task.cost+'">'+shortMoney(task.cost)+'</td>'
      +'<td class="platform-table-data-cell platform-column-cell" data-sort-value="'+(999999-task.lastMin)+'">'+ago(task.lastMin)+'</td>'
      +'<td class="platform-table-data-cell platform-column-cell"><span class="tasks-status" data-status="'+task.status+'">'+task.status+'</span></td></tr>';
  }
  function renderPagination(total){
    var count=Math.max(1,Math.ceil(total/state.pageSize));
    if(state.page>count)state.page=count;
    var html='<button type="button" data-page="prev" aria-label="Previous page"'+(state.page===1?' disabled':'')+'>‹</button>';
    for(var i=1;i<=count;i++)html+='<button type="button" data-page="'+i+'"'+(i===state.page?' aria-current="page"':'')+'>'+i+'</button>';
    html+='<button type="button" data-page="next" aria-label="Next page"'+(state.page===count?' disabled':'')+'>›</button>';
    pages.innerHTML=html;
  }
  function render(){
    var filtered=activeRows(),start=(state.page-1)*state.pageSize,visible=filtered.slice(start,start+state.pageSize);
    rowsHost.innerHTML=visible.map(taskRow).join('');
    empty.hidden=visible.length>0;
    $('.tasks-table',page).hidden=!visible.length;
    renderPagination(filtered.length);renderChips();
    requestAnimationFrame(function(){if(window.PlatformUI&&window.PlatformUI.enhanceResizableTables)window.PlatformUI.enhanceResizableTables()});
  }
  function renderChips(){
    var host=$('#tasks-filter-chips'),wrap=$('#tasks-active-filters'),count=selectedCount(state.filters),html=[],row=0;
    definitions.forEach(function(def){
      if(!state.filters[def.id].size)return;
      var chips=[];
      state.filters[def.id].forEach(function(value){chips.push('<span class="ovscope-chip"><span>'+esc(value)+'</span><button type="button" data-filter-type="'+def.id+'" data-filter-value="'+esc(value)+'" aria-label="Remove '+esc(def.label)+' '+esc(value)+'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M8 10v8M12 10v8M16 10v8M6 7l1 14h10l1-14"/></svg></button></span>')});
      html.push('<div class="ovscope-rule"><span class="ovscope-connector">'+(row++?'And':'Where')+'</span><span class="ovscope-category">'+def.label+'</span><span class="ovscope-operator">is any of</span><span class="ovscope-values">'+chips.join('')+'</span><button type="button" class="ovscope-remove-rule" data-filter-type="'+def.id+'" aria-label="Remove '+def.label+' filter"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M8 10v8M12 10v8M16 10v8M6 7l1 14h10l1-14"/></svg></button></div>');
    });
    host.innerHTML=html.join('');wrap.hidden=!count;wrap.toggleAttribute('data-filtered',!!count);filterTrigger.toggleAttribute('data-on',!!count);$('#tasks-filter-count').textContent=count;$('#tasks-filter-count').hidden=!count;$('#tasks-clear-filters').hidden=!count;
  }
  function renderFilterTypes(){
    filterTypes.innerHTML=definitions.map(function(def){var n=draft[def.id].size;return '<button type="button" data-filter-tab="'+def.id+'" aria-pressed="'+(activeType===def.id)+'"><span>'+def.label+'</span><small>'+(n||'')+'</small></button>'}).join('');
  }
  function filteredOptions(){
    var def=definitions.find(function(item){return item.id===activeType}),query=filterSearch.value.trim().toLowerCase();
    return def.options.filter(function(option){return option.toLowerCase().indexOf(query)>=0});
  }
  function renderFilterValues(){
    var def=definitions.find(function(item){return item.id===activeType}),options=filteredOptions();
    $('#tasks-filter-item-title').textContent=def.label;filterSearch.placeholder='Search '+def.label.toLowerCase();filterAllLabel.textContent='Select all ('+options.length+')';
    filterList.innerHTML=options.map(function(option){return '<label class="accp-item"><input type="checkbox" value="'+esc(option)+'"'+(draft[activeType].has(option)?' checked':'')+'><span class="accp-cb"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="m4 12 5 5L20 6"/></svg></span><span>'+esc(option)+'</span></label>'}).join('')||'<div class="usage-filter-empty">No matching options</div>';
    var checked=options.filter(function(option){return draft[activeType].has(option)}).length;
    filterAll.checked=options.length>0&&checked===options.length;filterAll.indeterminate=checked>0&&checked<options.length;
  }
  function positionFilters(){
    var rect=filterTrigger.getBoundingClientRect(),width=Math.min(580,innerWidth-16),height=Math.min(520,innerHeight-16),left=Math.max(8,Math.min(rect.left,innerWidth-width-8));
    var top=rect.bottom+8+height<=innerHeight?rect.bottom+8:Math.max(12,rect.top-height-8);
    filterPopover.style.left=left+'px';filterPopover.style.top=top+'px';
  }
  function openFilters(){
    draft=cloneFilters(state.filters);activeType=definitions.find(function(def){return draft[def.id].size})?.id||'status';filterSearch.value='';renderFilterTypes();renderFilterValues();filterPopover.hidden=false;positionFilters();filterTrigger.setAttribute('aria-expanded','true');lastFilterTrigger=filterTrigger;filterSearch.focus({preventScroll:true});
  }
  function closeFilters(){filterPopover.hidden=true;filterTrigger.setAttribute('aria-expanded','false');if(lastFilterTrigger)lastFilterTrigger.focus({preventScroll:true})}
  function dateInputValue(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')}
  function setTime(value,label){
    state.time=value;state.page=1;$('#tasks-time-label').textContent=label;$$('[data-time]',timeMenu).forEach(function(button){button.setAttribute('aria-checked',String(button.dataset.time===value));button.toggleAttribute('data-on',button.dataset.time===value)});timeWrap.removeAttribute('data-open');customRange.hidden=true;timePresets.hidden=false;timeTrigger.setAttribute('aria-expanded','false');render();
  }
  function compactNumber(value){return value>=1000000?(value/1000000).toFixed(2)+'M':value>=1000?(value/1000).toFixed(1)+'K':String(value)}
  function tokenChart(task){
    var total=task.tokens.total||1,input=task.tokens.input/total*100,cached=task.tokens.cached/total*100;
    return '<section class="tasks-detail-card tasks-token-card"><div class="tasks-token-donut" role="img" aria-label="Token distribution: '+compactNumber(task.tokens.input)+' input, '+compactNumber(task.tokens.cached)+' cached, '+compactNumber(task.tokens.output)+' output" style="--tasks-token-input:'+input.toFixed(2)+'%;--tasks-token-cached:'+(input+cached).toFixed(2)+'%"><span><small>Tokens</small><strong>'+compactNumber(task.tokens.total)+'</strong></span></div><div class="tasks-token-legend">'
      +'<span><i data-token="input"></i>Input<strong>'+compactNumber(task.tokens.input)+'</strong></span>'
      +'<span><i data-token="cached"></i>Cached<strong>'+compactNumber(task.tokens.cached)+'</strong></span>'
      +'<span><i data-token="output"></i>Output<strong>'+compactNumber(task.tokens.output)+'</strong></span></div></section>';
  }
  function detailMarkup(task){
    return '<section class="tasks-detail-stats" aria-label="Task summary">'
      +'<div class="tasks-detail-card tasks-detail-stat"><span>Estimated cost</span><strong>'+shortMoney(task.cost)+'</strong></div>'
      +'<div class="tasks-detail-card tasks-detail-stat"><span>Tokens</span><strong>'+compactNumber(task.tokens.total)+'</strong></div>'
      +'<div class="tasks-detail-card tasks-detail-stat"><span>'+(task.usageRecord?'Requests':'Turns')+'</span><strong>'+task.turns.toLocaleString('en-US')+'</strong></div></section>'
      +(task.period?'<section class="tasks-detail-card"><span>Usage period</span><p>'+esc(task.period)+'</p></section>':'')
      +'<section class="tasks-detail-card tasks-detail-context"><div><span>Repo</span><a href="'+esc(task.repo)+'" target="_blank" rel="noopener">'+esc(task.repo)+'</a></div><div><span>Branch</span><strong>'+esc(task.branch)+'</strong></div><div><span>Model</span><strong>'+esc(task.model)+'</strong></div><div><span>Source</span><strong>'+esc(task.source)+'</strong></div></section>'
      +tokenChart(task)
      +'<section class="tasks-detail-card"><h3>Activity</h3><div class="tasks-detail-events">'
      +'<div class="tasks-detail-event"><i></i><div><strong>Task started</strong><p>'+esc(task.developer)+' started this task in '+esc(task.source)+'.</p></div></div>'
      +'<div class="tasks-detail-event"><i></i><div><strong>'+esc(task.model)+' selected</strong><p>'+esc(task.provider)+' handled the model request.</p></div></div>'
      +'<div class="tasks-detail-event"><i></i><div><strong>'+(task.status==='Running'?'Latest activity':'Task '+task.status.toLowerCase())+'</strong><p>'+ago(task.lastMin)+' · '+shortMoney(task.cost)+' total cost</p></div></div>'
      +'</div></section>';
  }
  function openDetail(task){
    if(!task)return;$('#tasks-detail-title').textContent=task.title;$('#tasks-detail-meta').textContent=task.developer+' · '+task.model;$('#tasks-detail-body').innerHTML=detailMarkup(task);$('#tasks-detail').setAttribute('data-open','');$('#tasks-detail').setAttribute('aria-hidden','false');$('#tasks-detail-backdrop').setAttribute('data-open','');document.documentElement.style.overflow='hidden';$$('[data-task-slug]').forEach(function(row){row.toggleAttribute('data-focus',row.dataset.taskSlug===task.slug)});setTimeout(function(){$('#tasks-detail-close').focus({preventScroll:true})},0);
  }
  function closeDetail(clearHash){
    var wasOpen=$('#tasks-detail').hasAttribute('data-open');
    $('#tasks-detail').removeAttribute('data-open');$('#tasks-detail').setAttribute('aria-hidden','true');$('#tasks-detail-backdrop').removeAttribute('data-open');if(wasOpen)document.documentElement.style.overflow='';$$('[data-task-slug]').forEach(function(row){row.removeAttribute('data-focus')});if(clearHash&&location.hash.indexOf('#task/')===0)history.replaceState(null,'','#gateway/tasks');
  }
  function navigateToTask(slugValue,fromHistory){
    var task=tasks.find(function(item){return item.slug===slugValue});if(!task)return;
    if(!fromHistory&&location.hash!=='#task/'+slugValue)history.pushState(null,'','#task/'+slugValue);
    var radio=$('#nv-tasks');radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));state.query='';state.time='all';
    definitions.forEach(function(def){state.filters[def.id].clear();def.options=Array.from(new Set(tasks.map(def.value))).sort(function(a,b){return a.localeCompare(b)});});
    state.page=Math.floor(tasks.slice().sort(function(a,b){return a.lastMin-b.lastMin}).findIndex(function(item){return item.slug===slugValue})/state.pageSize)+1;$('#tasks-search').value='';$('#tasks-time-label').textContent='All time';timeWrap.removeAttribute('data-open');render();requestAnimationFrame(function(){if(location.hash==='#task/'+slugValue)openDetail(task)});
  }

  $('#tasks-search').addEventListener('input',function(){state.query=this.value;state.page=1;render()});
  pages.addEventListener('click',function(event){var button=event.target.closest('button[data-page]');if(!button||button.disabled)return;var count=Math.max(1,Math.ceil(activeRows().length/state.pageSize));state.page=button.dataset.page==='prev'?Math.max(1,state.page-1):button.dataset.page==='next'?Math.min(count,state.page+1):Number(button.dataset.page);render();page.scrollIntoView({block:'start',behavior:'smooth'})});
  filterTrigger.addEventListener('click',function(event){event.stopPropagation();filterPopover.hidden?openFilters():closeFilters()});
  filterTypes.addEventListener('click',function(event){var button=event.target.closest('[data-filter-tab]');if(!button)return;activeType=button.dataset.filterTab;filterSearch.value='';renderFilterTypes();renderFilterValues()});
  filterList.addEventListener('change',function(event){var input=event.target.closest('input[type=checkbox]');if(!input)return;input.checked?draft[activeType].add(input.value):draft[activeType].delete(input.value);renderFilterTypes();renderFilterValues()});
  filterSearch.addEventListener('input',renderFilterValues);
  filterAll.addEventListener('change',function(){filteredOptions().forEach(function(option){filterAll.checked?draft[activeType].add(option):draft[activeType].delete(option)});renderFilterTypes();renderFilterValues()});
  $('#tasks-filter-clear').addEventListener('click',function(){definitions.forEach(function(def){draft[def.id].clear()});renderFilterTypes();renderFilterValues()});
  $('#tasks-filter-cancel').addEventListener('click',closeFilters);
  $('#tasks-filter-apply').addEventListener('click',function(){state.filters=cloneFilters(draft);state.page=1;closeFilters();render()});
  $('#tasks-clear-filters').addEventListener('click',function(){definitions.forEach(function(def){state.filters[def.id].clear()});state.page=1;render()});
  $('#tasks-filter-chips').addEventListener('click',function(event){var button=event.target.closest('button[data-filter-type]');if(!button)return;var set=state.filters[button.dataset.filterType];button.hasAttribute('data-filter-value')?set.delete(button.dataset.filterValue):set.clear();state.page=1;render()});
  timeTrigger.addEventListener('click',function(event){event.stopPropagation();var open=!timeWrap.hasAttribute('data-open');timeWrap.toggleAttribute('data-open',open);timeTrigger.setAttribute('aria-expanded',String(open));if(!open){customRange.hidden=true;timePresets.hidden=false}});
  timeMenu.addEventListener('click',function(event){var button=event.target.closest('button[data-time]');if(!button)return;event.stopPropagation();if(button.dataset.time==='custom'){
      timePresets.hidden=true;customRange.hidden=false;var to=new Date(),from=new Date(to.getTime()-29*86400000);$('#tasks-date-from').value=state.from||dateInputValue(from);$('#tasks-date-to').value=state.to||dateInputValue(to);return;
    }setTime(button.dataset.time,button.textContent.trim())});
  $('#tasks-time-back').addEventListener('click',function(event){event.stopPropagation();customRange.hidden=true;timePresets.hidden=false});
  $('#tasks-time-cancel').addEventListener('click',function(event){event.stopPropagation();timeWrap.removeAttribute('data-open');customRange.hidden=true;timePresets.hidden=false;timeTrigger.setAttribute('aria-expanded','false')});
  $('#tasks-date-apply').addEventListener('click',function(event){event.stopPropagation();state.from=$('#tasks-date-from').value;state.to=$('#tasks-date-to').value;if(!state.from||!state.to)return;var from=new Date(state.from+'T00:00:00'),to=new Date(state.to+'T00:00:00');if(from>to){var swap=state.from;state.from=state.to;state.to=swap}setTime('custom',new Date(state.from+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})+' – '+new Date(state.to+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}))});
  $('#tasks-detail-close').addEventListener('click',function(){closeDetail(true)});$('#tasks-detail-backdrop').addEventListener('click',function(){closeDetail(true)});
  document.addEventListener('click',function(event){if(!filterPopover.hidden&&!filterPopover.contains(event.target)&&!filterTrigger.contains(event.target))closeFilters();if(timeWrap.hasAttribute('data-open')&&!timeWrap.contains(event.target)){timeWrap.removeAttribute('data-open');customRange.hidden=true;timePresets.hidden=false;timeTrigger.setAttribute('aria-expanded','false')}});
  document.addEventListener('keydown',function(event){if(event.key!=='Escape')return;if($('#tasks-detail').hasAttribute('data-open')){closeDetail(true);return}if(!filterPopover.hidden){closeFilters();return}if(timeWrap.hasAttribute('data-open')){timeWrap.removeAttribute('data-open');customRange.hidden=true;timePresets.hidden=false;timeTrigger.setAttribute('aria-expanded','false');timeTrigger.focus({preventScroll:true})}});
  document.addEventListener('click',function(event){var link=event.target.closest('a[href^="#task/"]');if(!link)return;var slugValue=link.getAttribute('href').slice(6);if(!tasks.some(function(task){return task.slug===slugValue}))return;event.preventDefault();var usageDrawer=$('#gnd');if(usageDrawer&&usageDrawer.hasAttribute('data-open'))$('#gnd-x')?.click();navigateToTask(slugValue)},true);
  window.addEventListener('resize',function(){if(!filterPopover.hidden)positionFilters()});
  function followRoute(){var match=location.hash.match(/^#task\/(.+)$/);if(match)navigateToTask(match[1],true);else closeDetail(false);}
  window.addEventListener('popstate',followRoute);
  window.addEventListener('hashchange',followRoute);
  $('#nv-tasks').addEventListener('change',function(){if(this.checked){definitions.forEach(function(def){def.options=Array.from(new Set(tasks.map(def.value))).sort(function(a,b){return a.localeCompare(b)});});render();}});
  window.TasksUI={closeDetail:closeDetail};
  var direct=location.hash.match(/^#task\/(.+)$/);if(direct)navigateToTask(direct[1],true);else render();
})();
