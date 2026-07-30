window.addEventListener("load", () => {
  if (window.innerWidth <= 1199) return;
  const overlay = document.querySelector(".page-transition-overlay");
  const preloaderText = document.querySelector(".about-preloader-text");
  const group1 = gsap.utils.toArray(".about-line-group-1");
  const group2 = gsap.utils.toArray(".about-line-group-2");
  const loadReveal = gsap.utils.toArray(".about-load-reveal");
  const scrollReveal = gsap.utils.toArray(".about-scroll-reveal").filter(el => !el.classList.contains("archive-visual-text"));
  const loadFade = gsap.utils.toArray(".about-load-fade").filter(el => !el.classList.contains("archive-table"));
  const allLines = [...group1, ...group2];
  const revealWraps = allLines.map(el => el.closest(".reveal-wrap")).filter(Boolean);
  const archiveHeader = document.querySelector(".archive-header-row");
  const archiveItems = gsap.utils.toArray(".archive-item");
  const archiveRows = [archiveHeader, ...archiveItems].filter(Boolean);
  const sideProjectHeader = document.querySelector(".side-project-names");
  const sideProjectItems = gsap.utils.toArray(".side-project-item");
  const sideProjectRows = [sideProjectHeader, ...sideProjectItems].filter(Boolean);
  const visualTextBlocks = gsap.utils.toArray(".archive-visual-text");

  archiveRows.forEach(row => {
    const line = row.querySelector('[class*="-line"]');
    if (!line) return;
    const op = parseFloat(window.getComputedStyle(line).opacity);
    line.dataset.archiveVis = op < 0.1 ? "0" : "1";
  });

  function releaseWrap(el) {
    const wrap = el.closest(".reveal-wrap");
    if (!wrap) return;
    wrap.style.overflow = "visible";
    wrap.style.overflowX = "visible";
    wrap.style.overflowY = "visible";
  }

  gsap.set([".hero-stage", ".main-frame", ".page-wrapper"], { overflow: "visible" });
  gsap.set(revealWraps, { overflow: "hidden" });
  gsap.set(allLines, { yPercent: 120, opacity: 1, x: 0 });
  gsap.set(loadReveal, { y: 40, opacity: 0 });
  gsap.set(loadFade, { opacity: 0 });
  gsap.set(scrollReveal, { y: 40, opacity: 0 });
  if (overlay) gsap.set(overlay, { display: "block", yPercent: 0 });

  archiveRows.forEach(row => {
    const textEls = Array.from(row.querySelectorAll('[class*="number"], [class*="project"]'));
    textEls.forEach(el => gsap.set(el, { clipPath: "inset(110% 0% 0% 0%)", y: 6 }));
    const line = row.querySelector('[class*="-line"]');
    if (line && line.dataset.archiveVis === "1") gsap.set(line, { clipPath: "inset(0% 100% 0% 0%)" });
  });

  sideProjectRows.forEach(row => {
    const line = row.querySelector(".side-project-item-line");
    if (line) gsap.set(line, { clipPath: "inset(0% 100% 0% 0%)" });
    const linkEls = Array.from(row.querySelectorAll(".link-style"));
    const textEls = Array.from(row.children).filter(el => !el.classList.contains("side-project-item-line") && !el.classList.contains("link-style"));
    textEls.forEach(el => gsap.set(el, { clipPath: "inset(110% 0% 0% 0%)", y: 6 }));
    linkEls.forEach(el => gsap.set(el, { opacity: 0 }));
  });

  visualTextBlocks.forEach(block => {
    Array.from(block.children).forEach(el => {
      const orig = parseFloat(window.getComputedStyle(el).opacity);
      el.dataset.originalOpacity = isNaN(orig) ? 1 : orig;
      gsap.set(el, { opacity: 0, y: 18 });
    });
  });

  gsap.set(".bottom-embed", { opacity: 0 });

  if (preloaderText) {
    gsap.fromTo(preloaderText, { y: "120%", opacity: 1 }, { y: "0%", opacity: 1, duration: 1.15, ease: "expo.out", delay: 0.18 });
  }

  function waitForEmbeds(callback) {
    let called = false;
    function done() { if (called) return; called = true; callback(); }
    function check() {
      if (document.querySelectorAll("canvas").length >= 1) { done(); } else { setTimeout(check, 100); }
    }
    setTimeout(done, 2500);
    check();
  }

  function startAboutAnimations() {
    const tl = gsap.timeline();
    if (preloaderText) tl.to(preloaderText, { y: "120%", opacity: 1, duration: 0.75, ease: "power4.inOut" }, 0);
    if (overlay) tl.to(overlay, { yPercent: 100, duration: 0.9, ease: "power4.inOut" }, 0.08);
    tl.to(group1, { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: { each: 0.08, onComplete: function() { releaseWrap(this.targets()[0]); } } }, 0.35);
    tl.to(loadFade, { opacity: 1, duration: 0.9, ease: "power2.out" }, 0.65);
    tl.to(loadReveal, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.12 }, 1.05);

    archiveRows.forEach((row, i) => {
      const t = 0.45 + i * 0.04;
      const line = row.querySelector('[class*="-line"]');
      const textEls = Array.from(row.querySelectorAll('[class*="number"], [class*="project"]'));
      if (line && line.dataset.archiveVis === "1") tl.to(line, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power2.out" }, t);
      if (textEls.length) tl.to(textEls, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.72, ease: "expo.out" }, t);
    });

    if (group2.length) {
      gsap.to(group2, {
        yPercent: 0, duration: 1.15, ease: "expo.out",
        stagger: { each: 0.08, onComplete: function() { releaseWrap(this.targets()[0]); } },
        scrollTrigger: { trigger: group2[0], start: "top 90%", once: true }
      });
    }

    const sideProjectsList = document.querySelector(".side-projects-list");
    if (sideProjectsList && sideProjectRows.length) {
      ScrollTrigger.create({
        trigger: sideProjectsList, start: "top 85%", once: true,
        onEnter: () => {
          sideProjectRows.forEach((row, i) => {
            const delay = i * 0.04;
            const line = row.querySelector(".side-project-item-line");
            const linkEls = Array.from(row.querySelectorAll(".link-style"));
            const textEls = Array.from(row.children).filter(el => !el.classList.contains("side-project-item-line") && !el.classList.contains("link-style"));
            if (line) gsap.to(line, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power2.out", delay });
            if (textEls.length) gsap.to(textEls, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.72, ease: "expo.out", delay });
            if (linkEls.length) gsap.to(linkEls, { opacity: 1, duration: 0.6, ease: "power2.out", delay: delay + 0.15 });
          });
        }
      });
    }

    visualTextBlocks.forEach(block => {
      ScrollTrigger.create({
        trigger: block, start: "top 85%", once: true,
        onEnter: () => {
          Array.from(block.children).forEach((el, i) => {
            gsap.to(el, { opacity: parseFloat(el.dataset.originalOpacity) || 1, y: 0, duration: 0.9, ease: "power2.out", delay: i * 0.18 });
          });
        }
      });
    });

    const bottomEmbed = document.querySelector(".bottom-embed");
    if (bottomEmbed) {
      gsap.to(bottomEmbed, { opacity: 1, duration: 1.0, ease: "power2.out", scrollTrigger: { trigger: bottomEmbed, start: "top 90%", once: true } });
    }

    ScrollTrigger.refresh();
  }

  scrollReveal.forEach(el => {
    gsap.to(el, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
  });

  const group1Moves = [0, 100, -120, -200, -100, 50, -150];
  const group2Moves = [100, 250, 150, -100, 100, 150, -50];
  group1.forEach((el, i) => {
    gsap.fromTo(el, { x: 0 }, { x: group1Moves[i] || 0, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "+=1800", scrub: 1.8 } });
  });
  group2.forEach((el, i) => {
    gsap.fromTo(el, { x: 0 }, { x: group2Moves[i] || 0, ease: "none", scrollTrigger: { trigger: el, start: "top 100%", end: "bottom top", scrub: 1.8 } });
  });

  waitForEmbeds(startAboutAnimations);
});
