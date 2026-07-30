window.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined") return;
  const overlay = document.querySelector(".page-transition-overlay");
  if (!overlay) return;
  const currentPath = window.location.pathname;
  const direction = sessionStorage.getItem("obys-transition-direction");
  gsap.set(overlay, { display: "block", yPercent: direction ? 0 : -100 });
  if (direction) {
    sessionStorage.removeItem("obys-transition-direction");
    gsap.to(overlay, {
      yPercent: direction === "down" ? 100 : -100,
      duration: 0.85, ease: "power4.inOut", delay: 0.05
    });
  }
  document.querySelectorAll("a[href='/'], a[href='/about']").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === currentPath) return;
      e.preventDefault();
      const goingToAbout = href.includes("about");
      sessionStorage.setItem("obys-transition-direction", goingToAbout ? "down" : "up");
      gsap.set(overlay, { display: "block", yPercent: goingToAbout ? -100 : 100 });
      gsap.to(overlay, {
        yPercent: 0, duration: 0.75, ease: "power4.inOut",
        onComplete: () => { window.location.href = href; }
      });
    });
  });
});
