(function() {
  if (window.innerWidth > 1199) return;
  document.addEventListener("DOMContentLoaded", function() {
    var kill = [".bottom-embed", ".archive-visual-block", ".archive-visual-embed"];
    kill.forEach(function(sel) {
      var el = document.querySelector(sel);
      if (el) { el.innerHTML = ""; el.style.display = "none"; }
    });
  });
})();
