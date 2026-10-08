/* Wonderful's SidebarNav + SecondarySidebarMenu, adapted to the prototype's
   existing radio-based pages, with one URL/history owner. */
(() => {
  'use strict';
  function init() {
    const art = document.querySelector('.art');
    const panel = document.querySelector('.artpanel');
    const oldNav = document.querySelector('[data-nav="ov"]')?.parentElement;
    if (!art || !panel || !oldNav || art.classList.contains('ws-shell')) return;
    // First-release scope; keep legacy/ranked prototypes and underlying key code intact.
    const firstRelease = !!document.querySelector('#model-router.smr-page');
    const icon = name => `<svg width="18" height="18" aria-hidden="true"><use href="assets/shell-icons.svg#${name}"></use></svg>`;
    const button = (label, glyph, className = 'ws-icon-button') => {
      const node = document.createElement('button');
      node.type = 'button'; node.className = className;
      node.setAttribute('aria-label', label); node.title = label;
      node.innerHTML = icon(glyph); return node;
    };
    art.classList.add('ws-shell');
    const global = document.createElement('aside');
    global.className = 'ws-global'; global.id = 'wonderful-navigation';
    global.setAttribute('aria-label', 'Wonderful navigation');
    global.innerHTML = `<a class="ws-brand" href="#wonderful/wonderful-agent" aria-label="Wonderful home"><img class="ws-orb" src="assets/wonderful-orb.png" alt=""><img class="ws-wordmark" src="assets/wonderful-wordmark.svg" alt="Wonderful"></a><nav class="ws-global-items" aria-label="Wonderful products"></nav>`;
    const items = [
      ['Wonderful Agent','Sphere','/'], ['Agents','TreeStructure','/agent-studio-v2'],
      ['AI Gateway','Graph',null], ['Activities','Pulse','/activities'],
      ['Dashboard','ChartBar','/dashboard'], ['Apps','SquaresFour','/apps'],
      ['Issues','BugBeetle','/issues'], ['Alerts','Siren','/alerts-center'],
      ['Campaigns','PhoneOutgoing','/campaigns'], ['Governance','ShieldCheck','/governance'],
      ['Resources','Stack','/resources'], ['Catalog','PuzzlePiece','/catalog'],
      ['Settings','Gear','/settings']
    ];
    let gateway;
    for (const [label, glyph, path] of items) {
      const item = document.createElement('button');
      item.type = 'button';
      item.dataset.product = path === null ? 'gateway' : label.toLowerCase().replaceAll(' ', '-');
      item.className = 'ws-global-item'; item.title = label;
      item.setAttribute('aria-label', label);
      item.innerHTML = icon(glyph) + `<span class="ws-global-label">${label}</span>`;
      if (path === null) {
        item.type = 'button'; item.setAttribute('aria-current', 'page');
        item.setAttribute('aria-controls', 'gateway-navigation'); gateway = item;
      } else {
        item.onclick = () => navigate({product:item.dataset.product});
      }
      global.querySelector('nav').append(item);
    }
    const collapse = button('Collapse Wonderful navigation', 'SidebarSimple', 'ws-global-item ws-collapse');
    collapse.innerHTML += '<span class="ws-global-label">Collapse sidebar</span>';
    global.append(collapse);
    const secondary = document.createElement('aside');
    secondary.className = 'ws-secondary'; secondary.id = 'gateway-navigation';
    secondary.setAttribute('aria-label', 'AI Gateway navigation');
    const localHeading = document.createElement('div'); localHeading.className = 'ws-local-heading';
    localHeading.innerHTML = '<span>AI Gateway</span>';
    const localClose = button('Hide AI Gateway navigation', 'SidebarSimple');
    localHeading.append(localClose);
    const localNav = document.createElement('nav'); localNav.setAttribute('aria-label', 'AI Gateway pages');
    // Move, never clone: existing handlers, current route and drawer links survive.
    oldNav.querySelectorAll('[data-nav]').forEach(node => localNav.append(node));
    if(firstRelease)localNav.querySelector('[data-nav="vk"]')?.style.setProperty('display','none','important');
    secondary.append(localHeading, localNav); oldNav.remove();
    art.prepend(global); panel.prepend(secondary);
    const header = secondary.nextElementSibling; header.classList.add('ws-topbar');
    header.firstElementChild.remove(); header.firstElementChild.remove();
    [...header.children].find(node=>node.textContent.trim()==='/')?.classList.add('ws-crumb-divider');
    const globalToggle = button('Open Wonderful navigation', 'List', 'ws-icon-button ws-mobile-menu');
    globalToggle.setAttribute('aria-controls', global.id);
    const localToggle = button('Toggle AI Gateway navigation', 'SidebarSimple');
    localToggle.setAttribute('aria-controls', secondary.id);
    const crumb = document.createElement('button'); crumb.type = 'button';
    crumb.className = 'ws-product-crumb'; crumb.textContent = 'AI Gateway';
    header.prepend(globalToggle, localToggle, crumb);
    const backdrop = document.createElement('button');
    backdrop.type = 'button'; backdrop.className = 'ws-backdrop'; backdrop.hidden = true;
    backdrop.setAttribute('aria-label', 'Close navigation'); document.body.append(backdrop);
    const mobile = matchMedia('(max-width: 760px)');
    const compact = matchMedia('(max-width: 1180px)');
    const read = key => {try{return localStorage.getItem('wonderful-shell.'+key);}catch{return null;}};
    const save = (key,value) => {try{localStorage.setItem('wonderful-shell.'+key,String(value));}catch{}};
    let collapsed = read('collapsed') === null ? compact.matches : read('collapsed') === 'true';
    let desktopLocalOpen = read('local-open') !== 'false';
    let localOpen = !mobile.matches && desktopLocalOpen, globalOpen = false;
    let route, routing = false, lastGateway = read('last-page') || 'ov';
    if(!ShellState.pages[lastGateway])lastGateway='ov';
    const placeholder = document.createElement('section');
    placeholder.className = 'ws-global-page'; placeholder.hidden = true;
    placeholder.innerHTML = '<h1></h1><p>This area belongs to the Wonderful platform. This local prototype implements AI Gateway.</p><div><button type="button" class="bgb bgb-p">Back to AI Gateway</button><a class="bgb" target="_blank" rel="noopener noreferrer">Open in Wonderful ↗</a></div>';
    panel.append(placeholder);
    placeholder.querySelector('button').onclick=()=>navigate({product:'gateway',page:lastGateway});
    function applyRoute(next) {
      if(firstRelease&&next.product==='gateway'&&next.page==='vk'){next={product:'gateway',page:'ov'};history.replaceState(null,'',ShellState.hash(next));}
      const productItem = global.querySelector('[data-product="'+next.product+'"]');
      if(!productItem)next={product:'gateway',page:'ov'};
      const isGateway=next.product==='gateway';
      route=next; routing=true;
      if(isGateway){
        lastGateway=next.page;save('last-page',lastGateway);
        const radio=document.getElementById('nv-'+next.page);
        radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));
      }
      routing=false;
      art.classList.toggle('ws-global-destination',!isGateway);
      placeholder.hidden=isGateway;
      localOpen=isGateway&&!mobile.matches&&desktopLocalOpen;globalOpen=false;
      localToggle.hidden=!isGateway;
      crumb.textContent=isGateway?'AI Gateway':productItem?.getAttribute('aria-label')||'AI Gateway';
      crumb.disabled=!isGateway&&!mobile.matches;
      global.querySelectorAll('[data-product]').forEach(item=>{if(item.dataset.product===next.product)item.setAttribute('aria-current','page');else item.removeAttribute('aria-current');});
      if(!isGateway){
        placeholder.querySelector('h1').textContent=crumb.textContent;
        placeholder.querySelector('a').href='https://app.wonderful.ai'+items.find(item=>item[0]===crumb.textContent)[2];
      }
      if(!next.task)window.TasksUI?.closeDetail(false);
      sync();
    }
    function navigate(next,{replace=false}={}) {
      const hash=ShellState.hash(next);
      if(location.hash!==hash)history[replace?'replaceState':'pushState'](null,'',hash);
      const changed=!route||route.product!==next.product||route.page!==next.page;
      applyRoute(next);
      if(changed)window.scrollTo({top:0,left:0,behavior:'instant'});
    }
    function fromHistory(){applyRoute(ShellState.parse(location.hash));window.scrollTo({top:0,left:0,behavior:'instant'});}
    global.querySelector('.ws-brand').onclick=event=>{event.preventDefault();navigate({product:'wonderful-agent'});};
    window.addEventListener('popstate',fromHistory);
    window.addEventListener('hashchange',fromHistory);
    document.querySelectorAll('input[name="nv"]').forEach(radio=>radio.addEventListener('change',()=>{
      if(routing||!radio.checked)return;
      const page=radio.id.slice(3);
      const task=page==='tasks'&&location.hash.startsWith('#task/')?location.hash.slice(6):undefined;
      navigate({product:'gateway',page,task});
    }));
    localNav.querySelectorAll('[data-nav]').forEach(item=>{item.onclick=()=>navigate({product:'gateway',page:item.dataset.nav});});
    window.GatewayShell={navigate};
    function sync() {
      art.classList.toggle('ws-global-collapsed', collapsed);
      art.classList.toggle('ws-local-hidden', !localOpen);
      art.classList.toggle('ws-global-open', globalOpen);
      global.inert = mobile.matches && !globalOpen;
      secondary.inert = !localOpen;
      globalToggle.setAttribute('aria-expanded', String(globalOpen));
      localToggle.setAttribute('aria-expanded', String(localOpen));
      gateway.setAttribute('aria-expanded', String(localOpen));
      collapse.setAttribute('aria-expanded', String(!collapsed));
      const label = mobile.matches ? 'Close Wonderful navigation' : (collapsed ? 'Expand' : 'Collapse') + ' Wonderful navigation';
      collapse.setAttribute('aria-label', label); collapse.title = label;
      collapse.querySelector('span').textContent = mobile.matches ? 'Close navigation' : 'Collapse sidebar';
      backdrop.hidden = !(mobile.matches && (globalOpen || localOpen));
      document.body.classList.toggle('ws-navigation-open', !backdrop.hidden);
      // The mobile menus are modal surfaces; keep background pages out of both
      // the keyboard order and the accessibility tree until the menu closes.
      [header, placeholder, ...panel.querySelectorAll(':scope > .pg')].forEach(node => { node.inert = !backdrop.hidden; });
      for (const [node, open] of [[global, globalOpen], [secondary, localOpen]]) {
        if (mobile.matches && open) { node.setAttribute('role', 'dialog'); node.setAttribute('aria-modal', 'true'); }
        else { node.removeAttribute('role'); node.removeAttribute('aria-modal'); }
      }
      resizeCanvas();
    }
    function closeMenus() { globalOpen = false; localOpen = false; sync(); }
    function showLocal() {
      if(route.product!=='gateway')navigate({product:'gateway',page:lastGateway});
      globalOpen = false; localOpen = true; sync();
      if(!mobile.matches){desktopLocalOpen=true;save('local-open',true);}
      if (mobile.matches) localNav.querySelector('[aria-current="page"]')?.focus({preventScroll:true});
    }
    gateway.onclick = showLocal; crumb.onclick = () => {if(route.product==='gateway')showLocal();else globalToggle.click();};
    collapse.onclick = () => {
      if (mobile.matches) { globalOpen = false; sync(); globalToggle.focus(); }
      else { collapsed = !collapsed; save('collapsed',collapsed);sync(); }
    };
    globalToggle.onclick = () => { globalOpen = !globalOpen; localOpen = false; sync(); if(globalOpen) gateway.focus(); };
    localToggle.onclick = () => { localOpen = !localOpen; globalOpen = false;if(!mobile.matches){desktopLocalOpen=localOpen;save('local-open',localOpen);}sync();if(localOpen&&mobile.matches)localClose.focus({preventScroll:true}); };
    localClose.onclick = () => { localOpen = false;if(!mobile.matches){desktopLocalOpen=false;save('local-open',false);}sync();localToggle.focus({preventScroll:true}); };
    backdrop.onclick = () => { const wasGlobal = globalOpen; closeMenus(); (wasGlobal ? globalToggle : localToggle).focus(); };
    localNav.addEventListener('click', event => {
      if (!event.target.closest('[data-nav]')) return;
      if (mobile.matches) { closeMenus(); localToggle.focus({preventScroll:true}); }
    });
    document.addEventListener('keydown', event => {
      if (backdrop.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); backdrop.click(); return; }
      if (event.key !== 'Tab') return;
      const scope = globalOpen ? global : secondary;
      const focusable = [...scope.querySelectorAll('button,a[href]')].filter(node => node.getClientRects().length);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !scope.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !scope.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    });
    mobile.addEventListener('change', () => {
      if (mobile.matches) localOpen = false;
      else localOpen = route.product==='gateway'&&desktopLocalOpen;
      globalOpen = false; sync();
    });
    compact.addEventListener('change', () => { if(read('collapsed')===null)collapsed=compact.matches;sync(); });
    function resizeCanvas() {
      const width = panel.clientWidth - (localOpen && !mobile.matches ? 240 : 0);
      art.classList.toggle('ws-canvas-narrow', width < 900);
      art.classList.toggle('ws-canvas-small', width < 600);
    }
    new ResizeObserver(resizeCanvas).observe(panel);
    navigate(ShellState.parse(location.hash),{replace:true});
  }
  // PlatformUI first upgrades the original labels and applies the destination order.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init));
  else setTimeout(init);
})();
