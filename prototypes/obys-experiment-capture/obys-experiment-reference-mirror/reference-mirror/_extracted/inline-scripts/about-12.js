window.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined") return;
  const overlay = document.querySelector(".page-transition-overlay");
  const preloaderText = document.querySelector(".about-preloader-text");
  if (!overlay) return;
  const currentPath = window.location.pathname;
  document.querySelectorAll("a[href='/'], a[href='/about']").forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === currentPath) return;
      e.preventDefault();
      if (preloaderText) gsap.set(preloaderText, { display: "none" });
      const goingToAbout = href.includes("about");
      sessionStorage.setItem("obys-transition-direction", goingToAbout ? "down" : "up");
      gsap.set(overlay, { display: "block", yPercent: goingToAbout ? -100 : 100 });
      gsap.to(overlay, { yPercent: 0, duration: 0.75, ease: "power4.inOut", onComplete: () => { window.location.href = href; } });
    });
  });
});
