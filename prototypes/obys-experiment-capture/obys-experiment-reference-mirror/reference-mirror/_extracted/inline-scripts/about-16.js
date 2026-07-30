window.addEventListener("load", () => {
  if (window.innerWidth <= 1199) return;
  if (typeof gsap === "undefined") return;

  const SIDE_IMAGES = [
    "assets/img/6a26c504e54b9c2f28047e36_001_.jpg",
    "assets/img/6a26c50520f00b5b91457ccd_002.jpg",
    "assets/img/6a26c505260cb219e97b4c92_003.jpg",
    "assets/img/6a26c504661101520b6ffd08_004.jpg",
    "assets/img/6a26c504fab4a38fa6a5473b_005.jpg",
    "assets/img/6a26c50472ac0975317e0da2_006.jpg",
    "assets/img/6a26c504b84414ab3264b984_007.jpg",
    "assets/img/6a26c504661101520b6ffce4_008.jpg",
    "assets/img/6a26c5047eb512f620796569_009.jpg",
    "assets/img/6a26c5044537c1bf946c35a3_010.jpg",
    "assets/img/6a26c5044fc0ddc08c9a7da7_011.jpg",
    "assets/img/6a26c5047d24f3846c0ad69d_012.jpg",
    "assets/img/6a26c504197959ec764bef97_013.jpg",
    "assets/img/6a26c5054537c1bf946c35e1_014.jpg"
  ];

  const sideItems = Array.from(document.querySelectorAll(".side-project-item"));
  const sideList = document.querySelector(".side-projects-list");
  if (!sideItems.length || !sideList) return;

  function makeSideLayer() {
    const layer = document.createElement("div");
    layer.className = "side-hover-layer";
    const img = document.createElement("img");
    img.alt = "";
    layer.appendChild(img);
    document.body.appendChild(layer);
    gsap.set(layer, { clipPath: "inset(50% 50% 50% 50%)", top: 0 });
    return { layer, img };
  }

  const sa = makeSideLayer();
  const sb = makeSideLayer();
  gsap.set(sa.layer, { zIndex: 502 });
  gsap.set(sb.layer, { zIndex: 503 });

  let sFront = sb;
  let sBack = sa;
  let sVisible = false;
  let sCurrentIdx = -1;
  let sHideTimeout = null;

  sideItems.forEach(item => { item.style.position = "relative"; });

  sideItems.forEach((item, i) => {
    let refItem, refLine;
    if (i < sideItems.length - 1) {
      refItem = sideItems[i + 1];
      refLine = refItem.querySelector(".side-project-item-line");
    } else {
      refItem = item;
      const lines = item.querySelectorAll(".side-project-item-line");
      refLine = lines[lines.length - 1];
    }
    if (!refLine) return;

    const hl = document.createElement("div");
    hl.className = "side-hover-line";
    hl.dataset.sideFor = String(i);
    refItem.appendChild(hl);

    requestAnimationFrame(() => {
      const lr = refLine.getBoundingClientRect();
      const ir = refItem.getBoundingClientRect();
      hl.style.position = "absolute";
      hl.style.top = (lr.top - ir.top) + "px";
      hl.style.left = (lr.left - ir.left) + "px";
      hl.style.width = lr.width + "px";
      hl.style.height = Math.max(lr.height, 1) + "px";
      gsap.set(hl, { scaleX: 0, transformOrigin: "left center" });
    });
  });

  function getSideHL(idx) {
    return document.querySelector(`.side-hover-line[data-side-for="${idx}"]`);
  }

  function sShowItem(idx) {
    const item = sideItems[idx];
    const rect = item.getBoundingClientRect();
    const hl = getSideHL(idx);

    if (!sVisible) {
      gsap.set(sFront.layer, { top: rect.top });
      sFront.img.src = SIDE_IMAGES[idx] || "";
      gsap.fromTo(sFront.layer,
        { clipPath: "inset(50% 50% 50% 50%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power3.out" }
      );
      sVisible = true;
    } else {
      const temp = sFront; sFront = sBack; sBack = temp;
      gsap.set([sa.layer, sb.layer], { top: rect.top });
      gsap.set(sBack.layer, { zIndex: 502 });
      gsap.set(sFront.layer, { zIndex: 503 });
      sFront.img.src = SIDE_IMAGES[idx] || "";
      gsap.fromTo(sFront.layer,
        { clipPath: "inset(50% 50% 50% 50%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power3.out" }
      );
    }

    if (hl) { gsap.killTweensOf(hl); gsap.to(hl, { scaleX: 1, duration: 0.4, ease: "power2.out" }); }
  }

  function sClearItem(idx) {
    if (idx < 0 || idx >= sideItems.length) return;
    const hl = getSideHL(idx);
    if (hl) { gsap.killTweensOf(hl); gsap.to(hl, { scaleX: 0, duration: 0.25, ease: "power2.in" }); }
  }

  function sHideAll() {
    sVisible = false;
    sCurrentIdx = -1;
    gsap.killTweensOf([sa.layer, sb.layer]);
    gsap.to([sa.layer, sb.layer], { clipPath: "inset(50% 50% 50% 50%)", duration: 0.28, ease: "power3.in" });
    document.querySelectorAll(".side-hover-line").forEach(hl => {
      gsap.killTweensOf(hl); gsap.to(hl, { scaleX: 0, duration: 0.2, ease: "power2.in" });
    });
  }

  sideList.addEventListener("mousemove", (e) => {
    clearTimeout(sHideTimeout);

    const firstLine = sideItems[0]?.querySelector(".side-project-item-line");
    const xMin = firstLine ? firstLine.getBoundingClientRect().left : 0;
    const xMax = firstLine ? firstLine.getBoundingClientRect().right : Infinity;

    if (e.clientX < xMin || e.clientX > xMax) {
      if (sCurrentIdx !== -1) { sClearItem(sCurrentIdx); sCurrentIdx = -1; }
      if (sVisible) sHideTimeout = setTimeout(sHideAll, 60);
      return;
    }

    let newIdx = -1;
    for (let i = 0; i < sideItems.length; i++) {
      const r = sideItems[i].getBoundingClientRect();
      if (e.clientY >= r.top && e.clientY <= r.bottom) { newIdx = i; break; }
    }
    if (newIdx !== sCurrentIdx) {
      if (sCurrentIdx !== -1) sClearItem(sCurrentIdx);
      if (newIdx !== -1) sShowItem(newIdx);
      sCurrentIdx = newIdx;
    }
  });

  sideList.addEventListener("mouseleave", () => {
    sHideTimeout = setTimeout(sHideAll, 60);
  });

  window.addEventListener("scroll", () => {
    clearTimeout(sHideTimeout);
    if (sCurrentIdx !== -1) { sClearItem(sCurrentIdx); sCurrentIdx = -1; }
    if (sVisible) sHideAll();
  }, { passive: true });
});
