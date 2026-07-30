window.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth <= 1199) return;
  const cursorEl = document.createElement("div");
  cursorEl.className = "about-custom-cursor";
  document.body.appendChild(cursorEl);
  const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2, visible: false };
  window.addEventListener("mousemove", (e) => { cursor.targetX = e.clientX; cursor.targetY = e.clientY; cursor.visible = true; });
  document.addEventListener("mouseleave", () => { cursor.visible = false; });
  document.addEventListener("mouseenter", () => { cursor.visible = true; });
  function animateCursor() {
    cursor.x += (cursor.targetX - cursor.x) * 0.15;
    cursor.y += (cursor.targetY - cursor.y) * 0.15;
    cursorEl.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0) translate(-50%, -50%)`;
    cursorEl.style.opacity = cursor.visible ? "1" : "0";
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
});
