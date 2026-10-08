(function(){
'use strict';
const P=window.PlatformUI={};
const $=s=>document.querySelector(s);
const E=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
P.department=n=>({'Product Eng':'Product Engineering','Customer Ops':'Customer Operations','Clinical Ops':'Clinical Operations','Corporate':'Corporate Services'}[n]||n);
P.toast=function(text,undo){if(P.accessToast)return P.accessToast(text,undo);let box=$('#platform-toast');if(!box){box=E('div',undefined,'platform-toast');box.id='platform-toast';box.setAttribute('role','status');box.setAttribute('aria-live','polite');document.body.append(box)}box.textContent=text;box.hidden=false;clearTimeout(P.toastTimer);P.toastTimer=setTimeout(()=>box.hidden=true,5000)};
P.clearErrors=function(root){root.querySelectorAll('.platform-field-error').forEach(n=>n.remove());root.querySelectorAll('[aria-invalid]').forEach(n=>{n.removeAttribute('aria-invalid');if(n.dataset.errorDescription){n.removeAttribute('aria-describedby');delete n.dataset.errorDescription}})};
P.fieldError=function(input,message){input.setAttribute('aria-invalid','true');const err=E('div',message,'platform-field-error');err.id=(input.id||'field')+'-error';if(!input.getAttribute('aria-describedby')){input.setAttribute('aria-describedby',err.id);input.dataset.errorDescription='1'}input.insertAdjacentElement('afterend',err)};
P.discard=function(done){
 let d=$('#platform-discard');if(d?.open)return;
 d=E('dialog',undefined,'platform-confirm');d.id='platform-discard';d.setAttribute('aria-labelledby','platform-discard-title');
 const h=E('h2','Discard unsaved changes?');h.id='platform-discard-title';d.append(h,E('p','Your changes will be lost.'));
 const foot=E('div',undefined,'platform-actions'),keep=E('button','Keep editing','platform-button'),discard=E('button','Discard changes','platform-button platform-danger');
 const back=document.activeElement;function close(){d.close();d.remove();if(back?.isConnected)back.focus()}
 keep.onclick=close;discard.onclick=()=>{close();done()};foot.append(keep,discard);d.append(foot);d.addEventListener('cancel',e=>{e.preventDefault();close()});document.body.append(d);d.showModal();keep.focus();
};
document.addEventListener('keydown',e=>{const d=$('#platform-discard');if(d?.open&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();d.querySelector('button').click()}},true);
P.panel=function(title,subtitle,canClose){const d=E('dialog',undefined,'platform-panel');d.setAttribute('aria-label',title);const head=E('header'),copy=E('div');copy.append(E('h2',title),E('p',subtitle));const x=E('button','×','platform-icon');x.setAttribute('aria-label','Close '+title);head.append(copy,x);const body=E('div',undefined,'platform-panel-body'),footer=E('footer'),close=E('button','Done','platform-button');footer.append(close);d.append(head,body,footer);const trigger=document.activeElement;const dismiss=(force=false)=>{if(!force&&canClose&&!canClose()){P.discard(()=>dismiss(true));return;}d.close();d.remove();if(trigger?.isConnected)trigger.focus()};x.onclick=close.onclick=()=>dismiss();d.addEventListener('cancel',e=>{e.preventDefault();dismiss()});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dismiss()}});document.body.append(d);d.showModal();x.focus();return {dialog:d,body,footer,close:()=>dismiss(true)}};
P.matches=function(policies,openPolicy){
 const panel=P.panel('Policy matches','Sample request activity · Aug 1–28, 2026');
 const toolbar=E('div',undefined,'platform-toolbar'),select=E('select'),search=E('input');select.setAttribute('aria-label','Filter matches by policy');select.append(new Option('All policies',''));policies.forEach(p=>select.append(new Option(p.name,p.id)));search.type='search';search.placeholder='Search matches';search.setAttribute('aria-label','Search policy matches');toolbar.append(search,select);panel.body.append(toolbar);
 const rows=E('div');panel.body.append(rows);
 const events=policies.flatMap(p=>Array.from({length:p.matches},(_,i)=>({p,check:p.criteria[i%p.criteria.length]||'Policy criterion',time:'Aug '+String(28-Math.floor(i/6)).padStart(2,'0')+', '+String(17-i%6).padStart(2,'0')+':'+String(i%4*15).padStart(2,'0'),id:p.id+'-'+String(i+1).padStart(3,'0')})));
 function paint(){const filtered=events.filter(x=>(!select.value||x.p.id===select.value)&&[x.p.name,x.check,x.id].join(' ').toLowerCase().includes(search.value.toLowerCase()));rows.replaceChildren();rows.append(E('p',filtered.length+' matched requests','platform-muted'));if(!filtered.length)rows.append(E('p','No matches for these filters.','platform-empty'));filtered.forEach(x=>{const row=E('button',undefined,'platform-event');row.append(E('strong',x.p.name),E('span',x.check),E('span',x.p.action==='block'?'Blocked':'Warned','platform-badge'),E('small',x.time));row.onclick=()=>{const detail=P.panel('Matched request',x.id+' · '+x.time+' · Sample event');detail.body.append(E('h3','Policy'),E('p',x.p.name),E('h3','Matched check'),E('p',x.check),E('h3','Result'),E('p',x.p.action==='block'?'Request blocked':'Request allowed with warning'),E('h3','Message shown'),E('p',x.p.reason||'No custom message.'));const view=E('button','View policy','platform-button platform-primary');view.onclick=()=>{detail.close();panel.close();openPolicy(x.p.id)};detail.footer.append(view)};rows.append(row)})}
 search.oninput=select.onchange=paint;paint();
};
// v3 drops widths saved before constrained drawer resizing. Those values could
// leave utility columns enormous or push the last drawer columns off-canvas.
const columnWidthStore='wonderful-column-widths-v3';
const columnOrderStore='wonderful-column-order-v1';
function savedColumnWidths(key){
 try{return JSON.parse(localStorage.getItem(columnWidthStore+'.'+key)||'null')}catch(_){return null}
}
function saveColumnWidths(key,widths){
 try{localStorage.setItem(columnWidthStore+'.'+key,JSON.stringify(widths.map(Math.round)))}catch(_){}
}
function savedColumnOrder(key){
 try{return JSON.parse(localStorage.getItem(columnOrderStore+'.'+key)||'null')}catch(_){return null}
}
function saveColumnOrder(key,order){
 try{localStorage.setItem(columnOrderStore+'.'+key,JSON.stringify(order))}catch(_){}
}
function columnLabel(cell,index){
 const clone=cell.cloneNode(true);clone.querySelectorAll('.qm,.qp,.ovgtip,.platform-copy-help,[role="tooltip"],.platform-column-drag,.platform-column-resizer,.platform-sort-chevrons,.ovgarrow').forEach(n=>n.remove());
 return (clone.textContent||'').replace(/\s+/g,' ').trim()||cell.getAttribute('aria-label')||'column '+(index+1);
}
function columnId(cell,index){return (cell.dataset.platformColumnId||columnLabel(cell,index).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'column-'+(index+1))}
function setColumnIds(header){const used={};[...header.children].forEach((cell,index)=>{if(cell.dataset.platformColumnId)return;const base=columnId(cell,index),n=used[base]=(used[base]||0)+1;cell.dataset.platformColumnId=base+(n>1?'-'+n:'')})}
function reorderChildren(row,indices){const children=[...row.children];if(children.length!==indices.length)return;indices.forEach(index=>row.append(children[index]))}
function restoreColumnOrder(header,rows,key){
 setColumnIds(header);const cells=[...header.children],current=cells.map((cell,index)=>columnId(cell,index)),saved=savedColumnOrder(key);
 const original=header._originalColumnOrder||(header._originalColumnOrder=current.slice());
 const desired=saved?.length===current.length&&saved.every(id=>current.includes(id))?saved:current;
 rows().forEach(row=>{
  const children=[...row.children];
  if(row!==header)children.forEach((cell,index)=>{if(!cell.dataset.platformColumnId)cell.dataset.platformColumnId=original[index]});
  const ids=children.map(cell=>cell.dataset.platformColumnId),indices=desired.map(id=>ids.indexOf(id));
  if(indices.some(i=>i<0)||indices.every((n,i)=>n===i))return;
  reorderChildren(row,indices);
 });
}
function sortChevrons(){const s=E('span',undefined,'platform-sort-chevrons');s.setAttribute('aria-hidden','true');s.innerHTML='<svg viewBox="0 0 12 12"><path d="M3 7.5 6 4.5l3 3"/></svg><svg viewBox="0 0 12 12"><path d="m3 4.5 3 3 3-3"/></svg>';return s}
function decorateSortCell(cell,target=cell){
 cell.dataset.platformSortable='';if(!target.querySelector(':scope > .platform-sort-chevrons'))target.append(sortChevrons());
}
function layoutColumnHeader(cell){
 if(!cell.textContent.trim()||cell.querySelector('input'))return;
 cell.classList.add('platform-column-header');
 const button=cell.querySelector('.platform-sort-label');
 if(button&&!button.querySelector('.platform-column-title')){
  const title=E('span',undefined,'platform-column-title');
  [...button.childNodes].filter(n=>!n.classList?.contains('platform-sort-chevrons')).forEach(n=>title.append(n));
  title.title=title.textContent.trim();button.prepend(title);
 }
 if(!cell.querySelector(':scope > .platform-header-content')){
  const content=E('span',undefined,'platform-header-content');
  [...cell.childNodes].filter(n=>!n.classList?.contains('platform-column-drag')&&!n.classList?.contains('platform-column-resizer')&&!n.classList?.contains('platform-sort-chevrons')).forEach(n=>content.append(n));
  // A fixed slot for controls allows only the label to shrink.
  if(!button){const title=E('span',undefined,'platform-column-title');while(content.firstChild)title.append(content.firstChild);title.title=title.textContent.replace(/[▼▲]/g,'').trim();content.append(title)}
  cell.append(content);
 }
 cell.querySelectorAll('.platform-column-title .qm').forEach(help=>cell.querySelector('.platform-header-content').append(help));
 cell.querySelectorAll('.platform-column-title').forEach(title=>title.title=columnLabel(title,0));
}
const tableMeasureCanvas=document.createElement('canvas');
function tableTextWidth(element){
 const clone=element.cloneNode(true);clone.querySelectorAll('.qp,.ovgtip,.platform-copy-help,[role="tooltip"],.platform-column-drag,.platform-column-resizer,.platform-sort-chevrons,.ovgarrow,[hidden]').forEach(n=>n.remove());
 const style=getComputedStyle(element),ctx=tableMeasureCanvas.getContext('2d');
 ctx.font=style.font||[style.fontWeight,style.fontSize,style.fontFamily].join(' ');
 const lines=(clone.innerText||clone.textContent||'').trim().split(/\n/).map(s=>s.replace(/\s+/g,' ').trim());
 return Math.ceil(Math.max(0,...lines.map(s=>ctx.measureText(s).width+Math.max(0,s.length-1)*(parseFloat(style.letterSpacing)||0))));
}
function tableDefaultWidths(cells,rows){
 return cells.map((cell,index)=>{
  const label=cell.querySelector('.platform-column-title')||cell;
  if(!label.textContent.trim()&&cell.querySelector('input'))return 40;
  // Checkbox/rank/action utility columns stay compact. Measuring their body
  // text made the blank rank column look like leading whitespace.
  if(!label.textContent.trim()){
   const values=rows.slice(0,60).filter(row=>row!==cell.parentElement).map(row=>row.children[index]).filter(Boolean),hasBodyText=values.some(target=>target.textContent.trim());
   if(!hasBodyText)return 12;
   if(values.filter(target=>target.textContent.trim()).every(target=>/^\d+$/.test(target.textContent.trim())))return 40;
   const body=Math.max(0,...values.map(target=>tableTextWidth(target)+32+(target.querySelector('svg,img,[class*="icon"],[class*="mark"],[class*="avatar"]')?24:0)));
   return Math.min(260,Math.max(64,body));
  }
  const header=tableTextWidth(label)+80+(cell.querySelector('.qm')?18:0);
  const body=Math.max(0,...rows.slice(0,60).filter(row=>row!==cell.parentElement).map(row=>{
   const target=row.children[index];if(!target)return 0;
   const mark=target.matches('.ovgs')||target.querySelector('svg,img,[style*="width"],[class*="icon"],[class*="mark"],[class*="avatar"]');
   return Math.min(440,tableTextWidth(target)+56+(mark?44:0));
  }));
  return Math.ceil(Math.max(100,header,body));
 });
}
function fitTableDefaults(widths,root,header){
 const style=getComputedStyle(header),gap=parseFloat(style.columnGap)||0,pad=(parseFloat(style.paddingLeft)||0)+(parseFloat(style.paddingRight)||0);
 const spare=root.clientWidth-pad-gap*(widths.length-1)-widths.reduce((sum,w)=>sum+w,0);
 if(spare>0){const index=[...header.children].findIndex(cell=>cell.textContent.trim());widths[Math.max(0,index)]+=Math.floor(spare)}
 return widths;
}
function tableContract(root,header,rows,native){
 root.classList.add('platform-data-table');header.classList.add('platform-table-header');
 const scroll=native?root.parentElement:root.id==='st-table'?root.parentElement:root.id==='vk-rows'?root.parentElement:root.matches('.view-mxr')?root.querySelector('.registry-scroll')||root:root;
 scroll?.classList.add('platform-table-scroll');
 if(scroll&&!scroll.hasAttribute('tabindex')){scroll.tabIndex=0;scroll.setAttribute('aria-label','Scrollable data table')}
 root.querySelectorAll('.bal-empty,.accp-empty,.gnd-empty').forEach(node=>node.classList.add('platform-table-empty'));
 [...header.children].forEach(cell=>cell.classList.add('platform-table-head-cell'));
 rows.forEach(row=>{if(row===header)return;row.classList.add('platform-table-row');[...row.children].forEach(cell=>cell.classList.add('platform-table-data-cell'))});
 const first=header.firstElementChild,last=header.lastElementChild;
 if(/^(Item|Entity|Rule|Model|Virtual key|Policy)$/i.test(columnLabel(first,0)))first.dataset.platformPinned='start';
 if(/^Actions$/i.test(columnLabel(last,header.children.length-1)))last.dataset.platformPinned='end';
 [...header.children].forEach((cell,index)=>{if(!cell.dataset.platformPinned)return;cell.dataset.tablePin=cell.dataset.platformPinned;rows.filter(row=>row!==header).forEach(row=>{if(row.children[index])row.children[index].dataset.tablePin=cell.dataset.platformPinned})});
 if(!native){root.setAttribute('role','table');header.setAttribute('role','row');[...header.children].forEach(cell=>{if(!cell.hasAttribute('role'))cell.setAttribute('role','columnheader')});rows.filter(row=>row!==header).forEach(row=>{if(!row.hasAttribute('role'))row.setAttribute('role','row')})}
}
function moveColumn(row,from,to){const cells=[...row.children],moving=cells[from],target=cells[to];if(!moving||!target||moving===target)return;row.insertBefore(moving,from<to?target.nextSibling:target)}
function wireColumnDrag(cell,key,rows,getWidths,applyWidths){
 if(cell.dataset.platformPinned||cell.querySelector(':scope > .platform-column-drag')||!cell.textContent.trim()||cell.querySelector('input'))return;
 const handle=E('span',undefined,'platform-column-drag');handle.tabIndex=0;handle.setAttribute('role','button');handle.setAttribute('aria-label','Move '+columnLabel(cell,[...cell.parentElement.children].indexOf(cell))+' column');handle.innerHTML='<svg width="12" height="16" viewBox="0 0 12 16" aria-hidden="true"><circle cx="3" cy="3" r="1.2"/><circle cx="9" cy="3" r="1.2"/><circle cx="3" cy="8" r="1.2"/><circle cx="9" cy="8" r="1.2"/><circle cx="3" cy="13" r="1.2"/><circle cx="9" cy="13" r="1.2"/></svg>';
 const shift=to=>{const header=cell.parentElement,from=[...header.children].indexOf(cell);if(header.firstElementChild.dataset.platformPinned==='start')to=Math.max(1,to);if(header.lastElementChild.dataset.platformPinned==='end')to=Math.min(header.children.length-2,to);if(to<0||to>=header.children.length||to===from)return;const widths=getWidths(),moved=widths.splice(from,1)[0];widths.splice(to,0,moved);rows().forEach(row=>moveColumn(row,from,to));applyWidths(widths);saveColumnWidths(key,widths);saveColumnOrder(key,[...header.children].map((c,i)=>columnId(c,i)))};
 handle.addEventListener('click',e=>{e.preventDefault();e.stopPropagation()});
 handle.addEventListener('pointerdown',event=>{
  if(event.button!==0)return;event.preventDefault();event.stopPropagation();
  const header=cell.parentElement,rect=cell.getBoundingClientRect(),offsetX=event.clientX-rect.left,offsetY=event.clientY-rect.top;
  let preview=null,indicator=null,destination=[...header.children].indexOf(cell);
  const move=e=>{
   if(e.pointerId!==event.pointerId)return;
   if(!preview&&Math.hypot(e.clientX-event.clientX,e.clientY-event.clientY)<4)return;
   if(!preview){
    preview=E('div',undefined,'platform-column-preview');preview.setAttribute('aria-hidden','true');
    const grip=handle.cloneNode(true);grip.removeAttribute('tabindex');grip.removeAttribute('role');grip.removeAttribute('aria-label');
    preview.append(grip,E('span',cell.querySelector('.platform-column-title')?.title||columnLabel(cell,0),'platform-column-title'));
    preview.style.width=Math.max(100,rect.width)+'px';preview.style.height=Math.max(36,rect.height)+'px';
    indicator=E('div',undefined,'platform-column-drop-line');indicator.setAttribute('aria-hidden','true');document.body.append(preview,indicator);
    cell.dataset.columnDragging='';document.body.dataset.reorderingColumn='';
   }
   preview.style.left=(e.clientX-offsetX)+'px';preview.style.top=(e.clientY-offsetY)+'px';
   const cells=[...header.children],from=cells.indexOf(cell),others=cells.filter(c=>c!==cell);
   let slot=others.findIndex(c=>e.clientX<c.getBoundingClientRect().left+c.getBoundingClientRect().width/2);if(slot<0)slot=others.length;
   destination=slot;
   const anchor=others[slot]?.getBoundingClientRect(),last=others.at(-1)?.getBoundingClientRect();
   indicator.style.left=((anchor?.left??last?.right??rect.right)-1)+'px';indicator.style.top=rect.top+'px';indicator.style.height=rect.height+'px';indicator.hidden=destination===from;
  };
  const cleanup=()=>{preview?.remove();indicator?.remove();delete cell.dataset.columnDragging;delete document.body.dataset.reorderingColumn;document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',end);document.removeEventListener('pointercancel',cancel);document.removeEventListener('keydown',escape);window.removeEventListener('blur',cancel)};
  const end=e=>{if(e.pointerId!==event.pointerId)return;const dropped=!!preview;cleanup();if(dropped)shift(destination)};
  const cancel=()=>cleanup(),escape=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();cleanup()}};
  document.addEventListener('pointermove',move);document.addEventListener('pointerup',end);document.addEventListener('pointercancel',cancel);document.addEventListener('keydown',escape);window.addEventListener('blur',cancel);
 });
 handle.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();event.stopPropagation();const from=[...cell.parentElement.children].indexOf(cell);shift(from+(event.key==='ArrowRight'?1:-1))});cell.insertBefore(handle,cell.firstChild);
}
function wireColumnHandle(cell,index,key,getWidths,applyWidths,minWidth,preserveTotal){
 if(cell.querySelector(':scope > .platform-column-resizer'))return;
 const handle=E('span',undefined,'platform-column-resizer');
 handle.addEventListener('click',event=>{event.preventDefault();event.stopPropagation()});
 handle.addEventListener('dblclick',event=>{event.preventDefault();event.stopPropagation()});
 handle.tabIndex=0;handle.setAttribute('role','separator');handle.setAttribute('aria-orientation','vertical');
 handle.setAttribute('aria-label','Resize '+columnLabel(cell,index)+' column');handle.setAttribute('aria-valuemin',String(minWidth));
 const currentIndex=()=>[...cell.parentElement.children].indexOf(cell);
 const resizeTo=width=>{
  const widths=getWidths(),i=currentIndex(),next=i+1;
  let target=Math.max(minWidth,Math.round(width));
  if(preserveTotal&&next<widths.length){
   const nextMin=64,pairTotal=widths[i]+widths[next];
   target=Math.min(target,pairTotal-nextMin);
   widths[next]=pairTotal-target;
  }
  widths[i]=target;applyWidths(widths);saveColumnWidths(key,widths);
  handle.setAttribute('aria-valuenow',String(Math.round(widths[i])));
 };
 let guide;
 const positionGuide=()=>{
  if(!guide)return;
  if(!cell.isConnected){hideGuide();return}
  const table=cell.closest('table,.platform-resizable-grid'),surface=table?.querySelector('.registry-table')||table;
  const header=cell.parentElement.getBoundingClientRect(),edge=handle.getBoundingClientRect(),bounds=surface?.getBoundingClientRect()||header;
  let top=Math.max(0,header.top),bottom=Math.min(innerHeight,bounds.bottom),left=0,right=innerWidth;
  for(let parent=cell.parentElement;parent&&parent!==document.body;parent=parent.parentElement){
   const style=getComputedStyle(parent),r=parent.getBoundingClientRect();
   if(/auto|scroll|hidden|clip/.test(style.overflowY)){top=Math.max(top,r.top);bottom=Math.min(bottom,r.bottom)}
   if(/auto|scroll|hidden|clip/.test(style.overflowX)){left=Math.max(left,r.left);right=Math.min(right,r.right)}
  }
  const x=edge.left+edge.width/2;guide.hidden=bottom<=top||x<left||x>right;
  guide.style.left=x+'px';guide.style.top=top+'px';guide.style.height=Math.max(0,bottom-top)+'px';
 };
 const trackHover=event=>{if(!cell.isConnected||(!handle.hasAttribute('data-dragging')&&!handle.matches(':focus-visible')&&!handle.contains(event.target)))hideGuide()};
 const hideGuide=()=>{guide?.remove();guide=null;delete handle.dataset.guide;document.removeEventListener('pointermove',trackHover,true);document.removeEventListener('scroll',positionGuide,true);window.removeEventListener('resize',positionGuide);window.removeEventListener('blur',hideGuide)};
 const showGuide=()=>{
  if(!cell.isConnected)return;
  if(!guide){guide=E('div',undefined,'platform-column-resize-guide');guide.setAttribute('aria-hidden','true');document.body.append(guide);handle.dataset.guide='';document.addEventListener('pointermove',trackHover,true);document.addEventListener('scroll',positionGuide,true);window.addEventListener('resize',positionGuide);window.addEventListener('blur',hideGuide)}
  guide.toggleAttribute('data-dragging',handle.hasAttribute('data-dragging'));positionGuide();
 };
 const leave=()=>{if(!handle.hasAttribute('data-dragging')&&!handle.matches(':focus-visible'))hideGuide()};
 handle.addEventListener('pointerenter',showGuide);handle.addEventListener('pointerleave',leave);
 handle.addEventListener('focus',showGuide);handle.addEventListener('blur',leave);
 handle.addEventListener('pointerdown',event=>{
  if(event.button!==0)return;event.preventDefault();event.stopPropagation();
  const startX=event.clientX,startWidth=getWidths()[currentIndex()];
  handle.setPointerCapture?.(event.pointerId);handle.dataset.dragging='';document.body.dataset.resizingColumn='';
  showGuide();
  const move=e=>{if(e.pointerId===event.pointerId){resizeTo(startWidth+e.clientX-startX);positionGuide()}};
  const cleanup=()=>{hideGuide();handle.removeAttribute('data-dragging');delete document.body.dataset.resizingColumn;handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',end);handle.removeEventListener('pointercancel',end);handle.removeEventListener('lostpointercapture',cleanup);window.removeEventListener('blur',cleanup)};
  const end=e=>{if(e.pointerId!==event.pointerId)return;cleanup();if(handle.hasPointerCapture?.(event.pointerId))handle.releasePointerCapture(event.pointerId);if(e.type==='pointerup'&&(handle.matches(':hover')||handle.matches(':focus-visible')))showGuide()};
  handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);
  handle.addEventListener('lostpointercapture',cleanup);window.addEventListener('blur',cleanup);
 });
 handle.addEventListener('keydown',event=>{if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;event.preventDefault();event.stopPropagation();resizeTo(getWidths()[currentIndex()]+(event.key==='ArrowRight'?12:-12));positionGuide()});
 cell.append(handle);
}
function enhanceNativeTable(table,index){
 if(!table.getBoundingClientRect().width)return;
 let cells=[...table.querySelectorAll(':scope > thead > tr:first-child > th')];if(cells.length<2)return;
 // Keep data rows a real column matrix, including Router recovery summaries.
 // Empty states retain a full-width spanning cell.
 table.querySelectorAll(':scope > tbody > tr').forEach(row=>{if(row.cells.length<2)return;[...row.cells].forEach(cell=>{const span=cell.colSpan;if(span<=1)return;cell.colSpan=1;for(let n=1;n<span;n++){const blank=document.createElement('td');blank.dataset.tableContinuation='';cell.after(blank)}})});
 const key=table.dataset.tableKey||(table.dataset.tableKey='native-'+(table.id||table.getAttribute('aria-label')||table.className||index).toString().replace(/\s+/g,'-'));
 table.classList.add('platform-resizable-table');
 let colgroup=table.querySelector(':scope > colgroup[data-platform-columns]');
 if(colgroup&&colgroup.children.length!==cells.length){colgroup.remove();colgroup=null}
 if(!colgroup){colgroup=document.createElement('colgroup');colgroup.dataset.platformColumns='';cells.forEach(()=>colgroup.append(document.createElement('col')));table.insertBefore(colgroup,table.firstChild)}
 const cols=[...colgroup.children];
 const measured=()=>cells.map((cell,i)=>Math.max(i===0&&!cell.textContent.trim()?36:64,Math.round(cell.getBoundingClientRect().width||parseFloat(cols[i]?.style.width)||96)));
 const apply=widths=>{if(widths.length!==cells.length)return;cols.forEach((col,i)=>col.style.width=Math.round(widths[i])+'px');table.style.width=widths.reduce((a,b)=>a+b,0)+'px';table.style.minWidth='100%';table.style.tableLayout='fixed'};
 const rows=()=>[table.querySelector(':scope > thead > tr:first-child'),...table.querySelectorAll(':scope > tbody > tr,:scope > tfoot > tr')].filter(Boolean).filter(row=>row.children.length===cells.length);
 restoreColumnOrder(cells[0].parentElement,rows,key);cells=[...table.querySelectorAll(':scope > thead > tr:first-child > th')];
 tableContract(table,cells[0].parentElement,rows(),true);
 const saved=savedColumnWidths(key);let defaults=tableDefaultWidths(cells,rows());
 if(!saved&&table.hasAttribute('data-table-fit')){
  const available=table.parentElement.clientWidth,minimums=cells.map(cell=>Math.max(100,tableTextWidth(cell.querySelector('.platform-column-title')||cell)+80)),minimumTotal=minimums.reduce((sum,width)=>sum+width,0),defaultTotal=defaults.reduce((sum,width)=>sum+width,0);
  if(defaultTotal>available&&available>minimumTotal){const ratio=(available-minimumTotal)/(defaultTotal-minimumTotal);defaults=defaults.map((width,i)=>minimums[i]+(width-minimums[i])*ratio)}
 }
 apply(saved?.length===cells.length?saved:defaults);
 wireNativeSorting(table,cells[0].parentElement);
 cells.slice(0,-1).forEach((cell,i)=>wireColumnHandle(cell,i,key,()=>{const stored=savedColumnWidths(key);return stored?.length===cells.length?stored:measured()},apply,i===0&&!cell.textContent.trim()?36:64));
 cells.forEach(cell=>wireColumnDrag(cell,key,rows,()=>{const stored=savedColumnWidths(key);return stored?.length===cells.length?stored:measured()},apply));
 cells.forEach(layoutColumnHeader);
 rows().filter(row=>row!==cells[0].parentElement).forEach(row=>[...row.children].forEach((cell,i)=>cell.classList.toggle('platform-column-cell',cells[i].classList.contains('platform-column-header'))));
}
const gridTableConfigs=[
 ['#jsgain .ovgr-h','#jsgain','.ovgr'],
 ['#st-table .sttr-h','#st-table','.sttr'],
 ['.bgtable .bgrow-h','.bgtable','.bgrow'],
 ['#acc-view-table .acctr-h','.acctable','.acctr'],
 ['.aptable .aptr-h','.aptable','.aptr'],
 ['.accside .accside-h','.accside','.accside-h,.accprov-b'],
 ['.gndrow-h',null,'.gndrow'],
 ['.sesrow-h',null,'.sesrow'],
 ['.acrow-h',null,'.acrow'],
 ['.view-mxr .acregg-h','.view-mxr','.acregg-h,.acreg'],
 ['.vkprice .vkpr-h','.vkprice','.vkpr']
];
function enhanceGridTable(header,root,rowsSelector,index,keyBase){
 if(!header.getBoundingClientRect().width)return;
 let cells=[...header.children];if(!root||cells.length<2)return;
 const key='grid-'+(root.id||keyBase.replace(/[^a-z0-9]+/gi,'-')+'-'+index)+'-'+(header.dataset.tableSchema||(header.dataset.tableSchema=[...header.children].map(c=>c.textContent.trim().replace(/[^a-z0-9]/gi,'')).join('-')));
 root.classList.add('platform-resizable-grid');
 if(root.id==='jsgain'){
  if(!root._stickyShadow){
   const shadow=E('div',undefined,'platform-sticky-section-shadow');shadow.setAttribute('aria-hidden','true');root.parentElement.append(shadow);
   const update=()=>{
    const head=root.querySelector('.ovgr-h'),edge=head?.children[2];if(!edge)return;
    const r=root.getBoundingClientRect(),parent=root.parentElement,p=parent.getBoundingClientRect(),e=edge.getBoundingClientRect();
    shadow.hidden=!r.width;shadow.style.left=(e.right-p.left-parent.clientLeft+12)+'px';shadow.style.top=(r.top-p.top-parent.clientTop)+'px';shadow.style.height=root.clientHeight+'px';
    const bulk=document.getElementById('gn-bulk'),checkbox=head.firstElementChild.getBoundingClientRect(),h=head.getBoundingClientRect();
    if(bulk){bulk.style.left=(checkbox.right-p.left-parent.clientLeft+12)+'px';bulk.style.top=(h.top-p.top-parent.clientTop)+'px';bulk.style.height=h.height+'px'}
   };
   root._stickyShadow=update;root.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(root);window.addEventListener('resize',update);
  }
  requestAnimationFrame(root._stickyShadow);
 }
 const rows=()=>[...root.querySelectorAll(rowsSelector)].filter(row=>row.children.length===cells.length);
 const measured=()=>cells.map(cell=>Math.max(32,Math.round(cell.getBoundingClientRect().width||96)));
 const registryTable=root.matches?.('.view-mxr')?root.querySelector('.registry-table'):null,virtualKeyTable=root.id==='vk-rows'?root:null,widthHost=registryTable||virtualKeyTable;
 const apply=widths=>{if(widths.length!==cells.length)return;const applied=root.id==='st-table'?widths.map((width,i)=>i===0?Math.max(180,width):width):widths;const template=applied.map(width=>Math.round(width)+'px').join(' ');rows().forEach(row=>{row.style.gridTemplateColumns=template;const style=getComputedStyle(row),total=applied.reduce((sum,width)=>sum+Math.round(width),0)+(applied.length-1)*(parseFloat(style.columnGap)||0)+(parseFloat(style.paddingLeft)||0)+(parseFloat(style.paddingRight)||0)+(parseFloat(style.borderLeftWidth)||0)+(parseFloat(style.borderRightWidth)||0);row.style.width=total+'px';row.style.minWidth=total+'px';row.style.boxSizing='border-box'});if(widthHost)widthHost.style.width=header.style.width;root.style.setProperty('--platform-sticky-1',Math.round(applied[0])+'px');root.style.setProperty('--platform-sticky-2',Math.round(applied[1]||0)+'px')};
 restoreColumnOrder(header,rows,key);cells=[...header.children];
 tableContract(root,header,rows(),false);
 const saved=savedColumnWidths(key);apply(saved?.length===cells.length?saved:fitTableDefaults(tableDefaultWidths(cells,rows()),root,header));
 wireGridSorting(header,()=>[...new Set(rows().filter(row=>row!==header).map(row=>row.parentElement))]);
 cells.slice(0,-1).forEach((cell,i)=>{
  // Blank utility columns are deliberately fixed-width; exposing an invisible
  // resize target there was the source of the large gap before row names.
  if(!cell.textContent.trim())return;
  wireColumnHandle(cell,i,key,()=>{const stored=savedColumnWidths(key);return stored?.length===cells.length?stored:measured()},apply,root.id==='st-table'&&i===0?180:64,header.matches('.gndrow-h'));
 });
 cells.forEach(cell=>wireColumnDrag(cell,key,rows,()=>{const stored=savedColumnWidths(key);return stored?.length===cells.length?stored:measured()},apply));
 cells.forEach(layoutColumnHeader);
 rows().filter(row=>row!==header).forEach(row=>[...row.children].forEach((cell,i)=>cell.classList.toggle('platform-column-cell',cells[i].classList.contains('platform-column-header'))));
}
P.enhanceResizableTables=function(){
 document.querySelectorAll('table').forEach(enhanceNativeTable);
 gridTableConfigs.forEach(([headerSelector,rootSelector,rowsSelector])=>document.querySelectorAll(headerSelector).forEach((header,index)=>enhanceGridTable(header,rootSelector?header.closest(rootSelector):header.parentElement,rowsSelector,index,headerSelector)));
};
document.fonts?.ready.then(()=>P.enhanceResizableTables());
P.inheritKeyRates=function(){document.querySelectorAll('#vkd .vkpr[data-model]').forEach(row=>{const name=row.dataset.model;const registry=Array.from(document.querySelectorAll('.registry-provider .acreg')).find(r=>r.dataset.model===name||r.children[0]?.textContent.trim()===name);if(!registry)return;const values=[registry.querySelector('.platform-registry-input')||registry.children[7],registry.querySelector('.platform-registry-output')||registry.children[9],registry.querySelector('.platform-registry-cached')||registry.children[8]].map(n=>Number(n?.textContent.replace(/[^0-9.]/g,'')));row.querySelectorAll('input').forEach((input,i)=>{if(Number.isFinite(values[i]))input.value=values[i].toFixed(2);input.readOnly=true;input.title='Inherited from Model registry'})})};
function init(){
 // Keep page descriptions available without a separate subtitle row.
 const headingHelp=document.querySelector('.platform-limits-heading .qm');
 if(headingHelp){
  const template=headingHelp.cloneNode(true);
  [['.platform-limits-subtitle','.platform-limits-heading'],['.mr-heading-copy > p','.mr-heading-copy'],['.ix-header > div > p','.ix-header > div']].forEach(([subtitleSelector,headingSelector])=>{
   const subtitle=document.querySelector(subtitleSelector),heading=document.querySelector(headingSelector);if(!subtitle||!heading)return;
   let help=heading.querySelector('.qm');
   if(help){const copy=help.querySelector('.qp > span');copy.prepend(document.createTextNode(subtitle.textContent.trim()+' '))}
   else{help=template.cloneNode(true);help.setAttribute('aria-label','About '+heading.querySelector('h1').textContent);help.querySelector('.qp > span').textContent=subtitle.textContent.trim();heading.append(help)}
   heading.classList.add('platform-page-heading');subtitle.remove();
  });
 }
 // Keep the CSS radio-based route renderer behind accessible navigation controls.
 document.querySelectorAll('label.nav').forEach(label=>{const b=E('button',undefined,label.className);b.type='button';b.innerHTML=label.innerHTML;b.dataset.nav=label.dataset.nav;const target=label.htmlFor;b.onclick=()=>{const radio=document.getElementById(target);if(radio){radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));}syncNav();document.querySelector('main')?.scrollTo(0,0)};label.replaceWith(b)});
 function syncNav(){document.querySelectorAll('button.nav').forEach(b=>{const current=document.getElementById('nv-'+b.dataset.nav)?.checked;b.toggleAttribute('data-current',!!current);if(current)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
 document.querySelectorAll('input[name="nv"]').forEach(n=>n.addEventListener('change',syncNav));syncNav();
 // Make the Access/Registry subpages reachable with the same keyboard contract.
 document.querySelectorAll('label.cptab[for],label.sesdtab[for]').forEach(label=>{const radio=document.getElementById(label.htmlFor);if(!radio)return;const button=E('button',label.textContent,label.className);button.type='button';button.setAttribute('role','tab');button.dataset.tabGroup=radio.name;const sync=()=>button.setAttribute('aria-selected',String(radio.checked));button.onclick=()=>{radio.click();document.querySelectorAll('button[role=tab][data-tab-group]').forEach(b=>{if(b.dataset.tabGroup===radio.name)b.setAttribute('aria-selected',String(b===button))})};label.replaceWith(button);radio.addEventListener('change',sync);sync()});
 document.addEventListener('keydown',e=>{
  const host=e.target.closest('.bgsel,.cpmw,.accprov-m');if(!host)return;
  const trigger=host.querySelector('[data-cpm-t],.accdots');if(!trigger)return;
  const choices=()=>[...host.querySelectorAll('.bgopt,.cpmi,.accdoti')].filter(n=>n.getClientRects().length&&n.getAttribute('aria-disabled')!=='true');
  if(e.key==='Escape'&&host.hasAttribute('data-open')){e.preventDefault();e.stopImmediatePropagation();host.removeAttribute('data-open');trigger.setAttribute('aria-expanded','false');trigger.focus();return;}
  if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
  e.preventDefault();e.stopImmediatePropagation();if(!host.hasAttribute('data-open'))trigger.click();
  const items=choices();if(!items.length)return;let index=items.indexOf(document.activeElement);index=e.key==='Home'?0:e.key==='End'?items.length-1:e.key==='ArrowDown'?(index+1)%items.length:(index-1+items.length)%items.length;items[index].tabIndex=0;items[index].focus();
 },true);
 // Keyboard support for the prototype's existing delegated custom controls.
 document.addEventListener('keydown',e=>{const item=e.target.closest('.bgopt,.accdoti,.ovgsort,.cpmi,.sesrow[data-id],.bgcard[data-g="vkmode"]');if(item&&(e.key==='Enter'||e.key===' ')){e.preventDefault();item.click()}});
 let updatePending=false;
 function semantics(){updatePending=false;providerActions();P.enhanceResizableTables();document.querySelectorAll('.bgopt:not([tabindex]),.ovgsort:not([tabindex]),.accdoti:not([tabindex]),.cpmi:not([tabindex]),#ses-rows .sesrow:not([tabindex]),.bgcard[data-g="vkmode"]:not([tabindex])').forEach(n=>{n.tabIndex=0;n.setAttribute('role','button')});document.querySelectorAll('#jsgain .ovgsort').forEach(n=>{n.setAttribute('aria-label','Sort by '+n.textContent.replace(/[▼▲?]/g,' ').trim());const arrow=n.querySelector('.ovgarrow');n.setAttribute('aria-pressed',String(!!arrow));});document.querySelectorAll('.vkmodel,.vkchip,.vksegb,.bgcard[data-g="vkmode"]').forEach(n=>n.setAttribute('aria-pressed',String(n.hasAttribute('data-on'))));}
 new MutationObserver(()=>{if(!updatePending){updatePending=true;requestAnimationFrame(semantics)}}).observe(document.body,{childList:true,subtree:true});semantics();
 document.addEventListener('click',()=>requestAnimationFrame(semantics));
 // Shared modal focus contract for legacy drawers and nested audience pickers.
 const ids=['ap-d','vkd','accm','accp','gnbd','sesd','gnd','pold','dr','lgd','ovp','acctb-fp'];const stack=[];let lastTrigger=null;
 const rememberTrigger=e=>{if(!e.target.closest('dialog,[role="dialog"]'))lastTrigger=e.target.closest('button,[role="button"],label')||e.target};document.addEventListener('pointerdown',rememberTrigger,true);document.addEventListener('click',rememberTrigger,true);
 const forms=new Map();
 const snapshot=d=>JSON.stringify([...d.querySelectorAll('input,textarea,select')].map(n=>[n.id||n.name,n.type==='checkbox'||n.type==='radio'?n.checked:n.value]).concat([...d.querySelectorAll('[data-on]')].map(n=>n.dataset.v||n.dataset.model||n.dataset.m||n.textContent.trim())).concat([...d.querySelectorAll('.accr-rows')].map(n=>[...n.querySelectorAll('.accr-prev')].map(p=>p.textContent).join('|'))));
 ids.forEach(id=>{const d=document.getElementById(id);if(!d)return;d.inert=!d.hasAttribute('data-open');let trigger;
 new MutationObserver(()=>{const open=d.hasAttribute('data-open');d.inert=!open;if(open){if(!stack.includes(d)){trigger=lastTrigger||document.activeElement;stack.push(d);forms.set(d,snapshot(d));requestAnimationFrame(()=>{if(!d.contains(document.activeElement)){d.tabIndex=-1;d.focus({preventScroll:true})}})}}else{const i=stack.indexOf(d);if(i>=0)stack.splice(i,1);requestAnimationFrame(()=>{if(document.querySelector('dialog[open]'))return;if(stack.length){const top=stack[stack.length-1];if(!top.contains(document.activeElement))top.focus();}else if(trigger?.isConnected)trigger.focus({preventScroll:true});});}}).observe(d,{attributes:true,attributeFilter:['data-open']});});
 document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;const d=stack[stack.length-1];if(!d||e.key!=='Tab')return;const list=[...d.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"],a[href]')].filter(n=>!n.closest('[hidden]')&&getComputedStyle(n).visibility!=='hidden'&&n.getClientRects().length);if(!list.length){e.preventDefault();return;}const first=list[0],last=list.at(-1);if(!d.contains(document.activeElement)||document.activeElement===d){e.preventDefault();(e.shiftKey?last:first).focus()}else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}},true);
 const exits={'ap-x':'ap-d','ap-cancel':'ap-d','vk-x':'vkd','accm-close':'accm','accm-cancel':'accm','ap-b':'ap-d','vkdb':'vkd','accmb':'accm'};let approved=false;
 document.addEventListener('click',e=>{if(approved)return;const id=exits[e.target.closest('[id]')?.id];if(!id)return;const d=document.getElementById(id);if(id==='vkd'&&$('#vk-secret')?.textContent)return;if(d&&forms.has(d)&&forms.get(d)!==snapshot(d)){e.preventDefault();e.stopImmediatePropagation();P.discard(()=>{approved=true;try{document.getElementById(id==='vkd'?'vk-x':id==='ap-d'?'ap-x':'accm-close').click()}finally{approved=false}})}},true);
 document.addEventListener('keydown',e=>{if(e.key!=='Escape'||document.querySelector('dialog[open]'))return;const d=stack.at(-1);if(!d||!['ap-d','vkd','accm'].includes(d.id)||d.id==='vkd'&&$('#vk-secret')?.textContent)return;if(forms.has(d)&&forms.get(d)!==snapshot(d)){e.preventDefault();e.stopImmediatePropagation();P.discard(()=>{forms.set(d,snapshot(d));document.getElementById(d.id==='vkd'?'vk-x':d.id==='ap-d'?'ap-x':'accm-close').click()})}},true);
 document.querySelectorAll('#ap-d .apf').forEach(field=>{const caption=field.querySelector('.apf-l'),input=field.querySelector('input,textarea');if(caption&&input?.id){const label=E('label',caption.textContent,caption.className);label.htmlFor=input.id;caption.replaceWith(label)}});
 const accessHeader=$('#acc-view-table .acctr-h');if(accessHeader){accessHeader.children[3].before(E('span','Connection'));accessHeader.lastElementChild.textContent='Enabled';}
 polishRegistryStructure();registryTools();governanceTabs();providerActions();keyTable();
 const session=$('#gn-sessions-view .sestools')||$('#ses-time')?.parentElement;if(session&&!$('#platform-session-period')){const note=E('span','Session activity · as of Sep 10, 2026','platform-muted');note.id='platform-session-period';session.append(note)}
}
function sortValue(node){
 const explicit=node?.dataset?.sortValue;
 if(explicit!=null&&explicit!==''){const numeric=Number(explicit);return Number.isFinite(numeric)?numeric:String(explicit).toLowerCase()}
 const text=(node?.textContent||'').trim(),normalized=text.replace(/−/g,'-').replace(/[,$€£%\s]/g,'');
 if(/^[+-]?\d+(?:\.\d+)?[KMB]?$/i.test(normalized)){const suffix=normalized.match(/[KMB]$/i)?.[0].toUpperCase(),value=Number(normalized.replace(/[KMB]$/i,'')),scale={K:1e3,M:1e6,B:1e9}[suffix]||1;return value*scale}
 return text.toLowerCase();
}
function wireNativeSorting(table,header){
 [...header.children].forEach(cell=>{
  if(cell.dataset.platformPinned==='end'||cell.dataset.sortReady||!cell.textContent.trim()||cell.querySelector('input,button:not(.platform-copy-help)'))return;
  cell.dataset.sortReady='1';const label=columnLabel(cell,0),help=[...cell.querySelectorAll('.qm,.platform-copy-help')],button=E('button',label,'platform-sort-label');button.type='button';button.setAttribute('aria-label','Sort by '+label);cell.replaceChildren(button,...help);decorateSortCell(cell,button);
  button.onclick=()=>{const index=[...header.children].indexOf(cell),ascending=cell.dataset.sortDirection!=='asc';setTableSort(header,cell,ascending);table.querySelectorAll(':scope > tbody').forEach(body=>sortTableRows([...body.rows].filter(row=>row.cells.length===header.children.length),index,ascending).forEach(row=>body.append(row)))};
 });
}
function setTableSort(header,cell,ascending){[...header.children].forEach(c=>{delete c.dataset.sortDirection;c.setAttribute('aria-sort','none');c.querySelector('.platform-sort-label')?.removeAttribute('aria-pressed')});cell.dataset.sortDirection=ascending?'asc':'desc';cell.setAttribute('aria-sort',ascending?'ascending':'descending');cell.querySelector('.platform-sort-label')?.setAttribute('aria-pressed','true')}
function sortTableRows(rows,index,ascending){return rows.sort((a,b)=>{const av=sortValue(a.children[index]),bv=sortValue(b.children[index]),cmp=typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv),undefined,{numeric:true,sensitivity:'base'});return ascending?cmp:-cmp})}
function wireGridSorting(header,rowGroups){
 [...header.children].forEach(cell=>{
  if(cell.dataset.platformPinned==='end')return;
  if(cell.matches('.ovgsort')){decorateSortCell(cell);const arrow=cell.querySelector('.ovgarrow')?.textContent.trim();cell.setAttribute('aria-sort',arrow?(arrow==='▲'?'ascending':'descending'):'none');if(arrow)cell.dataset.sortDirection=arrow==='▲'?'asc':'desc';return}
  if(cell.dataset.sortReady||!cell.textContent.trim()||cell.querySelector('input,button'))return;
  cell.dataset.sortReady='1';const label=[...cell.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join(' ').trim();if(!label)return;
  [...cell.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).forEach(n=>n.remove());const button=E('button',label,'platform-sort-label');button.type='button';button.setAttribute('aria-label','Sort by '+label);cell.insertBefore(button,cell.firstChild);decorateSortCell(cell,button);
  button.onclick=()=>{const index=[...header.children].indexOf(cell),ascending=cell.dataset.sortDirection!=='asc';setTableSort(header,cell,ascending);rowGroups().forEach(group=>{const rows=[...group.children].filter(row=>row!==header&&row.children.length===header.children.length&&!row.matches('.ovgr-total,[data-total]'));const total=group.querySelector(':scope > .ovgr-total,:scope > [data-total]');sortTableRows(rows,index,ascending).forEach(row=>group.insertBefore(row,total))})};
 });
}
function polishRegistryStructure(){
 const root=$('.view-mxr'),groups=root?.querySelector('.registry-groups'),head=root?.querySelector('.acregg-h');if(!root||!groups||!head)return;
 const title=root.querySelector('.registry-title')?.parentElement;if(title){const divider=title.nextElementSibling;title.remove();if(divider&&!divider.className)divider.remove()}
 groups.querySelector('.registry-provider[aria-label="LangGraph models"]')?.remove();
 head.replaceChildren(...['Model','Status','Hosting','Served via','Connection','Lifecycle','Regions','Input','Cached','Output','Routing'].map(label=>E('span',label,'acregh'+(['Input','Cached','Output'].includes(label)?' acregn':''))));head.style.gridTemplateColumns='';
 groups.querySelectorAll('.registry-provider').forEach(section=>{
  const group=section.querySelector('.acgrp');if(group&&!group.querySelector('.platform-registry-provider-summary')){const summary=E('div',undefined,'platform-registry-provider-summary');summary.append(...group.children);group.append(summary)}
  const connected=group?.querySelector('.acregst');if(connected)connected.className='acregst platform-registry-badge '+(/not connected/i.test(connected.textContent)?'platform-registry-off':'platform-registry-on');
  section.querySelectorAll('.acreg').forEach(row=>{
   const old=[...row.children],model=old[0],service=old[1],lifecycle=old[2],regions=old[3],rawModelName=model.querySelector('.accname')?.textContent.trim()||'',hostingLabel=model.querySelector('.registry-model-type')?.textContent.trim()||(/\bSelf-hosted\b/i.test(rawModelName)?'Self-hosted':'External');
   model.querySelectorAll('.cpt').forEach(b=>b.remove());[...model.children].slice(2).forEach(extra=>extra.remove());const modelName=model.querySelector('.accname');if(modelName)modelName.textContent=rawModelName.replace(/^(Claude|Mistral|Wonderful|DeepSeek)\s+/,'').replace(/\s+Self-hosted$/i,'');
   const status=E('span',row.hasAttribute('data-off')?'Off':'On','platform-registry-badge '+(row.hasAttribute('data-off')?'platform-registry-off':'platform-registry-on'));
   const hosting=E('span',hostingLabel,'platform-registry-nowrap');
   const served=E('span',service.querySelector('.acvia')?.textContent.trim()||'—','platform-registry-nowrap');
   const connection=E('span',[...service.querySelectorAll('code')].map(x=>x.textContent.trim()).join(' · ')||'—','platform-registry-nowrap');
   const regionValues=[...regions.querySelectorAll('code')].map(x=>x.textContent.trim()).filter(Boolean),region=E('span',undefined,'platform-registry-regions');region.title=regionValues.join(', ');(regionValues.length?regionValues:['—']).forEach(value=>region.append(E('span',value,'platform-registry-region')));
   const lifecycleBadge=lifecycle.querySelector('.registry-lifecycle')||lifecycle.firstElementChild;lifecycleBadge.className='registry-lifecycle platform-registry-badge platform-registry-'+(lifecycleBadge.dataset.status||lifecycleBadge.textContent.trim().toLowerCase());
   const route=old[7];route.querySelectorAll('br').forEach(br=>br.replaceWith(' · '));const routeParts=[...route.children].map(child=>child.textContent.trim()).filter(Boolean);route.textContent=routeParts.join(' · ')||route.textContent.trim();route.classList.add('platform-registry-nowrap');route.title=route.textContent;
   row.replaceChildren(model,status,hosting,served,connection,lifecycle,region,old[4],old[5],old[6],route);row.style.gridTemplateColumns='';
  });
 });
 wireGridSorting(head,()=>[...groups.querySelectorAll('.registry-provider')]);
}
function governanceTabs(){
 const root=$('.view-govp'),sections=root?[...root.querySelectorAll(':scope > .polsect')]:[];if(sections.length!==2||root.querySelector('.platform-policy-tabs'))return;
 const tabs=E('div',undefined,'platform-policy-tabs');tabs.setAttribute('role','tablist');
 sections.forEach((section,index)=>{section.id='platform-policy-panel-'+index;const button=E('button',index?'Your policies':'Wonderful','');button.type='button';button.setAttribute('role','tab');button.setAttribute('aria-controls',section.id);button.onclick=()=>{sections.forEach((panel,i)=>panel.hidden=i!==index);tabs.querySelectorAll('[role="tab"]').forEach((tab,i)=>{tab.toggleAttribute('data-on',i===index);tab.setAttribute('aria-selected',String(i===index))})};tabs.append(button);const header=section.querySelector('.polrow.bgrow-h'),rows=section.querySelector('[id$="-rows"]');if(header&&rows)wireGridSorting(header,()=>[rows])});
 root.insertBefore(tabs,sections[0]);tabs.firstElementChild.click();
}
function registryTools(){const root=$('.view-mxr'),groups=root?.querySelector('.registry-groups');if(!groups)return;const toolbar=E('div',undefined,'platform-toolbar');const search=E('input'),provider=E('select'),life=E('select'),reset=E('button','Reset','platform-button'),count=E('span','','platform-muted');search.type='search';search.placeholder='Search models';search.setAttribute('aria-label','Search model registry');provider.setAttribute('aria-label','Filter registry provider');life.setAttribute('aria-label','Filter registry lifecycle');provider.append(new Option('All providers',''));const sections=[...groups.querySelectorAll('.registry-provider')];sections.forEach(s=>provider.append(new Option(s.querySelector('.acgrp-t').textContent,s.getAttribute('aria-label'))));['All lifecycles','Active','Deprecated','Retired'].forEach((x,i)=>life.append(new Option(x,i?x.toLowerCase():'')));toolbar.append(search,provider,life,reset,count);root.querySelector('.registry-scroll').insertAdjacentElement('beforebegin',toolbar);const empty=E('p','No models match these filters.','platform-empty');empty.hidden=true;groups.after(empty);
 function filter(){let found=0,total=0;sections.forEach(s=>{let shown=0;s.querySelectorAll('.acreg').forEach(r=>{total++;const match=(!provider.value||provider.value===s.getAttribute('aria-label'))&&(!life.value||r.querySelector('.registry-lifecycle')?.dataset.status===life.value)&&r.children[0].textContent.toLowerCase().includes(search.value.toLowerCase());r.hidden=!match;if(match){shown++;found++}});s.hidden=!shown});count.textContent=found+' of '+total+' models';empty.hidden=found>0;reset.hidden=!search.value&&!provider.value&&!life.value}
 search.oninput=provider.onchange=life.onchange=filter;reset.onclick=()=>{search.value=provider.value=life.value='';filter()};filter();}
function providerActions(){document.querySelectorAll('.accdoti:not([data-platform-action])').forEach(item=>{item.dataset.platformAction='1';const label=item.textContent.trim();item.setAttribute('role','button');item.tabIndex=0;if(label==='Test connection'||label==='Rotate credential'||label==='Disconnect'){item.setAttribute('aria-disabled','true');item.title='Requires a live provider connection';item.onclick=e=>{e.preventDefault();P.toast('This action requires a live provider connection.')} ;return;}
 item.onclick=e=>{e.stopPropagation();const row=item.closest('.accprov');row?.querySelector('.accprov-m')?.removeAttribute('data-open');const name=row?.querySelector('.accprov-b')?.getAttribute('aria-label')?.replace(/^Show /,'').replace(/ models$/,'')||'Provider';
 const initialLabel=row.dataset.connectionLabel||name;let input;const panel=P.panel('Edit connection',name+' · Local configuration',()=>!input||input.value===initialLabel);panel.footer.querySelector('button').textContent='Cancel';const l=E('label','Connection label');input=E('input');input.value=initialLabel;input.id='platform-connection-label';l.htmlFor=input.id;panel.body.append(l,input,E('p','Connection testing and credential rotation require a live provider connection.','platform-muted'));const save=E('button','Save changes','platform-button platform-primary');panel.footer.append(save);save.onclick=()=>{P.clearErrors(panel.body);if(!input.value.trim()){P.fieldError(input,'Enter a connection label.');return;}row.dataset.connectionLabel=input.value.trim();let caption=row.querySelector('.platform-connection-label');if(!caption){caption=E('span',undefined,'platform-connection-label');row.querySelector('.accprov-x').append(caption)}caption.textContent=input.value.trim();row.querySelector('.accprov-b').title='Connection: '+input.value.trim();panel.close();P.toast('Connection label saved.');};};});}
P.providerDetails=function(id){
 const row=document.querySelector('.accprov[data-prov="'+id+'"]');if(!row)return;
 const name=row.querySelector('.accprov-t').textContent,details=row.querySelector('.accprov-s').textContent.split('·').map(x=>x.trim());
 const panel=P.panel(name,'Provider connection');
 const logo=row.querySelector('.accprov-b > span:first-child').cloneNode(true);logo.classList.add('platform-provider-logo');logo.setAttribute('aria-hidden','true');panel.body.append(logo);
 const fields=[['Status',row.querySelector('.accprov-st').textContent],['Billing',details[0]],['Region',details.slice(1).join(' · ')||'Not specified'],['Enabled models',row.querySelector('.accprov-c').textContent],['Connection label',row.dataset.connectionLabel||name]];
 fields.forEach(([label,value])=>{const detail=E('div',undefined,'platform-detail');detail.append(E('span',label,'platform-muted'),E('span',value));panel.body.append(detail)});
 const edit=E('button','Edit connection','platform-button platform-primary');edit.onclick=()=>{panel.close();row.querySelector('.accdoti').click()};panel.footer.append(edit);
 panel.body.append(E('h3','Connection actions'),E('p','Testing, credential rotation and disconnection require a live provider connection.','platform-muted'));
 ['Test connection','Rotate credential','Disconnect'].forEach(label=>{const button=E('button',label,'platform-button platform-provider-action');button.disabled=true;panel.body.append(button)});
};
function legacyKeyTable(){const host=$('#vk-rows');if(!host)return;const billing=E('select',undefined,'platform-billing-filter');billing.setAttribute('aria-label','Filter key billing');['All billing','Gateway','BYOK'].forEach((label,i)=>billing.append(new Option(label,i?label:'')));$('#vk-q').closest('label').after(billing);billing.onchange=()=>{host.dataset.billingFilter=billing.value;$('#vk-q').dispatchEvent(new Event('input',{bubbles:true}));};$('[data-m="vkfilter"] [data-f="byok"]')?.remove();$('[data-m="vkfilter"] [data-cpm-lab]').textContent='All statuses';$('[data-m="vkfilter"] [data-f="all"]').textContent='All statuses';function paint(){host.querySelectorAll('.vkrow').forEach(row=>{if(row.dataset.platformRow)return;row.dataset.platformRow='1';const last=row.lastElementChild;if(row.classList.contains('bgrow-h')){last.textContent='Status';last.before(E('span','Billing'));return;}const byok=row.dataset.billing==='BYOK'||row.dataset.status==='BYOK';row.dataset.billing=byok?'BYOK':'Gateway';if(byok)row.dataset.status='Active';row.children[2].textContent=P.department(row.children[2].textContent.trim());const billing=E('span',byok?'BYOK':'Gateway','platform-muted');last.before(billing);if(byok)last.querySelector('.bgp').textContent='Active';const identity=row.querySelector('.vkname');if(identity){identity.tabIndex=0;identity.setAttribute('role','button');const open=()=>{const panel=P.panel(identity.textContent,'Virtual key details');const names=['Virtual key','Connected to','Department','Project','Models','Default model','TPM',"Monthly spend limit",'Spend','Billing','Status'];[...row.children].forEach((cell,i)=>{const block=E('div',undefined,'platform-detail');block.append(E('span',names[i]||'Details','platform-muted'),E('span',cell.textContent));panel.body.append(block)});if(row.dataset.owner){const owner=E('div',undefined,'platform-detail');owner.append(E('span','Owner','platform-muted'),E('span',row.dataset.owner));panel.body.append(owner)}if(row.dataset.route){panel.body.append(E('h3','Recovery order'),E('p',JSON.parse(row.dataset.route).join(' · ')))};panel.body.append(E('p','Amounts are in USD. Spend covers August 2026.','platform-muted'))};identity.onclick=open;identity.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}};}})}new MutationObserver(paint).observe(host,{childList:true});paint();const owner=host.querySelector('.bgrow-h').children[2];owner.textContent='Department';const filter=$('[data-m="vkwho"] [data-cpm-t] > span');if(filter)filter.textContent='Department ';}

function keyTable(){
 const host=$('#vk-rows'),query=$('#vk-q'),toolbar=query?.closest('.bgtools'),header=host?.querySelector('.bgrow-h');if(!host||!query||!toolbar||!header)return;
 const labels=['Virtual key','Connected to','Department','Project','Models','Default model','TPM','Spend limit','MTD spend','Billing','Status'];
 function paint(){
  host.querySelectorAll('.vkrow').forEach(row=>{
   if(row.dataset.platformRow)return;row.dataset.platformRow='1';const last=row.lastElementChild;
   if(row===header){last.before(E('span','Billing'));[...row.children].forEach((cell,i)=>{cell.textContent=labels[i];cell.classList.toggle('bgnum',[4,6,7,8].includes(i))});return;}
   const byok=row.dataset.billing==='BYOK'||row.dataset.status==='BYOK';row.dataset.billing=byok?'BYOK':'Gateway';if(byok)row.dataset.status='Active';row.children[2].textContent=P.department(row.children[2].textContent.trim());
   const billing=E('span',row.dataset.billing,'platform-muted platform-vk-nowrap');last.before(billing);if(byok)last.querySelector('.bgp').textContent='Active';
   [...row.children].forEach(cell=>{if(!cell.title)cell.title=cell.textContent.trim()});
   const identity=row.querySelector('.vkname');if(identity){identity.tabIndex=0;identity.setAttribute('role','button');const open=()=>{const panel=P.panel(identity.textContent,'Virtual key details');labels.forEach((name,i)=>{const block=E('div',undefined,'platform-detail');block.append(E('span',name,'platform-muted'),E('span',row.children[i]?.textContent||'—'));panel.body.append(block)});if(row.dataset.owner){const owner=E('div',undefined,'platform-detail');owner.append(E('span','Owner','platform-muted'),E('span',row.dataset.owner));panel.body.append(owner)}if(row.dataset.route)panel.body.append(E('h3','Recovery order'),E('p',JSON.parse(row.dataset.route).join(' · ')));panel.body.append(E('p','Amounts are in USD. Spend covers August 2026.','platform-muted'))};identity.onclick=open;identity.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}};}
  });
 }
 paint();wireGridSorting(header,()=>[host]);

 toolbar.querySelectorAll('[data-m="vkfilter"],[data-m="vksort"],[data-m="vkwho"],.platform-billing-filter').forEach(control=>control.remove());
 const count=$('#vk-count'),trigger=E('button',undefined,'bgb platform-vk-filter-trigger');trigger.type='button';trigger.setAttribute('aria-haspopup','dialog');trigger.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg><span data-label>All activities</span><span class="platform-vk-filter-count" hidden></span>';
 trigger.querySelector('.platform-vk-filter-count').setAttribute('aria-hidden','true');toolbar.insertBefore(trigger,count);

 const statusLimit="You’ve reached your spend limit";
 const definitions=[
  {id:'status',label:'Status',all:'statuses',value:row=>row.dataset.status,items:()=>[['Active','Active'],['Paused','Paused'],[statusLimit,'At spend limit']]},
  {id:'billing',label:'Billing',all:'billing types',value:row=>row.dataset.billing,items:()=>[['Gateway','Gateway'],['BYOK','BYOK']]},
  {id:'department',label:'Department',all:'departments',value:row=>row.dataset.dept,items:()=>[...new Set(rows().map(row=>row.dataset.dept))].sort().map(value=>[value,value])},
  {id:'connected',label:'Connected to',all:'connection types',value:row=>row.dataset.kind,items:()=>[...new Set(rows().map(row=>row.dataset.kind))].sort().map(value=>[value,value])}
 ];
 const rows=()=>[...host.querySelectorAll('.vkrow:not(.bgrow-h)')],committed=Object.fromEntries(definitions.map(def=>[def.id,new Set()]));let draft,active='status';
 const backdrop=E('div',undefined,'accp-b platform-vk-filter-backdrop'),dialog=E('div',undefined,'accp platform-vk-filter-dialog');backdrop.id='platform-vk-filter-backdrop';dialog.id='platform-vk-filter';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Filter virtual keys');dialog.inert=true;
 const body=E('div',undefined,'accp-body'),typesWrap=E('div',undefined,'accp-types'),types=E('div',undefined,'accp-typelist'),itemsWrap=E('div',undefined,'accp-items'),controls=E('div',undefined,'accp-ctrl'),search=E('input',undefined,'accp-search'),allLabel=E('label',undefined,'accp-allrow'),all=E('input'),allText=E('span'),list=E('div',undefined,'accp-list'),footer=E('div',undefined,'accm-f platform-vk-filter-footer'),clear=E('button','Clear all','accbtn'),actions=E('div',undefined,'accm-fa'),cancel=E('button','Cancel','accbtn'),apply=E('button','Apply selections','accbtn accbtn-p');
 search.type='search';search.placeholder='Search';search.setAttribute('aria-label','Search filter items');all.type='checkbox';const mark=()=>{const box=E('span',undefined,'accp-cb');box.innerHTML='<svg class="accp-cb-tick" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>';return box};
 allLabel.append(all,mark(),allText);controls.append(search,allLabel);itemsWrap.append(controls,list);typesWrap.append(types);body.append(typesWrap,itemsWrap);actions.append(cancel,apply);footer.append(clear,actions);dialog.append(body,footer);document.body.append(backdrop,dialog);
 const snapshot=state=>definitions.map(def=>def.id+':'+[...state[def.id]].sort().join('|')).join(';'),selectedCount=state=>definitions.reduce((sum,def)=>sum+state[def.id].size,0);
 function renderTypes(){types.replaceChildren();definitions.forEach(def=>{const button=E('button',undefined,'accp-type');button.type='button';button.setAttribute('aria-pressed',String(active===def.id));button.append(E('span',def.label),E('span',draft[def.id].size?String(draft[def.id].size):'','accp-type-n'));button.onclick=()=>{active=def.id;search.value='';renderTypes();renderItems()};types.append(button)})}
 function renderItems(){const def=definitions.find(item=>item.id===active),term=search.value.trim().toLowerCase(),options=def.items().filter(([,label])=>label.toLowerCase().includes(term));list.replaceChildren();options.forEach(([value,label])=>{const item=E('label',undefined,'accp-item'),input=E('input'),copy=E('span',label);input.type='checkbox';input.checked=draft[def.id].has(value);input.onchange=()=>{input.checked?draft[def.id].add(value):draft[def.id].delete(value);renderTypes();syncAll();syncApply()};item.append(input,mark(),copy);list.append(item)});if(!options.length)list.append(E('p','No matching items.','accp-empty'));allText.textContent='Select all '+def.all;syncAll();syncApply()}
 function syncAll(){const def=definitions.find(item=>item.id===active),visible=[...list.querySelectorAll('.accp-item input')],checked=visible.filter(input=>input.checked).length;all.checked=visible.length>0&&checked===visible.length;all.indeterminate=checked>0&&checked<visible.length;all.disabled=!visible.length;all.onchange=()=>{const values=def.items().filter(([,label])=>label.toLowerCase().includes(search.value.trim().toLowerCase())).map(([value])=>value);values.forEach(value=>all.checked?draft[def.id].add(value):draft[def.id].delete(value));renderItems();renderTypes()}}
 function syncApply(){apply.disabled=snapshot(draft)===snapshot(committed)}
 function filterRows(){const term=query.value.trim().toLowerCase(),hasFilters=selectedCount(committed)>0;let shown=0;rows().forEach(row=>{const searchMatch=!term||(row.dataset.q||row.textContent).toLowerCase().includes(term),filterMatch=!hasFilters||definitions.some(def=>committed[def.id].has(def.value(row)));row.hidden=!(searchMatch&&filterMatch);if(!row.hidden)shown++});if(count)count.textContent=shown===rows().length?rows().length+' rows':shown+' of '+rows().length;const empty=$('#vk-empty');if(empty){empty.hidden=shown>0;empty.textContent='No virtual keys match these filters.'}const total=selectedCount(committed),label=trigger.querySelector('[data-label]'),badge=trigger.querySelector('.platform-vk-filter-count');label.textContent=total?total+' selected':'All activities';badge.textContent=String(total);badge.hidden=!total;trigger.toggleAttribute('data-on',!!total)}
 function close(){dialog.removeAttribute('data-open');backdrop.removeAttribute('data-open');dialog.inert=true;trigger.setAttribute('aria-expanded','false');trigger.focus({preventScroll:true})}
 function open(){draft=Object.fromEntries(definitions.map(def=>[def.id,new Set(committed[def.id])]));active=definitions.find(def=>draft[def.id].size)?.id||'status';search.value='';renderTypes();renderItems();const rect=trigger.getBoundingClientRect(),width=Math.min(420,innerWidth-32),left=Math.max(16,Math.min(rect.left,innerWidth-width-16)),height=Math.min(460,innerHeight-32),top=rect.bottom+8+height<=innerHeight?rect.bottom+8:Math.max(16,rect.top-height-8);dialog.style.left=left+'px';dialog.style.top=top+'px';dialog.style.width=width+'px';dialog.setAttribute('data-open','');backdrop.setAttribute('data-open','');dialog.inert=false;trigger.setAttribute('aria-expanded','true');search.focus()}
 trigger.onclick=()=>dialog.hasAttribute('data-open')?close():open();backdrop.onclick=close;cancel.onclick=close;clear.onclick=()=>{definitions.forEach(def=>draft[def.id].clear());renderTypes();renderItems()};apply.onclick=()=>{definitions.forEach(def=>{committed[def.id].clear();draft[def.id].forEach(value=>committed[def.id].add(value))});filterRows();close()};search.oninput=renderItems;query.addEventListener('input',filterRows);document.addEventListener('keydown',event=>{if(event.key==='Escape'&&dialog.hasAttribute('data-open')){event.preventDefault();close()}});
 new MutationObserver(()=>{paint();filterRows();P.enhanceResizableTables()}).observe(host,{childList:true});filterRows();
}
function productChanges(){
 // Keep the global navigation task-oriented and use one icon language.
 const navOrder=['ov','gain','caps','pol','tasks','acc','rou','vk'];
 const navLabels={gain:'Usage',caps:'Spend limits'};
 const navIcons={
  ov:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  gain:'<path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19H2"/>',
  tasks:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 9 1.5 1.5L12 8M8 15l1.5 1.5L12 14M14 9h3M14 15h3"/>',
  caps:'<path d="M3 7.5h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11Z"/><path d="M3 10h18"/><path d="M16 14h3"/><path d="M6 7.5V6a2 2 0 0 1 2-2h8"/>',
  ins:'<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .9 1.6l.1.6h5.2l.1-.6c.1-.6.4-1.2.9-1.6A6 6 0 0 0 12 3Z"/>',
  acc:'<path d="M12 3 4 6v6c0 4.8 3.2 8 8 9 4.8-1 8-4.2 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
  rou:'<circle cx="5" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 5h4a4 4 0 0 1 4 4v1M7 19h4a4 4 0 0 0 4-4v-1M5 7v10"/>',
  vk:'<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M16 4l4 4M14 7l3 3"/>',
  pol:'<path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 4.6-.7 8-4 8-9V6l-8-3Z"/><path d="M8 12h8M12 8v8"/>'
 };
 const navHost=$('[data-nav="ov"]')?.parentElement;
 if(navHost&&!navHost.dataset.productNav){
  navHost.dataset.productNav='1';
  navHost.querySelectorAll(':scope > .nav-g').forEach(x=>x.remove());
  navOrder.forEach(key=>{
   const item=navHost.querySelector('[data-nav="'+key+'"]');if(!item)return;
   const icon=item.querySelector(':scope > span');
   if(icon)icon.innerHTML='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+navIcons[key]+'</svg>';
   if(navLabels[key]){const text=[...item.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);if(text)text.textContent=navLabels[key]}
   navHost.append(item);
  });
 }

 // Overview and Usage show presets directly, with Fixed at the bottom.
 ['pg','gn'].forEach(prefix=>{
  const menu=$('#'+prefix+'cus-menu');if(!menu)return;
  const rail=menu.querySelector('.pgcutabs');if(!rail)return;
  const preset=rail.querySelector('[data-pgct="last"]');if(preset)preset.textContent='Preset';
   const ptd=rail.querySelector('[data-pgct="ptd"]');
   rail.querySelectorAll('[data-pgct="since"],[data-pgct="ptd"],[data-pgct="prev"]').forEach(b=>b.hidden=true);
  if(!menu.querySelector('[data-product-period]')){
   const list=menu.querySelector('#'+prefix+'cup-last > span');
   const before=list?.querySelector('[data-lastunit="month"]');
   [['MTD','month'],['YTD','year']].forEach(([label,unit])=>{
    const b=E('button',label,'pgcutab');b.type='button';b.dataset.productPeriod=unit;
    b.onclick=e=>{
     e.stopPropagation();
     list?.querySelectorAll('.pgcupreset,[data-product-period]').forEach(x=>x.removeAttribute('data-on'));
     ptd?.click();menu.querySelector('[data-ptdunit="'+unit+'"]')?.click();preset?.click();
     b.setAttribute('data-on','');
    };
    list?.insertBefore(b,before||null);
   });
  }
  if(!menu.dataset.singleList){
   menu.dataset.singleList='';menu.classList.add('platform-timeframe-menu');rail.hidden=true;
   const list=menu.querySelector('#'+prefix+'cup-last > span'),fixed=rail.querySelector('[data-pgct="fix"]'),fixedPane=$('#'+prefix+'cup-fix');
   const entry=E('button','Fixed…','pgcutab platform-timeframe-fixed');entry.type='button';entry.onclick=e=>{e.stopPropagation();fixed.click()};list.append(entry);
   const back=E('button','‹ Presets','pgcutab platform-timeframe-back');back.type='button';back.onclick=e=>{e.stopPropagation();preset.click()};fixedPane.prepend(back);
   $('#'+prefix+'cus-trigger')?.addEventListener('click',()=>preset.click());
  }
 });
 $('#gn-sortsel')?.remove();
 $('#gn-slice [data-slice="sessions"]')?.remove();
 $('#gn-sessions-view')?.remove();
 const usageCard=$('#gn-gainers-view');
 if(usageCard&&!usageCard.dataset.productReady){
  usageCard.dataset.productReady='1';
  const redundantTitle=usageCard.firstElementChild;
  if(redundantTitle?.textContent.includes('Usage Breakdown')){
   const divider=redundantTitle.nextElementSibling;
   redundantTitle.remove();divider?.remove();
  }
 }
 const usageToolbar=$('#gn-gainers-toolbar'),usageBar=$('.view-gain .gnbar');
 if(usageToolbar&&usageBar){
  const search=usageToolbar.querySelector('.bgq');
  if(search)usageBar.insertBefore(search,$('#gncus-dd'));
  usageToolbar.remove();
 }

 // Keep the overview's requested product language and default breakdown
 // stable even though the legacy renderer rewrites both on every refresh.
 const overall=$('#sb0');
 if(overall&&!overall.checked){overall.checked=true;window.__render?.()}
 const breakdownLabel=$('#bdsb .bdlab');if(breakdownLabel)breakdownLabel.textContent='Overall';
 function polishOverview(){
  const spendTitle=$('#ov-spend-title');if(spendTitle&&spendTitle.textContent!=='Total spend')spendTitle.textContent='Total spend';
  const chartTitle=$('#ov-st-title');if(chartTitle&&chartTitle.textContent!=='Total spend over time')chartTitle.textContent='Total spend over time';
  const stats=$('[data-card="overview-mega"] .megastats');
  if(stats&&!$('#platform-average-spend-card')){
   const card=E('div',undefined,'card platform-average-spend-card');card.id='platform-average-spend-card';
   card.append(E('span','Avg. spend per day','platform-average-spend-label'),E('span','—','platform-average-spend-value'));
   stats.append(card);
  }
  const value=$('#platform-average-spend-card .platform-average-spend-value'),w=window.__win;
  if(value&&w&&window.__TOT){let total=0;for(let i=w.a;i<=w.b;i++)total+=window.__TOT(i);const next=money(total/Math.max(1,w.n));if(value.textContent!==next)value.textContent=next}
 }

 const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
 const compact=n=>new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n);
 const hash=s=>[...s].reduce((n,c)=>((n*31+c.charCodeAt(0))>>>0),7);
 function addUsageColumns(){
  const host=$('#jsgain');if(!host)return;
  const dataRows=[...host.querySelectorAll('.ovgr:not(.ovgr-h):not(.ovgr-total)')];
  host.querySelectorAll('.ovgr:not([data-product-columns])').forEach(row=>{
   row.dataset.productColumns='1';
   row.style.gridTemplateColumns=row.style.gridTemplateColumns.replace(/ 4px minmax\(100px,\s*1fr\)$/,' 96px 112px 112px 142px 4px minmax(100px,1fr)');
   const anchor=row.children[row.children.length-2];if(!anchor)return;
   if(row.classList.contains('ovgr-h')){
    ['Tokens','Spend limit','Spend action','Spend limit rule'].forEach(t=>row.insertBefore(E('span',t,'ovgn'),anchor));
   }else if(row.classList.contains('ovgr-total')){
    const rows=window.__gainRows||[];
    const totals=[compact(rows.reduce((n,r)=>n+(r.tokens||0),0)),'','',''];
    totals.forEach((t,i)=>row.insertBefore(E('span',t,i===0?'ovgn':''),anchor));
   }else{
    const info=window.__gainRows?.[dataRows.indexOf(row)];
    [compact(info?.tokens||0),info?.limit===null?'—':money(info?.limit||0),
      info?.spendAction||'—',info?.limitRule||'—'].forEach((t,i)=>row.insertBefore(E('span',t,i<2?'ovgn':'platform-muted'),anchor));
   }
  });
 }

 let summaryMode='average';
 const summaryLabels={average:'Average',sum:'Sum',min:'Min',max:'Max',median:'Median'};
 function applySummary(){
  const host=$('#st-table'),head=host?.querySelector('.sttr-h');if(!head)return;
  const headers=[...head.querySelectorAll(':scope > .num')];
  host.querySelectorAll('.sttr[data-s]').forEach(row=>{
   const values=[...row.querySelectorAll(':scope > .num')].map((cell,i)=>({cell,i,value:Number(cell.textContent.replace(/[^0-9.-]/g,''))})).filter(x=>Number.isFinite(x.value)&&!/projected/i.test(headers[x.i]?.textContent||''));
   const nums=values.map(x=>x.value).sort((a,b)=>a-b);if(!nums.length)return;
   let value;
   if(summaryMode==='sum')value=nums.reduce((a,b)=>a+b,0);
   else if(summaryMode==='min')value=nums[0];
   else if(summaryMode==='max')value=nums[nums.length-1];
   else if(summaryMode==='median'){const m=Math.floor(nums.length/2);value=nums.length%2?nums[m]:(nums[m-1]+nums[m])/2}
   else value=nums.reduce((a,b)=>a+b,0)/nums.length;
   const cell=row.querySelector(':scope > .avg');if(cell)cell.textContent=money(value);
  });
  const label=$('#st-summary-label');if(label)label.textContent=summaryLabels[summaryMode];
 }
 function addSummaryMenu(){
  const host=$('#st-table'),head=host?.querySelector('.sttr-h'),cell=head?.querySelector(':scope > .avg');if(!cell||cell.dataset.summaryReady)return;
  document.querySelectorAll('.platform-summary-menu').forEach(x=>x.remove());
  cell.dataset.summaryReady='1';cell.classList.add('platform-summary-cell');
  const button=E('button',undefined,'platform-summary-trigger');button.type='button';button.setAttribute('aria-haspopup','listbox');
  button.append(E('span',summaryLabels[summaryMode]));button.firstChild.id='st-summary-label';button.insertAdjacentHTML('beforeend','<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9l6 6 6-6"/></svg>');
  const menu=E('span',undefined,'platform-summary-menu');menu.setAttribute('role','listbox');
  Object.entries(summaryLabels).forEach(([value,label])=>{const opt=E('button',label,'platform-summary-option');opt.type='button';opt.dataset.value=value;opt.setAttribute('role','option');opt.setAttribute('aria-selected',String(value===summaryMode));opt.onclick=e=>{e.stopPropagation();summaryMode=value;menu.querySelectorAll('[role="option"]').forEach(x=>x.setAttribute('aria-selected',String(x.dataset.value===value)));menu.removeAttribute('data-open');applySummary()};menu.append(opt)});
  button.onclick=e=>{
   e.stopPropagation();const opening=!menu.hasAttribute('data-open');
   document.querySelectorAll('.platform-summary-menu[data-open]').forEach(x=>x.removeAttribute('data-open'));
   if(opening){menu.setAttribute('data-open','');const r=button.getBoundingClientRect(),h=menu.offsetHeight;menu.style.left=Math.max(8,Math.min(innerWidth-menu.offsetWidth-8,r.right-menu.offsetWidth))+'px';menu.style.top=Math.max(8,r.top-h-6)+'px'}
  };
  cell.replaceChildren(button);document.body.append(menu);applySummary();
 }

 function polishAccess(){
  document.querySelectorAll('#accm [data-add]').forEach(b=>b.className='accbtn');
  const summary=$('#accm .accsum');if(summary)summary.hidden=true;
  document.querySelectorAll('#accm .accr-row').forEach(row=>{
   const preview=row.querySelector('.accr-prev'),button=row.querySelector('.accr-count');if(!preview||!button||button.dataset.chips===preview.textContent)return;
   const raw=preview.textContent.trim();button.dataset.chips=raw;preview.hidden=true;
   const chevron=button.querySelector('svg')?.cloneNode(true);button.replaceChildren();
   raw.split(/,\s*/).filter(Boolean).forEach(name=>button.append(E('span',name,'platform-selection-chip')));
   if(chevron)button.append(chevron);
  });
 }
function enhanceModelAccessSplit(){
  const split=$('#acc-view-split'),table=$('#acc-view-table');
  if(!split||!table)return;
  split.hidden=false;table.hidden=true;
  const checkMarkup='<span class="accp-cb"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg></span>';
  function polishSplit(){
   const providers=split.querySelector('.accside');
   if(providers&&!providers.querySelector('.platform-providers-heading')){
    const heading=E('h3',undefined,'platform-providers-heading'),label=E('label',undefined,'acctcb platform-provider-select-all'),box=E('input');
    box.type='checkbox';box.setAttribute('aria-label','Select all visible providers');label.append(box);label.insertAdjacentHTML('beforeend',checkMarkup);heading.append(label,E('span','Providers'));
    box.addEventListener('change',()=>{split.querySelectorAll('.accprov:not([hidden]) .platform-provider-select input').forEach(cb=>{if(cb.checked!==box.checked)cb.click()});requestAnimationFrame(syncSplit)});
    providers.prepend(heading);
   }
   split.querySelectorAll('.accprov').forEach(provider=>{
    if(provider.querySelector(':scope > .platform-provider-select'))return;
    const label=E('label',undefined,'acctcb platform-provider-select'),box=E('input');box.type='checkbox';
    box.setAttribute('aria-label','Select all models from '+(provider.querySelector('.accprov-t')?.textContent.trim()||'provider'));
    label.append(box);label.insertAdjacentHTML('beforeend',checkMarkup);label.addEventListener('click',event=>event.stopPropagation());
    box.addEventListener('change',()=>{const pane=$('#'+provider.dataset.prov);pane?.querySelectorAll('.accrow:not([hidden]) .platform-access-select input').forEach(cb=>{if(cb.checked!==box.checked)cb.click()});requestAnimationFrame(syncSplit)});
    provider.prepend(label);
   });
   split.querySelectorAll('.accprov-m,.accfind').forEach(node=>node.remove());
   split.querySelector('.accside-h > span:last-child:empty')?.remove();
   split.querySelectorAll('.accchip svg path[d="M12 20h9"]').forEach(path=>path.remove());
   split.querySelectorAll('.accname').forEach(name=>{
    name.dataset.fullName||=name.textContent.trim();
    name.textContent=name.dataset.fullName.replace(/^(Claude|Mistral|Wonderful|DeepSeek)\s+/,'');
   });
   split.querySelectorAll('.accchip-t').forEach(host=>{
    host.querySelectorAll('.accchip-m').forEach(label=>label.remove());
    const tags=[...host.querySelectorAll(':scope > .acctag:not(.acctag-n)')];
    const existing=host.querySelector(':scope > .acctag-n');
    if(tags.length>1&&!existing){tags.slice(1).forEach(tag=>tag.remove());host.append(E('span','+'+(tags.length-1)+' more','acctag acctag-n'))}
    else if(existing&&!/more$/.test(existing.textContent))existing.textContent+=' more';
   });
  }
  polishSplit();

  // Keep the current table toolbar as the single source of filter state.
  // Moving it preserves all of the existing handlers (including the audience
  // picker), while the table rows remain hidden as a lightweight state mirror.
  let controls=$('#platform-access-controls');
  if(!controls){
   controls=E('div',undefined,'platform-access-controls');controls.id='platform-access-controls';
   split.parentElement.insertBefore(controls,split);
   const bar=table.querySelector('.acctb-bar'),bulk=table.querySelector('.acctb-bulk');
   bar?.querySelector('#acctb-provsel')?.remove();
   bar?.querySelector('#acctb-accsel')?.remove();
   $('#acctb-sortsel')?.remove();
   if(bar)controls.append(bar);if(bulk)controls.append(bulk);
   controls.addEventListener('click',e=>{
    const current=e.target.closest('.bgsel');
    requestAnimationFrame(()=>controls.querySelectorAll('.bgsel[data-open]').forEach(x=>{if(x!==current)x.removeAttribute('data-open')}));
   });
   document.addEventListener('click',e=>{if(!controls.contains(e.target))controls.querySelectorAll('.bgsel[data-open]').forEach(x=>x.removeAttribute('data-open'))});
  }

  const status=$('#acctb-statsel');
  if(status&&!$('#platform-access-status')){
   const switcher=E('span',undefined,'gnseg platform-access-status');switcher.id='platform-access-status';switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Model status');
   [['all','All'],['on','Active'],['off','Inactive']].forEach(([value,label])=>{const button=E('button',label);button.type='button';button.dataset.v=value;button.onclick=()=>{status.querySelector('.bgopt[data-v="'+({on:'active',off:'inactive'}[value]||value)+'"]').click();switcher.querySelectorAll('button').forEach(item=>item.toggleAttribute('data-on',item===button));requestAnimationFrame(syncSplit)};switcher.append(button)});
   const current=status.querySelector('.bgopt[data-v][data-on]')?.dataset.v||'all';switcher.querySelector('[data-v="'+current+'"]')?.setAttribute('data-on','');
   status.insertAdjacentElement('beforebegin',switcher);status.hidden=true;
  }

  split.querySelectorAll('.accrow').forEach(row=>{
   if(row.querySelector(':scope > .platform-access-select'))return;
   const label=E('label',undefined,'acctcb platform-access-select');
   const box=E('input');box.type='checkbox';box.setAttribute('aria-label','Select '+row.dataset.model);
   label.append(box);label.insertAdjacentHTML('beforeend',checkMarkup);
   label.addEventListener('click',e=>e.stopPropagation());
   box.addEventListener('change',()=>{
    const mirror=[...document.querySelectorAll('#acctb-rows .acctr')].find(x=>x.dataset.model===row.dataset.model)?.querySelector('.acctcb input');
    if(mirror&&mirror.checked!==box.checked)mirror.click();
    requestAnimationFrame(syncSplit);
   });
   row.prepend(label);
  });
  split.querySelectorAll('.accpane-h').forEach(head=>{
   if(head.querySelector('.platform-access-select-all'))return;
   const label=E('label',undefined,'acctcb platform-access-select-all');
   const box=E('input');box.type='checkbox';box.setAttribute('aria-label','Select all visible models for this provider');
   label.append(box);label.insertAdjacentHTML('beforeend',checkMarkup);
   box.addEventListener('change',()=>{
    const pane=head.closest('.accpane');
    pane.querySelectorAll('.accrow:not([hidden]) .platform-access-select input').forEach(cb=>{if(cb.checked!==box.checked)cb.click()});
    requestAnimationFrame(syncSplit);
   });
   head.prepend(label);
  });

  function syncSplit(){
   polishSplit();
   const mirrorRows=[...document.querySelectorAll('#acctb-rows .acctr')];
   const order=new Map(mirrorRows.map((row,i)=>[row.dataset.model,i]));
   const visible=new Set(order.keys());
   const checked=new Set(mirrorRows.filter(row=>row.querySelector('.acctcb input')?.checked).map(row=>row.dataset.model));
   split.querySelectorAll('.accpane').forEach(pane=>{
    const q=(pane.querySelector('.accfind')?.value||'').trim().toLowerCase();
    const body=pane.querySelector('.accpane-b'),rows=[...pane.querySelectorAll('.accrow')];
    rows.sort((a,b)=>(order.get(a.dataset.model)??1e6)-(order.get(b.dataset.model)??1e6)).forEach(row=>body?.append(row));
    rows.forEach(row=>{
     const shown=visible.has(row.dataset.model)&&(!q||row.dataset.model.toLowerCase().includes(q));
     row.hidden=!shown;
     const box=row.querySelector('.platform-access-select input');if(box)box.checked=checked.has(row.dataset.model);
    });
    const shown=rows.filter(row=>!row.hidden),selected=shown.filter(row=>checked.has(row.dataset.model)).length;
    const all=pane.querySelector('.platform-access-select-all input');
    if(all){all.checked=shown.length>0&&selected===shown.length;all.indeterminate=selected>0&&selected<shown.length;all.disabled=!shown.length}
    const none=pane.querySelector('.accnone');if(none)none.hidden=shown.length>0;
   });
   const providers=[...split.querySelectorAll('.accprov')];
   providers.forEach(provider=>{
    const pane=$('#'+provider.dataset.prov),has=!!pane?.querySelector('.accrow:not([hidden])');
    provider.hidden=!has;
    const shown=[...(pane?.querySelectorAll('.accrow:not([hidden])')||[])],selected=shown.filter(row=>checked.has(row.dataset.model)).length,box=provider.querySelector('.platform-provider-select input');
    if(box){box.checked=shown.length>0&&selected===shown.length;box.indeterminate=selected>0&&selected<shown.length;box.disabled=!shown.length}
   });
   const shownProviders=providers.filter(provider=>!provider.hidden),selectedProviders=shownProviders.filter(provider=>provider.querySelector('.platform-provider-select input')?.checked).length,mixedProviders=shownProviders.some(provider=>provider.querySelector('.platform-provider-select input')?.indeterminate);
   const providerAll=split.querySelector('.platform-provider-select-all input');if(providerAll){providerAll.checked=shownProviders.length>0&&selectedProviders===shownProviders.length;providerAll.indeterminate=mixedProviders||selectedProviders>0&&selectedProviders<shownProviders.length;providerAll.disabled=!shownProviders.length}
   const current=providers.find(provider=>provider.hasAttribute('data-on'));
   if(!current||current.hidden)providers.find(provider=>!provider.hidden)?.querySelector('.accprov-b')?.click();
   let empty=split.querySelector('.platform-access-empty');
   if(!empty){empty=E('section',undefined,'platform-access-empty');empty.setAttribute('role','status');empty.append(E('h3','No models match your filters'),E('p','Try a different search or remove filters to see more models.'));const clear=E('button','Clear filters','platform-button');clear.type='button';clear.onclick=()=>{P.clearModelAccessFilters?.();const q=$('#acctb-q');if(q){q.value='';q.dispatchEvent(new Event('input',{bubbles:true}))}$('#platform-access-status button[data-v="all"]')?.click()};empty.append(clear);split.append(empty)}
   const isEmpty=mirrorRows.length===0;split.toggleAttribute('data-empty',isEmpty);empty.hidden=!isEmpty;
  }
  window.__syncAccessSplit=syncSplit;
  if(!split.dataset.platformWired){
   split.dataset.platformWired='1';
   split.addEventListener('click',e=>{if(e.target.closest('.accsw,.accprov-b'))requestAnimationFrame(()=>{window.__renderAccessTable?.();syncSplit()})});
   split.addEventListener('input',e=>{if(e.target.matches('.accfind'))requestAnimationFrame(syncSplit)});
   const rows=$('#acctb-rows');if(rows)new MutationObserver(syncSplit).observe(rows,{childList:true,subtree:true});
   const bulk=$('#acctb-bulk');if(bulk)new MutationObserver(syncSplit).observe(bulk,{attributes:true,childList:true,subtree:true,characterData:true});
  }
  syncSplit();
 }
 P.enhanceModelAccessSplit=enhanceModelAccessSplit;
 addUsageColumns();addSummaryMenu();polishAccess();polishOverview();enhanceModelAccessSplit();P.enhanceResizableTables();
 const watch=new MutationObserver(()=>{addUsageColumns();addSummaryMenu();polishAccess();polishOverview();P.enhanceResizableTables()});
 ['jsgain','st-table','accm','st-chart','jsspendbig'].forEach(id=>{const n=$('#'+id);if(n)watch.observe(n,{childList:true,subtree:true,characterData:true})});
 document.addEventListener('click',e=>{if(!e.target.closest('.platform-summary-trigger')&&!e.target.closest('.platform-summary-menu'))document.querySelector('.platform-summary-menu[data-open]')?.removeAttribute('data-open')});
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>{init();setTimeout(productChanges)}):(init(),setTimeout(productChanges));
})();
