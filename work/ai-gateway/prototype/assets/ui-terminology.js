(function(){
'use strict';
// Normalize presentation copy only. Dataset keys, IDs, input values, and
// accounting dimensions retain their existing stable identifiers.
const terms={person:'user',persons:'users',people:'users',team:'group',teams:'groups',department:'group',departments:'groups',tool:'source',tools:'sources'};
function wording(value){
 return value.replace(/\b(persons?|people|teams?|departments?|tools?)\b/gi,word=>{
  const replacement=terms[word.toLowerCase()];
  return word===word.toUpperCase()?replacement.toUpperCase():/^[A-Z]/.test(word)?replacement[0].toUpperCase()+replacement.slice(1):replacement;
 });
}
const skip='script,style,code,pre,textarea,[contenteditable="true"],[data-ui-verbatim],.bal-name,.bal-opt-n,.ovgnm,.accp-item,.ovscope-chip,.mr-picker-copy';
function visit(node){
 if(node.nodeType===Node.TEXT_NODE){if(node.parentElement&&!node.parentElement.closest(skip)){const next=wording(node.data);if(next!==node.data)node.data=next}return;}
 if(node.nodeType!==Node.ELEMENT_NODE||node.matches(skip)||node.closest(skip))return;
 for(const attr of ['aria-label','title','placeholder'])if(node.hasAttribute(attr)){const old=node.getAttribute(attr),next=wording(old);if(next!==old)node.setAttribute(attr,next)}
 node.childNodes.forEach(visit);
}
function init(){
 visit(document.body);
 const observer=new MutationObserver(records=>{
  observer.disconnect();
  for(const record of records){
   if(record.type==='childList')record.addedNodes.forEach(visit);
   else visit(record.target);
  }
  observe();
 });
 const observe=()=>observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder']});
 observe();
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
