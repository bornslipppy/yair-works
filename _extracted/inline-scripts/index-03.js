window.addEventListener("load", function () {
  if (window.innerWidth <= 1199) return;
  const logo = document.querySelector(".hero-reveal-logo");
  const topText = document.querySelector(".hero-reveal-top");
  const bottomText = document.querySelector(".hero-reveal-bottom");

  const revealItems = [bottomText, topText, logo].filter(Boolean);

  gsap.set(revealItems, { yPercent: 120, opacity: 0 });

  gsap.timeline({ delay: 4.65 })
    .to(bottomText, { yPercent: 0, opacity: 1, duration: 1.2, ease: "expo.out" })
    .to(topText, { yPercent: 0, opacity: 1, duration: 1.2, ease: "expo.out" }, "-=1.08")
    .to(logo, { yPercent: 0, opacity: 1, duration: 1.2, ease: "expo.out" }, "-=1.08");
});
