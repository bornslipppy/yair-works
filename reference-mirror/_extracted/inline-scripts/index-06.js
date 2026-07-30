if (window.innerWidth > 1199) {
  const lineFill = document.querySelector(".preloader-line-fill");
  const percent = document.querySelector(".preloader-percent");
  const duration = 4000;
  const startTime = performance.now();

  gsap.to([".preloader-title", ".preloader-percent", ".preloader-line"], {
    opacity: 1, duration: 0.8, ease: "power2.out"
  });

  function animateFakeLoader(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = progress * 100;
    if (lineFill) lineFill.style.width = value + "%";
    if (percent) percent.textContent = value.toFixed(0);
    if (progress < 1) requestAnimationFrame(animateFakeLoader);
  }

  requestAnimationFrame(animateFakeLoader);

  setTimeout(() => {
    gsap.to([".preloader-title", ".preloader-percent", ".preloader-line"], {
      opacity: 0, duration: 0.25, ease: "power2.out",
      onComplete: () => {
        gsap.set([".preloader-title", ".preloader-percent", ".preloader-line"], { display: "none" });
      }
    });
  }, 4050);

  setTimeout(() => {
    gsap.to(".preloader-top", { yPercent: -100, duration: 1.2, ease: "expo.inOut" });
    gsap.to(".preloader-bottom", { yPercent: 100, duration: 1.2, ease: "expo.inOut" });
    gsap.set(".preloader", { pointerEvents: "none", display: "none", delay: 1.4 });
  }, 4300);
}
