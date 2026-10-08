/* Pure routing helpers shared by the shell and its regression tests. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.ShellState=api;})(typeof window==='object'?window:this,function(){
  const pages={ov:'overview',gain:'usage',caps:'spend-limits',pol:'governance',tasks:'tasks',acc:'model-access',rou:'model-router',vk:'virtual-keys'};
  function parse(hash){
    if(/^#task\/.+/.test(hash))return {product:'gateway',page:'tasks',task:hash.slice(6)};
    const old=hash.match(/^#nv-(\w+)$/);
    if(old&&pages[old[1]])return {product:'gateway',page:old[1]};
    const local=Object.keys(pages).find(key=>hash==='#gateway/'+pages[key]);
    if(local)return {product:'gateway',page:local};
    const global=hash.match(/^#wonderful\/([a-z0-9-]+)$/);
    return global?{product:global[1]}:{product:'gateway',page:'ov'};
  }
  function hash(route){return route.product==='gateway'?(route.task?'#task/'+route.task:'#gateway/'+pages[route.page||'ov']):'#wonderful/'+route.product;}
  return {pages,parse,hash};
});
