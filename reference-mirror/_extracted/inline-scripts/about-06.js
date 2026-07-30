window.addEventListener("load", () => {
  if (window.innerWidth <= 1199) return;
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ duration: 1.2, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.1, infinite: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
});
