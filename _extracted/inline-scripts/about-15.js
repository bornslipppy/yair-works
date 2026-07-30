window.addEventListener("load", () => {
  if (window.innerWidth <= 1199) return;
  if (typeof gsap === "undefined") return;

  const IMAGES = [
    "assets/img/6a26e3eaf91d749143da5be1_01_Makhno.jpg",
    "assets/img/6a26e3eadc7edeaed2b096f9_02_DES.jpg",
    "assets/img/6a26e3e93e633f7374768067_03_Ji.jpg",
    "assets/img/6a26e3ea1e31e37f4da0ad70_04_SC.jpg",
    "assets/img/6a26e3ea7561154813f56165_05_Shibuya_(1).jpg",
    "assets/img/6a26e3e978f117f096921381_06_Format.jpg",
    "assets/img/6a26e3ea6c1d97153b45e289_07_Sisiomn.jpg",
    "assets/img/6a26e3e91010be00aa8327dc_08_Obys.jpg",
    "assets/img/6a26e3ea41aa711057d61d47_09_Supersame.jpg",
    "assets/img/6a26e3eac2d11cd2c53e41e3_10_STN.jpg",
    "assets/img/6a26e3e9b76728a29c69051d_11__Berti.jpg",
    "assets/img/6a26e3ea2133e88e52e2e782_12_Museum.jpg",
    "assets/img/6a26e3eaacb6af7621eb196b_13_TheFlatironRoom.jpg",
    "assets/img/6a26e3ea83a9c2dff588f506_14_Obys_Identoty.jpg",
    "assets/img/6a26e3ea1ec069880f876b52_15_Makhno.jpg",
    "assets/img/6a26e3eadc2ca169d67583e1_16_Modular.jpg",
    "assets/img/6a26e3ea2d7926c99a03fd43_17_Grids.jpg",
    "assets/img/6a26e3eb26f9684fe8b9bd1e_18_Nord.jpg",
    "assets/img/6a26e3ebbd2247ff86579a4b_19_Lean.jpg",
    "assets/img/6a26e3eb4d55d4faf3b2e1cc_20_Modo.jpg",
    "assets/img/6a26e3ebb1e6da139698b607_21_Bauhaus.jpg",
    "assets/img/6a26e3eb6d4ff7a46b5c4430_22_SC.jpg",
    "assets/img/6a26e3eb3ffd3af7522c366e_23_Ukraine.jpg",
    "assets/img/6a26e3eb4cd98b4a8e93feb6_24_DES.jpg",
    "assets/img/6a26e3eaf91d749143da5c1e_25_AV.jpg",
    "assets/img/6a26e3eb18e3d56b164b973c_26_Columns.jpg",
    "assets/img/6a26e3eb738351da41fc7bd0_27_SSS.jpg",
    "assets/img/6a26e3eb8dbfd3f5c3dc9bc5_28_CP.jpg",
    "assets/img/6a26e3eb85cba61e1bec5b3e_29_Modo.jpg",
    "assets/img/6a26e3ebe079c3f2b041dc36_30_AIM.jpg",
    "assets/img/6a26e3eb6d4ff7a46b5c447a_31_Grids.jpg",
    "assets/img/6a26e3ebbde812b9a9464c81_32_SpringSummer.jpg"
  ];

  const archiveItems = Array.from(document.querySelectorAll(".archive-item"));
  const archiveTable = document.querySelector(".archive-table");
  if (!archiveItems.length || !archiveTable) return;

  IMAGES.forEach(src => { if (src) new Image().src = src; });

  function makeLayer() {
    const layer = document.createElement("div");
    layer.className = "archive-hover-layer";
    const img = document.createElement("img");
    img.alt = "";
    layer.appendChild(img);
    document.body.appendChild(layer);
    gsap.set(layer, { clipPath: "inset(50% 50% 50% 50%)", top: 0 });
    return { layer, img };
  }

  const a = makeLayer();
  const b = makeLayer();
  gsap.set(a.layer, { zIndex: 500 });
  gsap.set(b.layer, { zIndex: 501 });

  let front = b;
  let back = a;
  let isVisible = false;
  let currentIdx = -1;
  let hideTimeout = null;

  archiveItems.forEach(item => {
    const line = item.querySelector(".archive-item-line");
    if (!line) return;
    item.style.position = "relative";
    const hl = document.createElement("div");
    hl.className = "archive-hover-line";
    item.appendChild(hl);
    requestAnimationFrame(() => {
      const lr = line.getBoundingClientRect();
      const ir = item.getBoundingClientRect();
      hl.style.position = "absolute";
      hl.style.top = (lr.top - ir.top) + "px";
      hl.style.left = (lr.left - ir.left) + "px";
      hl.style.width = lr.width + "px";
      hl.style.height = Math.max(lr.height, 1) + "px";
      gsap.set(hl, { scaleX: 0, transformOrigin: "left center" });
    });
  });

  function showItem(idx) {
    const item = archiveItems[idx];
    const rect = item.getBoundingClientRect();
    const hl = item.querySelector(".archive-hover-line");

    if (!isVisible) {
      gsap.set(front.layer, { top: rect.top });
      front.img.src = IMAGES[idx] || "";
      gsap.fromTo(front.layer,
        { clipPath: "inset(50% 50% 50% 50%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power3.out" }
      );
      isVisible = true;
    } else {
      const temp = front; front = back; back = temp;
      gsap.killTweensOf(front.layer);
      gsap.set(front.layer, { clipPath: "inset(50% 50% 50% 50%)", top: rect.top, zIndex: 501 });
      gsap.set(back.layer, { top: rect.top, zIndex: 500 });
      front.img.src = IMAGES[idx] || "";
      gsap.fromTo(front.layer,
        { clipPath: "inset(50% 50% 50% 50%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power3.out" }
      );
    }

    if (hl) { gsap.killTweensOf(hl); gsap.to(hl, { scaleX: 1, duration: 0.4, ease: "power2.out" }); }
  }

  function clearItem(idx) {
    if (idx < 0 || idx >= archiveItems.length) return;
    const hl = archiveItems[idx].querySelector(".archive-hover-line");
    if (hl) { gsap.killTweensOf(hl); gsap.to(hl, { scaleX: 0, duration: 0.25, ease: "power2.in" }); }
  }

  function hideAll() {
    isVisible = false;
    currentIdx = -1;
    gsap.killTweensOf([a.layer, b.layer]);
    gsap.to([a.layer, b.layer], { clipPath: "inset(50% 50% 50% 50%)", duration: 0.28, ease: "power3.in" });
    archiveItems.forEach(item => {
      const hl = item.querySelector(".archive-hover-line");
      if (hl) { gsap.killTweensOf(hl); gsap.to(hl, { scaleX: 0, duration: 0.2, ease: "power2.in" }); }
    });
  }

  archiveTable.addEventListener("mousemove", (e) => {
    clearTimeout(hideTimeout);

    const firstLine = archiveItems[0]?.querySelector(".archive-item-line");
    const xLimit = firstLine ? firstLine.getBoundingClientRect().right : Infinity;

    if (e.clientX > xLimit) {
      if (currentIdx !== -1) {
        clearItem(currentIdx);
        currentIdx = -1;
      }
      if (isVisible) hideTimeout = setTimeout(hideAll, 60);
      return;
    }

    let newIdx = -1;
    for (let i = 0; i < archiveItems.length; i++) {
      const r = archiveItems[i].getBoundingClientRect();
      if (e.clientY >= r.top && e.clientY <= r.bottom) { newIdx = i; break; }
    }
    if (newIdx !== currentIdx) {
      if (currentIdx !== -1) clearItem(currentIdx);
      if (newIdx !== -1) showItem(newIdx);
      currentIdx = newIdx;
    }
  });

  archiveTable.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(hideAll, 60);
  });

  window.addEventListener("scroll", () => {
    clearTimeout(hideTimeout);
    if (currentIdx !== -1) { clearItem(currentIdx); currentIdx = -1; }
    if (isVisible) hideAll();
  }, { passive: true });
});
