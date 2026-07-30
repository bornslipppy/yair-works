window.addEventListener("DOMContentLoaded", () => {
  const preloaderText = document.querySelector(".about-preloader-text");
  if (!preloaderText) return;
  const base = preloaderText.textContent.replace(/\.+$/, "");
  preloaderText.innerHTML = base + '<span class="loading-dot">.</span><span class="loading-dot">.</span><span class="loading-dot">.</span>';
});
