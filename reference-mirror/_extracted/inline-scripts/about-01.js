(function(){
  var root = document.getElementById('obys-rotational-embed');
  if (!root) return;
  var embed = root.parentElement;
  var holder = embed ? embed.parentElement : null;
  if (holder && getComputedStyle(holder).position === 'static') holder.style.position = 'relative';
  if (embed) {
    embed.style.position = 'absolute';
    embed.style.inset = '0';
    embed.style.width = '100%';
    embed.style.height = '100%';
    embed.style.margin = '0';
    embed.style.padding = '0';
    embed.style.overflow = 'hidden';
  }
})();
